import { parse } from '@babel/parser';
import generator from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import template from '@babel/template';

import { readFileSync, dirname, relativePath, joinPath } from '../utils';
import { FileResource } from '../resource';
import { TranslateFn } from '.';

const MAIN_CALL_FILE_NAME = 'MainCall';

export const TranslateJsMainCall: TranslateFn = ( context, source, target ) => {
    const fileData = source.sourceCode;
    const fileAst = parse( fileData, { sourceType: 'module' } );
    const MainCallFilePath: string = joinPath( dirname( context.miniprogram ), 'utils', MAIN_CALL_FILE_NAME );
    traverseFileAst( fileAst, target, MainCallFilePath );
    target.ast = fileAst;
    target.sourceCode = generator( fileAst ).code;
}

function traverseFileAst ( ast: t.File, targetFile: FileResource, mainCallFilePath: string ) {
    traverse( ast, {
        Program ( path ) {
            const { body } = path.node;
            const MainCallImport = body.find( statement => (
                t.isImportDeclaration( statement ) &&
                statement.specifiers.length === 1 &&
                t.isImportDefaultSpecifier( statement.specifiers[0] ) &&
                statement.specifiers[0].local.name === MAIN_CALL_FILE_NAME
            ));
            
            if ( MainCallImport ) {
                return ;
            }

            const mainCallFileRelativePath: string = relativePath( dirname( targetFile.sourceAbsolutePath ), mainCallFilePath );
            const importMainCallBuilder = template( `import MainCall from 'MAIN_CALL_PATH'` );
            const importMainCallAst: any = importMainCallBuilder({ MAIN_CALL_PATH: mainCallFileRelativePath });

            body.unshift( importMainCallAst );
        },
        CallExpression ( path ) {
            const { arguments: [ firstArgs ], callee } = path.node;
            const { name: argsName } = callee as any;

            if (
                t.isCallExpression( path.node ) && 
                argsName === 'Page' &&
                (!t.isCallExpression( firstArgs ) ||
                (firstArgs.callee as any).name !== 'MainCall')
            ) {
                const pageBuilder = template( `Page(MainCall( PAGE_ARGS ));` );

                const ast: any = pageBuilder({ PAGE_ARGS: firstArgs });

                path.replaceWith( ast );
            }
        },
    });
}