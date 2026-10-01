/**
 * 在首次绘制前应用已保存的主题，避免深色模式用户看到闪白。
 * 必须与 src/stores/useThemeStore.ts 使用同一个 storage key。
 * 独立外部脚本可被 CSP `script-src 'self'` 放行，无需 'unsafe-inline'。
 */
;(function () {
  try {
    var saved = localStorage.getItem('tomato-clock.theme')
    var theme =
      saved === 'light' || saved === 'dark'
        ? saved
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  } catch {
    /* localStorage 不可用（隐私模式等）时保持默认主题 */
  }
})()
