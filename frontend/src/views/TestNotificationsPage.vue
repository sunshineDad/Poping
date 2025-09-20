<template>
  <div class="test-notifications-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">通知组件测试页面</h1>
      <p class="page-description">测试所有Element-UI通知组件的黑白配色方案</p>
    </div>

    <!-- 测试区域 -->
    <div class="test-sections">
      
      <!-- 消息提示测试 -->
      <div class="test-section">
        <h2 class="section-title">消息提示 (Message)</h2>
        <div class="button-group">
          <button @click="testMessageSuccess" class="test-btn success">成功消息</button>
          <button @click="testMessageError" class="test-btn error">错误消息</button>
          <button @click="testMessageWarning" class="test-btn warning">警告消息</button>
          <button @click="testMessageInfo" class="test-btn info">信息消息</button>
          <button @click="clearAllMessages" class="test-btn clear">清除所有消息</button>
        </div>
      </div>

      <!-- 通知提示测试 -->
      <div class="test-section">
        <h2 class="section-title">通知提示 (Notification)</h2>
        <div class="button-group">
          <button @click="testNotificationSuccess" class="test-btn success">成功通知</button>
          <button @click="testNotificationError" class="test-btn error">错误通知</button>
          <button @click="testNotificationWarning" class="test-btn warning">警告通知</button>
          <button @click="testNotificationInfo" class="test-btn info">信息通知</button>
          <button @click="clearAllNotifications" class="test-btn clear">清除所有通知</button>
        </div>
      </div>

      <!-- 对话框测试 -->
      <div class="test-section">
        <h2 class="section-title">对话框 (MessageBox)</h2>
        <div class="button-group">
          <button @click="testConfirmDialog" class="test-btn confirm">确认对话框</button>
          <button @click="testAlertDialog" class="test-btn alert">警告对话框</button>
          <button @click="testPromptDialog" class="test-btn prompt">输入对话框</button>
        </div>
      </div>

      <!-- 兼容性测试 -->
      <div class="test-section">
        <h2 class="section-title">兼容性测试 (原有接口)</h2>
        <div class="button-group">
          <button @click="testToastSuccess" class="test-btn success">Toast 成功</button>
          <button @click="testToastError" class="test-btn error">Toast 错误</button>
          <button @click="testToastWarning" class="test-btn warning">Toast 警告</button>
          <button @click="testToastInfo" class="test-btn info">Toast 信息</button>
          <button @click="testConfirmFunction" class="test-btn confirm">Confirm 函数</button>
        </div>
      </div>

    </div>

    <!-- 测试结果显示 -->
    <div class="test-results">
      <h2 class="section-title">测试结果</h2>
      <div class="result-list">
        <div v-for="result in testResults" :key="result.id" class="result-item">
          <span class="result-time">{{ result.time }}</span>
          <span class="result-type" :class="result.type">{{ result.message }}</span>
        </div>
      </div>
      <button @click="clearResults" class="test-btn clear">清除结果</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message, toast, confirm, alert, prompt } from '@/utils/message'

// 测试结果记录
const testResults = ref<Array<{id: number, time: string, message: string, type: string}>>([])
let resultId = 0

// 添加测试结果
const addResult = (msg: string, type: string = 'info') => {
  testResults.value.unshift({
    id: ++resultId,
    time: new Date().toLocaleTimeString(),
    message: msg,
    type
  })
}

// ========== 消息提示测试 ==========
const testMessageSuccess = () => {
  message.success('这是一个成功消息提示')
  addResult('成功消息提示已显示', 'success')
}

const testMessageError = () => {
  message.error('这是一个错误消息提示')
  addResult('错误消息提示已显示', 'error')
}

const testMessageWarning = () => {
  message.warning('这是一个警告消息提示')
  addResult('警告消息提示已显示', 'warning')
}

const testMessageInfo = () => {
  message.info('这是一个信息消息提示')
  addResult('信息消息提示已显示', 'info')
}

const clearAllMessages = () => {
  message.closeAllMessages()
  addResult('所有消息提示已清除', 'clear')
}

// ========== 通知提示测试 ==========
const testNotificationSuccess = () => {
  message.notifySuccess({
    title: '操作成功',
    message: '您的操作已成功完成，系统已自动保存相关数据。'
  })
  addResult('成功通知已显示', 'success')
}

const testNotificationError = () => {
  message.notifyError({
    title: '操作失败',
    message: '操作执行失败，请检查网络连接或稍后重试。'
  })
  addResult('错误通知已显示', 'error')
}

const testNotificationWarning = () => {
  message.notifyWarning({
    title: '注意事项',
    message: '当前操作可能会影响系统性能，建议在低峰期执行。'
  })
  addResult('警告通知已显示', 'warning')
}

