(function(){
  const script=document.currentScript.src;
  const base=new URL('../vendor/mathjax/',script).href.replace(/\/$/,'');
  const fontPath=new URL('../vendor/mathjax-newcm-font',script).href.replace(/\/$/,'');
  window.MathJax={loader:{paths:{mathjax:base}},tex:{inlineMath:[['\\(','\\)']],displayMath:[['\\[','\\]']],packages:{'[+]':['ams'],'[-]':['noundefined']},tags:'none',macros:{relax:''}},output:{font:'mathjax-newcm',fontPath},svg:{fontCache:'local'},options:{enableMenu:false,skipHtmlTags:['script','noscript','style','textarea','pre','code']},startup:{pageReady:()=>window.MathJax.startup.defaultPageReady().then(()=>{document.dispatchEvent(new Event('math-ready'));})}};
})();
