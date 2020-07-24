import { TranslateFn } from '.';
import {
    findConfigFile,
    readConfigFile,
    parseJsonConfigFileContent,
    sys,
    transpileModule,
    ParseConfigHost
} from 'typescript';
import { error } from '../utils';

const parseConfigHost: ParseConfigHost = {
    fileExists: sys.fileExists,
    readFile: sys.readFile,
    readDirectory: sys.readDirectory,
    useCaseSensitiveFileNames: true
};

export const TranslateTsToJs: TranslateFn = ({ root }, sourceFile, targetFile ) => {

    const configPath = findConfigFile( root, sys.fileExists, 'tsconfig.json' );
    if ( !configPath ) {
        return error(`Could not find tsconfig.json in root.(${ root })`);
    }

    const config = readConfigFile( configPath, sys.readFile );
    const options = parseJsonConfigFileContent( config.config, parseConfigHost, './' );
    const result = transpileModule( sourceFile.sourceCode, { compilerOptions: options.options } );

    targetFile.sourceCode = result.outputText;
}