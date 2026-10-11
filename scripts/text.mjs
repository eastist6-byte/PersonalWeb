import {readPageConfigs} from './page-config.mjs';
export async function readText(options={}){return readPageConfigs(options);}
export function publicText(copy){return copy;}
