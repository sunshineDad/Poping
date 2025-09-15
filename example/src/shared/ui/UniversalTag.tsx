/**
 * [File Overview]
 * ===============
 * - Purpose: 统一的标签渲染组件，替代ResourceTag和CommandTag
 * - Data Flow: Tag对象 → 渲染 → hover预览 → 编辑/删除操作
 * - Core Features: 统一样式、hover预览、pending状态显示
 * - Related Files:
 *   @/types/tags.ts → 使用的Tag类型
 *   @/components/ResourceTag → 被此组件替代
 *   @/components/CommandTag → 被此组件替代
 */

import React, { useState, useRef, useCallback } from 'react';
import { File, FileText, Image, X, Palette, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tag, getFileIcon, getCommandIcon } from '@shared/types';
import { api } from '@services';
import { TagPreview } from './TagPreview';
import { Popover, PopoverTrigger, PopoverContent } from '@shared/ui';

interface UniversalTagProps {
  tag: Tag;
  sessionId?: string;   // 用于资源预览
  readonly?: boolean;   // 消息中显示时为只读
  onEdit?: (tag: Tag) => void;
  onDelete?: (tagId: string) => void;
  className?: string;
}

export const UniversalTag: React.FC<UniversalTagProps> = ({
  tag,
  sessionId,
  readonly = false,
  onEdit,
  onDelete,
  className
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const tagRef = useRef<HTMLSpanElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const fetchingRef = useRef(false);

  const openPreview = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setShowPreview(true);
  }, []);

  const scheduleClosePreview = useCallback(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setShowPreview(false);
      hideTimerRef.current = null;
    }, 120);
  }, []);

  /**
   * [Function: getTagStyle]
   * =======================
   * - Input: None (uses tag prop)
   * - Output: string, CSS class names
   * - Role in Flow: 根据标签类型和状态返回样式
   */
  const getTagStyle = () => {
    let baseStyle = 'inline-flex items-center gap-1.5 px-2.5 py-1 mx-0.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer select-none';
    
    if (tag.type === 'resource') {
      const styles = {
        image: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        text: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100', 
        doc: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
      };
      baseStyle += ' ' + styles[tag.resourceType];
    } else {
      baseStyle += ' bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
    }
    
    // pending状态样式
    if (tag.isPending) {
      baseStyle += ' opacity-75';
    } else {
      baseStyle += ' hover:shadow-sm active:scale-95';
    }
    
    if (readonly) {
      // readonly只禁用编辑功能，保留hover预览功能
      baseStyle += ' cursor-default';
    } else {
      baseStyle += ' hover:scale-105';
    }
    
    return baseStyle;
  };

  /**
   * [Function: getIcon]
   * ===================
   * - Input: None (uses tag prop)
   * - Output: React.ReactElement
   * - Role in Flow: 根据标签类型返回对应图标
   */
  const getIcon = () => {
    if (tag.type === 'resource') {
      const icons = {
        image: <Image className="w-3.5 h-3.5" />,
        text: <FileText className="w-3.5 h-3.5" />,
        doc: <File className="w-3.5 h-3.5" />
      };
      return icons[tag.resourceType];
    } else {
      return tag.commandType === 'text_to_image' ? 
        <Palette className="w-3.5 h-3.5" /> : 
        <Image className="w-3.5 h-3.5" />;
    }
  };

  /**
   * [Function: getDisplayText]
   * ==========================
   * - Input: None (uses tag prop)
   * - Output: string
   * - Role in Flow: 获取标签显示文本，包含pending状态指示
   */
  const getDisplayText = () => {
    if (tag.type === 'resource') {
      return tag.name;
    } else {
      return tag.display;
    }
  };

  /**
   * [Function: calculatePosition]
   * =============================
   * - Input: element (HTMLElement)
   * - Output: position object
   * - Role in Flow: 计算预览框位置，避免超出视口
   */
  // 不再手动计算坐标，改用 Popover 自动定位

  /**
   * [Function: handleMouseEnter]
   * ============================
   * - Input: None
   * - Output: void
   * - Role in Flow: 处理鼠标悬停，显示预览
   */
  const handleMouseEnter = useCallback(async () => {
    if (!tagRef.current) return;
    openPreview();
    // 如果已有内容或正在加载，避免重复请求
    if (previewContent || fetchingRef.current) return;

    // 加载预览内容（去抖 + 去重）
    if (tag.type === 'resource') {
      try {
        fetchingRef.current = true;
        // 如果是 pending 状态且有本地文件，直接预览本地文件
        if (tag.isPending && tag.pendingFile) {
          setIsLoadingPreview(true);
          const fileReader = new FileReader();
          await new Promise<void>((resolve) => {
            fileReader.onload = (e) => {
              const result = e.target?.result;
              if (result) {
                const content = {
                  content: tag.resourceType === 'image'
                    ? (result as string).split(',')[1]
                    : result,
                  content_type: tag.pendingFile!.type,
                  filename: tag.pendingFile!.name,
                };
                setPreviewContent(content);
              }
              resolve();
            };
            fileReader.onerror = () => {
              setPreviewContent({ error: '本地文件预览失败' });
              resolve();
            };
            if (tag.resourceType === 'image') {
              fileReader.readAsDataURL(tag.pendingFile);
            } else {
              fileReader.readAsText(tag.pendingFile);
            }
          });
        } else if (sessionId) {
          // 通过后端获取资源内容
          setIsLoadingPreview(true);
          const result = await api.getResourceContent(tag.id, sessionId);
          if (result.success) {
            setPreviewContent(result.data);
          } else {
            setPreviewContent({ error: '预览加载失败' });
          }
        } else {
          setPreviewContent({ error: '无预览内容' });
        }
      } catch (error) {
        console.error('Preview load failed:', error);
        setPreviewContent({ error: '预览加载失败' });
      } finally {
        setIsLoadingPreview(false);
        fetchingRef.current = false;
      }
    } else if (tag.type === 'command') {
      // 命令标签直接显示配置信息
      setPreviewContent(tag);
    }
  }, [tag, sessionId, openPreview, previewContent]);

  /**
   * [Function: handleMouseLeave]
   * ============================
   * - Input: None
   * - Output: void
   * - Role in Flow: 处理鼠标离开，隐藏预览
   */
  const handleMouseLeave = useCallback(() => {
    setShowPreview(false);
    setPreviewContent(null);
    setIsLoadingPreview(false);
  }, []);

  /**
   * [Function: handleClick]
   * =======================
   * - Input: None
   * - Output: void
   * - Role in Flow: 处理点击编辑
   */
  const handleClick = useCallback(() => {
    if (!readonly && onEdit) {
      onEdit(tag);
    }
  }, [readonly, onEdit, tag]);

  /**
   * [Function: handleDelete]
   * ========================
   * - Input: e (React.MouseEvent)
   * - Output: void
   * - Role in Flow: 处理删除操作
   */
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(tag.id);
    }
  }, [onDelete, tag.id]);

  return (
    <Popover open={showPreview} onOpenChange={(o) => setShowPreview(o)}>
      <PopoverTrigger asChild>
        <span
          ref={tagRef}
          contentEditable={false}
          className={cn(getTagStyle(), className)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={scheduleClosePreview}
          onClick={handleClick}
          data-tag-type={tag.type}
          data-tag-id={tag.id}
          title={tag.type === 'resource' ? tag.name : tag.display}
        >
          {getIcon()}
          <span className="max-w-32 truncate">{getDisplayText()}</span>
          {!readonly && onDelete && (
            <button
              onClick={handleDelete}
              className="ml-1 -mr-1 p-0.5 rounded hover:bg-black/10 transition-colors opacity-0 group-hover:opacity-100"
              title="删除标签"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="p-0 bg-transparent border-0 shadow-none"
        onMouseEnter={openPreview}
        onMouseLeave={scheduleClosePreview}
      >
        <TagPreview tag={tag} content={previewContent} isLoading={isLoadingPreview} inline />
      </PopoverContent>
    </Popover>
  );
};
