import path from 'path';

export const basename = ( p: string, e?: string ) => path.basename( p, e );

export const relativePath = ( from: string, to: string ) => path.relative( from, to ); 

export const absolutePath = ( relativePath: string ) => path.resolve( relativePath );

export const joinPath = ( ...paths: string[] ) => path.join( ...paths );

export const dirname = ( p: string ) => path.dirname( p );

export const extname = ( p: string ) => path.extname( p );

export const resolve = ( ...p: string[] ) => path.resolve( ...p );

export const imageRE = /\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/;
export const mediaRE = /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/;
export const fontsRE = /\.(woff2?|eot|ttf|otf)(\?.*)?$/i;

export const isStaticAsset = ( file: string ) => {
    return imageRE.test(file) || mediaRE.test(file) || fontsRE.test(file)
}

export const onlyCopy = /\/node_modules\/|\.d\.ts$/i;

export const isOnlyCopy = ( file: string ) => onlyCopy.test( file );