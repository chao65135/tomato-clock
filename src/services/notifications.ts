import type { TimerMode } from '../domain/timer'

export type NotificationSupport = NotificationPermission | 'unsupported'

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationSupport {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationSupport> {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  return Notification.requestPermission()
}

export function showNotification(title: string, body: string) {
  if (getNotificationPermission() !== 'granted') {
    return
  }

  const notification = new Notification(title, {
    body,
    icon: '/tomato-icon.svg',
    tag: 'tomato-clock-timer',
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }
}

export function notifyTimerCompleted(mode: TimerMode) {
  const body =
    mode === 'focus' ? '专注结束，休息一下吧。' : '休息结束，开始下一段专注吧。'

  showNotification('番茄钟', body)
}
