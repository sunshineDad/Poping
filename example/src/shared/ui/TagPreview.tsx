/**
 * [File Overview]
 * ===============
 * - Purpose: 统一的标签预览组件，显示hover时的详细信息
 * - Data Flow: Tag + 预览内容 → 根据类型渲染不同预览界面
 * - Core Features: 图片预览、文本预览、命令配置预览、pending状态
 * - Related Files:
 *   @/components/UniversalTag/UniversalTag.tsx → 调用此组件
 *   @/components/CommandTagPreview → 被此组件替代
 */

import React from 'react';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import { Tag } from '@shared/types';

interface TagPreviewProps {
  tag: Tag;
  content: any;
  position?: { x: number; y: number; showAbove: boolean };
  isLoading: boolean;
  inline?: boolean;
}

export const TagPreview: React.FC<TagPreviewProps> = ({
  tag,
  content,
  position,
  isLoading,
  inline = false
}) => {
  /**
   * [Function: renderResourcePreview]
   * =================================
   * - Input: content (API返回的资源内容)
   * - Output: JSX预览内容
   * - Role in Flow: 渲染资源类型的预览
   */
  const renderResourcePreview = (content: any) => {
    if (!content) return null;
    
    if (content.error) {
      return (
        <div className="flex items-center gap-2 p-3 text-red-600 bg-red-50 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{content.error}</span>
        </div>
      );
    }

    if (content.pending) {
      return (
        <div className="flex items-center gap-2 p-3 text-orange-600 bg-orange-50 rounded-lg">
          <Clock className="w-4 h-4" />
          <span className="text-sm">{content.message}</span>
        </div>
      );
    }

    switch (tag.type === 'resource' ? tag.resourceType : null) {
      case 'image':
        return (
          <img
            src={`data:${content.content_type || 'image/png'};base64,${content.content}`}
            alt={tag.type === 'resource' ? tag.name : '预览'}
            className="max-w-80 max-h-60 object-contain rounded-lg shadow-xl"
            style={{
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))'
            }}
          />
        );
      
      case 'text':
        return (
          <div
            className="max-w-96 max-h-60 p-4 bg-white rounded-lg shadow-xl border border-gray-100 overflow-auto"
            style={{
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))'
            }}
          >
            <div className="text-xs font-medium text-gray-500 mb-2 pb-2 border-b border-gray-100">
              {tag.type === 'resource' ? tag.name : '文本内容'}
            </div>
            <pre className="text-sm text-gray-900 font-mono whitespace-pre-wrap break-words">
              {typeof content.content === 'string' 
                ? content.content.slice(0, 1000) + (content.content.length > 1000 ? '...' : '')
                : JSON.stringify(content.content, null, 2).slice(0, 1000)
              }
            </pre>
          </div>
        );
      
      case 'doc':
        return (
          <div
            className="max-w-96 max-h-60 p-4 bg-white rounded-lg shadow-xl border border-gray-100 overflow-auto"
            style={{
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1))'
            }}
          >
            <div className="text-xs font-medium text-gray-500 mb-2 pb-2 border-b border-gray-100">
              {tag.type === 'resource' ? tag.name : '文档内容'}
            </div>
            <div className="text-sm text-gray-900">
              {content.content_type?.includes('json') ? (
                <pre className="font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(
                    typeof content.content === 'string' 
                      ? JSON.parse(content.content) 
                      : content.content, 
                    null, 
                    2
                  ).slice(0, 1000)}
                </pre>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {typeof content.content === 'string'
                    ? content.content.slice(0, 1000) + (content.content.length > 1000 ? '...' : '')
                    : String(content.content).slice(0, 1000)
                  }
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  /**
   * [Function: renderCommandPreview]
   * ================================
   * - Input: tag (CommandTag)
   * - Output: JSX预览内容
   * - Role in Flow: 渲染命令类型的预览
   */
  const renderCommandPreview = (tag: Tag) => {
    if (tag.type !== 'command') return null;

    return (
      <div className="max-w-sm">
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">
              {tag.commandType === 'text_to_image' ? '🎨' : '🖼️'}
            </span>
            <span className="font-medium text-sm">
              {tag.commandType === 'text_to_image' ? '文生图' : '图生图'}
            </span>
            <span className="text-xs text-gray-500">
              {tag.isPending ? '配置待完成' : '已配置'}
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            {/* 描述文本 */}
            <div>
              <span className="text-gray-500 font-medium">描述:</span>
              <p className="text-gray-900 mt-1 break-words leading-relaxed">
                {tag.config.prompt || '未设置'}
              </p>
            </div>
            
            {/* 风格 */}
            {tag.config.style_id && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">风格:</span>
                <span className="text-gray-900 font-medium">{tag.config.style_id}</span>
              </div>
            )}
            
            {/* 尺寸 */}
            {tag.config.width && tag.config.height && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">尺寸:</span>
                <span className="text-gray-900 font-medium">
                  {tag.config.width}×{tag.config.height}
                </span>
              </div>
            )}
            
            {/* 宽高比 */}
            {tag.config.aspect_ratio && tag.config.aspect_ratio !== '1:1' && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">宽高比:</span>
                <span className="text-gray-900 font-medium">{tag.config.aspect_ratio}</span>
              </div>
            )}
            
            {/* 图生图特有字段 */}
            {tag.commandType === 'image_to_image' && (
              <>
                {tag.config.source_image && (
                  <div>
                    <span className="text-gray-500 block mb-1">参考图片:</span>
                    {tag.isPending && tag.pendingFiles?.sourceImage ? (
                      <div className="border border-gray-200 rounded p-2 bg-gray-50">
                        <img
                          src={URL.createObjectURL(tag.pendingFiles.sourceImage)}
                          alt="参考图片预览"
                          className="max-w-full max-h-20 object-contain rounded mx-auto block"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="text-xs text-gray-500 mt-1 text-center truncate">
                          {tag.pendingFiles.sourceImage.name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-900 font-medium truncate">
                        {tag.isPending ? '待上传' : '已上传'}
                      </span>
                    )}
                  </div>
                )}
                
                {tag.config.strength && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">强度:</span>
                    <span className="text-gray-900 font-medium">
                      {Math.round(tag.config.strength * 100)}%
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * [Function: renderLoadingState]
   * ==============================
   * - Input: None
   * - Output: JSX加载状态
   * - Role in Flow: 显示加载中的状态
   */
  const renderLoadingState = () => (
    <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      <span className="text-sm text-gray-600">加载预览中...</span>
    </div>
  );

  /**
   * [Function: renderPreviewContent]
   * ================================
   * - Input: None
   * - Output: JSX预览内容
   * - Role in Flow: 根据标签类型和状态渲染对应内容
   */
  const renderPreviewContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (tag.type === 'resource') {
      return renderResourcePreview(content);
    } else if (tag.type === 'command') {
      return renderCommandPreview(tag);
    }

    return null;
  };

  const previewContent = renderPreviewContent();
  if (!previewContent) return null;

  if (inline) {
    return (
      <div className="transition-opacity duration-200">
        {previewContent}
      </div>
    );
  }

  if (position) {
    return (
      <div
        className="fixed pointer-events-none z-[999999]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: position.showAbove
            ? 'translateX(-50%) translateY(-100%)'
            : 'translateX(-50%) translateY(0%)',
        }}
      >
        <div className="transition-opacity duration-200">
          {previewContent}
        </div>
      </div>
    );
  }

  return null;
};
