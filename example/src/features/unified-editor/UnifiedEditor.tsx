/**
 * UnifiedEditor - 统一富文本编辑器
 * 基于Lexical框架，替代所有重复的编辑器组件
 * 支持simple/conversation/structured三种模式
 */

import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode, $isElementNode, $isTextNode, LexicalNode } from 'lexical';
import { ResourceTagNode } from './nodes/ResourceTagNode';
import { CommandTagNode } from './nodes/CommandTagNode';
import { ResourceTagTransformPlugin } from './plugins/ResourceTagTransformPlugin';
import { SimpleSlashPlugin } from './plugins/SimpleSlashPlugin';
import type { EditorContent } from '@shared/types';
import { TagManager } from '@shared/utils';
import './UnifiedEditor.css';
import { UnifiedEditorContext } from './context';

export type EditorMode = 'simple' | 'conversation' | 'structured';

export interface UnifiedEditorProps {
  mode?: EditorMode;
  value?: string;
  onChange?: (value: string) => void;
  onStructuredChange?: (content: EditorContent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  currentSessionId?: string;
  enableSlashCommands?: boolean;
  enableFileUpload?: boolean;
  getCommandTagInfo?: (tagId: string) => any;
}

// 兼容所有现有编辑器的ref接口
export interface UnifiedEditorRef {
  focus: () => void;
  insertResourceTag: (tag: string | File) => void;
  insertCommandTag: (tag: any) => void;
  selectionStart: number;
  getPlainTextCursorPosition: () => number;
  setSelectionRange: (start: number, end: number) => void;
  exportForSubmission: (sessionId: string) => Promise<string>;
  clear: () => void;
}

// 内部Hook：处理编辑器实例和兼容性
function useEditorRef(ref: React.ForwardedRef<UnifiedEditorRef>, mode: EditorMode) {
  const [editor] = useLexicalComposerContext();
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      editor.focus();
    },
    
    insertResourceTag: (input: string | File) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        try {
          let resourceTag: ResourceTagNode | null = null;
          if (typeof input === 'string') {
            resourceTag = ResourceTagNode.fromString(input);
          } else {
            resourceTag = ResourceTagNode.fromFile(input);
          }

          if (!resourceTag) throw new Error('Invalid resource tag');

          const anchorNode = selection.anchor.getNode();
          const focusNode = selection.focus.getNode();
          const nodesToInsert: LexicalNode[] = [resourceTag];
          if ($isTextNode(anchorNode)) {
            const textContent = anchorNode.getTextContent();
            const anchorOffset = selection.anchor.offset;
            if (anchorOffset === 0 || textContent[anchorOffset - 1] !== ' ') {
              nodesToInsert.unshift($createTextNode(' '));
            }
          } else {
            nodesToInsert.unshift($createTextNode(' '));
          }
          if ($isTextNode(focusNode)) {
            const textContent = focusNode.getTextContent();
            const focusOffset = selection.focus.offset;
            if (focusOffset === textContent.length || textContent[focusOffset] !== ' ') {
              nodesToInsert.push($createTextNode(' '));
            }
          } else {
            nodesToInsert.push($createTextNode(' '));
          }
          selection.insertNodes(nodesToInsert);
        } catch (e) {
          // Fallback: insert the textual form to avoid crashing when
          // node registration class identity mismatches during HMR.
          const text = typeof input === 'string' ? input : `@image://${Date.now()}`;
          const before = $createTextNode(' ');
          const content = $createTextNode(text);
          const after = $createTextNode(' ');
          selection.insertNodes([before, content, after]);
          console.warn('ResourceTagNode insert fallback to text:', e);
        }
      });
    },
    
    insertCommandTag: (tag: any) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const commandTag = CommandTagNode.create(
            tag.commandType || 'text_to_image',
            tag.id,
            tag.display || tag.name || tag.id,
            tag.config || { prompt: '' },
            false // isPending = false
          );
          
          // 检查光标前后是否有文本，如果没有则添加空格分隔
          const anchorNode = selection.anchor.getNode();
          const focusNode = selection.focus.getNode();
          const nodesToInsert: LexicalNode[] = [commandTag];
          
          // 检查前面是否需要空格
          if ($isTextNode(anchorNode)) {
            const textContent = anchorNode.getTextContent();
            const anchorOffset = selection.anchor.offset;
            if (anchorOffset === 0 || textContent[anchorOffset - 1] !== ' ') {
              nodesToInsert.unshift($createTextNode(' '));
            }
          } else {
            nodesToInsert.unshift($createTextNode(' '));
          }
          
          // 检查后面是否需要空格
          if ($isTextNode(focusNode)) {
            const textContent = focusNode.getTextContent();
            const focusOffset = selection.focus.offset;
            if (focusOffset === textContent.length || textContent[focusOffset] !== ' ') {
              nodesToInsert.push($createTextNode(' '));
            }
          } else {
            nodesToInsert.push($createTextNode(' '));
          }
          
          selection.insertNodes(nodesToInsert);
        }
      });
    },
    
    get selectionStart() {
      let start = 0;
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          start = selection.anchor.offset;
        }
      });
      return start;
    },
    
    getPlainTextCursorPosition: () => {
      let position = 0;
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          position = selection.anchor.offset;
        }
      });
      return position;
    },
    
    setSelectionRange: (start: number, end: number) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.anchor.offset = start;
          selection.focus.offset = end;
        }
      });
    },
    
    exportForSubmission: async (sessionId: string) => {
      return new Promise<string>((resolve) => {
        editor.getEditorState().read(() => {
          // 从编辑器提取内容并转换为EditorContent格式
          const root = $getRoot();
          const segments: Array<string | any> = [];
          
          console.log('🔍 UnifiedEditor exportForSubmission - Starting extraction');
          
          // 遍历所有顶级节点
          const children = root.getChildren();
          console.log('📋 Found children:', children.length);
          
          for (const paragraph of children) {
            console.log('📄 Processing paragraph:', paragraph.getType());
            if ($isElementNode(paragraph)) {
              const childNodes = paragraph.getChildren();
              console.log('📝 Paragraph has child nodes:', childNodes.length);
              
              for (const node of childNodes) {
                console.log('🔍 Processing node:', node.getType(), node);
                
                if (node instanceof ResourceTagNode) {
                  const tag = node.toTag();
                  console.log('📎 Found ResourceTag:', tag);
                  segments.push(tag);
                } else if (node instanceof CommandTagNode) {
                  const tag = node.toTag();
                  console.log('⚡ Found CommandTag:', tag);
                  segments.push(tag);
                } else if ($isTextNode(node)) {
                  // 文本节点
                  const textContent = node.getTextContent();
                  if (textContent) {
                    console.log('📄 Found text:', textContent);
                    segments.push(textContent);
                  }
                } else {
                  console.log('❓ Unknown node type:', node.getType(), node);
                }
              }
            }
          }
          
          console.log('📋 Final segments:', segments);
          const content: EditorContent = { segments };
          
          // 如果是temp-session，在window上保存EditorContent，供Home.tsx使用
          if (sessionId === 'temp-session') {
            (window as any).pendingEditorContent = content;
          }
          
          // 使用TagManager导出
          TagManager.exportForSubmission(content, sessionId)
            .then(resolve)
            .catch(() => resolve('')); // 出错时返回空字符串
        });
      });
    },

    clear: () => {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        root.append(paragraph);
        paragraph.selectStart();
      });
    }
  }));
}

