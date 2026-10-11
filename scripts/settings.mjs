export function normalizeBase(value) {
  if(typeof value!=='string')throw new Error('PAGES_BASE 必须是路径');
  if(value==='')return '/';
  if(!value.startsWith('/')||value.includes('//')||value.includes('..')||/[?#\\\s]/.test(value))
    throw new Error('PAGES_BASE 应为 / 或 /仓库名/，不能包含网址、空格、查询参数或上级路径');
  return value.endsWith('/')?value:value+'/';
}
