#!/usr/bin/env node

/**
 * 前端代码规范检查脚本
 * 检查项目是否遵循技术规范
 */

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class StandardsChecker {
  constructor() {
    this.errors = []
    this.warnings = []
    this.srcDir = path.join(__dirname, '../src')
  }

  // 检查文件内容
  checkFileContent(filePath, content) {
    const relativePath = path.relative(this.srcDir, filePath)
    
    // 检查 Axios 导入
    this.checkAxiosImports(relativePath, content)
    
    // 检查 Vue 组件结构
    if (filePath.endsWith('.vue')) {
      this.checkVueComponentStructure(relativePath, content)
    }
    
    // 检查 TypeScript 规范
    if (filePath.endsWith('.ts') || filePath.endsWith('.vue')) {
      this.checkTypeScriptStandards(relativePath, content)
    }
  }

  // 检查 Axios 导入规范
  checkAxiosImports(filePath, content) {
    // 检查是否直接导入 axios（除了 http.ts）
    if (!filePath.includes('utils\\http.ts') && !filePath.includes('utils/http.ts')) {
      const directAxiosImport = /import.*axios.*from.*['"]axios['"]/g
      if (directAxiosImport.test(content)) {
        this.errors.push({
          file: filePath,
          rule: 'axios-import',
          message: '不应直接导入 axios，请使用 @/utils/http'
        })
      }
    }
    
    // 检查是否使用了统一的 http 工具（排除 http.ts 文件本身）
    if (!filePath.includes('utils\\http.ts') && !filePath.includes('utils/http.ts')) {
      const hasApiCall = /\.(get|post|put|delete|patch)\s*\(/g
      const hasHttpImport = /import.*http.*from.*@\/utils\/http/g
      
      if (hasApiCall.test(content) && !hasHttpImport.test(content)) {
        this.warnings.push({
          file: filePath,
          rule: 'http-import',
          message: '检测到 API 调用但未导入 http 工具'
        })
      }
    }
  }

  // 检查 Vue 组件结构
  checkVueComponentStructure(filePath, content) {
    // 检查 SFC 顺序：template → script → style
    const templateIndex = content.indexOf('<template>')
    const scriptIndex = content.indexOf('<script')
    const styleIndex = content.indexOf('<style')
    
    if (templateIndex > -1 && scriptIndex > -1) {
      if (templateIndex > scriptIndex) {
        this.errors.push({
          file: filePath,
          rule: 'sfc-order',
          message: 'Vue SFC 应按 template → script → style 顺序排列'
        })
      }
    }
    
    // 检查是否使用 Composition API
    if (scriptIndex > -1) {
      const scriptContent = content.substring(scriptIndex)
      const hasSetup = /<script\s+setup/g.test(scriptContent)
      const hasOptionsAPI = /export\s+default\s*{/g.test(scriptContent)
      
      if (hasOptionsAPI && !hasSetup) {
        this.warnings.push({
          file: filePath,
          rule: 'composition-api',
          message: '建议使用 Composition API (<script setup>)'
        })
      }
    }
  }

  // 检查 TypeScript 规范
  checkTypeScriptStandards(filePath, content) {
    // 检查是否有 console.log 残留
    const consoleLog = /console\.log\s*\(/g
    if (consoleLog.test(content)) {
      this.warnings.push({
        file: filePath,
        rule: 'no-console',
        message: '发现 console.log，生产环境前请移除'
      })
    }
    
    // 检查接口命名（应使用 PascalCase）
    const interfaceRegex = /interface\s+([a-z][a-zA-Z]*)/g
    let match
    while ((match = interfaceRegex.exec(content)) !== null) {
      this.warnings.push({
        file: filePath,
        rule: 'interface-naming',
        message: `接口 "${match[1]}" 应使用 PascalCase 命名`
      })
    }
  }

  // 运行检查
  async run() {
    console.log('🔍 开始检查前端代码规范...\n')
    
    // 获取所有需要检查的文件
    const files = [
      ...(await glob('**/*.vue', { cwd: this.srcDir })),
      ...(await glob('**/*.ts', { cwd: this.srcDir })),
      ...(await glob('**/*.js', { cwd: this.srcDir }))
    ].map(file => path.join(this.srcDir, file))
    
    // 检查每个文件
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8')
        this.checkFileContent(file, content)
      } catch (error) {
        console.error(`❌ 读取文件失败: ${file}`, error.message)
      }
    }
    
    // 输出结果
    this.printResults()
  }

  // 打印检查结果
  printResults() {
    console.log('📊 检查结果:\n')
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ 恭喜！代码完全符合规范标准')
      return
    }
    
    // 打印错误
    if (this.errors.length > 0) {
      console.log(`❌ 发现 ${this.errors.length} 个错误:\n`)
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.file}`)
        console.log(`   规则: ${error.rule}`)
        console.log(`   问题: ${error.message}\n`)
      })
    }
    
    // 打印警告
    if (this.warnings.length > 0) {
      console.log(`⚠️  发现 ${this.warnings.length} 个警告:\n`)
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.file}`)
        console.log(`   规则: ${warning.rule}`)
        console.log(`   建议: ${warning.message}\n`)
      })
    }
    
    // 总结
    console.log('📋 总结:')
    console.log(`   错误: ${this.errors.length} 个`)
    console.log(`   警告: ${this.warnings.length} 个`)
    
    if (this.errors.length > 0) {
      console.log('\n❗ 请修复所有错误后再提交代码')
      process.exit(1)
    } else {
      console.log('\n✅ 没有发现严重错误，可以提交代码')
    }
  }
}

// 运行检查
const checker = new StandardsChecker()
checker.run().catch(console.error)

export default StandardsChecker