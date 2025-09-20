import { ElMessageBox } from 'element-plus'

export async function confirmDialog(message: string, title = '确认'): Promise<boolean> {
  try {
    await ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
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

export async function alertDialog(message: string, title = '提示'): Promise<void> {
  try {
    await ElMessageBox.alert(message, title, {
      confirmButtonText: '确定',
      type: 'info',
      customClass: 'message-box-black-white',
      buttonSize: 'default',
      confirmButtonClass: 'confirm-button-black-white'
    })
  } catch {
    // 用户关闭对话框
  }
}

export async function promptDialog(message: string, title = '输入', inputValue = ''): Promise<string | null> {
  try {
    const { value } = await ElMessageBox.prompt(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue,
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

