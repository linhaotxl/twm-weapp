#!/usr/bin/env node
import { argv } from 'yargs';
import Twm from '../TwmWatcher';
import { ELang } from '../utils';

async function main () {
    const { root = '', output = '', lang = ELang.JS, watch, config } = argv;
    const lowerLang = (lang as ELang).toLowerCase() as ELang;

    new Twm({
        root: root as string,
        output: output as string,
        lang: lowerLang,
        watched: !!watch,
        config: config as string
    }).init()
}

main();