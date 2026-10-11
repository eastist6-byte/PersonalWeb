import {text,format} from '../lib/copy';
const toggle=document.querySelector<HTMLButtonElement>('.nav-toggle');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));document.querySelector('#primary-nav')?.classList.toggle('is-open',open);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){toggle?.setAttribute('aria-expanded','false');document.querySelector('#primary-nav')?.classList.remove('is-open');}});
const search=document.querySelector<HTMLInputElement>('#library-search');
if(search) {
  let directories:string[]|null=null;
  const rows=[...document.querySelectorAll<HTMLElement>('#library-list .article-row')];
  const update=()=>{let count=0;const q=search.value.trim().toLocaleLowerCase();for(const row of rows){const match=(!directories||directories.includes(row.dataset.directory||''))&&(row.dataset.title||'').toLocaleLowerCase().includes(q);row.hidden=!match;if(match)count++;}document.querySelector('#result-count')!.textContent=format(text.common.articleCount,{count});(document.querySelector('#search-empty') as HTMLElement).hidden=count>0;};
  const reset=()=>{search.value='';directories=null;document.querySelectorAll('.directory-filter').forEach(b=>b.classList.toggle('is-active',(b as HTMLElement).dataset.directories==='all'));document.querySelector('#filter-label')!.textContent=text.common.allArticles;update();};
  search.addEventListener('input',update);
  document.querySelectorAll<HTMLButtonElement>('.directory-filter').forEach(b=>b.addEventListener('click',()=>{directories=b.dataset.directories==='all'?null:(b.dataset.directories||'').split(',');document.querySelectorAll('.directory-filter').forEach(x=>x.classList.toggle('is-active',x===b));document.querySelector('#filter-label')!.textContent=b.childNodes[1]?.textContent||b.textContent||text.library.filterResult;update();}));
  document.querySelector('#search-reset')?.addEventListener('click',reset);
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)){e.preventDefault();search.focus();}});
}
function prepareToc(){
  const details=document.querySelector<HTMLDetailsElement>('.toc');
  if(details&&window.matchMedia('(max-width: 900px)').matches)details.open=false;
  const links=[...document.querySelectorAll<HTMLAnchorElement>('.toc-link')];
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)links.forEach(a=>a.classList.toggle('is-current',a.hash==='#'+entry.target.id));},{rootMargin:'-100px 0px -65% 0px'});
  document.querySelectorAll('.tex-prose h3,.tex-prose h4,.tex-prose h5').forEach(el=>observer.observe(el));
}
prepareToc();document.addEventListener('article-ready',prepareToc);
