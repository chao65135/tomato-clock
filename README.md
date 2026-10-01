# Tomato Clock

一个先聚焦 Web 端的番茄钟工具。

## 功能

- 专注、短休息、长休息计时
- 自定义时长和自动开始下一阶段
- 每日和累计统计
- 计时结束浏览器通知和提示音
- 浅色/深色主题
- PWA 安装和离线访问
- 数据导出

## 技术栈

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- Zustand
- vite-plugin-pwa
- 可选 Sentry

## 本地开发

```bash
npm install
npm run dev
```

## 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 类型检查并构建生产版本
npm run preview      # 预览生产构建
npm test             # 运行单元测试
npm run test:watch   # 监听模式运行单元测试
npm run lint         # 运行 Oxlint
npm run typecheck    # 仅运行 TypeScript 类型检查
npm run format       # 使用 Prettier 格式化代码
npm run format:check # 检查代码格式
```

## 部署

项目已包含 Vercel、Netlify 和 Cloudflare（Workers / Pages）所需配置。详细步骤见：

- [发布流程](docs/release.md)
- [隐私说明](docs/privacy-policy.md)

可选环境变量：

```bash
VITE_SENTRY_DSN=
VITE_APP_ENV=production
```

生产构建和预览：

```bash
npm run build
npm run preview
```
