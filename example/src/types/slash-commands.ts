/**
 * Slash Command System Types - Simple & Direct
 * ============================================
 * - Purpose: 斜杠命令系统的类型定义
 * - Data Flow: Command → Config → Tag → Message
 */

import React from 'react';
import { Image, Palette } from 'lucide-react';

// 菜单系统需要的额外类型
export interface MenuPosition {
  x: number;
  y: number;
  anchorPosition?: 'top' | 'bottom' | 'left' | 'right';
  maxHeight?: number;
}

export interface NavigationState {
  focusedIndex: number;
  focusedGroup?: string;
  isSearching: boolean;
  searchQuery: string;
}

export interface ResponsiveConfig {
  isMobile?: boolean;
  breakpoint?: number;
}

export interface SlashMenuItem {
  id: string;
  command: SlashCommand;
  isVisible: boolean;
}

// 基础命令类型 - 扩展支持现有菜单系统
export interface SlashCommand {
  id: 'text_to_image' | 'image_to_image';
  name: string;
  displayName: string;
  icon: React.ReactNode;
  description: string;
  category: 'ai' | 'media' | 'file' | 'workflow' | 'custom';
  keywords: string[];
  hasConfig: boolean;
}

// 命令配置 - 扁平结构，易于理解
export interface CommandConfig {
  prompt: string;
  style_id?: string;
  aspect_ratio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '21:9' | '3:2' | '2:3';
  width?: number;         // Image width in pixels
  height?: number;        // Image height in pixels
  source_image?: string;  // resource_id for image_to_image
  strength?: number;      // 0.1-1.0 for image_to_image
}

// 命令标签 - 在编辑器中显示的标签
export interface CommandTag {
  id: string;
  command: SlashCommand['id'];
  config: CommandConfig;
  display: string;
  created_at: string;
}

// 风格数据
export interface Style {
  id: string;
  name: string;
  preview: string;
}

// 用户图片资源
export interface UserImage {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
}

// 菜单状态
export interface SlashMenuState {
  visible: boolean;
  position: { x: number; y: number };
  query: string;
}

// 硬编码命令定义 - 适配菜单系统
export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'text_to_image',
    name: 'text_to_image',
    displayName: '文生图',
    icon: React.createElement(Palette, { size: 16 }),
    description: '根据文字描述生成图片',
    category: 'media',
    keywords: ['文生图', '图片', '生成', '绘图', 'text2img'],
    hasConfig: true
  },
  {
    id: 'image_to_image', 
    name: 'image_to_image',
    displayName: '图生图',
    icon: React.createElement(Image, { size: 16 }),
    description: '基于参考图片生成新图片',
    category: 'media', 
    keywords: ['图生图', '图片', '转换', 'img2img'],
    hasConfig: true
  }
];

// 宽高比选项
export const ASPECT_RATIO_OPTIONS = [
  { value: '1:1', label: '正方形 (1:1)' },
  { value: '16:9', label: '横向 (16:9)' },
  { value: '9:16', label: '纵向 (9:16)' },
  { value: '21:9', label: '宽屏 (21:9)' }
] as const;