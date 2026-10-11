#!/usr/bin/env node

/**
 * Fork 初始化脚本 — 一键配置你的整合包 Web 工具
 * 用法: node scripts/setup-fork.cjs
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

const CONFIG_PATH = path.join(__dirname, '..', 'src', 'site-config.ts');
const MODS_PATH = path.join(__dirname, '..', 'src', 'data', 'mods.ts');
const INDEX_HTML = path.join(__dirname, '..', 'index.html');
const README_PATH = path.join(__dirname, '..', 'README.md');

async function main() {
  console.log('\n🔧 MC Full Park — Fork 初始化向导\n');
  console.log('按 Enter 跳过某项，保留默认值。\n');

  const name = (await ask('整合包名称 [MC Full Park]: ')) || 'MC Full Park';
  const description = (await ask('整合包描述 [Minecraft 整合包构建工具]: ')) || 'Minecraft 整合包构建工具';
  const author = (await ask('作者/GitHub 用户名 [BG4JTS]: ')) || 'BG4JTS';
  const repo = (await ask(`仓库名 [${name.toLowerCase().replace(/\s+/g, '-')}]: `)) || name.toLowerCase().replace(/\s+/g, '-');
  const mcVersion = (await ask('默认 MC 版本 [26.1.2]: ')) || '26.1.2';
  const loader = (await ask('默认加载器 (fabric/quilt/forge/neoforge) [fabric]: ')) || 'fabric';
  const accent = (await ask('主题色 (hex) [#10b981]: ')) || '#10b981';

  const fullRepo = `${author}/${repo}`;

  // 1. Update site-config.ts
  const siteConfig = `export const SITE_CONFIG = {
  name: '${name}',
  description: '${description}',
  repo: '${fullRepo}',
  repoWeb: '${fullRepo}',
  defaultMcVersion: '${mcVersion}',
  defaultLoader: '${loader}',
  accentColor: '${accent}',
  author: '${author}',
  issueLabels: ['mod-conflict', 'bug', 'suggestion'],
};
`;
  fs.writeFileSync(CONFIG_PATH, siteConfig, 'utf-8');
  console.log(`\n✅ 已更新 ${CONFIG_PATH}`);

  // 2. Update index.html title
  let html = fs.readFileSync(INDEX_HTML, 'utf-8');
  html = html.replace(/<title>.*<\/title>/, `<title>${name}</title>`);
  fs.writeFileSync(INDEX_HTML, html, 'utf-8');
  console.log(`✅ 已更新 index.html 标题`);

  // 3. Update README title
  let readme = fs.readFileSync(README_PATH, 'utf-8');
  readme = readme.replace(/^# .+$/m, `# ${name} — 整合包构建工具`);
  readme = readme.replace(/^> .+$/m, `> ${description}。玩家在线选 mod、查依赖、报问题。整合包作者 fork 即用。`);
  fs.writeFileSync(README_PATH, readme, 'utf-8');
  console.log(`✅ 已更新 README.md`);

  // 4. Remind about mods.ts
  console.log(`\n📝 下一步：编辑 src/data/mods.ts，替换为你的 mod 列表。`);
  console.log(`   分类可选: library / redstone / performance / automation / storage`);
  console.log(`             building / ui / visual / network / world / other`);
  console.log(`             resourcepack / shaderpack\n`);

  // 5. Remind about GitHub Pages
  console.log(`🚀 部署 GitHub Pages:`);
  console.log(`   1. git push origin main`);
  console.log(`   2. 仓库 Settings → Pages → Source: GitHub Actions`);
  console.log(`   3. 推送后自动部署到 https://${author}.github.io/${repo}/\n`);

  console.log(`🎉 初始化完成！运行 npm run dev 开始开发。\n`);
  rl.close();
}

main();