// 编辑器内容组件
const EditorInner = forwardRef<UnifiedEditorRef, UnifiedEditorProps>(({
  mode = 'simple',
  placeholder = "Type a message...",
  className = "",
  enableSlashCommands = false,
  currentSessionId,
  onChange
}, ref) => {
  const [editor] = useLexicalComposerContext();
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  
  useEditorRef(ref, mode);

  // 监听编辑器状态变化
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const textContent = root.getTextContent().trim();
        
        // 简单检查是否有标签节点：如果JSON序列化包含这些类型就认为有标签
        const editorStateJson = JSON.stringify(editorState);
        const hasTagNodes = editorStateJson.includes('resource-tag') || editorStateJson.includes('command-tag');
        
        const hasContent = textContent.length > 0 || hasTagNodes;
        setIsEmpty(!hasContent);
        
        // 通知父组件内容变化 - 如果有标签节点，即使文本为空也算有内容
        if (onChange) {
          // 传递实际文本内容，但父组件会基于hasContent判断是否可提交
          onChange(hasContent ? (textContent || ' ') : '');
        }
      });
    });
  }, [editor, onChange]);

  // 监听焦点变化
  useEffect(() => {
    const editorElement = editor.getRootElement();
    if (!editorElement) return;

    const handleFocus = (e: FocusEvent) => {
      console.log('Editor gained focus, isFocused was:', isFocused);
      setIsFocused(true);
    };

    const handleBlur = (e: FocusEvent) => {
      console.log('Editor lost focus, isFocused was:', isFocused);
      setIsFocused(false);
    };

    // 使用 focusin 和 focusout 事件，它们会冒泡
    editorElement.addEventListener('focusin', handleFocus);
    editorElement.addEventListener('focusout', handleBlur);

    return () => {
      editorElement.removeEventListener('focusin', handleFocus);
      editorElement.removeEventListener('focusout', handleBlur);
    };
  }, [editor, isFocused]);
  
  const handleClick = () => {
    console.log('handleClick called, current isFocused:', isFocused);
    editor.focus();
  };

  return (
    <UnifiedEditorContext.Provider value={{ currentSessionId }}>
    <div className={`unified-editor relative ${className}`} onClick={handleClick}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable 
            className="w-full min-h-[120px] pt-4 pl-2 pr-[50px] pb-[60px] bg-transparent text-foreground resize-none outline-none border-none font-sans text-base leading-relaxed focus:outline-none cursor-text"
            spellCheck="false"
            style={{
              caretColor: '#000000'
            }}
          />
        }
        placeholder={
          <div 
            className={`editor-placeholder absolute top-4 left-2 text-gray-400 pointer-events-none font-sans text-base transition-opacity duration-200 ${
              isFocused ? 'opacity-0' : isEmpty ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {placeholder}
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <SimpleSlashPlugin enable={enableSlashCommands} sessionId={currentSessionId} />
    </div>
    </UnifiedEditorContext.Provider>
  );
});

// 主组件
const UnifiedEditor = forwardRef<UnifiedEditorRef, UnifiedEditorProps>((props, ref) => {
  const initialConfig = {
    namespace: 'UnifiedEditor',
    theme: {
      // Lexical编辑器主题
      root: 'relative min-h-[40px] focus-within:outline-none',
      paragraph: 'mb-0',
      text: {
        base: '',
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline'
      }
    },
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error);
    },
    nodes: [ResourceTagNode, CommandTagNode],
    editorState: () => {
      // 创建初始编辑器状态，确保有一个空的段落节点
      const root = $getRoot();
      if (root.getChildren().length === 0) {
        const paragraph = $createParagraphNode();
        root.append(paragraph);
        // 设置光标到段落开始位置
        paragraph.selectStart();
      }
    }
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorInner {...props} ref={ref} />
      <ResourceTagTransformPlugin />
    </LexicalComposer>
  );
});

UnifiedEditor.displayName = 'UnifiedEditor';

export default UnifiedEditor;
