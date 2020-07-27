import { outputFile, copy, CopyOptions, readFileSync as fsReadFileSync, readFile as fsReadFile, readJson as fsReadJson, ReadOptions, unlink as fsUnlink, remove, WriteFileOptions, accessSync as fsAccessSync, mkdirs } from 'fs-extra';
import { PathLike } from 'fs';
import { extname } from 'path';

export const writeFile = (
    file: string,
    data: any,
    options?: string | WriteFileOptions
) => outputFile( file, data, options );

export const copyFile = (
    src: string,
    dest: string,
    options?: CopyOptions
) => copy( src, dest, options );

export const readFileSync = (
    p: PathLike | number,
    options?: { encoding?: BufferEncoding; flag?: string; }
) => fsReadFileSync( p, options );

export const readFile = (
    p: string,
    options?: { encoding?: BufferEncoding; flag?: string; }
) => fsReadFile( p, options );

export const readJsonFile = (
    file: string,
    options?: ReadOptions
) => fsReadJson( file, options );

export const endsWith = ( p: string, name: string ) => p.endsWith( name );

export const accessSync = ( p: PathLike, m?: number ) => fsAccessSync( p, m );

export const replaceExtname = ( path: string, ext: string ) => {
    const e = extname( path );
    const extRE = new RegExp( `${ e }$` );
    return path.replace( extRE, ext );
}

export const unlink = ( path: string ) => fsUnlink( path );

export const rmdir = ( path: string ) => remove( path );

export const mkdir = ( path: string ) => mkdirs( path );