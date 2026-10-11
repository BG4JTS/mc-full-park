# MC Full Park — 整合包构建工具

> Minecraft 整合包 Web 构建平台。玩家在线选 mod、查依赖、报问题。整合包作者 fork 即用。

## 功能

- **模组选择** — 紧凑列表、全选/反选、分类筛选、一键 Modrinth 外链
- **资源/光影** — 独立管理页面
- **星图依赖** — Canvas 力导向图，碰撞检测，边粒子动效，缩放/拖拽
- **健康分析** — 实时评分：缺失依赖、循环依赖、孤立依赖检测
- **Modrinth 搜索** — 支持不限版本/限定版本切换
- **反馈系统** — 浮动按钮 → 弹窗选 mod + 贴 log → 自动填充 GitHub Issue
- **Issue 追踪** — 读取 GitHub Issues，自动匹配问题 mod，重复检测
- **多格式导出** — .mcpark / .mrpack / CurseForge / config.toml / CSV
- **Fork 可配置** — 修改 `src/site-config.ts` 即可定制

## Fork 指南（整合包作者）

### 1. Fork 本仓库

点击 GitHub 右上角 **Fork** 按钮。

### 2. 修改站点配置

编辑 `src/site-config.ts`：

```typescript
export const SITE_CONFIG = {
  name: '你的整合包名',           // 显示在页面标题
  description: '你的整合包描述',
  repo: '你的用户名/你的仓库名',   // GitHub Issues 反馈目标
  repoWeb: '你的用户名/你的仓库名', // Web 工具仓库（可选）
  defaultMcVersion: '1.20.4',      // 默认 MC 版本
  defaultLoader: 'fabric',         // fabric / quilt / forge / neoforge
  accentColor: '#10b981',          // 主题色
  author: '你的名字',
  issueLabels: ['mod-conflict', 'bug', 'suggestion'],
};
```

### 3. 替换 Mod 列表

编辑 `src/data/mods.ts`，按格式填入你的 mod 列表：

```typescript
{
  id: 'mod-id',
  name: 'Mod 名称',
  version: '1.0.0',
  required: false,
  category: 'performance',  // 分类见下方
  description: '简要描述',
  source: 'modrinth',
  projectId: 'modrinth-project-id',
  dependencies: ['fabric-api'],
  env: { client: 'required', server: 'optional' },
}
```

**可用分类**: `library` / `redstone` / `performance` / `automation` / `storage` / `building` / `ui` / `visual` / `network` / `world` / `resourcepack` / `shaderpack` / `other`

### 4. 部署

```bash
npm install
npm run dev      # 本地开发
npm run build    # 构建产物在 dist/
```

可部署到 GitHub Pages / Vercel / Netlify 等平台。

## 玩家使用

1. 打开整合包作者提供的 Web 链接
2. 在「模组选择」中勾选需要的 mod
3. 查看侧栏健康评分，确保无缺失依赖
4. 导出 .mcpark / .mrpack 文件
5. 遇到问题点击右下角反馈按钮，自动带上 mod 列表和日志

## 技术栈

- React 18 + TypeScript
- Vite 5
- TailwindCSS 3
- Canvas API（星图可视化）
- GitHub REST API（Issue 读取）
- Modrinth API v2（搜索）

## License

MIT
