import { ContextResource, FileResource } from '../resource';
import { TranslateLessToCss } from './TranslateLessToCss';
import { TranslateTsToJs } from './TranslateTsToJs';
import { TranslatePackageJson } from './TranslatePackageJson';

export type TranslateFn = ( context: ContextResource, source: FileResource, target: FileResource ) => void;

export interface IExtension {
    test?: RegExp;
    extname: string;
    replace?: string;
    sourceGen?: boolean;
    translate: TranslateFn[];
}

export const TS: IExtension = {
    test: /([^\.d]\.ts)$/,
    extname: '.ts',
    replace: '.js',
    translate: [ TranslateTsToJs ],
    sourceGen: true
};

export const DTS: IExtension = {
    extname: '.d.ts',
    translate: []
};

export const JS: IExtension = {
    extname: '.js',
    translate: [  ],
    // sourceGen: true
};

export const JSON: IExtension = {
    extname: '.json',
    translate: [ TranslatePackageJson ],
};

export const WXML: IExtension = {
    extname: '.wxml',
    translate: [],
};

export const WXSS: IExtension = {
    extname: '.wxss',
    translate: [],
};

export const LESS: IExtension = {
    extname: '.less',
    replace: '.wxss',
    sourceGen: true,
    translate: [ TranslateLessToCss ],
};