import Twm from '../TwmWatcher';
import { unlink, writeFile, error, copyFile, rmdir, mkdir, warn } from '../utils';
import { FileResource, ContextResource, DirectorResource } from '../resource';
import { IMiddleware } from '.';

export class GenerateDistPlugin implements IMiddleware {
    apply ( twm: Twm ) {
        twm.hooks.distGenHooks.tapPromise( 'CopyFile', (
            context: ContextResource,
            changeFilesMap: Map<FileResource, FileResource>,
            changeDirMap: Map<string, DirectorResource>,
        ) => new Promise( async resolve => {
            await this.resolveGenerateDist( context, changeFilesMap, changeDirMap );
            resolve( context );
        }));
    }

    /**
     * 解析源文件生成目标文件
     * @param { ContextResource } context           上下文对象
     * @param { FileResource[] }  fileResources     修改文件列表
     */
    async resolveGenerateDist (
        context: ContextResource,
        changeFilesMap: Map<FileResource, FileResource>,
        changeDirMap: Map<string, DirectorResource>
    ) {
        const { fileContext: { translateMap } } = context;
        const writeFiles = new Set<FileResource>();
        const deleteFiles = new Set<FileResource>();
        const copyFiles = new Set<FileResource>();
        const addDirs = new Set<string>();
        const deleteDirs = new Set<string>();

        if ( changeFilesMap && changeFilesMap instanceof Map && changeFilesMap.size ) {
            // 有改动的文件，遍历改动文件列表
            for ( const [ source, target ] of changeFilesMap.entries() ) {
                this.translateFileUpdate( source, target, writeFiles, deleteFiles, copyFiles )
            }
        } else if ( changeDirMap && changeDirMap instanceof Map && changeDirMap.size ) {
            for ( const director of changeDirMap.values() ) {
                this.resolveDirector( director, addDirs, deleteDirs );
            }
        } else {
            // 第一次编译，将不需要翻译的文件全部放入 copy 数组中
            // 将需要翻译源文件放入 copy，翻译后的文件放入 write 中
            // copyFiles = new Set( onlyCopyFiles );
            this.traversalTranslateFile( translateMap, writeFiles, copyFiles );
        }

        // console.log(  )
        addDirs.size && await this.addDir( addDirs );
        writeFiles.size && await this.writeFiles( writeFiles );
        copyFiles.size && await this.copyFiles( copyFiles );
        deleteFiles.size && await this.deleteFiles( deleteFiles );
        deleteDirs.size && await this.deleteDir( deleteDirs );
    }

    /**
     * 更新需要翻译的文件，翻译后的文件需要 write，而源文件需要 copy
     * @param { FileResource } targetFile 翻译后的目标文件
     * @param { FileResource } sourceFile 源文件
     * @param { Set<FileResource> } copyFiles 需要 copy 的文件集合
     * @param { Set<FileResource> } writeFiles 需要 write 的文件集合
     */
    translateFileUpdate (
        source: FileResource,
        target: FileResource,
        writeFiles: Set<FileResource>,
        deleteFiles: Set<FileResource>,
        copyFiles: Set<FileResource>,
    ) {
        if ( source.deleted ) {
            this.addDeleteFile( source, target, deleteFiles );
        } else if ( source.staticAssets ) {
            this.addCopyFile( source, target, copyFiles );
        } else {
            this.addWriteFile( source, target, writeFiles );
        }
    }

    /**
     * 遍历翻译文件，将源文件存入 copyFiles，翻译后的文件存入 writeFiles
     * @param { Map<FileResource, FileResource> } maps  翻译文件集合
     * @param { Set<FileResource> } writeFiles          需要 write 文件集合
     * @param { Set<FileResource> } copyFiles           需要 copy  文件集合
     */
    traversalTranslateFile (
        maps: Map<FileResource, FileResource>,
        writeFiles: Set<FileResource>,
        copyFiles: Set<FileResource>
    ) {
        for ( const [ source, target ] of maps.entries() ) {
            if ( source.staticAssets ) {
                this.addCopyFile( source, target, copyFiles );
            } else {
                this.addWriteFile( source, target, writeFiles );
            }
        }
    }

    resolveDirector ( dir: DirectorResource, addDir: Set<string>, deleteDir: Set<string> ) {
        if ( dir.isAdd() ) {
            addDir.add( dir.pathD );
        } else if ( dir.isDelete() ) {
            deleteDir.add( dir.pathD );
        }
    }

    addWriteFile ( source: FileResource, target: FileResource, writeFiles: Set<FileResource> ) {
        writeFiles.add( target );
        if ( source !== target && source.generated ) {
            writeFiles.add( source );
        }
    }

    addDeleteFile ( source: FileResource, target: FileResource, deleteFiles: Set<FileResource> ) {
        deleteFiles.add( target );
        if ( source !== target ) {
            deleteFiles.add( source );
        }
    }

    addCopyFile ( source: FileResource, target: FileResource, copyFiles: Set<FileResource> ) {
        copyFiles.add( target );
    }

    /**
     * write 文件
     */
    async writeFiles ( files: Set<FileResource> ) {
        for ( const file of files ) {
            file.generated && await writeFile( file.distAbsolutePath, file.sourceCode );
        }
    }

    /**
     * copy 文件
     */
    async copyFiles ( files: Set<FileResource> ) {
        for ( const file of files ) {
            await copyFile( file.sourceAbsolutePath, file.distAbsolutePath );
        }
    }

    /**
     * delete 文件
     */
    async deleteFiles ( files: Set<FileResource> ) {
        for ( const file of files ) {
            await unlink( file.distAbsolutePath )
            .catch( e => {
                error( e.message );
            })
        }
    }

    async addDir ( dirs: Set<string> ) {
        for ( const path of dirs ) {
            await mkdir( path )
            .catch( e => {
                warn( e );
            });
        }
    }

    async deleteDir ( dirs: Set<string> ) {
        for ( const path of dirs ) {
            await rmdir( path )
            .catch( e => {
                warn( e );
            });
        }
    }
}