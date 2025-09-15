/**
 * CommandTagNode - Lexical自定义节点：命令标签
 * 
 * 核心功能：
 * - 渲染[cmd:id]格式的命令标签
 * - 支持text_to_image和image_to_image命令
 * - 集成UniversalTag组件保持UI一致性
 * - 完全兼容现有命令系统
 */

import { 
  DecoratorNode,
  NodeKey,
  LexicalNode,
  SerializedLexicalNode,
  Spread
} from 'lexical';
import React from 'react';
import { UniversalTag } from '@shared/ui';
import type { CommandTag } from '@shared/types';

export interface SerializedCommandTagNode extends Spread<
  {
    commandType: CommandTag['commandType'];
    commandId: string;
    display: string;
    config: CommandTag['config'];
    isPending: boolean;
    pendingFiles?: CommandTag['pendingFiles'];
    type: 'command-tag';
    version: 1;
  },
  SerializedLexicalNode
> {}

export class CommandTagNode extends DecoratorNode<React.JSX.Element> {
  static type = 'command-tag';

  constructor(
    private __commandType: CommandTag['commandType'] = 'text_to_image',
    private __commandId: string = '',
    private __display: string = '',
    private __config: CommandTag['config'] = { prompt: '' },
    private __isPending: boolean = false,
    private __pendingFiles?: CommandTag['pendingFiles'],
    key?: NodeKey
  ) {
    super(key);
  }

  static getType(): string {
    return CommandTagNode.type;
  }

  /**
   * 创建新的CommandTagNode实例
   * 兼容现有的[cmd:id]格式
   */
  static create(
    commandType: CommandTag['commandType'],
    commandId: string,
    display: string,
    config: CommandTag['config'],
    isPending: boolean = false,
    pendingFiles?: CommandTag['pendingFiles']
  ): CommandTagNode {
    return new CommandTagNode(commandType, commandId, display, config, isPending, pendingFiles);
  }

  /**
   * 从[cmd:id]字符串解析创建节点
   * 保持与现有编辑器的兼容性
   */
  static fromString(tagString: string, getCommandInfo?: (id: string) => any): CommandTagNode | null {
    const match = tagString.match(/\[cmd:([^\]]+)\]/);
    if (!match) return null;
    
    const [, commandId] = match;
    const commandInfo = getCommandInfo ? getCommandInfo(commandId) : null;
    
    if (commandInfo) {
      return CommandTagNode.create(
        commandInfo.commandType || 'text_to_image',
        commandId,
        commandInfo.display || commandId,
        commandInfo.config || { prompt: '' }
      );
    }
    
