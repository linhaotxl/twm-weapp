import { TranslateFn } from '.';
import { error } from '../utils';


export const TranslatePackageJson: TranslateFn = async ( context, source, target ) => {
    if ( source.filename !== 'package.json' ) {
        return ;
    }

    try {
        const codeJSON = JSON.parse( source.sourceCode || '{}' );
        codeJSON.name = `${ codeJSON.name }-dist`;
        target.sourceCode = JSON.stringify( codeJSON, null, 2 );
    } catch ( e ) {
        console.log( e );
    }
}