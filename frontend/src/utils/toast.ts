import { ElNotification } from 'element-plus'

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
}

function show(options: ToastOptions): void {
  ElNotification({
    title: options.title,
    message: options.message,
    type: options.type,
    duration: options.duration ?? 3000,
    showClose: options.closable ?? true
  })
}

export const toast = {
  show,
  success(message: string | ToastOptions) {
    const opts = typeof message === 'string' ? { message } : message
    show({ ...opts, type: 'success' })
  },
  error(message: string | ToastOptions) {
    const opts = typeof message === 'string' ? { message, duration: 0 } : { duration: 0, ...message }
    show({ ...opts, type: 'error' })
  },
  warning(message: string | ToastOptions) {
    const opts = typeof message === 'string' ? { message } : message
    show({ ...opts, type: 'warning' })
  },
  info(message: string | ToastOptions) {
    const opts = typeof message === 'string' ? { message } : message
    show({ ...opts, type: 'info' })
  },
  clear() {
    ElNotification.closeAll()
  }
}

export default toast

