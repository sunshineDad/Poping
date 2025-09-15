import { createApp, ref, nextTick } from 'vue'
import Toast from '@/components/ui/Toast.vue'

/**
 * [文件概览]
 * - 目的: 全局Toast消息提示管理器
 * - 数据流: 调用方法 → 创建Toast实例 → 显示消息 → 自动销毁
 * - 核心数据: Toast实例列表、配置选项
 * - 关系: @/components/ui/Toast.vue → Toast组件
 */

export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
}

interface ToastInstance {
  id: string
  app: any
  container: HTMLElement
}

class ToastManager {
  private instances: ToastInstance[] = []
  private idCounter = 0

  /**
   * [函数: show]
   * - 输入: ToastOptions - Toast配置选项
   * - 输出: string - Toast实例ID
   * - 角色: 显示Toast消息
   * - 逻辑: 1. 创建容器 2. 创建Vue应用实例 3. 挂载组件 4. 管理生命周期
   */
  show(options: ToastOptions): string {
    const id = `toast-${++this.idCounter}`
    
    // 创建容器
    const container = document.createElement('div')
    container.id = id
    
    // 创建Vue应用实例
    const app = createApp(Toast, {
      ...options,
      visible: true,
      onClose: () => {
        this.remove(id)
      }
    })
    
    // 挂载到容器
    app.mount(container)
    
    // 添加到实例列表
    this.instances.push({
      id,
      app,
      container
    })
    
    return id
  }

  /**
   * [函数: remove]
   * - 输入: string - Toast实例ID
   * - 输出: void
   * - 角色: 移除指定的Toast实例
   * - 逻辑: 1. 查找实例 2. 卸载Vue应用 3. 移除DOM元素 4. 清理实例列表
   */
  remove(id: string): void {
    const index = this.instances.findIndex(instance => instance.id === id)
    if (index === -1) return
    
    const instance = this.instances[index]
    
    // 卸载Vue应用
    instance.app.unmount()
    
    // 移除DOM元素
    if (instance.container.parentNode) {
      instance.container.parentNode.removeChild(instance.container)
    }
    
    // 从实例列表中移除
    this.instances.splice(index, 1)
  }

  /**
   * [函数: clear]
   * - 输入: 无
   * - 输出: void
   * - 角色: 清除所有Toast实例
   * - 逻辑: 遍历所有实例并逐个移除
   */
  clear(): void {
    const instances = [...this.instances]
    instances.forEach(instance => {
      this.remove(instance.id)
    })
  }

  /**
   * [函数: success]
   * - 输入: string | ToastOptions - 消息内容或完整配置
   * - 输出: string - Toast实例ID
   * - 角色: 显示成功消息
   * - 逻辑: 调用show方法，设置type为success
   */
  success(message: string | ToastOptions): string {
    const options = typeof message === 'string' 
      ? { message, type: 'success' as const }
      : { ...message, type: 'success' as const }
    
    return this.show(options)
  }

  /**
   * [函数: error]
   * - 输入: string | ToastOptions - 消息内容或完整配置
   * - 输出: string - Toast实例ID
   * - 角色: 显示错误消息
   * - 逻辑: 调用show方法，设置type为error，duration为0（不自动关闭）
   */
  error(message: string | ToastOptions): string {
    const options = typeof message === 'string' 
      ? { message, type: 'error' as const, duration: 0 }
      : { ...message, type: 'error' as const, duration: message.duration ?? 0 }
    
    return this.show(options)
  }

  /**
   * [函数: warning]
   * - 输入: string | ToastOptions - 消息内容或完整配置
   * - 输出: string - Toast实例ID
   * - 角色: 显示警告消息
   * - 逻辑: 调用show方法，设置type为warning
   */
  warning(message: string | ToastOptions): string {
    const options = typeof message === 'string' 
      ? { message, type: 'warning' as const }
      : { ...message, type: 'warning' as const }
    
    return this.show(options)
  }

  /**
   * [函数: info]
   * - 输入: string | ToastOptions - 消息内容或完整配置
   * - 输出: string - Toast实例ID
   * - 角色: 显示信息消息
   * - 逻辑: 调用show方法，设置type为info
   */
  info(message: string | ToastOptions): string {
    const options = typeof message === 'string' 
      ? { message, type: 'info' as const }
      : { ...message, type: 'info' as const }
    
    return this.show(options)
  }
}

// 创建全局实例
const toastManager = new ToastManager()

// 导出便捷方法
export const toast = {
  show: (options: ToastOptions) => toastManager.show(options),
  success: (message: string | ToastOptions) => toastManager.success(message),
  error: (message: string | ToastOptions) => toastManager.error(message),
  warning: (message: string | ToastOptions) => toastManager.warning(message),
  info: (message: string | ToastOptions) => toastManager.info(message),
  clear: () => toastManager.clear(),
  remove: (id: string) => toastManager.remove(id)
}

// 默认导出
export default toast