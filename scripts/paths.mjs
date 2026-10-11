import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function inside(base, relative) {
  const p = path.resolve(base, relative);
  if (p !== base && !p.startsWith(base + path.sep)) throw new Error('路径越出指定目录: ' + relative);
  return p;
}
