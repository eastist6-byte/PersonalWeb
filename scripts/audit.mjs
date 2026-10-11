import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
const sourcePattern=/(?:^|\/)(?:server|work|content|node_modules|\.git)(?:\/|$)|(?:^|\/)(?:credentials[^/]*|\.env(?:\.[^/]*)?|[^/]*\.(?:db|sqlite|sqlite3|sql|tex|sty))(?:$|\/)/i;
export async function auditSite(root,base,manifest) {
  const files=[];
  async function walk(folder,relative=''){
    for(const e of await fs.readdir(folder,{withFileTypes:true})){
      const r=path.posix.join(relative,e.name);
      if(e.isSymbolicLink())throw new Error('发布文件不能是链接：'+r);
      if(sourcePattern.test(r))throw new Error('发布文件包含本地数据或原稿：'+r);
      if(e.isDirectory())await walk(path.join(folder,e.name),r);else files.push(r);
    }
  }
  await walk(root);
  const routeFiles=files.filter(f=>f.endsWith('.html')&&!f.startsWith('vendor/'));
  for(const rel of routeFiles){
    const html=await fs.readFile(path.join(root,rel),'utf8');
    if(/\/api\/|unlock-form|local-text|assets\/local\.js|text-private\.json|reading-room|点击放大/.test(html))
      throw new Error('静态页面仍包含停用功能：'+rel);
    const $=load(html);
    if($('input[type=password],#message-form,#admin-app,#unlock-panel').length)throw new Error('静态页面包含后端表单：'+rel);
    for(const element of $('a[href],img[src],script[src],link[href]').toArray()){
      const value=$(element).attr('href')??$(element).attr('src');
      if(!value||/^(?:https?:|mailto:|tel:|data:|\/\/)/.test(value))continue;
      const u=new URL(value,'https://pages.invalid'+base+rel.replace(/index\.html$/,''));
      if(!u.pathname.startsWith(base))throw new Error('链接未包含 Pages 子路径：'+rel+' -> '+value);
      const relative=decodeURIComponent(u.pathname.slice(base.length));
      const file=path.join(root,relative+(u.pathname.endsWith('/')?'index.html':''));
      await fs.access(file).catch(()=>{throw new Error('失效链接：'+rel+' -> '+value);});
      if(u.hash&&file.endsWith('.html')){
        const target=load(await fs.readFile(file,'utf8'));
        const fragment=decodeURIComponent(u.hash.slice(1));
        if(!target('[id]').toArray().some(el=>target(el).attr('id')===fragment)&&!target('a[name]').toArray().some(el=>target(el).attr('name')===fragment))
          throw new Error('失效的章节引用：'+rel+' -> '+value);
      }
    }
  }
  for(const route of ['admin/index.html','messages/new/index.html','messages/receipt/index.html'])
    if(files.includes(route))throw new Error('不应生成后台功能页面：'+route);
  const messages=load(await fs.readFile(path.join(root,'messages/index.html'),'utf8'));
  if(messages('#public-messages').text().trim()||messages('main form,main input,main textarea,main button').length)
    throw new Error('留言板不是空白静态页面');
  const actualIds=files.filter(f=>/^articles\/[^/]+\/index\.html$/.test(f)).map(f=>f.split('/')[1]).sort();
  const wantedIds=manifest.articles.map(a=>a.id).sort();
  if(JSON.stringify(actualIds)!==JSON.stringify(wantedIds))throw new Error('生成了不应发布的文章');
  return {files:files.length,pages:routeFiles.length,articles:wantedIds.length,base,guestbook:'empty',backendRoutes:0};
}
