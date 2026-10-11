import data from '../../work/generated/text-public.json';
export const text=data;
export function format(template:string,values:Record<string,string|number>):string {
  return template.replace(/\{([a-zA-Z]+)\}/g,(match,key)=>key in values?String(values[key]):match);
}
