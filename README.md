# TapdAnalyser

基于 Monorepo 架构的全栈应用，使用 Vue3 + Express。

## 技术栈

- 包管理：pnpm + workspace
- 构建工具：Turborepo
- 前端：Vue3 + TypeScript + Vite
- 后端：Express + TypeScript
- 共享包：TypeScript

## 项目结构

```
tapdAnalyser/
├── apps/
│   ├── frontend/     # Vue3 前端应用
│   └── backend/      # Express 后端应用
├── packages/
│   └── shared/       # 共享类型和工具
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动所有项目
pnpm dev

# 启动特定项目
pnpm --filter frontend dev
pnpm --filter backend dev
```

### 构建

```bash
# 构建所有项目
pnpm build

# 构建特定项目
pnpm --filter frontend build
pnpm --filter backend build
```

### 代码检查

```bash
pnpm lint
``` 