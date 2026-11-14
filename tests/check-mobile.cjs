// 本命令检查代码与截图处理边界；真实 CSS 渲染必须继续运行浏览器检查页。
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..');
function scripts(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(item=>item.isDirectory()?scripts(path.join(directory,item.name)):item.name.endsWith('.js')?[path.join(directory,item.name)]:[]);}
for(const file of [...scripts(path.join(root,'js/同城App')),path.join(root,'js/核心/页面会话恢复.js'),path.join(__dirname,'mobile-screenshot-check.js')])execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(index,/<script src="\.\/assets\/vendor\/html2canvas-1\.4\.1\.min\.js"/,'截图必须使用固定的本地依赖');
execFileSync(process.execPath,[path.join(root,'build-index.mjs'),'--check'],{stdio:'inherit'});
execFileSync(process.execPath,['--test',path.join(__dirname,'tongcheng-app-screenshot.test.cjs'),path.join(__dirname,'tongcheng-app-navigation.test.cjs')],{stdio:'inherit'});
console.log('\n命令行检查通过。还必须在浏览器运行 tests/mobile-screenshot-check.html?autorun=1，确认所有真实 PNG 通过，并实际点击本次修改页的“复制 App 截图”。');
