/**
 * SlashCommandPlugin - Lexical插件：处理斜杠命令
 * 
 * 基础版本：检测"/"输入并显示菜单
 * 注意：这是一个简化实现，为了快速集成
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection, 
  $createTextNode,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND
} from 'lexical';
import { useCallback, useEffect, useState, useRef } from 'react';
import { SlashCommandMenu } from '@features/composer/slash';
import { SLASH_COMMANDS, SlashCommand, MenuPosition } from '@shared/types';
import { CommandTagNode } from '../nodes/CommandTagNode';

interface SlashCommandState {
  isOpen: boolean;
  position: MenuPosition;
  searchQuery: string;
  triggerOffset: number;
}

export function SlashCommandPlugin({ 
  enable = true 
}: { 
  enable?: boolean; 
}) {
  const [editor] = useLexicalComposerContext();
  const [slashState, setSlashState] = useState<SlashCommandState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    searchQuery: '',
    triggerOffset: 0
  });

  /**
   * 检测斜杠输入并显示菜单
   */
  const checkForSlashTrigger = useCallback((text: string, offset: number) => {
    if (!enable) return false;
    
    // 查找最后一个斜杠的位置
    const slashMatch = text.substring(0, offset).match(/\/([a-zA-Z\u4e00-\u9fa5]*)$/);
    
    if (slashMatch) {
      const searchQuery = slashMatch[1] || '';
      const slashOffset = offset - slashMatch[0].length;
      
      // 计算菜单位置（简化版本，实际应该基于光标位置）
      const position = calculateMenuPosition();
      
      setSlashState({
        isOpen: true,
        position,
        searchQuery,
        triggerOffset: slashOffset
      });
      
      return true;
    }
    
    return false;
  }, [enable]);

  /**
   * 计算菜单显示位置
   */
  const calculateMenuPosition = useCallback((): MenuPosition => {
    // 简化实现：固定位置
    // 实际应该基于光标的DOM位置计算
    return {
      x: 100,
      y: 100,
      maxHeight: 300
    };
  }, []);

  /**
   * 处理命令选择
   */
  const handleCommandSelect = useCallback((command: SlashCommand) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      // 删除触发的斜杠文本
      const anchor = selection.anchor;
      const focus = selection.focus;
      
      // 移动到斜杠位置并删除斜杠和查询文本
      const slashStart = slashState.triggerOffset;
      const currentOffset = anchor.offset;
      const textToDelete = currentOffset - slashStart;
      
      if (textToDelete > 0) {
        // 选中斜杠和查询文本并删除
        selection.anchor.set(selection.anchor.key, slashStart, 'text');
        selection.focus.set(selection.focus.key, currentOffset, 'text');
        
        // 删除选中的文本
        selection.removeText();
      }

      // 创建命令标签节点
      const commandTag = CommandTagNode.create(
        command.id,
        `${command.id}_${Date.now()}`,
        command.displayName,
        { prompt: '' } // 默认配置，稍后用户可以编辑
      );
      
      // 插入命令标签
      selection.insertNodes([commandTag]);
      
      // 在标签后添加空格
      const spaceNode = $createTextNode(' ');
      selection.insertNodes([spaceNode]);
    });

    // 关闭菜单
    setSlashState(prev => ({ ...prev, isOpen: false }));
  }, [editor, slashState.triggerOffset]);

  /**
   * 关闭菜单
   */
  const handleCloseMenu = useCallback(() => {
    setSlashState(prev => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * 监听编辑器内容变化
   */
  useEffect(() => {
    if (!enable) return;

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          if (slashState.isOpen) {
            setSlashState(prev => ({ ...prev, isOpen: false }));
          }
          return;
        }

        // 获取当前文本内容和光标位置
        const anchorNode = selection.anchor.getNode();
        const anchorOffset = selection.anchor.offset;
        
        if (anchorNode.getTextContent) {
          const text = anchorNode.getTextContent();
          const triggered = checkForSlashTrigger(text, anchorOffset);
          
          if (!triggered && slashState.isOpen) {
            // 如果之前打开了菜单但现在没有触发条件，关闭菜单
            setSlashState(prev => ({ ...prev, isOpen: false }));
          }
        }
      });
    });
  }, [editor, enable, slashState.isOpen, checkForSlashTrigger]);

  /**
   * 监听键盘事件
   */
  useEffect(() => {
    if (!slashState.isOpen) return;

    // 注册Escape键关闭菜单
    const removeEscapeListener = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        handleCloseMenu();
        return true;
      },
      COMMAND_PRIORITY_LOW
    );

    return removeEscapeListener;
  }, [editor, slashState.isOpen, handleCloseMenu]);

  // 渲染菜单
  if (!slashState.isOpen || !enable) {
    return null;
  }

  return (
    <SlashCommandMenu
      commands={SLASH_COMMANDS}
      position={slashState.position}
      onCommandSelect={handleCommandSelect}
      onClose={handleCloseMenu}
      isOpen={slashState.isOpen}
      searchQuery={slashState.searchQuery}
      className="unified-editor-slash-menu"
    />
  );
}
