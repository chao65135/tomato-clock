import { NavLink, Route, Routes } from 'react-router-dom'
import TimerEngine from './components/TimerEngine'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import StatsPage from './pages/StatsPage'
import { useThemeStore } from './stores/useThemeStore'

function App() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TimerEngine />

      <header className="border-b border-slate-200 dark:border-slate-800">
        <nav className="mx-auto flex w-full max-w-2xl items-center gap-6 px-4 py-4">
          <span className="font-semibold">Tomato Clock</span>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'text-rose-600 dark:text-rose-400' : ''
            }
          >
            计时
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? 'text-rose-600 dark:text-rose-400' : ''
            }
          >
            设置
          </NavLink>
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              isActive ? 'text-rose-600 dark:text-rose-400' : ''
            }
          >
            统计
          </NavLink>

          <button
            type="button"
            className="ml-auto rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {theme === 'dark' ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
