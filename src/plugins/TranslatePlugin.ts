import Twm from '../TwmWatcher';
import { ContextResource, FileResource } from '../resource';
import { IExtension } from '../translate';
import { IMiddleware } from '.';

/**
 * @param { string } path 解析的路径 文件 和 目录两种情况
 * @param { string } ext  解析文件的扩展名 .js
 * @param { function } translate  解析的具体步骤，怎么解析
 */
export class TranslatePlugin implements IMiddleware {

    apply ( twm: Twm ) {
        twm.hooks.changeFileHooks.tapPromise( 'TranslateFile', (
            context: ContextResource,
            changeFiles: Map<FileResource, FileResource>
        ) => new Promise( async resolve => {
            await this.resolveTranslateFile( context, changeFiles );
            resolve();
        }));
    }

    /**
     * 解析翻译的文件
     * @param { ContextResource } context       上下文对象
     * @param { FileResource[] }  changeFiles 修改的文件列表
     */
    async resolveTranslateFile ( context: ContextResource, changeFilesMap: Map<FileResource, FileResource> ) {
        const { fileContext: { translateMap }, extensions } = context;
        const extensionMap = new Map<IExtension, Map<FileResource, FileResource>>();
        const extensionNames: string[] = extensions.map( e => e.extname );

        // 如果存在修改的文件，则只处理修改的文件
        if ( changeFilesMap && changeFilesMap instanceof Map && changeFilesMap.size ) {
            for ( const [ source, target ] of changeFilesMap.entries() ) {
                const eIndex = extensionNames.indexOf( source.extname );
                if ( eIndex === -1 ) continue;

                let filesMap = extensionMap.get( extensions[ eIndex ] );
                if ( !filesMap ) {
                    filesMap = new Map();
                    extensionMap.set( extensions[ eIndex ], filesMap );
                }

                filesMap.set( source, target );
            }
        } else {
            extensions.forEach( e => extensionMap.set( e, new Map() ) );
            for ( const [ source, target ] of translateMap.entries() ) {
                const eIndex = extensionNames.indexOf( source.extname );
                if ( eIndex === -1 ) continue;

                const filesMap = extensionMap.get( extensions[ eIndex ] );
                filesMap.set( source, target );
            }
        }

        for ( const [ e, files ] of extensionMap.entries() ) {
            await this._translateFile( context, files, e );
        }

    }

    /**
     * 翻译具体文件
     * @param { ContextResource } context    上下文对象 
     * @param { FileResource }    source     源文件
     * @param { FileResource }    target     目标文件
     * @param { IExtension[] }    extensions 扩展列表
     */
    async _translateFile (
        context: ContextResource,
        translateFileMap: Map<FileResource, FileResource>,
        extensions: IExtension
    ) {
        const length = extensions.translate.length;

        for ( const [ source, target ] of translateFileMap.entries() ) {
            if ( source.deleted ) {
                continue ;
            }
            source.reloadSourceCode();

            for ( let i = 0; i < length; ++i ) {
                const t = extensions.translate[i];
                await t( context, source, target );
            }
        }
    }
}