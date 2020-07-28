import { AsyncSeriesWaterfallHook, AsyncSeriesHook } from 'tapable';
import to from 'await-to-js';
import clear from 'clear';

import { DefaultPlugins } from './plugins';
import { ContextResource, FileResource, DirectorResource } from './resource';
import { FileWatcher } from './helper';
import { JS, TS, JSON, WXSS, WXML, DTS, TwmExtension } from './translate';
import { absolutePath, info, joinPath, accessSync, error, readJSONSync } from './utils';

export type TwmOptions = {
    root: string;
    output: string;
    watched: boolean;
    config: string;
    plugins?: Function[];
    translates?: TwmExtension[];
};

export default class Twm {

    defaultExtensions = [ JS, TS, DTS, JSON, WXML, WXSS ];
    defaultPlugins = DefaultPlugins;
    hooks = {
        initialHooks: new AsyncSeriesHook([ 'context' ]),
        changeFileHooks: new AsyncSeriesWaterfallHook([ 'context', 'changeFile' ]),
        distGenHooks: new AsyncSeriesWaterfallHook([ 'context', 'changeFile', 'changeDir' ]),
        removeFileHooks: new AsyncSeriesHook([ 'context' ])
    };
    fileWatcher: FileWatcher = null;
    options: TwmOptions = null;
    context: ContextResource = null;

    constructor ( options: TwmOptions ) {
        this.options = options;
    }

    async init () {
        const { root, output, watched, config } = this.options;
        const options = new ContextResource();
        let configObject: Partial<TwmOptions> = {};

        try {
            const configPath = !!config ? absolutePath( config ) : joinPath( options.root, 'twm.config.js' );
            accessSync( configPath );
            const [ err, { default: innerConfigObject } ] = await to( import( configPath ) );
            if ( err ) {
                error( err );
            } else {
                configObject = innerConfigObject;
            }
        } catch ( e ) {
            console.log(e)
        }
        const { translates = [], plugins = [] } = configObject;

        options.set( 'root', absolutePath( root ) );

        const projectConfigJson = readJSONSync( joinPath( options.root, 'project.config.json' ) );
        options.set( 'miniprogram', absolutePath( projectConfigJson.miniprogramRoot || options.root ) );

        options.set( 'output', absolutePath( output ) );
        options.set( 'watched', watched );

        const extensions = [ ...this.defaultExtensions ];
        const translatesLength = translates.length;
        for ( let i = 0; i < translatesLength; ++i ) {
            const t = translates[i];
            const index = extensions.findIndex( _t => _t.extname === t.extname );

            if ( index === -1 ) {
                extensions.push( t );
            } else {
                for ( const _t of t.translate ) {
                    typeof _t.index === 'number'
                        ? extensions[index].translate.splice( _t.index, 0, _t )
                        : extensions[index].translate.push( _t );
                }
            }
        }
        options.set( 'extensions', extensions );

        const { extensionMap, extensionNames, replaceNames } = options.extensions.reduce<{ extensionNames: string[]; extensionMap: Record<string, string>; replaceNames: string[]; }>(( prev, curr ) => {
            prev.extensionNames.push( curr.extname );
            prev.replaceNames.push( curr.replace! );
            if ( curr.replace ) {
                prev.extensionMap[ curr.extname ] = curr.replace
            }
            return prev;
        }, { extensionNames: [], replaceNames: [], extensionMap: {} });

        options.set( 'extensionNames', extensionNames );
        options.set( 'extensionMap', extensionMap );
        options.set( 'replaceNames', replaceNames );

        this.context = options;

        this.applySinglePlugins([ ...this.defaultPlugins, ...plugins ]);

        await this.start();
    }

    private applySinglePlugins ( defaultPlugins: any[] ) {
        defaultPlugins.forEach( PluginCtor => {
            const plugin = new PluginCtor();
            plugin.apply( this );
        });
    }

    async start () {
        clear();
        info( `twm build start...` );
        const now = Date.now();

        await this.hooks.initialHooks.promise( this.context );
        await this.hooks.changeFileHooks.promise( this.context );
        await this.hooks.distGenHooks.promise( this.context );

        if ( this.context.watched ) {
            await this.initialFileWatcher();
        }

        info( `twm build success with ${ Date.now() - now } ms` );
    }

    private initialFileWatcher () {
        this.fileWatcher = new FileWatcher(
            {},
            this.context,
            this.updateFiles,
            this.updateDirs
        );
    }

    private updateFiles = async ( changeFilesMap: Map<FileResource, FileResource> ) => {
        await this.hooks.changeFileHooks.promise( this.context, changeFilesMap );
        await this.hooks.distGenHooks.promise( this.context, changeFilesMap );
    }

    private updateDirs = async ( changeDirsMap: Map<DirectorResource, DirectorResource> ) => {
        await this.hooks.distGenHooks.promise( this.context, null, changeDirsMap );
    }
}
