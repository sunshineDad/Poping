import { ElNotification } from 'element-plus'

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
  customClass?: string
}

function show(options: ToastOptions): void {
  ElNotification({
    title: options.title,
    message: options.message,
    type: options.type,
    duration: options.duration ?? 3000,
    showClose: options.closable ?? true,
    customClass: `notification-${options.type || 'info'} ${options.customClass || ''}`,
    dangerouslyUseHTMLString: false
  })
}

export const toast = {
  show,
  success(message: string | ToastOptions) {
    const opts = typeof message === 'string' ? { message } : message
    show({ 
      ...opts, 
      type: 'success',
      customClass: 'notification-black-white'
    })
  },
  error(message: string | ToastOptions) {
    const opts = typeof message === 'string' ? { message, duration: 0 } : { duration: 0, ...message }
    show({ 
      ...opts, 
      type: 'error',
      customClass: 'notification-black-white'
    })
  },
  warning(message: string | ToastOptions) {
    const opts = typeof message === 'string' ? { message } : message
    show({ 
      ...opts, 
      type: 'warning',
      customClass: 'notification-black-white'
    })
  },
  info(message: string | ToastOptions) {
    const opts = typeof message === 'string' ? { message } : message
    show({ 
      ...opts, 
      type: 'info',
      customClass: 'notification-black-white'
    })
  },
  clear() {
    ElNotification.closeAll()
  }
}

export default toast

