import fs from 'node:fs';
import path from 'node:path';
export interface Attachment {id:string;title:string;extension:string;}
export interface Article {id:string;title:string;summary:string;directory:string;date:string;status:string;attachments:Attachment[];}
export interface Directory {id:string;title:string;parent?:string;description?:string;}
export interface TocItem {id:string;title:string;level:number;}
export interface Manifest {title:string;subtitle:string;intro:string;about:string;profile:{heading:string;contact:string;};nodes:Directory[];articles:Article[];}
export const site:Manifest=JSON.parse(fs.readFileSync(path.resolve('work/generated/site.json'),'utf8'));
export const url=(p='')=>import.meta.env.BASE_URL.replace(/\/$/,'')+'/'+p.replace(/^\//,'');
export const date=(v:string)=>String(v).slice(0,10).replaceAll('-','.');
export function directoryPath(id:string):string {const n=site.nodes.find(x=>x.id===id);return n?(n.parent?directoryPath(n.parent)+' / ':'')+n.title:'';}
export const downloadUrl=(a:Article,f?:Attachment)=>url('media/'+a.id+'/'+(f?f.id+f.extension:'article.pdf'));
export function readArticle(id:string) {
  const base=path.resolve('content/generated',id);
  return {html:fs.readFileSync(path.join(base,'article.html'),'utf8'),toc:JSON.parse(fs.readFileSync(path.join(base,'toc.json'),'utf8')) as TocItem[]};
}
