import less from 'less';
import { TranslateFn } from '.';
import { resolve, dirname, error } from '../utils';

const PathRE = /\@import(?:.*)(?:\'|\")(.+)(?:\'|\")/g;

const relativeToAbsolute = ( currentFilePath: string ) => {
    return ( all: string, relativePath: string ) => {
        return all.replace( relativePath, resolve( dirname( currentFilePath ), relativePath ));
    };
};

export const TranslateLessToCss: TranslateFn = async ( context, source, target ) => {
    const content = source.sourceCode;
    const input = content.replace( PathRE, relativeToAbsolute( source.sourceAbsolutePath ) );
    
    try {
        const result = await less.render( input );
        target.sourceCode = result.css;
    } catch ( e ) {
        error(`
'${ source.sourceAbsolutePath }'
- ${ e.message }
        `);
    }
}