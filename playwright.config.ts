import {defineConfig} from '@playwright/test';
import fs from 'node:fs';
const port=Number(process.env.TEST_PORT??4334);
const build=JSON.parse(fs.readFileSync('work/generated/build.json','utf8'));
export default defineConfig({
  testDir:'./tests',testMatch:'pages.spec.ts',workers:1,
  outputDir:'./work/tests/browser',
  reporter:[['list'],['json',{outputFile:'./work/qa/browser-tests.json'}]],
  use:{channel:'chrome',baseURL:'http://127.0.0.1:'+port+build.base,
    viewport:{width:1280,height:900},trace:'retain-on-failure'},
  webServer:{command:'node scripts/preview.mjs',env:{PORT:String(port)},url:'http://127.0.0.1:'+port+build.base,reuseExistingServer:false}
});
