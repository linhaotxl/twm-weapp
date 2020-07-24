import { watch, FSWatcher, WatchOptions } from 'chokidar';
import { ContextResource, FileResource, DirectorResource, EDirectorState } from '../resource';
import { joinPath, info, change, extname, warn, replaceExtname, accessSync } from '../utils';
import fs from 'fs';
import { fileResourceGen, dirResourceGen } from './FileResourceGen';

export class FileWatcher {
    defaultOptions: WatchOptions = {
        awaitWriteFinish: {
            stabilityThreshold: 300
        }
    };
    watcher: FSWatcher = null;
    context: ContextResource;
    ready: boolean = false;
    onUpdate: ( changeFilesMap: Map<FileResource, FileResource> ) => Promise<any>;
    onUpdateDir: ( changeDirsMap: Map<string, DirectorResource> ) => Promise<any>;

    constructor (
        options: WatchOptions,
        context: ContextResource,
        onUpdate: ( changeFilesMap: Map<FileResource, FileResource> ) => Promise<any>,
        onUpdateDir: ( changeDirsMap: Map<string, DirectorResource> ) => Promise<any>
    ) {
        this.context = context;
        this.onUpdate = onUpdate;
        this.onUpdateDir = onUpdateDir;
        this.initialFileWatch( options, context );
    }

    initialFileWatch ( options: WatchOptions, context: ContextResource ) {
        const { root, miniprogram } = context;

        const ignored = [
            ...new Set([
                joinPath( root, 'dist' ),
                joinPath( root, 'node_modules' ),
                joinPath( root, 'miniprogram_npm' ),
                joinPath( miniprogram, 'node_modules' ),
                joinPath( miniprogram, 'miniprogram_npm' ),
                joinPath( root, '/**', '.DS_Store' )
            ])
        ]

        this.watcher = watch( root, {
            ...this.defaultOptions,
            ignored,
            ignoreInitial: true,
        });

        this.watcher.on( 'ready', () => this.ready = true );
        this.watcher.on( 'all', async ( type, path, status ) => {
            if ( !this.ready ) {
                return ;
            }

            if ( type === 'change' ) {
                const modifyPath = this.checkModifyTranslateTargetFile( path );
                if ( modifyPath ) {
                    return warn(`Invalid Operation. Please modify '${ modifyPath }'.`);
                }
            }

            // if ( type === 'addDir' ) {
            //     try {
            //         accessSync( path );
            //         return ;
            //     } catch ( e ) {}
            // }

            change( `${ type } ${ path } ...` );
            switch ( type ) {
                case 'change':
                    await this.handlerChangeContent( path, status );
                    break;
                case 'add':
                    await this.handlerAddFile( path );
                    break;
                case 'unlink':
                    await this.handlerUnlinkFile( path );
                    break;
                case 'addDir':
                    await this.handlerAddDir( path );
                    break;
                case 'unlinkDir':
                    await this.handlerDeleteDir( path );
                    break;
            }
            change( `${ type } end.` );
        })
    }

    async handlerChangeContent ( changePath: string, stats: fs.Stats ) {
        const changeFileMap = this.getUpdateFile( changePath );
        await this.onUpdate( changeFileMap )
    }

    async handlerAddFile ( filePath: string ) {
        fileResourceGen(
            filePath,
            this.context
        )
        await this.onUpdate( this.getUpdateFile( filePath ) );
    }

    async handlerUnlinkFile ( filePath: string ) {
        const { fileContext } = this.context;
        const removeFileMap = this.getUpdateFile( filePath );
        for ( const [ s, t ] of removeFileMap.entries() ) {
            s.deleted = true;
            t.deleted = true;
            fileContext.deleteFile( s );
        }
        await this.onUpdate( removeFileMap );
    }

    async handlerAddDir ( addDirPath: string ) {
        const changeDirMap = this.getUpdateDir( addDirPath, EDirectorState.ADD );
        await this.onUpdateDir( changeDirMap );
    }

    async handlerDeleteDir ( addDirPath: string ) {
        const changeDirMap = this.getUpdateDir( addDirPath, EDirectorState.DELETE );
        await this.onUpdateDir( changeDirMap );
    }

    getUpdateFile ( changes: string ) {
        const { fileContext } = this.context;
        const { fileSource, fileTarget } = fileContext.getChangeFileSourceAndTarget( changes );
        const changeFilesMap = new Map<FileResource, FileResource>();
        if ( fileSource && fileTarget ) {
            changeFilesMap.set( fileSource, fileTarget );
        }
        return changeFilesMap;
    }

    getUpdateDir ( changePath: string, state: EDirectorState ) {
        return new Map<string, DirectorResource>([
            [ changePath, dirResourceGen( changePath, state, this.context ) ]
        ]);
    }

    checkModifyTranslateTargetFile ( changePath: string ) {
        const { replaceNames, extensions } = this.context;
        const extName = extname( changePath );
        const eIndex = replaceNames.indexOf( extName );

        if ( eIndex === -1 ) {
            return '';
        }

        const extension = extensions[ eIndex ];
        try {
            if ( extName === extension.replace ) {
                const path = replaceExtname( changePath, extension.extname );
                accessSync( path );
                return path;
            }
        } catch ( e ) {}

        return '';
    }
}