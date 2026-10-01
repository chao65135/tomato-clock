# Tomato Clock

English | [简体中文](README.md)

A pomodoro timer that focuses on the web first.

Live: <https://tomato-clock.dingchao-cn.workers.dev/>

## Features

- Focus, short break, and long break timers
- Custom durations and auto-start for the next phase
- Daily and cumulative statistics
- Browser notifications and a chime when a timer ends
- Light/dark theme
- PWA install and offline access
- Data export

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- Zustand
- vite-plugin-pwa
- Optional Sentry

## Local Development

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev            # Start the dev server
npm run build          # Typecheck and build for production
npm run preview        # Preview the production build locally
npm run deploy         # Deploy to Cloudflare Workers
npm run deploy:preview # Create a Cloudflare preview deployment
npm test               # Run unit tests
npm run test:watch     # Run unit tests in watch mode
npm run lint           # Run Oxlint
npm run typecheck      # Run a TypeScript typecheck only
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting
```

## Deployment

Live: <https://tomato-clock.dingchao-cn.workers.dev/>

The project ships with the configuration needed for Vercel, Netlify, and Cloudflare (Workers / Pages). Detailed steps:

- [Release process](docs/release.md)
- [Privacy policy](docs/privacy-policy.md)

> Note: the linked documents are currently written in Chinese only.

Optional environment variables:

```bash
VITE_SENTRY_DSN=
VITE_APP_ENV=production
```

Production build and preview:

```bash
npm run build
npm run preview
```
