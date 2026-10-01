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
  const permission = getNotificationPermission()

  if (permission === 'denied' || permission === 'default') {
    return
  }

  const options: NotificationOptions = {
    body,
    icon: '/tomato-icon.svg',
    tag: 'tomato-clock-timer',
  }

  // 桌面浏览器优先用页面构造的通知，可绑定 onclick 聚焦窗口。
  // Android Chrome / iOS PWA 构造时会抛错，降级到 Service Worker 通知。
  if (permission === 'granted' && isNotificationSupported()) {
    try {
      const notification = new Notification(title, options)

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return
    } catch {
      // 继续走 Service Worker 通知
    }
  }

  if (!('serviceWorker' in navigator)) {
    return
  }

  void navigator.serviceWorker
    .getRegistration()
    .then((registration) => registration?.showNotification(title, options))
    .catch(() => {
      // 通知失败不应影响计时器本身
    })
}

export function notifyTimerCompleted(mode: TimerMode) {
  const body =
    mode === 'focus' ? '专注结束，休息一下吧。' : '休息结束，开始下一段专注吧。'

  showNotification('番茄钟', body)
}
