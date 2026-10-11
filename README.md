# MC Full Park - Minecraft 26.1.2 生电整合包

<div align="center">

[![Modrinth](https://img.shields.io/modrinth/dt/cG4k3W8Y?label=Downloads&style=flat-square)](https://modrinth.com/modpack/mc-full-park)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Minecraft 26.1.2 自动化生电建筑整合包**

</div>

## 📦 功能特性

### 双模式分发
- **社区版**: 面向普通用户的完整打包版本（Modrinth/GitHub Releases）
- **自定义版**: Web 工具自动生成个性化 mod 配置

### 核心能力
- ✅ 自动化构建与发布（CI/CD via GitHub Actions）
- ✅ Modrinth API 自动发布
- ✅ Web 端 mod 选择器 + 依赖自动解析
- ✅ 一键导出 CurseForge/Modrinth 兼容配置

## 🚀 快速开始

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/mc-full-park.git
cd mc-full-park

# 安装 Rope（Rust 环境要求）
cargo install rope-cli

# 启动 Web 开发服务器
npm run dev
```

### CI/CD 流程
```yaml
# .github/workflows/release.yml
# 自动执行步骤：
# 1. 检查代码 → 2. 构建资源包 → 3. 上传 Modrinth → 4. 创建 GitHub Release
```

## 🌐 Web 工具

访问 `http://localhost:5173` 使用：
- 📋 浏览全部可用 mods
- 🔍 搜索过滤
- ✓️ 勾选需要的 mod
- 📥 自动处理依赖关系
- 💾 导出配置文件（`.jar`, `.json`）

## 📋 项目结构

```
mc-full-park/
├── .github/
│   └── workflows/          # CI/CD 工作流
│       ├── release.yml     # 发行版构建发布
│       └── deploy-web.yml  # Web 部署
├── web/                    # Web 应用源码
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── utils/         # 依赖解析工具
│   │   └── App.tsx        # 主应用
├── resources/              # 资源包模板
├── scripts/               # 构建脚本
│   ├── build-pack.js
│   └── modrinth-push.js
├── rope.toml              # Rope 配置文件
└── package.json           # 项目依赖
```

## 🛠️ 技术栈

- **构建工具**: Rope (Modpack Builder)
- **CI/CD**: GitHub Actions
- **前端**: React + Vite + TailwindCSS
- **后端 API**: Node.js Express
- **部署**: Modrinth API / GitHub Releases

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

<div align="center">
Made with ❤️ for Minecraft Redstone Engineers
</div>
