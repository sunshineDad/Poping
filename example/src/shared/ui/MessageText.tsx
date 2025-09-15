import React, { useState, useCallback } from 'react';
import { File, FileText, Image, Eye } from 'lucide-react';
import { api } from '@services';

interface ResourceTag {
  type: 'image' | 'text' | 'doc';
  id: string;
  name: string;
  position: number;
  length: number;
}

interface MessageTextProps {
  content: string;
  sessionId?: string;
  className?: string;
}

export const MessageText: React.FC<MessageTextProps> = ({
  content,
  sessionId,
  className = ''
}) => {
  const [showPreview, setShowPreview] = useState<{ tag: ResourceTag; x: number; y: number; showAbove?: boolean; showOnLeft?: boolean } | null>(null);
  const [resourceContent, setResourceContent] = useState<Record<string, any>>({});
  const [loadingContent, setLoadingContent] = useState<Set<string>>(new Set());

  // Load resource content for preview
  const loadResourceContent = useCallback(async (resourceId: string, sessionId?: string) => {
    if (resourceContent[resourceId] || loadingContent.has(resourceId)) {
      return; // Already loaded or loading
    }

    setLoadingContent(prev => new Set([...prev, resourceId]));
    
    try {
      console.log('Loading resource content for:', resourceId, 'with sessionId:', sessionId);
      const result = await api.getResourceContent(resourceId, sessionId);
      console.log('Resource content result:', result);
      
      if (result.success) {
        setResourceContent(prev => ({
          ...prev,
          [resourceId]: result.data
        }));
      } else {
        console.error('Resource content API returned error:', result.error);
        setResourceContent(prev => ({
          ...prev,
          [resourceId]: { error: 'Failed to load content' }
        }));
      }
    } catch (error) {
      console.error('Failed to load resource content:', error);
      setResourceContent(prev => ({
        ...prev,
        [resourceId]: { error: 'Network error' }
      }));
    } finally {
      setLoadingContent(prev => {
        const newSet = new Set(prev);
        newSet.delete(resourceId);
        return newSet;
      });
    }
  }, [resourceContent, loadingContent]);

  // Parse resource tags from text
  const parseResourceTags = useCallback((text: string): ResourceTag[] => {
    const tags: ResourceTag[] = [];
    const regex = /@(image|text|doc):\/\/([^@\s]+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, type, id] = match;
      const fullName = id.split('/').pop() || id;
      const name = fullName.length > 6 ? fullName.slice(-6) : fullName;
      
      tags.push({
        type: type as 'image' | 'text' | 'doc',
        id,
        name,
        position: match.index || 0,
        length: fullMatch.length
      });
    }

    return tags;
  }, []);

  // Get icon for resource type
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-3 h-3" />;
      case 'text':
        return <FileText className="w-3 h-3" />;
      case 'doc':
        return <File className="w-3 h-3" />;
      default:
        return <File className="w-3 h-3" />;
    }
  };

  // Render content with resource tags
  const renderContentWithTags = () => {
    const resourceTags = parseResourceTags(content);
    
    if (resourceTags.length === 0) {
      return content;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    resourceTags.forEach((tag, index) => {
      // Add text before the tag
      if (tag.position > lastIndex) {
        const textBefore = content.substring(lastIndex, tag.position);
        elements.push(textBefore);
      }

      // Add the resource tag as a styled element
      elements.push(
        <span
          key={`tag-${index}`}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium mx-1 cursor-pointer hover:bg-blue-200 transition-colors relative group"
          onMouseEnter={() => {
            // Load resource content for preview
            if ((tag.type === 'image' || tag.type === 'text') && sessionId) {
              loadResourceContent(tag.id, sessionId);
            }
          }}
        >
          {getResourceIcon(tag.type)}
          <span>{tag.name}</span>
          
          {/* Tooltip using relative positioning - below the tag */}
          {resourceContent[tag.id] && !resourceContent[tag.id].error && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999] pointer-events-none">
              {tag.type === 'image' ? (
                <img 
                  src={`data:${resourceContent[tag.id].content_type || 'image/png'};base64,${resourceContent[tag.id].content}`}
                  alt={tag.name}
                  className="max-w-64 max-h-48 object-contain rounded-lg shadow-xl"
                />
              ) : (
                <div className="max-w-80 max-h-40 p-3 bg-white rounded-lg border overflow-auto shadow-xl">
                  <div className="text-xs font-medium text-gray-500 mb-2">{tag.id}</div>
                  <pre className="text-sm whitespace-pre-wrap break-words">
                    {typeof resourceContent[tag.id].content === 'string' 
                      ? resourceContent[tag.id].content.slice(0, 500) + (resourceContent[tag.id].content.length > 500 ? '...' : '')
                      : JSON.stringify(resourceContent[tag.id].content, null, 2).slice(0, 500)
                    }
                  </pre>
                </div>
              )}
            </div>
          )}
        </span>
      );

      lastIndex = tag.position + tag.length;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      elements.push(content.substring(lastIndex));
    }

    return elements;
  };

  return (
    <>
      <div className={className}>
        {renderContentWithTags()}
      </div>

      {/* Preview Tooltip */}
      {showPreview && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: showPreview.x,
            top: showPreview.y,
            transform: showPreview.showOnLeft 
              ? 'translateX(-100%) translateY(-50%)' 
              : 'translateX(0%) translateY(-50%)',
            zIndex: 999999
          }}
        >
          {showPreview.tag.type === 'image' ? (
            /* Image Preview - Clean and minimal */
            <div className="mb-2">
              {resourceContent[showPreview.tag.id] && !resourceContent[showPreview.tag.id].error ? (
                <img 
                  src={`data:${resourceContent[showPreview.tag.id].content_type || 'image/png'};base64,${resourceContent[showPreview.tag.id].content}`}
                  alt={showPreview.tag.name}
                  className="max-w-64 max-h-48 object-contain rounded-lg"
                  style={{ 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.06)' 
                  }}
                />
              ) : resourceContent[showPreview.tag.id]?.error ? (
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs">
                  <div className="flex items-center gap-2 mb-1">
                    {getResourceIcon(showPreview.tag.type)}
                    <span className="font-medium">{showPreview.tag.name}</span>
                  </div>
                  <div className="text-xs text-red-400">{resourceContent[showPreview.tag.id].error}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              ) : loadingContent.has(showPreview.tag.id) ? (
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs">
                  <div className="flex items-center gap-2 mb-1">
                    {getResourceIcon(showPreview.tag.type)}
                    <span className="font-medium">{showPreview.tag.name}</span>
                  </div>
                  <div className="text-xs text-gray-400">Loading...</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              ) : (
                <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs">
                  <div className="flex items-center gap-2 mb-1">
                    {getResourceIcon(showPreview.tag.type)}
                    <span className="font-medium">{showPreview.tag.name}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Eye className="w-3 h-3 mr-1" />
                    <span>Image preview</span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          ) : (
            /* Text/Doc Preview - Keep existing style */
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                {getResourceIcon(showPreview.tag.type)}
                <span className="font-medium">{showPreview.tag.name}</span>
              </div>
              <div className="text-xs text-gray-300">
                {showPreview.tag.type === 'text' && 'Text resource'}
                {showPreview.tag.type === 'doc' && 'Document resource'}
              </div>
              
              {showPreview.tag.type === 'text' && (
                <div className="mt-2 p-2 bg-gray-800 rounded border text-xs">
                  {resourceContent[showPreview.tag.id] ? (
                    <pre className="whitespace-pre-wrap max-h-32 overflow-y-auto text-gray-300">
                      {resourceContent[showPreview.tag.id].content?.substring(0, 500)}
                      {resourceContent[showPreview.tag.id].content?.length > 500 ? '...' : ''}
                    </pre>
                  ) : loadingContent.has(showPreview.tag.id) ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    <span className="text-gray-400">Text file content preview...</span>
                  )}
                </div>
              )}
              
              {showPreview.tag.type === 'doc' && (
                <div className="mt-2 p-2 bg-gray-800 rounded border text-xs">
                  Document content preview...
                </div>
              )}
              
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      )}
    </>
  );
};