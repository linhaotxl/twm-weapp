import { FileResource } from './';
import { DirectorResource } from './DirectorResource';

export class FileContext {

    translateMap: Map<FileResource, FileResource> = new Map();
    translateNameMap: Map<string, FileResource>   = new Map();
    translateNameDirMap: Map<string, DirectorResource> = new Map();
    onlyCopyFiles: FileResource[] = [];

    addFile ( sourceFile: FileResource, targetFile: FileResource ) {
        this.translateMap.set( sourceFile, targetFile );
        this.translateNameMap.set( sourceFile.sourceAbsolutePath, sourceFile );
    }

    deleteFile ( suorceFile: FileResource ) {
        this.translateMap.delete( suorceFile );
        this.translateNameMap.delete( suorceFile.sourceAbsolutePath );
    }

    addDirector ( path: string, dir: DirectorResource ) {
        this.translateNameDirMap.set( path, dir );
    }

    addOnlyCopyFile ( file: FileResource ) {
        this.onlyCopyFiles.push( file );
    }

    isSameTargetFile ( file: FileResource ) {
        for ( const targetFile of this.translateMap.values() ) {
            if ( file.sourceAbsolutePath === targetFile.sourceAbsolutePath ) {
                return true;
            }
        }
        return false;
    }

    getChangeFileSourceAndTarget ( changeFilePath: string ) {
        const fileSource = this.translateNameMap.get( changeFilePath );
        const fileTarget = fileSource
            ? this.translateMap.get( fileSource )
            : null;
        return { fileSource, fileTarget };
    }

}