import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
const manifest=JSON.parse(await fs.readFile('work/generated/site.json','utf8'));
const build=JSON.parse(await fs.readFile('work/generated/build.json','utf8'));
const base=build.base;
async function mathReady(page:any){
  await page.waitForFunction(()=>!!(window as any).MathJax?.startup?.promise);
  await page.evaluate(async()=>{await (window as any).MathJax.startup.promise;});
}
test.beforeAll(async()=>{await fs.mkdir('work/qa/screenshots',{recursive:true});});
test('首页与空白留言板不调用后台，作者文字与头像正常',async({page})=>{
  const api:string[]=[];page.on('request',r=>{if(r.url().includes('/api/'))api.push(r.url());});
  await page.goto('./');
  await expect(page.locator('#profile-heading')).toHaveText(manifest.profile.heading);
  await expect(page.locator('.entry-card')).toHaveCount(3);
  expect(await page.locator('.profile-avatar').evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
  await page.screenshot({path:'work/qa/screenshots/home-desktop.png',fullPage:true});
  await page.locator('#home-messages').click();
  await expect(page).toHaveURL(new RegExp(base.replaceAll('/','\\/')+'messages\\/$'));
  await expect(page.locator('#public-messages')).toBeEmpty();
  await expect(page.locator('main form,main input,main textarea,main button')).toHaveCount(0);
  await page.screenshot({path:'work/qa/screenshots/messages-desktop.png',fullPage:true});
  expect(api).toEqual([]);
});
test('文库搜索与清除筛选工作正常',async({page})=>{
  await page.goto('library/');
  await expect(page.locator('.article-row')).toHaveCount(manifest.articles.length);
  const input=page.locator('#library-search');
  await input.fill('切丛');await expect(page.locator('.article-row:visible')).toHaveCount(1);
  await input.fill('不存在的关键词');await expect(page.locator('.article-row:visible')).toHaveCount(0);
  await page.locator('#search-reset').click();
  await expect(page.locator('.article-row:visible')).toHaveCount(manifest.articles.length);
});
test('每篇文章的公式、图示、目录和下载均可用',async({page,request})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  let maths=0,diagrams=0;
  for(const a of manifest.articles){
    const report=JSON.parse(await fs.readFile(path.join('content/generated',a.id,'report.json'),'utf8'));
    await page.goto('articles/'+a.id+'/');
    await mathReady(page);
    await expect(page.locator('#article-body mjx-container')).toHaveCount(report.maths);
    await expect(page.locator('mjx-merror,[data-mjx-error]')).toHaveCount(0);
    await expect(page.locator('#article-toc a')).toHaveCount(report.sections);
    for(const img of await page.locator('#article-body img').all()){
      await img.scrollIntoViewIfNeeded();
      await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
      expect((await request.get(await img.getAttribute('src')??'')).status()).toBe(200);
      await img.screenshot({path:'work/qa/screenshots/'+a.id+'-diagram.png'});
    }
    const pdf=await request.get(base+'media/'+a.id+'/article.pdf');
    expect(pdf.status()).toBe(200);
    expect((await pdf.body()).subarray(0,5).toString()).toBe('%PDF-');
    if(a.id==='lie-so3')await page.screenshot({path:'work/qa/screenshots/article-desktop.png'});
    maths+=report.maths;diagrams+=report.diagrams;
  }
  console.log(JSON.stringify({renderedMaths:maths,loadedDiagrams:diagrams}));
  expect(errors).toEqual([]);
});
test('停用的后台网址返回 404，提交请求返回 405',async({request})=>{
  for(const route of ['admin/','messages/new/','messages/receipt/','api/messages','api/health','work/runtime/site.db','content/sources/lie-notes/Liejb.tex'])
    expect((await request.get(base+route)).status(),route).toBe(404);
  expect((await request.post(base+'api/messages',{data:{body:'test'}})).status()).toBe(405);
});
test('手机菜单、目录和减少动画设置可用',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('./');
  const menu=page.locator('.nav-toggle');
  await expect(menu).toBeVisible();await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');await expect(menu).toHaveAttribute('aria-expanded','false');
  await menu.focus();await page.keyboard.press('Enter');await expect(menu).toHaveAttribute('aria-expanded','true');
  await page.goto('articles/lie-tangent-bundles/');
  await mathReady(page);
  expect(await page.evaluate(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  const toc=page.locator('.toc');
  await expect(toc).not.toHaveAttribute('open','');
  await toc.locator('summary').click();await expect(toc).toHaveAttribute('open','');
  const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1);
  expect(noOverflow).toBe(true);
  const reduced=await page.locator('.reveal').count();
  if(reduced)expect(await page.locator('.reveal').first().evaluate(el=>parseFloat(getComputedStyle(el).animationDuration))).toBeLessThanOrEqual(0.001);
  await page.screenshot({path:'work/qa/screenshots/article-mobile.png'});
  await page.goto('./');
  expect(await page.locator('.reveal').first().evaluate(el=>parseFloat(getComputedStyle(el).animationDuration))).toBeLessThanOrEqual(0.001);
  await page.screenshot({path:'work/qa/screenshots/home-mobile.png',fullPage:true});
});
