/**
 * [File Overview]
 * ===============
 * - Purpose: 用于渲染消息中的结构化内容（只读模式）
 * - Data Flow: 消息文本 → 解析为结构化内容 → 渲染标签和文本
 * - Core Features: 只读标签渲染、hover预览、无编辑功能
 * - Related Files:
 *   @/components/MessageList/MessageItem.tsx → 使用此组件渲染消息内容
 *   @/utils/TagManager.ts → 解析消息文本
 */

import React, { useMemo } from 'react';
import { TagManager } from '@shared/utils';
import { UniversalTag } from '@shared/ui';
import type { Tag } from '@shared/types';

interface MessageContentProps {
  content: string;
  sessionId?: string;
  className?: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ 
  content, 
  sessionId,
  className = ""
}) => {
  /**
   * [Function: parsedContent - Memoized]
   * ====================================
   * - Input: content string
   * - Output: EditorContent with tags
   * - Role in Flow: 解析消息文本中的标签
   */
  const parsedContent = useMemo(() => {
    return TagManager.parseText(content);
  }, [content]);

  /**
   * [Function: renderSegment]
   * =========================
   * - Input: segment (string | Tag), index
   * - Output: JSX element
   * - Role in Flow: 渲染单个内容段
   */
  const renderSegment = (segment: string | Tag, index: number) => {
    if (typeof segment === 'string') {
      // 保留换行符和空格
      return (
        <span key={index} className="whitespace-pre-wrap">
          {segment}
        </span>
      );
    } else {
      return (
        <UniversalTag 
          key={`${segment.id}_${index}`}
          tag={segment}
          sessionId={sessionId}
          readonly={true}
          className="mx-1"
        />
      );
    }
  };

  return (
    <div className={`message-content leading-relaxed ${className}`}>
      {parsedContent.segments.map(renderSegment)}
    </div>
  );
};
