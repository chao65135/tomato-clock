# 发布流程

## 前置条件

- Node.js 24
- npm
- 一个静态托管平台账号：Vercel、Netlify、Cloudflare Workers 或 Cloudflare Pages
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

## Cloudflare Workers（静态资源托管，已在本仓库配置）

仓库根目录的 `wrangler.jsonc` 描述了静态资源托管方式：

- `assets.directory = ./dist`：上传 `npm run build` 的产物
- `assets.not_found_handling = single-page-application`：未命中静态资源时回退 `index.html`，交给 React Router 处理前端路由

在 Cloudflare 控制台把仓库连接到 Workers（Workers & Pages → Create → Workers）后填写：

1. Build command 使用 `npm run build`。
2. Deploy command 保持默认的 `npx wrangler deploy`。
3. Preview command 保持默认的 `npx wrangler preview`。
4. Root directory 保持仓库根目录；Worker 名称建议填写 `tomato-clock`，与 `wrangler.jsonc` 中的 `name` 保持一致。
5. 配置 `VITE_SENTRY_DSN` 和 `VITE_APP_ENV`。

安全响应头（CSP、X-Frame-Options、Referrer-Policy 等）由 `public/_headers` 提供，内容与 `netlify.toml` 保持一致；`vercel.json` 不涉及该文件。

构建镜像默认 Node.js 24，满足 `vite` 的版本要求，无需额外设置 `NODE_VERSION`。

### 本地 CLI 部署（可选）

`wrangler` 已作为 devDependency 安装，可以不走 Git 集成、直接从本地部署：

```bash
npx wrangler login      # 首次使用需在浏览器完成授权
npm run build           # 生成 dist
npm run deploy          # 等价于 npx wrangler deploy，发布到生产
npm run deploy:preview  # 等价于 npx wrangler preview，创建 Preview 部署
```

部署命令读取仓库根目录的 `wrangler.jsonc`，不需要额外参数。建议先用 `npx wrangler deploy --dry-run` 校验配置与产物。

`npm run preview` 仍是 `vite preview`（本地预览 `dist`），与 Cloudflare 的 Preview 部署不是同一件事，因此后者命名为 `deploy:preview`。

因为 `wrangler` 是 devDependency，CI 与 Cloudflare 构建流程执行 `npm ci` 时会一并安装它（含 workerd 二进制），首次安装体积会明显增大。

### 关于 `public/_redirects`

Cloudflare 的静态资源引擎会把该文件里的 `/* /index.html 200` 判定为无效规则（构建日志出现 `Infinite loop detected in this rule and has been ignored`）并忽略它。这是预期行为：

- Workers 部署下 SPA 回退由 `wrangler.jsonc` 的 `assets.not_found_handling` 负责，不依赖该规则；
- 该文件保留是为了兼容 Cloudflare Pages / 其它平台的 SPA 回退写法，不影响静态资源与 `sw.js`、`manifest.webmanifest` 的正常返回。

## Cloudflare Pages（备选）

1. 构建命令使用 `npm run build`。
2. 输出目录使用 `dist`。
3. 配置 `VITE_SENTRY_DSN` 和 `VITE_APP_ENV`。
4. SPA 回退依赖 `public/_redirects`；若该规则被忽略（见上文告警），请改用 Workers 方式部署或自行补充 `404.html`。
5. `public/_headers` 对 Pages 同样生效。

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