const testNotificationInfo = () => {
  message.notifyInfo({
    title: '系统提示',
    message: '系统将在5分钟后进行例行维护，请及时保存工作。'
  })
  addResult('信息通知已显示', 'info')
}

const clearAllNotifications = () => {
  message.closeAllNotifications()
  addResult('所有通知已清除', 'clear')
}

// ========== 对话框测试 ==========
const testConfirmDialog = async () => {
  const result = await message.confirm({
    title: '确认删除',
    message: '您确定要删除这个项目吗？此操作不可撤销。',
    type: 'warning'
  })
  addResult(`确认对话框结果: ${result ? '确认' : '取消'}`, result ? 'success' : 'info')
}

const testAlertDialog = async () => {
  await message.alert({
    title: '系统通知',
    message: '您的账户余额不足，请及时充值以继续使用服务。',
    type: 'info'
  })
  addResult('警告对话框已显示', 'info')
}

const testPromptDialog = async () => {
  const result = await message.prompt({
    title: '输入名称',
    message: '请输入新项目的名称：',
    inputValue: '默认项目名称'
  })
  addResult(`输入对话框结果: ${result || '取消'}`, result ? 'success' : 'info')
}

// ========== 兼容性测试 ==========
const testToastSuccess = () => {
  toast.success('这是使用原有toast接口的成功提示')
  addResult('Toast成功提示已显示（兼容性测试）', 'success')
}

const testToastError = () => {
  toast.error('这是使用原有toast接口的错误提示')
  addResult('Toast错误提示已显示（兼容性测试）', 'error')
}

const testToastWarning = () => {
  toast.warning('这是使用原有toast接口的警告提示')
  addResult('Toast警告提示已显示（兼容性测试）', 'warning')
}

const testToastInfo = () => {
  toast.info('这是使用原有toast接口的信息提示')
  addResult('Toast信息提示已显示（兼容性测试）', 'info')
}

const testConfirmFunction = async () => {
  const result = await confirm('您确定要执行这个操作吗？')
  addResult(`Confirm函数结果: ${result ? '确认' : '取消'}（兼容性测试）`, result ? 'success' : 'info')
}

// ========== 工具函数 ==========
const clearResults = () => {
  testResults.value = []
  addResult('测试结果已清除', 'clear')
}
</script>

<style scoped>
.test-notifications-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  background-color: #f9fafb;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
}

.page-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.test-sections {
  display: grid;
  gap: 24px;
  margin-bottom: 40px;
}

.test-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.test-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.test-btn.success {
  background-color: #111827;
  color: white;
}

.test-btn.success:hover {
  background-color: #1f2937;
  transform: translateY(-1px);
}

.test-btn.error {
  background-color: #dc2626;
  color: white;
}

.test-btn.error:hover {
  background-color: #b91c1c;
  transform: translateY(-1px);
}

.test-btn.warning {
  background-color: #f59e0b;
  color: white;
}

.test-btn.warning:hover {
  background-color: #d97706;
  transform: translateY(-1px);
}

.test-btn.info {
  background-color: #6b7280;
  color: white;
}

.test-btn.info:hover {
  background-color: #4b5563;
  transform: translateY(-1px);
}

.test-btn.confirm {
  background-color: #111827;
  color: white;
}

.test-btn.confirm:hover {
  background-color: #1f2937;
  transform: translateY(-1px);
}

.test-btn.alert {
  background-color: #f59e0b;
  color: white;
}

.test-btn.alert:hover {
  background-color: #d97706;
  transform: translateY(-1px);
}

.test-btn.prompt {
  background-color: #6b7280;
  color: white;
}

.test-btn.prompt:hover {
  background-color: #4b5563;
  transform: translateY(-1px);
}

.test-btn.clear {
  background-color: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.test-btn.clear:hover {
  background-color: #f3f4f6;
  transform: translateY(-1px);
}

.test-results {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.result-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.result-item:last-child {
  border-bottom: none;
}

.result-time {
  color: #9ca3af;
  margin-right: 12px;
  min-width: 80px;
  font-family: monospace;
}

.result-type {
  flex: 1;
}

.result-type.success {
  color: #059669;
}

.result-type.error {
  color: #dc2626;
}

.result-type.warning {
  color: #d97706;
}

.result-type.info {
  color: #2563eb;
}

.result-type.clear {
  color: #6b7280;
}

@media (max-width: 768px) {
  .test-notifications-page {
    padding: 16px;
  }
  
  .page-header {
    padding: 24px 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .test-btn {
    width: 100%;
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .result-time {
    min-width: auto;
    margin-right: 0;
  }
}
</style>