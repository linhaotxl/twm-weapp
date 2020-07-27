import { FileResource } from './';
import { DirectorResource } from './DirectorResource';

export class FileContext {

    translateMap     = new Map<FileResource, FileResource>();
    translateNameMap = new Map<string, FileResource>();

    translateNameDirMap = new Map<string, DirectorResource>();
    translateDirMap     = new Map<DirectorResource, DirectorResource>();

    onlyCopyFiles: FileResource[] = [];

    addFile ( sourceFile: FileResource, targetFile: FileResource ) {
        this.translateMap.set( sourceFile, targetFile );
        this.translateNameMap.set( sourceFile.sourceAbsolutePath, sourceFile );
    }

    deleteFile ( suorceFile: FileResource ) {
        this.translateMap.delete( suorceFile );
        this.translateNameMap.delete( suorceFile.sourceAbsolutePath );
    }

    addDirector ( sourceDir: DirectorResource, targetDir: DirectorResource ) {
        this.translateDirMap.set( sourceDir, targetDir );
        this.translateNameDirMap.set( sourceDir.pathA, sourceDir );
    }

    unlinkDirector ( sourceDir: DirectorResource ) {
        this.translateDirMap.delete( sourceDir );
        this.translateNameDirMap.delete( sourceDir.pathA );
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

    getChangeDirSourceAndTarget ( changeDirPath: string ) {
        const dirSource = this.translateNameDirMap.get( changeDirPath );
        const dirTarget = dirSource
            ? this.translateDirMap.get( dirSource )
            : null;
        return { dirSource, dirTarget };
    }

}