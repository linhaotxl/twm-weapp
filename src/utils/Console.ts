import { green, red, cyan, yellow } from 'chalk';

const _log = console.log;

export const info = function ( ...args: any[] ) {
    _log( green( ...args ) );
}

export const change = ( ...args: any[] ) => {
    _log( cyan( ...args ) )
}

export const error = ( ...args: any[] ) => {
    _log( red( ...args ) );
}

export const warn = ( ...args: any[] ) => {
    _log( yellow( ...args ) );
}

export const logTimeStart = ( text: string ) => {
    const now = Date.now();
    info( text );
    return now;
}

export const logTimeEnd = ( lastNow: number, text: string ) => {
    const period = Date.now() - lastNow;
    const periodSecond = (period / 1000).toFixed( 2 );
    info( `${ text } ${ periodSecond }s` );
}