import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import {ROOT} from './paths.mjs';
export const PAGE_FILES={
  common:'00-全站.yaml',home:'01-首页.yaml',library:'02-文库.yaml',article:'03-文章阅读.yaml',
  downloads:'04-下载区.yaml',messages:'05-留言板.yaml',about:'08-关于.yaml',notFound:'10-404.yaml'
};
export const REQUIRED={
  common:['siteTitle','pageDescription','brandLabel','brandTagline','skip','navLabel','navToggle','home','library','downloads','messages','about','footer','allArticles','articleCount','shortCount'],
  home:['avatarAlt','heading','intro','contact','entries','libraryDescription','messagesDescription','downloadsDescription','latest','aboutLink'],
  library:['title','description','directory','searchNote','listLabel','searchLabel','searchPlaceholder','filterResult','emptyHeading','emptyDescription','reset'],
  article:['adjacent','previous','next','back','formats','toc','tocLabel','downloadPdf','top','resources','articlePdf','pdfDescription','attachment'],
  downloads:['title','description','articlePdf','directDownload'],
  messages:['title','publicHeading'],
  about:['intro','title','contentHeading','libraryDescription','publicDownloads','demoHeading','demoDescription'],
  notFound:['title','heading','description','back']
};
export async function readPageConfigs({directory=path.join(ROOT,'content/pages')}={}) {
  const pages={};
  for(const [group,file]of Object.entries(PAGE_FILES)){
    const raw=await fs.readFile(path.join(directory,file),'utf8');
    const document=YAML.parseDocument(raw);
    if(document.errors.length)throw new Error(file+' YAML 无效：'+document.errors[0].message);
    const config=document.toJS();
    for(const key of REQUIRED[group])if(typeof config?.[key]!=='string'||!config[key].trim())
      throw new Error(file+' 缺少文字字段：'+key);
    pages[group]=Object.fromEntries(REQUIRED[group].map(key=>[key,config[key]]));
  }
  return pages;
}
