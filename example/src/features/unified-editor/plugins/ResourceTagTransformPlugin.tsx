/**
 * ResourceTagTransformPlugin - 文本转换插件
 * 
 * 功能：
 * - 自动将 @type://id 格式的文本转换为 ResourceTagNode
 * - 确保所有资源标签都被正确解析和渲染
 * - 防止在编辑过程中丢失 pendingFile 引用
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $createTextNode, $isTextNode, TextNode } from 'lexical';
import { $createParagraphNode } from 'lexical';
import { ResourceTagNode } from '../nodes/ResourceTagNode';

const RESOURCE_TAG_REGEX = /@(image|text|doc):\/\/([^\s@]+)/g;

export function ResourceTagTransformPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    console.log('🚀 ResourceTagTransformPlugin: Registering transform...');
    
    // 注册文本转换
    const removeTransform = editor.registerNodeTransform(TextNode, (textNode: TextNode) => {
      const textContent = textNode.getTextContent();
      console.log('🔍 Transform: Checking text node:', textContent);
      
      // 创建新的正则表达式实例避免状态问题
      const regex = /@(image|text|doc):\/\/([^\s@]+)/g;
      
      // 检查是否包含资源标签
      if (regex.test(textContent)) {
        console.log('🔄 Transform: Found resource tags in text, converting:', textContent);
        
        // 重置正则表达式
        regex.lastIndex = 0;
        
        const newNodes = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(textContent)) !== null) {
          const [fullMatch, resourceType, resourceId] = match;
          const startIndex = match.index;

          console.log('🎯 Transform: Processing match:', fullMatch, 'at index:', startIndex);

          // 添加标签前的文本
          if (startIndex > lastIndex) {
            const beforeText = textContent.slice(lastIndex, startIndex);
            if (beforeText) {
              newNodes.push($createTextNode(beforeText));
              console.log('📝 Transform: Added text before tag:', beforeText);
            }
          }

          // 创建资源标签节点（加保护，避免HMR导致的class不一致报错）
          try {
            const resourceTagNode = ResourceTagNode.fromString(fullMatch);
            if (resourceTagNode) {
              console.log('✅ Transform: Created ResourceTagNode for:', fullMatch);
              newNodes.push(resourceTagNode);
            } else {
              console.warn('❌ Transform: Failed to create ResourceTagNode for:', fullMatch);
              newNodes.push($createTextNode(fullMatch));
            }
          } catch (e) {
            console.warn('⚠️ Transform fallback to text for tag:', fullMatch, e);
            newNodes.push($createTextNode(fullMatch));
          }

          lastIndex = startIndex + fullMatch.length;
        }

        // 添加剩余文本
        if (lastIndex < textContent.length) {
          const afterText = textContent.slice(lastIndex);
          if (afterText) {
            newNodes.push($createTextNode(afterText));
            console.log('📝 Transform: Added text after tag:', afterText);
          }
        }

        // 替换原始文本节点
        if (newNodes.length > 0) {
          console.log('🔄 Transform: Replacing text node with', newNodes.length, 'nodes');
          textNode.replace(newNodes[0]);
          // 插入剩余节点
          for (let i = 1; i < newNodes.length; i++) {
            newNodes[i - 1].insertAfter(newNodes[i]);
          }
        }
      }
    });

    return removeTransform;
  }, [editor]);

  return null;
}
