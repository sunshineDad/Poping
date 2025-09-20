import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'

// 消息提示接口
interface MessageOptions {
  message: string
  duration?: number
  showClose?: boolean
  customClass?: string
}

// 通知提示接口
interface NotificationOptions {
  title?: string
  message: string
  duration?: number
  showClose?: boolean
  customClass?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

// 确认对话框接口
interface ConfirmOptions {
  title?: string
  message: string
  confirmButtonText?: string
  cancelButtonText?: string
  type?: 'warning' | 'info' | 'success' | 'error'
}

// 输入对话框接口
interface PromptOptions {
  title?: string
  message: string
  inputValue?: string
  confirmButtonText?: string
  cancelButtonText?: string
}

/**
 * 统一消息提示工具
 * 使用Element-UI组件库，采用黑白配色方案
 */
class MessageService {
  
  // ========== 消息提示 (Message) ==========
  
  /**
   * 成功消息
   */
  success(options: string | MessageOptions) {
    const config = this.normalizeMessageOptions(options)
    return ElMessage({
      type: 'success',
      ...config,
      customClass: `message-success ${config.customClass || ''}`.trim()
    })
  }

  /**
   * 错误消息
   */
  error(options: string | MessageOptions) {
    const config = this.normalizeMessageOptions(options)
    return ElMessage({
      type: 'error',
      ...config,
      customClass: `message-error ${config.customClass || ''}`.trim()
    })
  }

  /**
   * 警告消息
   */
  warning(options: string | MessageOptions) {
    const config = this.normalizeMessageOptions(options)
    return ElMessage({
      type: 'warning',
      ...config,
      customClass: `message-warning ${config.customClass || ''}`.trim()
    })
  }

  /**
   * 信息消息
   */
  info(options: string | MessageOptions) {
    const config = this.normalizeMessageOptions(options)
    return ElMessage({
      type: 'info',
      ...config,
      customClass: `message-info ${config.customClass || ''}`.trim()
    })
  }

  // ========== 通知提示 (Notification) ==========
  
  /**
   * 成功通知
   */
  notifySuccess(options: string | NotificationOptions) {
    const config = this.normalizeNotificationOptions(options)
    return ElNotification({
      type: 'success',
      ...config,
      customClass: `notification-success notification-black-white ${config.customClass || ''}`.trim()
    })
  }

  /**
   * 错误通知
   */
  notifyError(options: string | NotificationOptions) {
    const config = this.normalizeNotificationOptions(options)
    return ElNotification({
      type: 'error',
      ...config,
      customClass: `notification-error notification-black-white ${config.customClass || ''}`.trim()
    })
  }

  /**
   * 警告通知
   */
  notifyWarning(options: string | NotificationOptions) {
    const config = this.normalizeNotificationOptions(options)
    return ElNotification({
      type: 'warning',
      ...config,
      customClass: `notification-warning notification-black-white ${config.customClass || ''}`.trim()
    })
  }

  /**
   * 信息通知
   */
  notifyInfo(options: string | NotificationOptions) {
    const config = this.normalizeNotificationOptions(options)
    return ElNotification({
      type: 'info',
      ...config,
      customClass: `notification-info notification-black-white ${config.customClass || ''}`.trim()
    })
  }

  // ========== 对话框 (MessageBox) ==========
  
  /**
   * 确认对话框
   */
  async confirm(options: string | ConfirmOptions): Promise<boolean> {
    const config = this.normalizeConfirmOptions(options)
    try {
      await ElMessageBox.confirm(config.message, config.title, {
        confirmButtonText: config.confirmButtonText || '确定',
        cancelButtonText: config.cancelButtonText || '取消',
        type: config.type || 'warning',
        customClass: 'message-box-black-white',
        buttonSize: 'default',
        showCancelButton: true,
        showConfirmButton: true,
        cancelButtonClass: 'cancel-button-black-white',
        confirmButtonClass: 'confirm-button-black-white'
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * 警告对话框
   */
  async alert(options: string | ConfirmOptions): Promise<void> {
    const config = this.normalizeConfirmOptions(options)
    try {
      await ElMessageBox.alert(config.message, config.title, {
        confirmButtonText: config.confirmButtonText || '确定',
        type: config.type || 'info',
        customClass: 'message-box-black-white',
        buttonSize: 'default',
        confirmButtonClass: 'confirm-button-black-white'
      })
    } catch {
      // 用户关闭对话框
    }
  }

  /**
   * 输入对话框
   */
  async prompt(options: string | PromptOptions): Promise<string | null> {
    const config = this.normalizePromptOptions(options)
    try {
      const { value } = await ElMessageBox.prompt(config.message, config.title, {
        confirmButtonText: config.confirmButtonText || '确定',
        cancelButtonText: config.cancelButtonText || '取消',
        inputValue: config.inputValue || '',
        customClass: 'message-box-black-white',
        buttonSize: 'default',
        showCancelButton: true,
        cancelButtonClass: 'cancel-button-black-white',
        confirmButtonClass: 'confirm-button-black-white'
      })
      return value
    } catch {
      return null
    }
  }

  // ========== 清理方法 ==========
  
  /**
   * 关闭所有消息
   */
  closeAllMessages() {
    ElMessage.closeAll()
  }

  /**
   * 关闭所有通知
   */
  closeAllNotifications() {
    ElNotification.closeAll()
  }

  // ========== 私有方法 ==========
  
  private normalizeMessageOptions(options: string | MessageOptions): MessageOptions {
    if (typeof options === 'string') {
      return {
        message: options,
        duration: 3000,
        showClose: true
      }
    }
    return {
      duration: 3000,
      showClose: true,
      ...options
    }
  }

  private normalizeNotificationOptions(options: string | NotificationOptions): NotificationOptions {
    if (typeof options === 'string') {
      return {
        message: options,
        duration: 4500,
        showClose: true,
        position: 'top-right'
      }
    }
    return {
      duration: 4500,
      showClose: true,
      position: 'top-right',
      ...options
    }
  }

  private normalizeConfirmOptions(options: string | ConfirmOptions): ConfirmOptions {
    if (typeof options === 'string') {
      return {
        message: options,
        title: '确认'
      }
    }
    return {
      title: '确认',
      ...options
    }
  }

  private normalizePromptOptions(options: string | PromptOptions): PromptOptions {
    if (typeof options === 'string') {
      return {
        message: options,
        title: '输入'
      }
    }
    return {
      title: '输入',
      ...options
    }
  }
}

// 导出单例实例
export const message = new MessageService()

// 兼容性导出 - 保持与原有toast和confirm的接口一致
export const toast = {
  success: (msg: string) => message.notifySuccess(msg),
  error: (msg: string) => message.notifyError(msg),
  warning: (msg: string) => message.notifyWarning(msg),
  info: (msg: string) => message.notifyInfo(msg),
  clear: () => message.closeAllNotifications()
}

export const confirm = message.confirm.bind(message)
export const alert = message.alert.bind(message)
export const prompt = message.prompt.bind(message)

// 默认导出
export default message