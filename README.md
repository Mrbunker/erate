# erate

多货币实时换算计算器。多行货币输入，修改任一行其余行基于 USD 交叉汇率自动联动；支持原生 HTML5 拖拽排序、增删行、localStorage 持久化，内置 170+ 种 ISO 4217 货币元数据。

在线体验：<https://mrbunker.github.io/erate/>

## 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS 3
- 字体：Fraunces / DM Sans / IBM Plex Mono
- 汇率数据源：[open.er-api.com](https://open.er-api.com/)（免费、无需 key、支持 CORS）

## 功能

- 多行货币输入，每行 = 货币选择器 + 金额输入框
- 基于 USD 交叉汇率联动：修改任意一行，其他行自动换算
- 原生 HTML5 拖拽排序（仅桌面端）
- 增删行，至少保留 1 行
- localStorage 持久化（行配置 + 金额）
- 货币选择器：搜索、常用/其他分组、已添加货币禁用、三级响应式展示

## 本地开发

```bash
npm install
npm run dev
```

## 构建与检查

```bash
npm run build   # 生产构建
npm run check   # TypeScript 类型检查
```

## 部署

通过 GitHub Actions 自动部署到 GitHub Pages（`.github/workflows/deploy.yml`）。`main` 分支推送时触发构建，Vite 的 `base` 在 CI 环境下设为 `/erate/`。
