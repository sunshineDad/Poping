/**
 * ResourceTagNode - Lexical自定义节点：资源标签
 * 
 * 核心功能：
 * - 渲染@type://id格式的资源标签
 * - 支持pending状态（文件上传中）
 * - 集成UniversalTag组件保持一致的UI
 * - 完全兼容现有TagManager逻辑
 */

import { 
  DecoratorNode,
  NodeKey,
  LexicalNode,
  SerializedLexicalNode,
  Spread
} from 'lexical';
import React, { useContext } from 'react';
import { UniversalTag } from '@shared/ui';
import type { ResourceTag } from '@shared/types';
import { TagManager } from '@shared/utils';
import { UnifiedEditorContext } from '../context';

export interface SerializedResourceTagNode extends Spread<
  {
    resourceType: ResourceTag['resourceType'];
    resourceId: string;
    name: string;
    isPending: boolean;
    type: 'resource-tag';
    version: 1;
  },
  SerializedLexicalNode
> {}

export class ResourceTagNode extends DecoratorNode<React.JSX.Element> {
  static type = 'resource-tag';

  constructor(
    private __resourceType: ResourceTag['resourceType'] = 'image',
    private __resourceId: string = '',
    private __name: string = '',
    private __isPending: boolean = false,
    private __pendingFile?: File,
    key?: NodeKey
  ) {
    super(key);
  }

  static getType(): string {
    return ResourceTagNode.type;
  }

  /**
   * 创建新的ResourceTagNode实例
   * 兼容现有的@type://id格式
   */
  static create(
    resourceType: ResourceTag['resourceType'],
    resourceId: string,
    name: string,
    isPending: boolean = false,
    pendingFile?: File
  ): ResourceTagNode {
    return new ResourceTagNode(resourceType, resourceId, name, isPending, pendingFile);
  }

  /**
   * 从@type://id字符串解析创建节点
   * 保持与现有SimpleRichTextEditor的兼容性
   */
  static fromString(tagString: string): ResourceTagNode | null {
    const match = tagString.match(/@(\w+):\/\/([^\s@]+)/);
    if (!match) return null;
    
    const [, type, id] = match;
    const resourceType = type as ResourceTag['resourceType'];
    
    // 总是从TagManager获取完整的标签信息
    const tag = TagManager.getTag(id);
    if (tag && tag.type === 'resource') {
      return ResourceTagNode.create(
        tag.resourceType,
        tag.id,
        tag.name,
        tag.isPending,
        tag.pendingFile
      );
    }
    
    // 回退到基本解析
    const name = id.split('/').pop() || id;
    const isPending = id.startsWith('tmp_');
    return ResourceTagNode.create(resourceType, id, name, isPending);
  }

  /**
   * 从File对象创建pending节点
   * 兼容StructuredEditor的文件上传逻辑
   */
  static fromFile(file: File): ResourceTagNode {
    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const resourceType: ResourceTag['resourceType'] = file.type.startsWith('image/') 
      ? 'image' 
      : file.type.startsWith('text/') 
        ? 'text' 
        : 'doc';
    
    return ResourceTagNode.create(resourceType, tempId, file.name, true, file);
  }

  /**
   * 序列化节点数据
   * 用于持久化和跨编辑器传输
   */
  exportJSON(): SerializedResourceTagNode {
    return {
      type: 'resource-tag',
      resourceType: this.__resourceType,
      resourceId: this.__resourceId,
      name: this.__name,
      isPending: this.__isPending,
      version: 1
    };
  }

  /**
   * 反序列化节点数据
   */
  static importJSON(serializedNode: SerializedResourceTagNode): ResourceTagNode {
    // 总是优先从TagManager获取完整信息
    const tag = TagManager.getTag(serializedNode.resourceId);
    if (tag && tag.type === 'resource') {
      return ResourceTagNode.create(
        tag.resourceType,
        tag.id,
        tag.name,
        tag.isPending,
        tag.pendingFile
      );
    }
    
    // 回退到序列化数据
    return ResourceTagNode.create(
      serializedNode.resourceType,
      serializedNode.resourceId,
      serializedNode.name,
      serializedNode.isPending
    );
  }

  /**
   * 克隆节点 - Lexical要求的方法
   */
  clone(): ResourceTagNode {
    return new ResourceTagNode(
      this.__resourceType,
      this.__resourceId,
      this.__name,
      this.__isPending,
      this.__pendingFile,
      this.getKey()
    );
  }

  /**
   * 创建DOM元素
   */
  createDOM(): HTMLElement {
    const element = document.createElement('span');
    element.className = 'resource-tag-node';
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
   * 保持@type://id格式
   */
  getTextContent(): string {
    return `@${this.__resourceType}://${this.__resourceId}`;
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
   * 获取资源类型
   */
  getResourceType(): ResourceTag['resourceType'] {
    return this.__resourceType;
  }

  /**
   * 获取资源ID
   */
  getResourceId(): string {
    return this.__resourceId;
  }

  /**
   * 获取显示名称
   */
  getName(): string {
    return this.__name;
  }

  /**
   * 是否为pending状态
   */
  isPending(): boolean {
    return this.__isPending;
  }

  /**
   * 更新pending状态
   * 用于文件上传完成后的状态切换
   */
  updatePendingStatus(isPending: boolean, newResourceId?: string): void {
    const writableNode = this.getWritable();
    writableNode.__isPending = isPending;
    if (newResourceId && !isPending) {
      writableNode.__resourceId = newResourceId;
    }
  }

  /**
   * 转换为Tag对象
   * 与UniversalTag组件兼容
   */
  toTag(): ResourceTag {
    return {
      type: 'resource' as const,
      resourceType: this.__resourceType,
      id: this.__resourceId,
      name: this.__name,
      isPending: this.__isPending,
      pendingFile: this.__pendingFile
    };
  }

  /**
   * 渲染为React组件
   * 使用现有的UniversalTag保持UI一致性
   */
  decorate(): React.JSX.Element {
    const node = this;
    const TagView: React.FC = () => {
      const { currentSessionId } = useContext(UnifiedEditorContext);
      return (
        <UniversalTag
          key={node.getKey()}
          tag={node.toTag()}
          sessionId={currentSessionId}
          readonly={false}
          onEdit={(tag) => {
            console.log('Edit resource tag:', tag);
          }}
          onDelete={() => {
            node.remove();
          }}
        />
      );
    };
    return <TagView />;
  }

  /**
   * 比较节点是否相同
   * 用于Lexical的reconciliation优化
   */
  isEqualToNode(node: LexicalNode): boolean {
    return (
      node instanceof ResourceTagNode &&
      node.__resourceType === this.__resourceType &&
      node.__resourceId === this.__resourceId &&
      node.__name === this.__name &&
      node.__isPending === this.__isPending
    );
  }
}
