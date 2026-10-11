import {defineConfig} from 'astro/config';
import {normalizeBase} from './scripts/settings.mjs';
export default defineConfig({
  output:'static',base:normalizeBase(process.env.PAGES_BASE ?? '/personal-site/'),
  trailingSlash:'always',outDir:'./outputs/pages',cacheDir:'./work/astro-cache',
  vite:{cacheDir:'./work/vite-cache'},devToolbar:{enabled:false}
});
