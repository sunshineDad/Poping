/**
 * [File Overview]
 * ===============
 * - Purpose: 统一标签系统的类型定义
 * - Data Flow: 替换分散在各处的正则表达式处理逻辑
 * - Core Data Structures: ResourceTag, CommandTag, EditorContent
 * - Related Files:
 *   @/types/slash-commands.ts → 将被此文件替代
 *   @/utils/TagManager.ts → 使用这些类型
 */

export interface CommandConfig {
  prompt: string;
  style_id?: string;
  aspect_ratio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '21:9' | '3:2' | '2:3';
  width?: number;
  height?: number;
  source_image?: string; // 可能是 tmp_id 或真实 resource_id
  strength?: number;     // 0.1-1.0 for image_to_image
}

export interface ResourceTag {
  type: 'resource';
  resourceType: 'image' | 'text' | 'doc';
  id: string;           // 暂存时是 tmp_id，提交后是真实 resource_id
  name: string;         // 文件名或显示名称
  isPending: boolean;   // 是否为待上传状态
  pendingFile?: File;   // 暂存的文件对象
}

export interface CommandTag {
  type: 'command';
  commandType: 'text_to_image' | 'image_to_image';
  id: string;
  display: string;      // 用户可见的标签文本
  config: CommandConfig;
  isPending: boolean;   // 是否有待上传的文件
  pendingFiles?: {      // 暂存的文件
    sourceImage?: File;
  };
}

export type Tag = ResourceTag | CommandTag;

export interface EditorContent {
  segments: Array<string | Tag>;
}

// 标签匹配模式 - 集中管理所有正则表达式
export const TAG_PATTERNS = {
  RESOURCE: /@(image|text|doc):\/\/([^\s@]+)/g,
  COMMAND: /\[cmd:([^\]]+)\]/g,
  // 用于检测slash命令触发
  SLASH_TRIGGER: /\/([a-zA-Z_]*)?$/
} as const;

// 文件类型映射
export const FILE_TYPE_MAP = {
  // 图片类型
  'image/jpeg': 'image',
  'image/jpg': 'image', 
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  
  // 文本类型
  'text/plain': 'text',
  'text/csv': 'text',
  'application/json': 'text',
  'text/markdown': 'text',
  
  // 文档类型
  'application/pdf': 'doc',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc'
} as const;

export type FileType = keyof typeof FILE_TYPE_MAP;
export type ResourceType = typeof FILE_TYPE_MAP[FileType];

// 工具函数：从文件类型推断资源类型
export function getResourceTypeFromFile(file: File): ResourceTag['resourceType'] {
  const resourceType = FILE_TYPE_MAP[file.type as FileType];
  return resourceType || 'doc'; // 默认为文档类型
}

// 工具函数：获取文件图标
export function getFileIcon(resourceType: ResourceTag['resourceType']): string {
  const icons = {
    image: '🖼️',
    text: '📄', 
    doc: '📎'
  };
  return icons[resourceType];
}

// 工具函数：获取命令图标
export function getCommandIcon(commandType: CommandTag['commandType']): string {
  const icons = {
    text_to_image: '🎨',
    image_to_image: '🖼️'
  };
  return icons[commandType];
}