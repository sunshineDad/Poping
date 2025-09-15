/**
 * [File Overview]
 * ===============
 * - Purpose: 统一标签处理系统的核心管理器
 * - Data Flow: 文本解析 → 结构化数据 → 文件上传 → 最终文本导出
 * - Core Functions: parseText, exportForSubmission, 暂存文件管理
 * - Related Files:
 *   @/types/tags.ts → 使用的类型定义
 *   @/services/api.ts → 文件上传API调用
 */

import {
  ResourceTag,
  CommandTag,
  Tag,
  EditorContent,
  TAG_PATTERNS,
  getResourceTypeFromFile,
} from '@shared/types';

// 重新导出EditorContent类型
export type { EditorContent } from '@shared/types';
import { api } from '@services';

export class TagManager {
  private static pendingResources = new Map<string, File>();
  private static tagRegistry = new Map<string, Tag>();

  /**
   * [Function: parseText]
   * ====================
   * - Input: text (string), 包含@type://id和[cmd:id]标签的文本
   * - Output: EditorContent, 结构化的内容对象
   * - Role in Flow: 将文本转换为可编辑的结构化数据
   * - Logic:
   *   1. 找到所有标签匹配位置
   *   2. 按位置排序，依次解析
   *   3. 分割为文本段和标签段
   */
  static parseText(text: string): EditorContent {
    const segments: Array<string | Tag> = [];
    
    // 收集所有匹配项并按位置排序
    const allMatches: Array<{
      match: RegExpMatchArray;
      type: 'resource' | 'command';
    }> = [];

    // 重置正则表达式状态
    TAG_PATTERNS.RESOURCE.lastIndex = 0;
    TAG_PATTERNS.COMMAND.lastIndex = 0;

    let match;
    while ((match = TAG_PATTERNS.RESOURCE.exec(text)) !== null) {
      allMatches.push({ match, type: 'resource' });
    }

    while ((match = TAG_PATTERNS.COMMAND.exec(text)) !== null) {
      allMatches.push({ match, type: 'command' });
    }

    // 按位置排序
    allMatches.sort((a, b) => a.match.index! - b.match.index!);

    let lastIndex = 0;
    
    for (const { match, type } of allMatches) {
      // 添加前面的纯文本
      if (match.index! > lastIndex) {
        const textSegment = text.substring(lastIndex, match.index);
        if (textSegment) {
          segments.push(textSegment);
        }
      }
      
      // 解析并添加标签
      const tag = this.parseTagFromMatch(match, type);
      if (tag) {
        segments.push(tag);
        this.tagRegistry.set(tag.id, tag);
      }
      
      lastIndex = match.index! + match[0].length;
    }
    
    // 添加剩余文本
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        segments.push(remainingText);
      }
    }
    
    return { segments };
  }

  /**
   * [Function: parseTagFromMatch]
   * =============================
   * - Input: match (RegExpMatchArray), type ('resource' | 'command')
   * - Output: Tag | null
   * - Role in Flow: 将正则匹配结果转换为标签对象
   */
  private static parseTagFromMatch(match: RegExpMatchArray, type: 'resource' | 'command'): Tag | null {
    if (type === 'resource') {
      const [fullMatch, resourceType, id] = match;
      if (!resourceType || !id) return null;
      
      const fullName = id.split('/').pop() || id;
      const name = fullName.length > 20 ? fullName.slice(0, 17) + '...' : fullName;
      const isPending = id.startsWith('tmp_');
      
      return {
        type: 'resource',
        resourceType: resourceType as ResourceTag['resourceType'],
        id,
        name,
        isPending,
        pendingFile: isPending ? this.pendingResources.get(id) : undefined
      } satisfies ResourceTag;
    } else {
      const [fullMatch, commandId] = match;
      if (!commandId) return null;
      
      // 尝试从注册表获取完整信息
      const registeredTag = this.tagRegistry.get(commandId);
      if (registeredTag && registeredTag.type === 'command') {
        return registeredTag;
      }
      
      // 回退：从ID推断基本信息
      const isTextToImage = commandId.includes('text_to_image');
      const commandType: CommandTag['commandType'] = isTextToImage ? 'text_to_image' : 'image_to_image';
      
      return {
        type: 'command',
        commandType,
        id: commandId,
        display: `${isTextToImage ? '文生图' : '图生图'} 命令`,
        config: { prompt: '' },
        isPending: false
      } satisfies CommandTag;
    }
  }

  /**
   * [Function: serializeToText]
   * ===========================
   * - Input: content (EditorContent)
   * - Output: string, 纯文本格式
   * - Role in Flow: 将结构化内容转换为文本
   */
  static serializeToText(content: EditorContent): string {
    return content.segments.map(segment => {
      if (typeof segment === 'string') {
        return segment;
      }
      
      if (segment.type === 'resource') {
        return `@${segment.resourceType}://${segment.id}`;
      } else if (segment.type === 'command') {
        return `[cmd:${segment.id}]`;
      }
      
      return '';
    }).join('');
  }

  /**
   * [Function: addPendingResource]
   * ==============================
   * - Input: file (File), 用户上传的文件
   * - Output: string, 生成的标签文本
   * - Role in Flow: 创建暂存资源标签
   */
  static addPendingResource(file: File): string {
    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const resourceType = getResourceTypeFromFile(file);
    
    // 存储暂存文件
    this.pendingResources.set(tempId, file);
    
    // 创建并注册标签
    const tag: ResourceTag = {
      type: 'resource',
      resourceType,
      id: tempId,
      name: file.name,
      isPending: true,
      pendingFile: file
    };
    
    this.tagRegistry.set(tempId, tag);
    
    return `@${resourceType}://${tempId}`;
  }

  /**
   * [Function: addCommandTag]
   * =========================
   * - Input: commandType, display, config, pendingFiles?
   * - Output: string, 生成的标签文本
   * - Role in Flow: 创建命令标签
   */
  static addCommandTag(
    commandType: CommandTag['commandType'],
    display: string,
    config: CommandTag['config'],
    pendingFiles?: { sourceImage?: File }
  ): string {
    const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tag: CommandTag = {
      type: 'command',
      commandType,
      id: commandId,
      display,
      config,
      isPending: !!pendingFiles?.sourceImage,
      pendingFiles
    };
    
    this.tagRegistry.set(commandId, tag);
    
    return `[cmd:${commandId}]`;
  }

  /**
   * [Function: exportForSubmission]
   * ================================
   * - Input: content (EditorContent), sessionId (string)
   * - Output: Promise<string>, 最终提交的文本
   * - Role in Flow: 上传所有暂存文件，替换ID，生成最终文本
   * - Logic:
   *   1. 提取所有待上传文件
   *   2. 批量上传获取真实资源ID
   *   3. 更新标签中的ID
   *   4. 转换命令标签为可读文本
   *   5. 序列化为最终文本
   */
  static async exportForSubmission(
    content: EditorContent,
    sessionId: string
  ): Promise<string> {
    console.log('🔍 exportForSubmission called with sessionId:', sessionId);
    const pendingUploads = this.extractPendingResources(content);
    console.log('📋 Found pending uploads:', pendingUploads.length);
    
    // 如果是临时sessionId，不执行文件上传，直接返回带pending信息的文本
    if (sessionId === 'temp-session') {
      console.log('⏳ Temp session - skipping file upload, returning content with pending info');
      const finalText = this.convertToFinalText(content);
      console.log('🎯 Final text for temp session:', finalText);
      return finalText;
    }
    
    if (pendingUploads.length > 0) {
      try {
        console.log('📤 Starting batch upload to sessionId:', sessionId);
        const uploadResults = await this.batchUploadFiles(pendingUploads, sessionId);
        console.log('✅ Upload results:', uploadResults);
        this.updateResourceIds(content, uploadResults);
      } catch (error) {
        console.error('Batch upload failed:', error);
        throw new Error('文件上传失败，请重试');
      }
    }
    
    const finalText = this.convertToFinalText(content);
    console.log('🎯 Final text for sessionId', sessionId, ':', finalText);
    return finalText;
  }

  /**
   * [Function: extractPendingResources]
   * ====================================
   * - Input: content (EditorContent)
   * - Output: 待上传的文件信息数组
   * - Role in Flow: 收集所有需要上传的文件
   */
  private static extractPendingResources(content: EditorContent): Array<{
    tag: ResourceTag | CommandTag;
    files: File[];
  }> {
    const pending: Array<{ tag: ResourceTag | CommandTag; files: File[] }> = [];
    
    for (const segment of content.segments) {
      if (typeof segment !== 'string' && segment.isPending) {
        if (segment.type === 'resource' && segment.pendingFile) {
          console.log('📁 Found pending resource:', segment.pendingFile.name);
          pending.push({ tag: segment, files: [segment.pendingFile] });
        } else if (segment.type === 'command' && segment.pendingFiles?.sourceImage) {
          console.log('🖼️ Found pending command source:', segment.pendingFiles.sourceImage.name);
          pending.push({ tag: segment, files: [segment.pendingFiles.sourceImage] });
        }
      }
    }
    
    return pending;
  }

  /**
   * [Function: batchUploadFiles]
   * ============================
   * - Input: uploads, sessionId
   * - Output: Promise<Map<string, string>>, 旧ID到新ID的映射
   * - Role in Flow: 批量上传文件并获取资源ID
   */
  private static async batchUploadFiles(
    uploads: Array<{ tag: ResourceTag | CommandTag; files: File[] }>,
    sessionId: string
  ): Promise<Map<string, string>> {
    const resultMap = new Map<string, string>();
    
    for (const { tag, files } of uploads) {
      try {
        if (tag.type === 'resource' && tag.isPending) {
          const result = await api.uploadFileToSession(sessionId, files[0], [tag.resourceType]);
          resultMap.set(tag.id, result.resourceId);
        } else if (tag.type === 'command' && tag.pendingFiles?.sourceImage) {
          const result = await api.uploadFileToSession(
            sessionId, 
            tag.pendingFiles.sourceImage, 
            ['source_image']
          );
          resultMap.set(`${tag.id}_source`, result.resourceId);
        }
      } catch (error) {
        console.error(`Upload failed for ${tag.id}:`, error);
        throw error;
      }
    }
    
    return resultMap;
  }

  /**
   * [Function: updateResourceIds]
   * =============================
   * - Input: content, uploadResults
   * - Output: void (修改content对象)
   * - Role in Flow: 用真实资源ID替换临时ID
   */
  private static updateResourceIds(
    content: EditorContent, 
    uploadResults: Map<string, string>
  ) {
    content.segments.forEach((segment, index) => {
      if (typeof segment !== 'string' && segment.isPending) {
        if (segment.type === 'resource') {
          const newResourceId = uploadResults.get(segment.id);
          if (newResourceId) {
            const updatedTag: ResourceTag = {
              ...segment,
              id: newResourceId,
              isPending: false,
              pendingFile: undefined
            };
            content.segments[index] = updatedTag;
            this.tagRegistry.set(newResourceId, updatedTag);
          }
        } else if (segment.type === 'command') {
          const sourceResourceId = uploadResults.get(`${segment.id}_source`);
          if (sourceResourceId) {
            const updatedTag: CommandTag = {
              ...segment,
              isPending: false,
              config: {
                ...segment.config,
                source_image: sourceResourceId
              },
              pendingFiles: undefined
            };
            content.segments[index] = updatedTag;
            this.tagRegistry.set(segment.id, updatedTag);
          }
        }
      }
    });
  }

  /**
   * [Function: convertToFinalText]
   * ==============================
   * - Input: content (EditorContent)
   * - Output: string, 最终的可读文本
   * - Role in Flow: 将结构化内容转换为后端可理解的文本
   */
  private static convertToFinalText(content: EditorContent): string {
    return content.segments.map(segment => {
      if (typeof segment === 'string') {
        return segment;
      }
      
      if (segment.type === 'resource') {
        return `@${segment.resourceType}://${segment.id}`;
      } else if (segment.type === 'command') {
        return this.generateCommandText(segment);
      }
      
      return '';
    }).join('');
  }

  /**
   * [Function: generateCommandText]
   * ===============================
   * - Input: tag (CommandTag)
   * - Output: string, 可读的命令文本
   * - Role in Flow: 将命令标签转换为后端可理解的文本
   */
  private static generateCommandText(tag: CommandTag): string {
    const config = tag.config;
    let text = '';
    
    if (tag.commandType === 'text_to_image') {
      text = `请使用文生图功能生成图片：${config.prompt}`;
      if (config.width && config.height) {
        text += `，尺寸：${config.width}×${config.height}`;
      }
      if (config.style_id) {
        text += `，使用风格：${config.style_id}，finetune_id：${config.style_id}`;
      }
    } else if (tag.commandType === 'image_to_image') {
      text = `请使用图生图功能：${config.prompt}`;
      if (config.source_image) text += `，参考图片ID：${config.source_image}`;
      if (config.width && config.height) {
        text += `，尺寸：${config.width}×${config.height}`;
      }
      if (config.style_id) {
        text += `，使用风格：${config.style_id}，finetune_id：${config.style_id}`;
      }
    }
    
    // Ensure a clear terminator to help the renderer split correctly
    if (!/[。.!?]$/.test(text)) {
      text += '。';
    }
    return text;
  }

  /**
   * [Function: getTag]
   * ==================
   * - Input: tagId (string)
   * - Output: Tag | undefined
   * - Role in Flow: 从注册表获取标签信息
   */
  static getTag(tagId: string): Tag | undefined {
    return this.tagRegistry.get(tagId);
  }

  /**
   * [Function: clearPendingResources]
   * =================================
   * - Input: None
   * - Output: void
   * - Role in Flow: 清理提交后的暂存数据
   */
  static clearPendingResources(): void {
    this.pendingResources.clear();
    
    // 清理注册表中的pending标签
    for (const [id, tag] of this.tagRegistry) {
      if ((tag.type === 'resource' && tag.isPending) || 
          (tag.type === 'command' && tag.isPending)) {
        this.tagRegistry.delete(id);
      }
    }
  }
}
