#!/usr/bin/env node
import { argv } from 'yargs';
import Twm from '../TwmWatcher';

async function main () {
    const { root = '', output = '', watch, config, ignore } = argv;

    new Twm({
        root: root as string,
        output: output as string,
        watched: !!watch,
        config: config as string,
        ignore: ignore as string
    }).init()
}

main();