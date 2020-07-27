import { ContextResource, FileResource } from '../resource';
import { TranslateTsToJs } from './TranslateTsToJs';

export type TranslateFn = ( context: ContextResource, source: FileResource, target: FileResource ) => void;

export interface TwmExtension {
    test?: RegExp;
    extname: string;
    replace?: string;
    sourceGen?: boolean;
    translate: TranslateFn[];
}

export const TS: TwmExtension = {
    test: /([^\.d]\.ts)$/,
    extname: '.ts',
    replace: '.js',
    translate: [ TranslateTsToJs ],
    sourceGen: true
};

export const DTS: TwmExtension = {
    extname: '.d.ts',
    translate: []
};

export const JS: TwmExtension = {
    extname: '.js',
    translate: [],
    // sourceGen: true
};

export const JSON: TwmExtension = {
    extname: '.json',
    translate: [],
};

export const WXML: TwmExtension = {
    extname: '.wxml',
    translate: [],
};

export const WXSS: TwmExtension = {
    extname: '.wxss',
    translate: [],
};