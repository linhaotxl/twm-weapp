import fse from 'fs-extra';
import fs from 'fs';
import { extname } from 'path';

export const writeFile = (
    file: string,
    data: any,
    options?: string | fse.WriteFileOptions
) => fse.outputFile( file, data, options );

export const copyFile = (
    src: string,
    dest: string,
    options?: fse.CopyOptions
) => fse.copy( src, dest, options );

export const readFileSync = (
    p: fs.PathLike | number,
    options?: { encoding?: BufferEncoding; flag?: string; }
) => fse.readFileSync( p, options );

export const readFile = (
    p: string,
    options?: { encoding?: BufferEncoding; flag?: string; }
) => fse.readFile( p, options );

export const readJsonFile = (
    file: string,
    options?: fse.ReadOptions
) => fse.readJson( file, options );

export const endsWith = ( p: string, name: string ) => p.endsWith( name );

export const accessSync = ( p: fs.PathLike, m?: number ) => fs.accessSync( p, m );

export const replaceExtname = ( path: string, ext: string ) => {
    const e = extname( path );
    const extRE = new RegExp( `${ e }$` );
    return path.replace( extRE, ext );
}

export const unlink = ( path: string ) => fse.unlink( path );

export const rmdir = ( path: string ) => fse.rmdir( path );

export const mkdir = ( path: string ) => fse.mkdir( path );