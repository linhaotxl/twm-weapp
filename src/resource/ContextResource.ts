import { IExtension } from '../translate';
import { ELang } from '../utils';
import { FileContext } from './';

export const DefaultMiniprogram: Record<string, string> = {
    [ ELang.JS ]: '',  
    [ ELang.TS ]: 'miniprogram',
};

export class ContextResource {
    root: string = '';
    output: string = '';
    miniprogram: string = '';
    lang: ELang = ELang.JS;

    extensions: IExtension[] = [];
    extensionNames: string[] = [];
    replaceNames: string[] = [];
    extensionMap: Record<string, string> = {};

    watched: boolean = false;

    config: string = '';

    fileContext: FileContext = new FileContext();

    set <K extends Exclude<keyof ContextResource, 'set'>>(
        this: InstanceType<typeof ContextResource>,
        key: K,
        value: InstanceType<typeof ContextResource>[K]
    ) {
        this[ key ] = value;
    }
}
