import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = dirname(fileURLToPath(import.meta.url));
const source = resolve(root, 'index.template.html');
const pages = resolve(root, '页面');
const output = resolve(root, 'index.html');
const include = /<!-- include: (.+?) -->/g;

export async function renderIndex() {
  async function expand(path, parents = []) {
    if (parents.includes(path)) throw new Error('页面片段循环引用：' + relative(root, path));
    const text = await readFile(path, 'utf8');
    let result = '';
    let offset = 0;
    for (const match of text.matchAll(include)) {
      const fragment = resolve(root, match[1]);
      const withinPages = relative(pages, fragment);
      if (!withinPages || withinPages === '..' || withinPages.startsWith('..' + sep) ||
          isAbsolute(withinPages) || !fragment.endsWith('.html')) {
        throw new Error('无效的页面片段路径：' + match[1]);
      }
      result += text.slice(offset, match.index);
      result += (await expand(fragment, [...parents, path])).replace(/\r?\n$/, '');
      offset = match.index + match[0].length;
    }
    return result + text.slice(offset);
  }

  return expand(source);
}

async function build(check) {
  const html = await renderIndex();
  const previous = await readFile(output, 'utf8').catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (previous === html) return;
  if (check) throw new Error('index.html 与源文件不同步，请运行 node build-index.mjs');
  const temporary = output + '.' + process.pid + '.tmp';
  try {
    await writeFile(temporary, html, 'utf8');
    await rename(temporary, output);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log('已更新 index.html');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  try {
    if (![undefined, '--check', '--watch'].includes(mode) || process.argv.length > 3) {
      throw new Error('用法：node build-index.mjs [--check | --watch]');
    }
    await build(mode === '--check');
    if (mode === '--watch') {
      console.log('正在监听页面源文件，保存后会自动更新 index.html');
      let lastError;
      while (true) {
        await delay(500);
        try {
          await build(false);
          lastError = undefined;
        } catch (error) {
          if (error.message !== lastError) console.error(error.message);
          lastError = error.message;
        }
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
