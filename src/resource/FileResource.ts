import { extname, basename, isStaticAsset } from '../utils/PathUtils';
import { readFileSync, accessSync } from '../utils/FsUtils';
import { IExtension } from '../translate';
import { error } from '../utils';

export interface IFileResource {
    sourceAbsolutePath: string;
    distAbsolutePath: string;
    extension: IExtension;
}

export class FileResource {
    filename: string = '';
    sourceAbsolutePath: string = '';
    distAbsolutePath: string = '';
    sourceCode: string = '';
    extname: string = '';
    generated: boolean = true;
    fileNoExtName: string = '';
    deleted: boolean = false;
    staticAssets: boolean = false;

    constructor ({ sourceAbsolutePath, distAbsolutePath, extension }: IFileResource ) {
        this.filename = basename( sourceAbsolutePath );
        this.sourceAbsolutePath = sourceAbsolutePath;
        this.distAbsolutePath = distAbsolutePath;
        this.extname = extname( sourceAbsolutePath );
        this.fileNoExtName = basename( this.filename, this.extname );
        this.staticAssets = isStaticAsset( sourceAbsolutePath );

        if ( extension ) {
            const { replace, extname: extName, sourceGen } = extension;
            this.generated = (replace && typeof replace === 'string' && replace !== extName )
                ? !!sourceGen
                : true;
        }

    }

    reloadSourceCode () {
        if ( this.staticAssets ) return ;
        
        try {
            accessSync( this.sourceAbsolutePath );
            this.sourceCode = readFileSync( this.sourceAbsolutePath, { encoding: 'utf-8' } ) as string;
        } catch ( e ) {
            error( e );
        }
    }
}