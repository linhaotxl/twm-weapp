import { AsyncSeriesWaterfallHook, AsyncSeriesHook } from 'tapable';

import { DefaultPlugins } from './plugins';
import { ContextResource, DefaultMiniprogram, FileResource, DirectorResource } from './resource';
import { FileWatcher } from './helper';
import { JS, TS, JSON, WXSS, WXML, LESS, IExtension } from './translate';
import { absolutePath, ELang, info } from './utils';

export type TwmOptions = {
    root: string;
    output: string;
    lang: ELang;
    extensions?: IExtension[];
};

export default class Twm {

    defaultOptions = {
        extensions: [ JS, TS, JSON, WXML, WXSS, LESS ],
    };
    hooks = {
        initialHooks: new AsyncSeriesHook([ 'context' ]),
        changeFileHooks: new AsyncSeriesWaterfallHook([ 'context', 'changeFile' ]),
        distGenHooks: new AsyncSeriesWaterfallHook([ 'context', 'changeFile', 'changeDir' ]),
        removeFileHooks: new AsyncSeriesHook([ 'context' ])
    };
    fileWatcher: FileWatcher = null;
    context: ContextResource = null;

    constructor ( options: TwmOptions ) {
        this.context = this.initialOptions( options );
        this.applySinglePlugins( DefaultPlugins );
    }

    initialOptions ({
        root,
        output,
        extensions = [],
        lang
    }: TwmOptions ) {
        const options = new ContextResource();

        options.set( 'root', absolutePath( root ) );
        options.set( 'output', absolutePath( output ) );
        options.set( 'lang', lang );
        options.set( 'miniprogram', absolutePath(DefaultMiniprogram[lang]) );
        options.set( 'extensions', [ ...this.defaultOptions.extensions, ...extensions ] );

        const { extensionMap, extensionNames, replaceNames } = options.extensions.reduce<{ extensionNames: string[]; extensionMap: Record<string, string>; replaceNames: string[]; }>(( prev, curr ) => {
            prev.extensionNames.push( curr.extname );
            prev.replaceNames.push( curr.replace );
            if ( curr.replace ) {
                prev.extensionMap[ curr.extname ] = curr.replace
            }
            return prev;
        }, { extensionNames: [], replaceNames: [], extensionMap: {} });

        options.set( 'extensionNames', extensionNames );
        options.set( 'extensionMap', extensionMap );
        options.set( 'replaceNames', replaceNames );

        return options;
    }

    applySinglePlugins ( defaultPlugins: any[] ) {
        defaultPlugins.forEach( PluginCtor => {
            const plugin = new PluginCtor();
            plugin.apply( this );
        });
    }

    async start () {
        info( 'building...' );
        await this.hooks.initialHooks.promise( this.context );
        await this.hooks.changeFileHooks.promise( this.context );
        await this.hooks.distGenHooks.promise( this.context );

        await this.initialFileWatcher();

        info( 'building success.' );
    }

    initialFileWatcher () {
        this.fileWatcher = new FileWatcher(
            {},
            this.context,
            this.updateFiles,
            this.updateDirs
        );
    }

    updateFiles = async ( changeFilesMap: Map<FileResource, FileResource> ) => {
        await this.hooks.changeFileHooks.promise( this.context, changeFilesMap );
        await this.hooks.distGenHooks.promise( this.context, changeFilesMap );
    }

    updateDirs = async ( changeDirsMap: Map<string, DirectorResource> ) => {
        await this.hooks.distGenHooks.promise( this.context, null, changeDirsMap );
    }
}
