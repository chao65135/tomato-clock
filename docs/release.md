# 发布流程

## 前置条件

- Node.js 24
- npm
- 一个静态托管平台账号：Vercel、Netlify 或 Cloudflare Pages
- 可选：Sentry DSN

## 本地发布前检查

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
```

生产预览：

```bash
npm run preview
```

建议在 `https://localhost:4173` 或部署后的 HTTPS 环境测试通知和 PWA 安装能力。

## 环境变量

复制 `.env.example` 到部署平台的对应环境变量设置中：

- `VITE_SENTRY_DSN`：可选，Sentry 项目 DSN
- `VITE_APP_ENV`：环境标识，例如 `production` 或 `staging`

## Vercel

1. 在 Vercel 导入仓库。
2. Framework 选择 Vite。
3. Build command 保持 `npm run build`。
4. Output directory 设置为 `dist`。
5. 配置上述环境变量后发布。

SPA 路由和基础安全响应头已经通过 `vercel.json` 配置。

## Netlify

1. 在 Netlify 导入仓库。
2. 构建命令使用 `npm run build`。
3. 发布目录使用 `dist`。
4. 配置环境变量。

`netlify.toml` 已包含 SPA redirect、缓存和基础安全响应头。

## Cloudflare Pages

1. 构建命令使用 `npm run build`。
2. 输出目录使用 `dist`。
3. 配置 `VITE_SENTRY_DSN` 和 `VITE_APP_ENV`。
4. 项目内已有的 `public/_redirects` 会处理 SPA 路由。

## Sentry

创建 Sentry 项目后，将 DSN 填入 `VITE_SENTRY_DSN`。应用会在存在 DSN 时自动初始化。

## 版本号

建议使用语义化版本：

```bash
npm version patch
npm version minor
npm version major
```

## 回滚

Web 端回滚通常是在托管平台选择上一个成功部署的版本重新发布。
