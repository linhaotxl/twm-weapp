import { TwmExtension } from '../translate';
import { FileContext } from './';

export class ContextResource {
    root: string = '';
    output: string = '';
    miniprogram: string = '';

    extensions: TwmExtension[] = [];
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
