import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'tomato-clock.theme'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }
  } catch {
    // 存储不可用时退回系统偏好
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function persistTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // 写入失败（隐私模式、配额）时仅在内存中生效
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
    persistTheme(nextTheme)
    applyTheme(nextTheme)
    set({ theme: nextTheme })
  },
  setTheme: (theme) => {
    persistTheme(theme)
    applyTheme(theme)
    set({ theme })
  },
}))
