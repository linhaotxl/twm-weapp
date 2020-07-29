import globby from 'globby';
import Twm from '../TwmWatcher';
import { joinPath, dirname } from '../utils';
import { ContextResource } from '../resource';
import { processAddFile, processAddDir } from '../helper';
import { TwmMiddleware } from '.';
 
export class GlobbyPathPlugin implements TwmMiddleware {
    apply ( twm: Twm ) {
        twm.hooks.initialHooks.tapPromise( 'GlobbyPath', ( context: ContextResource ) => new Promise( async resolve => {
            const { root } = context;
            await this.createFileResourceMap(
                joinPath( root, '/**' ),
                context
            );

            resolve( context );
        }));
    }

    /**
     * 创建文件对象
     */
    async createFileResourceMap (
        globbyPath: string | string[],
        context: ContextResource
    ) {
        // 获取扫描目录
        const paths = await this.getGlobbyPaths( globbyPath, context );

        for ( const filePath of paths ) {
            processAddDir( dirname( filePath ), context );
            processAddFile( filePath, context );
        }
    }

    /**
     * 获取扫描目录集合
     */
    async getGlobbyPaths ( globbyPath: string | string[], context: ContextResource ) {
        const { output, miniprogram, root, ignores } = context;
        const path = typeof globbyPath === 'string' ? [ globbyPath ] : globbyPath;
        const gPathSet = new Set([
            `!${ joinPath( root, 'node_modules' ) }`,
            `!${ joinPath( root, 'miniprogram_npm' ) }`,
            `!${ joinPath( miniprogram, 'node_modules' ) }`,
            `!${ joinPath( miniprogram, 'miniprogram_npm' ) }`
        ]);
        const gPath: string[] = [
            ...path,
            ...gPathSet,
            ...ignores.map( i => `!${ i }` ),
            `!${ output }`,
        ];

        return await globby( gPath );
    }
}