    // 回退到基本命令节点
    return CommandTagNode.create(
      'text_to_image',
      commandId,
      commandId,
      { prompt: '' }
    );
  }

  /**
   * 从命令配置创建节点
   * 用于slash命令生成
   */
  static fromConfig(
    commandType: CommandTag['commandType'],
    config: CommandTag['config'],
    display?: string
  ): CommandTagNode {
    const commandId = `${commandType}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const displayText = display || (commandType === 'text_to_image' ? '🎨 ' : '🖼️ ') + config.prompt.slice(0, 20);
    
    return CommandTagNode.create(commandType, commandId, displayText, config);
  }

  /**
   * 序列化节点数据
   */
  exportJSON(): SerializedCommandTagNode {
    return {
      type: 'command-tag',
      commandType: this.__commandType,
      commandId: this.__commandId,
      display: this.__display,
      config: this.__config,
      isPending: this.__isPending,
      pendingFiles: this.__pendingFiles,
      version: 1
    };
  }

  /**
   * 反序列化节点数据
   */
  static importJSON(serializedNode: SerializedCommandTagNode): CommandTagNode {
    return CommandTagNode.create(
      serializedNode.commandType,
      serializedNode.commandId,
      serializedNode.display,
      serializedNode.config,
      serializedNode.isPending,
      serializedNode.pendingFiles
    );
  }

  /**
   * 克隆节点 - Lexical要求的方法
   */
  clone(): CommandTagNode {
    return new CommandTagNode(
      this.__commandType,
      this.__commandId,
      this.__display,
      this.__config,
      this.__isPending,
      this.__pendingFiles,
      this.getKey()
    );
  }

  /**
   * 创建DOM元素
   */
  createDOM(): HTMLElement {
    const element = document.createElement('span');
    element.className = 'command-tag-node';
    return element;
  }

  /**
   * 更新DOM（Lexical会自动处理）
   */
  updateDOM(): false {
    return false;
  }

  /**
   * 获取文本表示（用于纯文本导出）
   * 保持[cmd:id]格式
   */
  getTextContent(): string {
    return `[cmd:${this.__commandId}]`;
  }

  /**
   * 判断节点是否内联显示
   */
  isInline(): boolean {
    return true;
  }

  /**
   * 节点是否可编辑
   */
  isKeyboardSelectable(): boolean {
    return false;
  }

  /**
   * 防止节点被合并到相邻的文本节点中
   */
  isIsolated(): boolean {
    return true;
  }

  /**
   * 防止节点在编辑操作中被修改
   */
  isUnmergeable(): boolean {
    return true;
  }

  /**
   * 标记节点为不可变，防止 Lexical 重新创建
   */
  static importDOM(): null {
    return null;
  }

  /**
   * 防止意外的文本插入影响节点
   */
  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

  /**
   * 获取命令类型
   */
  getCommandType(): CommandTag['commandType'] {
    return this.__commandType;
  }

  /**
   * 获取命令ID
   */
  getCommandId(): string {
    return this.__commandId;
  }

  /**
   * 获取显示文本
   */
  getDisplay(): string {
    return this.__display;
  }

  /**
   * 获取命令配置
   */
  getConfig(): CommandTag['config'] {
    return this.__config;
  }

  /**
   * 是否为pending状态
   */
  isPending(): boolean {
    return this.__isPending;
  }

  /**
   * 更新命令配置
   */
  updateConfig(newConfig: CommandTag['config'], newDisplay?: string): void {
    const writableNode = this.getWritable();
    writableNode.__config = newConfig;
    if (newDisplay) {
      writableNode.__display = newDisplay;
    }
  }

  /**
   * 更新pending状态
   */
  updatePendingStatus(isPending: boolean): void {
    const writableNode = this.getWritable();
    writableNode.__isPending = isPending;
  }

  /**
   * 转换为Tag对象
   * 与UniversalTag组件兼容
   */
  toTag(): CommandTag {
    return {
      type: 'command',
      commandType: this.__commandType,
      id: this.__commandId,
      display: this.__display,
      config: this.__config,
      isPending: this.__isPending,
      pendingFiles: this.__pendingFiles
    };
  }

  /**
   * 渲染为React组件
   * 使用现有的UniversalTag保持UI一致性
   */
  decorate(): React.JSX.Element {
    return (
      <UniversalTag
        key={this.getKey()}
        tag={this.toTag()}
        readonly={false}
        onEdit={(tag) => {
          // TODO: 实现命令编辑逻辑
          console.log('Edit command tag:', tag);
        }}
        onDelete={() => {
          // 删除节点 - 直接从DOM中移除
          this.remove();
        }}
      />
    );
  }

  /**
   * 比较节点是否相同
   * 用于Lexical的reconciliation优化
   */
  isEqualToNode(node: LexicalNode): boolean {
    return (
      node instanceof CommandTagNode &&
      node.__commandType === this.__commandType &&
      node.__commandId === this.__commandId &&
      node.__display === this.__display &&
      node.__isPending === this.__isPending &&
      JSON.stringify(node.__config) === JSON.stringify(this.__config) &&
      JSON.stringify(node.__pendingFiles) === JSON.stringify(this.__pendingFiles)
    );
  }
}
