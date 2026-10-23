import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
const id='matrix-diagonalization';
const report=JSON.parse(await fs.readFile(path.join('content/generated',id,'report.json'),'utf8'));
const toc=JSON.parse(await fs.readFile(path.join('content/generated',id,'toc.json'),'utf8'));
async function ready(page:any){
  await page.waitForFunction(()=>!!(window as any).MathJax?.startup?.promise);
  await page.evaluate(async()=>{await (window as any).MathJax.startup.promise;await document.fonts.ready;});
}
async function targetVisible(page:any,href:string){
  const target=page.locator(href);
  await expect(target).toHaveCount(1);
  await expect.poll(async()=>target.evaluate((el:HTMLElement)=>{
    const box=el.getBoundingClientRect();
    const header=document.querySelector('.site-header')!.getBoundingClientRect();
    return box.top>=header.bottom-2&&box.top<window.innerHeight-20;
  })).toBe(true);
}
test.beforeAll(async()=>{await fs.mkdir('work/qa/screenshots',{recursive:true});});
test('长文保持单页，公式、编号、插图、引用和 PDF 完整',async({page,request})=>{
  test.setTimeout(90000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('articles/'+id+'/');await ready(page);
  await expect(page.locator('main h1')).toHaveText('浅谈矩阵的对角化');
  await expect(page.locator('#article-body mjx-container')).toHaveCount(report.maths);
  await expect(page.locator('mjx-merror,[data-mjx-error],[data-mml-node="merror"]')).toHaveCount(0);
  await expect(page.locator('#article-toc a')).toHaveCount(toc.length);
  await expect(page.locator('#article-toc .toc-subsub')).toHaveCount(3);
  await expect(page.locator('#article-body .bibitem')).toHaveCount(2);
  await expect(page.locator('#article-body')).toContainText('为什么几何问题要求正交变换');
  await expect(page.locator('.chapter-navigation')).toHaveCount(0);
  const invalid=await page.locator('#article-body').evaluate(el=>Array.from(el.querySelectorAll('a[href^="#"]')).map(a=>a.getAttribute('href')!).filter(h=>h.length>1&&!document.getElementById(decodeURIComponent(h.slice(1)))));
  expect(invalid).toEqual([]);
  await page.screenshot({path:'work/qa/screenshots/matrix-diagonalization-desktop.png'});
  const image=page.locator('#article-body .tex-diagram img');await image.scrollIntoViewIfNeeded();
  await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
  const size=await image.evaluate((el:HTMLImageElement)=>({width:el.naturalWidth,height:el.naturalHeight}));
  expect(size.width).toBeGreaterThan(300);expect(size.height).toBeGreaterThan(150);
  expect(size.width/size.height).toBeGreaterThan(1.5);expect(size.width/size.height).toBeLessThan(2.5);
  expect(await (await request.get((await image.getAttribute('src'))!)).text()).toMatch(/\bstroke\s*=/);
  await image.screenshot({path:'work/qa/screenshots/matrix-diagonalization-diagram.png'});
  const href=await page.locator('.article-downloads a').first().getAttribute('href');
  const pdf=await request.get(href!);expect(pdf.status()).toBe(200);
  expect((await pdf.body()).equals(await fs.readFile(path.join('content/generated',id,'article.pdf')))).toBe(true);
  expect(errors).toEqual([]);
});
test('桌面目录全部可点击，三级标题和参考文献跳转正确',async({page})=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('articles/'+id+'/');await ready(page);
  for(let index=0;index<toc.length;index++){
    const link=page.locator('#article-toc a').nth(index),href='#'+toc[index].id;
    await expect(link).toHaveAttribute('href',href);await link.click();
    expect(new URL(page.url()).hash).toBe(href);await targetVisible(page,href);
  }
  await page.screenshot({path:'work/qa/screenshots/matrix-diagonalization-references.png'});
  await page.goBack();await targetVisible(page,'#'+toc[toc.length-2].id);
  await page.goto('articles/'+id+'/#'+toc.find((item:any)=>item.level===3).id);await ready(page);
  await targetVisible(page,'#'+toc.find((item:any)=>item.level===3).id);
});
test('手机目录全部可跳转并收起，键盘和长公式不撑宽页面',async({page})=>{
  test.setTimeout(120000);
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('articles/'+id+'/');await ready(page);
  const details=page.locator('.toc');await expect(details).not.toHaveAttribute('open','');
  for(let index=0;index<toc.length;index++){
    await details.locator('summary').click();await expect(details).toHaveAttribute('open','');
    const href='#'+toc[index].id;await page.locator('#article-toc a').nth(index).click();
    await expect(details).not.toHaveAttribute('open','');expect(new URL(page.url()).hash).toBe(href);
    await targetVisible(page,href);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  }
  await details.locator('summary').focus();await page.keyboard.press('Enter');
  await page.locator('#article-toc a').nth(10).focus();await page.keyboard.press('Enter');
  await targetVisible(page,'#'+toc[10].id);
  await page.screenshot({path:'work/qa/screenshots/matrix-diagonalization-mobile.png'});
});