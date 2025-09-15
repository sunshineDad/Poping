import React, { useState } from 'react';
import { CommandTag as CommandTagType } from '@shared/types';
import { Tooltip } from '@shared/ui';

interface CommandTagProps {
  tag: CommandTagType;
  onEdit?: (tag: CommandTagType) => void;
  onDelete?: (tagId: string) => void;
  readonly?: boolean; // 消息中显示时为只读
  className?: string;
}

export function CommandTag({ tag, onEdit, onDelete, readonly = false, className = '' }: CommandTagProps) {
  const [showDelete, setShowDelete] = useState(false);
  
  // 获取命令图标
  const getCommandIcon = (command: CommandTagType['command']): string => {
    return command === 'text_to_image' ? '🎨' : '🖼️';
  };
  
  // 获取命令名称
  const getCommandName = (command: CommandTagType['command']): string => {
    return command === 'text_to_image' ? '文生图' : '图生图';
  };
  
  // 生成预览内容
  const renderPreview = () => {
    const config = tag.config;
    
    return (
      <div className="max-w-sm">
        <div className="p-3 bg-background border border-border rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{getCommandIcon(tag.command)}</span>
            <span className="font-medium text-sm">{getCommandName(tag.command)}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(tag.created_at).toLocaleString('zh-CN', {
                month: 'short',
                day: '2-digit', 
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            {/* 描述文本 */}
            <div>
              <span className="text-muted-foreground font-medium">描述:</span>
              <p className="text-foreground mt-1 break-words leading-relaxed">
                {config.prompt}
              </p>
            </div>
            
            {/* 风格 */}
            {config.style_id && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">风格:</span>
                <span className="text-foreground font-medium">{config.style_id}</span>
              </div>
            )}
            
            {/* 宽高比 */}
            {config.aspect_ratio && config.aspect_ratio !== '1:1' && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">宽高比:</span>
                <span className="text-foreground font-medium">{config.aspect_ratio}</span>
              </div>
            )}
            
            {/* 图生图特有字段 */}
            {tag.command === 'image_to_image' && (
              <>
                {config.source_image && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">参考图片:</span>
                    <span className="text-foreground font-medium truncate ml-2 max-w-24">
                      {config.source_image}
                    </span>
                  </div>
                )}
                
              </>
            )}
          </div>
          
          {/* 操作按钮 */}
          {!readonly && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(tag);
                }}
                className="flex-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors font-medium"
              >
                编辑
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(tag.id);
                }}
                className="flex-1 px-2 py-1 text-xs bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors font-medium"
              >
                删除
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <Tooltip content={renderPreview()} side="top" align="start">
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition-all cursor-pointer select-none ${
          readonly 
            ? 'bg-primary/10 text-primary border-primary/20'
            : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:shadow-sm'
        } ${className}`}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
        onClick={() => !readonly && onEdit?.(tag)}
      >
        <span>{getCommandIcon(tag.command)}</span>
        <span className="max-w-32 truncate font-medium">{tag.display}</span>
        
        {!readonly && showDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(tag.id);
            }}
            className="ml-1 text-primary/60 hover:text-red-500 transition-colors w-3 h-3 flex items-center justify-center"
            title="删除命令"
          >
            ×
          </button>
        )}
      </span>
    </Tooltip>
  );
}
