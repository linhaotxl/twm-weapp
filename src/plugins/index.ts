import Twm from '../TwmWatcher';
import { GlobbyPathPlugin } from './GlobbyPathPlugin';
import { TranslatePlugin } from './TranslatePlugin';
import { GenerateDistPlugin } from './GenerateDistPlugin';
import { ContextResource } from '../resource';

export interface IMiddleware {
    apply: ( twm: Twm, context: ContextResource ) => void;
}

export type Plugin = {
    new (...args: any[]): any;
}

export const DefaultPlugins: Plugin[] = [
    GlobbyPathPlugin,
    TranslatePlugin,
    GenerateDistPlugin,
];