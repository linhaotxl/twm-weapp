import { TwmExtension } from '../translate';
import { extname, joinPath, relativePath, dirname, replaceExtname, accessSync } from '../utils';
import { FileResource, FileContext, ContextResource, DirectorResource, EDirectorState } from '../resource';

/**
 * 生成文件对象
 * 根据扩展字段里的配置，如果文件需要翻译( 配置 replace 字段 )，则会生成 Source File (.ts) 和 Target File(.js)
 */
export const processAddFile = (
    sourcePath: string,
    context: ContextResource
) => {
    const { extensionMap, extensionNames, extensions, replaceNames, output, root, fileContext } = context;

    // 获取 Source File 的扩展对象
    const extension = getExtension( extname( sourcePath ), extensionNames, extensions );

    // 生成 Source File 对象
    const sourceFile = new FileResource({
        sourceAbsolutePath: sourcePath,
        distAbsolutePath: joinPath( output, relativePath( root, sourcePath ) ),
        extension
    });

    let translateFilePathE = sourceFile.extname;
    // 获取 Target File 的扩展名，根据 Source File 的扩展名从配置里获取，如果没有配置使用原来的扩展名
    if ( extensionMap[sourceFile.extname] ) {
        if (
            extension &&
            (extension.test && extension.test.test( sourceFile.sourceAbsolutePath ) ||
            !extension.test)
        ) {
            translateFilePathE = extensionMap[sourceFile.extname];
        }
    }
    // const translateFilePathE = extensionMap[sourceFile.extname]
    //     ? extensionMap[sourceFile.extname]
    //     : sourceFile.extname;

    // 获取 Target File 的路径
    const translateFilePathA = extension
        ? joinPath( dirname( sourceFile.sourceAbsolutePath ), sourceFile.fileNoExtName + translateFilePathE )
        : sourceFile.sourceAbsolutePath;

    // 获取 Target File 的生成路径
    const translateFilePathD = extension
        ? joinPath( output, relativePath( root, dirname( translateFilePathA ) ), sourceFile.fileNoExtName + translateFilePathE )
        : sourceFile.distAbsolutePath;

    // 获取 Target File 的扩展对象
    const translateE = getExtension( extname( translateFilePathA ), extensionNames, extensions );

    if (
        extension &&
        extension.replace &&
        typeof extension.replace === 'string' &&
        extension.replace !== extension.extname
    ) {
        // 处理需要翻译的文件，需要生成 TargetFile
        processAddSourceFile( sourceFile, translateFilePathA, translateFilePathD, translateE, fileContext );
    } else {
        // 处理不需要翻译的文件，Target File 可以共用 Source File
        processAddTargetFile( sourceFile, translateFilePathA, extensions, replaceNames, fileContext );
    }

}

/**
 * 从 extensionNames 中获取与扩展名 fileExtName 相同的扩展对象
 */
const getExtension = (
    fileExtName: string,
    extensionNames: string[],
    extensions: TwmExtension[]
) => {
    const eIndex = extensionNames.indexOf( fileExtName );
    const ext = extensions[ eIndex ];
    return ext;
}

/**
 * 处理需要翻译的文件
 */
const processAddSourceFile = (
    sourceFile: FileResource,
    sourceAbsolutePath: string,
    distAbsolutePath: string,
    extension: TwmExtension,
    fileContext: FileContext
) => {
    // 直接生成 Target File，并设置
    const sourceTarget = new FileResource({ sourceAbsolutePath, distAbsolutePath, extension });
    fileContext.addFile( sourceFile, sourceTarget );
}

/**
 * 处理不需要翻译的文件
 */
const processAddTargetFile = (
    sourceFile: FileResource,
    translateFilePathA: string,
    extensions: TwmExtension[],
    repaceNames: string[],
    fileContext: FileContext,
) => {
    // 处理不需要翻译的文件，且已经存在 Target File 的 Source File
    // 例如: 存在 app.less 和 app.wxss 两个文件，遍历到 app.less 时会同时生成 Source File 和 Target File
    // 而遍历到 app.wxss 时不再需要生成文件对象了
    if ( fileContext.isSameTargetFile( sourceFile ) ) {
        return ;
    }

    // 获取扩展对象
    // const extension = getExtension( sourceFile.extname, repaceNames, extensions );
    const extension = extensions.find( e => e.replace === sourceFile.extname );
    let path = translateFilePathA;
    if ( extension ) {
        path = replaceExtname( translateFilePathA, extension.extname )
    }

    try {
        accessSync( path );
        if ( !extension ) {
            fileContext.addFile( sourceFile, sourceFile );
        }
    } catch ( e ) {
        fileContext.addFile( sourceFile, sourceFile );
    }
}

export const processAddDir = ( pathA: string, context: ContextResource ) => {
    const { output, root, fileContext } = context;
    if ( fileContext.translateNameDirMap.has( pathA ) ) {
        return ;
    }

    const pathD = joinPath( output, relativePath( root, pathA ) );
    const sourceDir = new DirectorResource( pathA, pathD, EDirectorState.ADD );
    fileContext.addDirector( sourceDir, sourceDir );
}

export const processUnlinkDir = ( pathA: string, context: ContextResource ) => {
    const { fileContext } = context;
    const { dirSource, dirTarget } = fileContext.getChangeDirSourceAndTarget( pathA );
    if ( dirSource && dirTarget ) {
        fileContext.unlinkDirector( dirSource );
    }
}