import { useState, type FormEvent } from 'react'

import { useTimerStore } from '../stores/useTimerStore'

function SettingsPage() {
  const settings = useTimerStore((state) => state.timer.settings)
  const updateSettings = useTimerStore((state) => state.updateSettings)
  const [form, setForm] = useState({
    focusMinutes: String(settings.focusMinutes),
    shortBreakMinutes: String(settings.shortBreakMinutes),
    longBreakMinutes: String(settings.longBreakMinutes),
    sessionsUntilLongBreak: String(settings.sessionsUntilLongBreak),
    autoStartNext: settings.autoStartNext,
  })
  const [saved, setSaved] = useState(false)

  const handleNumberChange = (
    field:
      | 'focusMinutes'
      | 'shortBreakMinutes'
      | 'longBreakMinutes'
      | 'sessionsUntilLongBreak',
    value: string,
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    updateSettings({
      focusMinutes: Number(form.focusMinutes),
      shortBreakMinutes: Number(form.shortBreakMinutes),
      longBreakMinutes: Number(form.longBreakMinutes),
      sessionsUntilLongBreak: Number(form.sessionsUntilLongBreak),
      autoStartNext: form.autoStartNext,
    })
    setSaved(true)
  }

  const fields = [
    {
      key: 'focusMinutes',
      label: '专注时长',
      hint: '分钟',
    },
    {
      key: 'shortBreakMinutes',
      label: '短休息',
      hint: '分钟',
    },
    {
      key: 'longBreakMinutes',
      label: '长休息',
      hint: '分钟',
    },
    {
      key: 'sessionsUntilLongBreak',
      label: '长休息间隔',
      hint: '个番茄',
    },
  ] as const

  return (
    <section>
      <h1 className="text-2xl font-semibold">设置</h1>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {fields.map((field) => (
          <label
            key={field.key}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-slate-700 dark:text-slate-200">
              {field.label}
            </span>
            <span className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-right text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={form[field.key]}
                onChange={(event) =>
                  handleNumberChange(field.key, event.target.value)
                }
              />
              <span className="w-16 text-left text-sm text-slate-500 dark:text-slate-400">
                {field.hint}
              </span>
            </span>
          </label>
        ))}

        <label className="flex items-center justify-between gap-4">
          <span className="text-slate-700 dark:text-slate-200">
            自动开始下一阶段
          </span>
          <input
            type="checkbox"
            className="size-5 accent-rose-600"
            checked={form.autoStartNext}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                autoStartNext: event.target.checked,
              }))
              setSaved(false)
            }}
          />
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full bg-rose-600 px-6 py-2 font-medium text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          >
            保存设置
          </button>

          {saved && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              已保存
            </p>
          )}
        </div>
      </form>
    </section>
  )
}

export default SettingsPage
