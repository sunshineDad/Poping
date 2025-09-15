/**
 * SimpleSlashPlugin - 简化的斜杠命令插件
 * 
 * 功能：
 * - 监听文本输入，检测"/"字符
 * - 在合适位置显示命令菜单
 * - 插入命令标签
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState, useCallback, useRef } from 'react';
import { SlashCommandPopup } from '@features/composer/slash';
import { MenuPosition } from '@shared/types';
import { CommandTag } from '@shared/types';
import { CommandTagNode } from '../nodes/CommandTagNode';
import { $getSelection, $isRangeSelection, $createTextNode, KEY_DOWN_COMMAND } from 'lexical';

interface SlashState {
  isOpen: boolean;
  position: MenuPosition;
}

export function SimpleSlashPlugin({ enable = true, sessionId }: { enable?: boolean; sessionId?: string }) {
  const [editor] = useLexicalComposerContext();
  const [slashState, setSlashState] = useState<SlashState>({
    isOpen: false,
    position: { x: 0, y: 0 }
  });
  
  const justClosedRef = useRef(false);

  const handleInsertTag = useCallback((tag: CommandTag) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      
      // 创建命令标签节点
      const commandTag = CommandTagNode.create(
        tag.commandType,
        tag.id,
        tag.display,
        tag.config,
        tag.isPending,
        tag.pendingFiles
      );
      
      // 插入命令标签
      selection.insertNodes([commandTag]);
      
      // 添加空格
      const spaceNode = $createTextNode(' ');
      selection.insertNodes([spaceNode]);
    });

    // 关闭菜单
    setSlashState(prev => ({ ...prev, isOpen: false }));
  }, [editor]);

  const handleCloseMenu = useCallback(() => {
    setSlashState(prev => ({ ...prev, isOpen: false }));
    
    // 设置标志位防止立即重新打开
    justClosedRef.current = true;
    setTimeout(() => {
      justClosedRef.current = false;
    }, 100);
    
    // 关闭菜单后重新聚焦编辑器（延迟以防止干扰右侧面板）
    setTimeout(() => {
      // 检查是否有配置面板打开，如果有则不聚焦编辑器
      const configPanels = document.querySelectorAll('[data-config-panel]');
      if (configPanels.length === 0) {
        editor.focus();
      }
    }, 200);
  }, [editor]);

  /**
   * 计算菜单位置（基于编辑器容器位置）
   */
  const calculateMenuPosition = useCallback((): MenuPosition => {
    // 尝试获取编辑器容器
    const editorContainer = document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (editorContainer) {
      const rect = editorContainer.getBoundingClientRect();
      const selection = window.getSelection();
      
      // 如果有选区，使用选区位置
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rangeRect = range.getBoundingClientRect();
        
        // 确保位置在编辑器容器内
        if (rangeRect.left >= rect.left && rangeRect.left <= rect.right) {
          return {
            x: rangeRect.left,
            y: rangeRect.bottom + 5,
            maxHeight: 300
          };
        }
      }
      
      // 回退到编辑器容器的左上角位置
      return {
        x: rect.left + 10,
        y: rect.top + 40, // 编辑器顶部稍下方
        maxHeight: 300
      };
    }
    
    // 最后的回退位置
    return {
      x: 400,
      y: 300,
      maxHeight: 300
    };
  }, []);

  useEffect(() => {
    if (!enable) {
      return;
    }

    // 使用键盘事件监听器捕获斜杠输入
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        // 如果刚关闭菜单，跳过检测
        if (justClosedRef.current) {
          return false;
        }

        // 检测斜杠键
        if (event.key === '/' && !slashState.isOpen) {
          event.preventDefault(); // 阻止斜杠字符插入
          
          // 计算菜单位置并显示
          const position = calculateMenuPosition();
          setSlashState({
            isOpen: true,
            position
          });
          
          return true; // 表示事件已处理
        }
        
        return false;
      },
      1 // 高优先级，确保在其他处理器之前执行
    );

    return removeKeyDownListener;
  }, [editor, enable, calculateMenuPosition, slashState.isOpen]);

  // 渲染菜单
  if (slashState.isOpen) {
    return (
      <SlashCommandPopup
        position={slashState.position}
        visible={slashState.isOpen}
        onInsertTag={handleInsertTag}
        onClose={handleCloseMenu}
        sessionId={sessionId}
      />
    );
  }

  return null;
}
