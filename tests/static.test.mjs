import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';
import {load} from 'cheerio';
import {ROOT} from '../scripts/paths.mjs';
import {readText} from '../scripts/text.mjs';
import {selectPublic,readPublicManifest} from '../scripts/manifest.mjs';
import {normalizeBase} from '../scripts/settings.mjs';
import {auditSite} from '../scripts/audit.mjs';
const output=path.join(ROOT,'outputs/pages');
const record=JSON.parse(await fs.readFile(path.join(ROOT,'work/generated/build.json'),'utf8'));
const copy=await readText(),manifest=await readPublicManifest(copy);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
test('公开发布边界：受保护文章、草稿及其专属目录均不导出',()=>{
  const nodes=[{id:'parent'},{id:'public',parent:'parent'},{id:'private'},{id:'draft'}];
  const articles=[
    {id:'open',directory:'public',status:'published',attachments:[]},
    {id:'locked',directory:'private',status:'published',accessGroup:'secret',attachments:[{id:'private-file',file:'../secret.db'}]},
    {id:'unfinished',directory:'draft',status:'draft'}
  ];
  const m=selectPublic({nodes,articles,accessGroups:[{id:'secret'}]});
  assert.deepEqual(m.articles.map(a=>a.id),['open']);
  assert.deepEqual(m.nodes.map(n=>n.id),['parent','public']);
  assert.deepEqual(m.accessGroups,[]);
  assert.throws(()=>selectPublic({nodes:[{id:'a',parent:'b'},{id:'b',parent:'a'}],articles:[]}),/循环/);
  assert.throws(()=>selectPublic({nodes:[{id:'public'}],articles:[{id:'file',directory:'public',status:'published',attachments:[{id:'file',file:'../secret.db'}]}]}),/越出/);
});
test('根网址与普通仓库网址均受支持，拒绝越界和外部地址',()=>{
  assert.equal(normalizeBase(''),'/');assert.equal(normalizeBase('/'),'/');
  assert.equal(normalizeBase('/repo-with-hyphen'),'/repo-with-hyphen/');
  for(const invalid of ['https://example.com','//example.com','/../secret/','/repo?x=1'])assert.throws(()=>normalizeBase(invalid));
});
test('全部发布页面通过链接、隐私文件与停用功能检查',async()=>{
  const result=await auditSite(output,record.base,manifest);
  assert.equal(result.articles,manifest.articles.length);
  assert.equal(result.guestbook,'empty');assert.equal(result.backendRoutes,0);
});
test('正文中的公式、定义和 SVG 数量与已验证转换结果一致',async()=>{
  let maths=0,diagrams=0,definitions=0;
  for(const a of manifest.articles){
    const generated=path.join(ROOT,'content/generated',a.id);
    const report=JSON.parse(await fs.readFile(path.join(generated,'report.json'),'utf8'));
    const $=load(await fs.readFile(path.join(output,'articles',a.id,'index.html'),'utf8'));
    assert.equal($('#article-body .inline-math,#article-body .math-block').length,report.maths,a.id);
    assert.equal($('#article-body img[src$=".svg"]').length,report.diagrams,a.id);
    assert.equal($('#article-body .newtheorem').filter((_,el)=>$(el).text().trim().startsWith('定义')).length,report.definitions,a.id);
    maths+=report.maths;diagrams+=report.diagrams;definitions+=report.definitions;
  }
  assert.ok(maths>0);assert.ok(definitions>0);
  console.log(JSON.stringify({articles:manifest.articles.length,maths,definitions,diagrams}));
});
test('所有 PDF 与已验证版本一致，确实是 PDF 文件',async()=>{
  for(const a of manifest.articles){
    const original=await fs.readFile(path.join(ROOT,'content/generated',a.id,'article.pdf'));
    const published=await fs.readFile(path.join(output,'media',a.id,'article.pdf'));
    assert.equal(published.subarray(0,5).toString(),'%PDF-');
    assert.equal(sha(published),sha(original),a.id);
  }
});
test('首页保留作者文字、头像和三个栏目入口',async()=>{
  const $=load(await fs.readFile(path.join(output,'index.html'),'utf8'));
  assert.equal($('#profile-heading').text(),copy.home.heading);
  assert.equal($('.profile-description').text(),copy.home.intro);
  assert.equal($('.brand small').text(),copy.common.brandTagline);
  assert.equal($('.entry-card').length,3);
  assert.equal($('#home-messages').attr('href'),record.base+'messages/');
  assert.equal($('footer a').length,0);
  const avatar=await fs.readFile(path.join(output,'assets/avatar.png'));
  assert.equal(sha(avatar),sha(await fs.readFile(path.join(ROOT,'content/images/avatar.png'))));
});
test('留言板保留标题及空白区域，提交、查询、管理页面不存在',async()=>{
  const $=load(await fs.readFile(path.join(output,'messages/index.html'),'utf8'));
  assert.equal($('main h1').text(),copy.messages.title);
  assert.equal($('#public-messages').length,1);
  assert.equal($('#public-messages').html(),'');
  assert.equal($('main form,main input,main textarea,main button').length,0);
  for(const rel of ['admin/index.html','messages/new/index.html','messages/receipt/index.html'])
    await assert.rejects(fs.access(path.join(output,rel)));
});
test('GitHub 工作流只上传静态输出，按 Pages 元数据构建路径',async()=>{
  const workflow=YAML.parse(await fs.readFile(path.join(ROOT,'.github/workflows/deploy-pages.yml'),'utf8'));
  const build=workflow.jobs.build;
  assert.equal(build.steps.find(s=>s.name==='Build public website').env.PAGES_BASE,'$'+'{{ steps.pages.outputs.base_path }}/');
  assert.equal(build.steps.find(s=>s.uses?.startsWith('actions/upload-pages-artifact@')).with.path,'outputs/pages');
  assert.equal(workflow.jobs.deploy.permissions.pages,'write');
  assert.equal(workflow.jobs.deploy.permissions['id-token'],'write');
});
