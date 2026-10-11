import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import {ROOT,inside} from './paths.mjs';
export function selectPublic(manifest) {
  if(!Array.isArray(manifest.articles)||!Array.isArray(manifest.nodes))throw new Error('文章和目录必须是数组');
  const allIds=new Set(),nodeIds=new Set();
  for(const n of manifest.nodes){
    if(!/^[a-z0-9-]+$/.test(n.id)||nodeIds.has(n.id))throw new Error('目录 ID 无效或重复');
    nodeIds.add(n.id);
  }
  for(const n of manifest.nodes){
    let current=n;const seen=new Set();
    while(current){if(seen.has(current.id))throw new Error('目录循环：'+n.id);seen.add(current.id);
      if(!current.parent)break;
      current=manifest.nodes.find(p=>p.id===current.parent);
      if(!current)throw new Error('父目录不存在：'+n.parent);
    }
  }
  for(const a of manifest.articles){
    if(!/^[a-z0-9-]+$/.test(a.id)||allIds.has(a.id))throw new Error('文章 ID 无效或重复：'+a.id);
    allIds.add(a.id);
    if(!['draft','published'].includes(a.status))throw new Error('未知发布状态：'+a.id);
    if(!nodeIds.has(a.directory))throw new Error('目录不存在：'+a.directory);
  }
  const articles=manifest.articles.filter(a=>a.status==='published'&&!a.accessGroup).map(a=>{
    const attachmentIds=new Set();
    const attachments=(a.attachments||[]).map(f=>{
      if(!/^[a-z0-9-]+$/.test(f.id)||f.id==='pdf'||attachmentIds.has(f.id))throw new Error('附件 ID 无效或重复');
      attachmentIds.add(f.id);
      if(!f.file)throw new Error('缺少附件路径');
      inside(path.join(ROOT,'content'),f.file);
      return {...f,extension:path.extname(f.file).toLowerCase()};
    });
    return {...a,attachments};
  });
  const used=new Set(articles.map(a=>a.directory));
  for(const id of [...used]){
    let n=manifest.nodes.find(n=>n.id===id);
    while(n?.parent){used.add(n.parent);n=manifest.nodes.find(p=>p.id===n.parent);}
  }
  return {...manifest,nodes:manifest.nodes.filter(n=>used.has(n.id)),articles,accessGroups:[]};
}
export async function readPublicManifest(copy) {
  const data=YAML.parse(await fs.readFile(path.join(ROOT,'content/site.yaml'),'utf8'));
  return selectPublic({...data,title:copy.common.siteTitle,subtitle:copy.common.pageDescription,
    intro:copy.home.intro,about:copy.about.intro,profile:{heading:copy.home.heading,contact:copy.home.contact}});
}
export function browserManifest(manifest) {
  return {...manifest,articles:manifest.articles.map(({source,accessGroup,...a})=>({
    ...a,attachments:a.attachments.map(({file,...f})=>f)
  }))};
}
