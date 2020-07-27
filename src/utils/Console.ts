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