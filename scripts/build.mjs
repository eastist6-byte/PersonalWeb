import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ROOT,inside} from './paths.mjs';
import {readText} from './text.mjs';
import {readPublicManifest,browserManifest} from './manifest.mjs';
import {normalizeBase} from './settings.mjs';
import {auditSite} from './audit.mjs';
const base=normalizeBase(process.env.PAGES_BASE??'/personal-site/');
const copy=await readText();
const manifest=await readPublicManifest(copy);
await fs.mkdir(inside(ROOT,'work/generated'),{recursive:true});
await fs.writeFile(inside(ROOT,'work/generated/text-public.json'),JSON.stringify(copy,null,2));
await fs.writeFile(inside(ROOT,'work/generated/site.json'),JSON.stringify(browserManifest(manifest),null,2));
const media=inside(ROOT,'public/media');
await fs.rm(media,{recursive:true,force:true});await fs.mkdir(media,{recursive:true});
await fs.mkdir(inside(ROOT,'public/assets'),{recursive:true});
await fs.copyFile(inside(ROOT,'content/images/avatar.png'),inside(ROOT,'public/assets/avatar.png'));
for(const a of manifest.articles){
  const generated=inside(ROOT,'content/generated/'+a.id);
  const report=JSON.parse(await fs.readFile(path.join(generated,'report.json'),'utf8'));
  if(!report.converted||report.id!==a.id||report.validatedMaths!==report.maths)throw new Error('文章尚未通过转换验证：'+a.id);
  for(const file of ['article.html','toc.json','article.pdf'])await fs.access(path.join(generated,file)).catch(()=>{throw new Error('缺少转换结果：'+a.id+'/'+file+'；请先执行 npm run content:update');});
  const out=path.join(media,a.id);await fs.mkdir(out,{recursive:true});
  for(const f of await fs.readdir(generated))if(f==='article.pdf'||/\.(svg|png|jpe?g|gif|webp|css)$/i.test(f))await fs.copyFile(path.join(generated,f),path.join(out,f));
  for(const f of a.attachments)await fs.copyFile(inside(ROOT,'content/'+f.file),path.join(out,f.id+f.extension));
}
const output=inside(ROOT,'outputs/pages');
await fs.rm(output,{recursive:true,force:true});
const result=spawnSync(process.execPath,[path.join(path.dirname(fileURLToPath(import.meta.resolve('astro/package.json'))),'bin/astro.mjs'),'build'],{
  cwd:ROOT,env:{...process.env,SITE_MODE:'pages',PAGES_BASE:base,ASTRO_TELEMETRY_DISABLED:'1'},
  stdio:'inherit',windowsHide:true
});
if(result.status!==0)throw new Error(result.error?.message||'Astro 构建失败');
await fs.writeFile(path.join(output,'.nojekyll'),'');
const audit=await auditSite(output,base,manifest);
await fs.writeFile(inside(ROOT,'work/generated/build.json'),JSON.stringify({...audit,generatedAt:new Date().toISOString()},null,2));
console.log('Pages 构建和发布检查通过：'+JSON.stringify(audit));
