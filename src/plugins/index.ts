import Twm from '../TwmWatcher';
import { GlobbyPathPlugin } from './GlobbyPathPlugin';
import { TranslatePlugin } from './TranslatePlugin';
import { GenerateDistPlugin } from './GenerateDistPlugin';
import { ContextResource } from '../resource';

export interface TwmMiddleware {
    apply: ( twm: Twm, context: ContextResource ) => void;
}

export type TwmPlugin = {
    new (...args: any[]): any;
}

export const DefaultPlugins: TwmPlugin[] = [
    GlobbyPathPlugin,
    TranslatePlugin,
    GenerateDistPlugin,
];