import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Code, Globe, Settings, FileText, Edit, Terminal, Search, List, CheckSquare, ExternalLink, Play, FileEdit, ClipboardList, Maximize2, Minimize2, Brain, Image as ImageIcon, Calendar, CornerDownRight, Clock, MessageCircle, Mic, Wrench, Zap } from 'lucide-react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { SmartMarkdown } from '@shared/ui/SmartMarkdown';
import { JsonViewer } from '@shared/ui';
import { ToolUseRenderer } from '@features/tool-render';
import { ToolContent } from '@features/tool-render/ToolContent';
import { CodeHighlight } from '@shared/ui';
import { ImageRenderer, DocsRenderer, TextsRenderer, MemoryRenderer, EventRenderer } from './ContentRenderers';
import { MessageText } from '@shared/ui';
import { MessageContent } from '@shared/ui';
import { ToolResultRenderer } from '@features/tool-render';
import { CommandTag } from '@features/composer/slash';
import { UniversalTag } from '@shared/ui';
import type { ChatMessage, ToolResult } from '@shared/types';
import type { CommandTag as CommandTagType } from '@shared/types';
import type { Resource, Memory, Event } from '@/lib/aigents';

interface MessageItemProps {
  message: ChatMessage;
  toolResults?: Record<string, ToolResult>;
  childrenMessages?: Record<string, ChatMessage[]>;
  expandedTasks?: Set<string>;
  onToggleTaskExpanded?: (toolUseId: string) => void;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  isStreaming?: boolean;
  sessionId?: string;
  allMessages?: ChatMessage[]; // To find corresponding tool_call for tool_result
  useStructuredContent?: boolean; // 新增：是否使用结构化内容渲染
}

interface AnimatedJsonDisplayProps {
  jsonString: string;
  startDelay: number;
  isExpanded: boolean;
}

const AnimatedJsonDisplay: React.FC<AnimatedJsonDisplayProps> = ({ jsonString, startDelay, isExpanded }) => {
  const [revealProgress, setRevealProgress] = useState(0);
  const [fullHeight, setFullHeight] = useState(0);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Get the full height of the JSON content
    if (hiddenRef.current) {
      setFullHeight(hiddenRef.current.scrollHeight);
    }
  }, [jsonString]);
  
  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (isExpanded) {
      // Expanding animation
      setRevealProgress(0);
      
      const timer = setTimeout(() => {
        const duration = 800; // 总动画时长0.8秒
        const startTime = Date.now();
        
        const animateReveal = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Use easeOutQuart for smooth deceleration
          const easedProgress = 1 - Math.pow(1 - progress, 4);
          setRevealProgress(easedProgress);
          
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animateReveal);
          } else {
            animationRef.current = null;
          }
        };
        
        animationRef.current = requestAnimationFrame(animateReveal);
      }, startDelay);
      
      return () => clearTimeout(timer);
    } else {
      // Collapsing animation - immediate start, no delay
      const duration = 600; // 收缩动画稍快一些
      const startTime = Date.now();
      const startProgress = revealProgress; // 从当前进度开始收缩
      
      const animateCollapse = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easeInQuart for smooth acceleration when collapsing
        const easedProgress = Math.pow(progress, 4);
        const currentProgress = startProgress * (1 - easedProgress);
        setRevealProgress(currentProgress);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateCollapse);
        } else {
          animationRef.current = null;
        }
      };
      
      animationRef.current = requestAnimationFrame(animateCollapse);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isExpanded, startDelay]);
  
  return (
    <div className="relative">
      {/* Hidden reference for measuring full height */}
      <div 
        ref={hiddenRef}
        className="absolute opacity-0 pointer-events-none -z-10"
      >
        <CodeHighlight
          code={jsonString}
          language="json"
          className="border-0 rounded-none"
        />
      </div>
      
      {/* Animated container with progressive height */}
      <div 
        className="overflow-hidden transition-none"
        style={{
          height: `${fullHeight * revealProgress}px`,
          minHeight: revealProgress > 0 ? '1px' : '0px'
        }}
      >
        <CodeHighlight
          code={jsonString}
          language="json"
          className="border-0 rounded-none"
        />
      </div>
    </div>
  );
};

function getToolIcon(toolName: string) {
  switch (toolName) {
    case 'Read':
      return <FileText size={15} />;
    case 'Edit':
    case 'MultiEdit':
      return <Edit size={15} />;
    case 'Bash':
      return <Terminal size={15} />;
    case 'Grep':
    case 'Glob':
      return <Search size={15} />;
    case 'LS':
      return <List size={15} />;
    case 'TodoRead':
    case 'TodoWrite':
      return <CheckSquare size={15} />;
    case 'WebSearch':
      return <Globe size={15} />;
    case 'WebFetch':
      return <ExternalLink size={15} />;
    case 'Task':
      return <Play size={15} />;
    case 'exit_plan_mode':
      return <ClipboardList size={15} />;
    case 'Write':
      return <FileEdit size={15} />;
    // MCP tools
    case 'mcp__memories__write_memory':
    case 'mcp__memories__update_memory':
    case 'mcp__memories__delete_memory':
    case 'mcp__memories__search_memories':
    case 'mcp__memories__link_memories':
    case 'mcp__memories__get_memory':
    case 'mcp__memories__get_memory_info':
    case 'mcp__memories__list_memories':
      return <Brain className="w-3.5 h-3.5 text-purple-600" />;
    case 'mcp__docs__save_doc':
    case 'mcp__docs__update_doc':
    case 'mcp__docs__delete_doc':
    case 'mcp__docs__search_docs':
    case 'mcp__docs__get_doc':
    case 'mcp__docs__get_doc_info':
    case 'mcp__docs__list_docs':
      return <FileText className="w-3.5 h-3.5 text-orange-600" />;
    case 'mcp__texts__save_text':
    case 'mcp__texts__update_text':
    case 'mcp__texts__delete_text':
    case 'mcp__texts__search_texts':
    case 'mcp__texts__get_text':
    case 'mcp__texts__get_text_info':
    case 'mcp__texts__list_texts':
      return <FileText className="w-3.5 h-3.5 text-green-600" />;
    case 'mcp__images__search_images':
    case 'mcp__images__delete_image':
    case 'mcp__images__get_image':
    case 'mcp__images__list_images':
    case 'mcp__images__get_image_info':
      return <ImageIcon className="w-3.5 h-3.5 text-blue-600" />;
    case 'mcp__events__search_events':
    case 'mcp__events__search_messages':
    case 'mcp__events__search_messages_in_event':
    case 'mcp__events__get_event':
    case 'mcp__events__list_events':
    case 'mcp__events__get_current_event':
    case 'mcp__events__get_timeline':
    case 'mcp__events__get_event_messages':
      return <Calendar className="w-3.5 h-3.5 text-indigo-600" />;
    case 'mcp__retrieval__search':
      return <Search className="w-3.5 h-3.5 text-teal-600" />;
    default:
      return <Settings size={15} />;
  }
}

// Function to detect and render special content types
function renderSpecialContent(content: any, onView?: (item: any) => void) {
  // Check if content is a resource
  if (content && typeof content === 'object' && content.type && content.name && content.size !== undefined) {
    const resource = content as Resource;
    switch (resource.type) {
      case 'images':
        return <ImageRenderer resource={resource} onView={onView} />;
      case 'docs':
        return <DocsRenderer resource={resource} onView={onView} />;
      case 'texts':
        return <TextsRenderer resource={resource} onView={onView} />;
      default:
        return null;
    }
  }
  
  // Check if content is a memory
  if (content && typeof content === 'object' && content.title && content.context && content.priority) {
    const memory = content as Memory;
    return <MemoryRenderer memory={memory} onView={onView} />;
  }
  
  // Check if content is an event
  if (content && typeof content === 'object' && content.title && content.type && content.status && content.timestamp) {
    const event = content as Event;
    return <EventRenderer event={event} onView={onView} />;
  }
  
  return null;
}

// Custom components for ReactMarkdown
const markdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    
    if (!inline && match) {
      return (
        <CodeHighlight
          code={String(children).replace(/\n$/, '')}
          language={language}
          className="my-4"
        />
      );
    }
    
    return (
      <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  
  pre({ children }: any) {
    return (
      <div className="my-4">
        {children}
      </div>
    );
  },
  
  p({ children }: any) {
    return (
      <p className="mb-4 last:mb-0 leading-relaxed">
        {children}
      </p>
    );
  },
  
  ul({ children }: any) {
    return (
      <ul className="my-4 list-disc list-inside space-y-1">
        {children}
      </ul>
    );
  },
  
  ol({ children }: any) {
    return (
      <ol className="my-4 list-decimal list-inside space-y-1">
        {children}
      </ol>
    );
  },
  
  li({ children }: any) {
    return (
      <li className="leading-relaxed">
        {children}
      </li>
    );
  },
  
  blockquote({ children }: any) {
    return (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic text-gray-700 dark:text-gray-300">
        {children}
      </blockquote>
    );
  },
  
  h1({ children }: any) {
    return (
      <h1 className="text-2xl font-bold mt-8 mb-4 first:mt-0">
        {children}
      </h1>
    );
  },
  
  h2({ children }: any) {
    return (
      <h2 className="text-xl font-bold mt-6 mb-3 first:mt-0">
        {children}
      </h2>
    );
  },
  
  h3({ children }: any) {
    return (
      <h3 className="text-lg font-semibold mt-5 mb-2 first:mt-0">
        {children}
      </h3>
    );
  },
  
  table({ children }: any) {
    return (
      <div className="my-4 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          {children}
        </table>
      </div>
    );
  },
  
  th({ children }: any) {
    return (
      <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold">
        {children}
      </th>
    );
  },
  
  td({ children }: any) {
    return (
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
        {children}
      </td>
    );
  },
  
  a({ href, children }: any) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
      >
        {children}
      </a>
    );
  },
  
  hr() {
    return (
      <hr className="my-8 border-t border-gray-300 dark:border-gray-600" />
    );
  },
  
  strong({ children }: any) {
    return (
      <strong className="font-semibold">
        {children}
      </strong>
    );
  },
  
  em({ children }: any) {
    return (
      <em className="italic">
        {children}
      </em>
    );
  }
};

// Parse command tags from message content
const parseCommandTags = (text: string): Array<{type: 'text' | 'command' | 'resource', content: string | CommandTagType}> => {
  console.log('🔍 parseCommandTags input:', JSON.stringify(text));
  
  const parts: Array<{type: 'text' | 'command' | 'resource', content: string | CommandTagType}> = [];
  
  // First find all resource tags
  const resourceMatches: Array<{ match: string; index: number }> = [];
  const resourceRegex = /@(?:image|text|doc):\/\/[^\s@]+/g;
  let resourceMatch;
  while ((resourceMatch = resourceRegex.exec(text)) !== null) {
    resourceMatches.push({
      match: resourceMatch[0],
      index: resourceMatch.index
    });
  }
  
  // Then split by command patterns and process each segment
  const commandSplitRegex = /(请使用(?:文生图|图生图)功能)/g;
  const segments = text.split(commandSplitRegex);
  
  let currentIndex = 0;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue;
    
    if (segment === '请使用文生图功能' || segment === '请使用图生图功能') {
      // This is a command start, combine with next segment to form complete command
      if (i + 1 < segments.length) {
        const commandTextRaw = segment + segments[i + 1];
        const parsed = parseCommandFromText(commandTextRaw);
        if (parsed) {
          // 1) push the command tag
          parts.push({ type: 'command', content: parsed.tag });

          // 2) process the remainder: may contain text and resource tags
          const remainder = commandTextRaw.slice(parsed.length);
          const remainderStart = currentIndex + parsed.length;
          const remainderEnd = remainderStart + remainder.length;
          if (remainder && remainder.trim().length > 0) {
            // Find resource matches that lie within this remainder range
            const rMatches = resourceMatches
              .filter(rm => rm.index >= remainderStart && rm.index < remainderEnd)
              .sort((a, b) => a.index - b.index);

            if (rMatches.length === 0) {
              parts.push({ type: 'text', content: remainder });
            } else {
              let segLastIndex = 0;
              for (const rm of rMatches) {
                const localIndex = rm.index - remainderStart;
                // Text before the resource tag
                if (localIndex > segLastIndex) {
                  const before = remainder.substring(segLastIndex, localIndex);
                  if (before.trim()) parts.push({ type: 'text', content: before });
                }
                // The resource tag itself
                parts.push({ type: 'resource', content: rm.match });
                segLastIndex = localIndex + rm.match.length;
              }
              // Remaining text
              if (segLastIndex < remainder.length) {
                const after = remainder.substring(segLastIndex);
                if (after.trim()) parts.push({ type: 'text', content: after });
              }
            }
          }
        } else {
          // If parsing failed, treat as text
          parts.push({ type: 'text', content: commandTextRaw });
        }
        i++; // Skip next segment as we've processed it
        currentIndex += commandTextRaw.length;
      }
    } else {
      // This is regular text, check for resource tags within it
      if (segment.trim()) {
        // Find resource tags in this segment
        const segmentResourceMatches = resourceMatches.filter(rm => 
          rm.index >= currentIndex && rm.index < currentIndex + segment.length
        );
        
        if (segmentResourceMatches.length > 0) {
          // Process segment with resource tags
          let segmentLastIndex = 0;
          for (const rm of segmentResourceMatches) {
            const localIndex = rm.index - currentIndex;
            
            // Add text before resource tag
            if (localIndex > segmentLastIndex) {
              const textBefore = segment.substring(segmentLastIndex, localIndex);
              if (textBefore.trim()) {
                parts.push({type: 'text', content: textBefore});
              }
            }
            
            // Add resource tag
            parts.push({type: 'resource', content: rm.match});
            segmentLastIndex = localIndex + rm.match.length;
          }
          
          // Add remaining text in segment
          if (segmentLastIndex < segment.length) {
            const remainingText = segment.substring(segmentLastIndex);
            if (remainingText.trim()) {
              parts.push({type: 'text', content: remainingText});
            }
          }
        } else {
          // No resource tags, add as plain text
          parts.push({type: 'text', content: segment});
        }
        
        currentIndex += segment.length;
      }
    }
  }
  
  console.log('🔍 parseCommandTags result:', parts);
  return parts.length > 0 ? parts : [{type: 'text', content: text}];
};

// Parse command from text description and return tag + consumed length
const parseCommandFromText = (text: string): { tag: CommandTagType; length: number } | null => {
  try {
    const isTextToImage = text.includes('文生图');

    // Single regex to capture the entire command segment at the beginning
    // Make prompt greedy and require a clear terminator: either
    //  - another field that starts with '，' (尺寸/风格/参考图片ID), or
    //  - an explicit sentence terminator (。.!?)
    // This avoids splitting a CJK word like "小猫" into two pieces when
    // optional groups allow a zero-length match.
    const re = isTextToImage
      ? /^(请使用文生图功能(?:生成图片)?)[：:]\s*(?<prompt>[^。\n]+?)(?:(?:，尺寸[：:]\s*(?<w>\d+)×(?<h>\d+))|(?:，使用风格[：:]\s*(?<style>[^，。\n]+)，finetune_id[：:]\s*(?<ft>[^，。\n]+))|(?<term>[。.!?])|(?=\s|$))/
      : /^(请使用图生图功能)[：:]\s*(?<prompt>[^。\n]+?)(?:(?:，参考图片ID[：:]\s*(?<src>[^，。\n]+))|(?:，尺寸[：:]\s*(?<w>\d+)×(?<h>\d+))|(?:，使用风格[：:]\s*(?<style>[^，。\n]+)，finetune_id[：:]\s*(?<ft>[^，。\n]+))|(?<term>[。.!?])|(?=\s|$))/;

    const m = text.match(re);
    if (!m) return null;
    const groups = (m as any).groups || {};

    // Aspect ratio helper
    const getAspectRatio = (width: number, height: number): string => {
      if (width === height) return '1:1';
      if (width === 1024 && height === 768) return '4:3';
      if (width === 768 && height === 1024) return '3:4';
      if (width === 1024 && height === 576) return '16:9';
      if (width === 576 && height === 1024) return '9:16';
      if (width === 1344 && height === 576) return '21:9';
      if (width === 1152 && height === 768) return '3:2';
      if (width === 768 && height === 1152) return '2:3';
      return `${width}:${height}`;
    };

    const width = groups.w ? parseInt(groups.w, 10) : 1024;
    const height = groups.h ? parseInt(groups.h, 10) : 1024;
    const aspectRatio = getAspectRatio(width, height);

    const prompt = (groups.prompt as string).trim();
    const styleId = (groups.ft as string | undefined) || (groups.style as string | undefined);
    const sourceImage = groups.src as string | undefined;

    const tag: CommandTagType = {
      id: `parsed_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      command: isTextToImage ? 'text_to_image' : 'image_to_image',
      config: {
        prompt,
        aspect_ratio: aspectRatio as any,
        width,
        height,
        ...(styleId && { style_id: styleId }),
        ...(sourceImage && { source_image: sourceImage })
      },
      display: `${isTextToImage ? '文生图' : '图生图'}: ${prompt.substring(0, 20)}...`,
      created_at: new Date().toISOString()
    };

    return { tag, length: m[0].length };
  } catch {
    return null;
  }
};

export function MessageItem({ 
  message, 
  toolResults = {}, 
  childrenMessages = {}, 
  expandedTasks = new Set(), 
  onToggleTaskExpanded,
  isFirstInGroup = true, 
  isLastInGroup = true,
  isStreaming = false,
  sessionId,
  allMessages = [],
  useStructuredContent = true
}: MessageItemProps) {
  const [copiedBlocks, setCopiedBlocks] = useState<Set<string>>(new Set());
  const [isUserMessageExpanded, setIsUserMessageExpanded] = useState(false);
  const [isAssistantMessageExpanded, setIsAssistantMessageExpanded] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineAnchor, setTimelineAnchor] = useState<{top: number; left: number} | null>(null);

  const openTimelineAt = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const width = 380;
    const left = Math.max(16, Math.min(r.left, window.innerWidth - width - 16));
    const top = r.bottom + 8;
    setTimelineAnchor({ top, left });
    setShowTimeline(true);
  };

  useEffect(() => {
    if (!showTimeline) return;
    const onKey = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setShowTimeline(false); };
    const onClick = (ev: MouseEvent) => {
      const el = document.getElementById('timeline-popover');
      if (!el) return;
      if (!el.contains(ev.target as Node)) setShowTimeline(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('mousedown', onClick); };
  }, [showTimeline]);

  const renderTimelinePopover = (timeline: any[]) => {
    if (!Array.isArray(timeline) || timeline.length === 0) return null;
    // Compute total duration and offsets for Gantt-like bars
    const total = timeline.reduce((acc: number, t: any) => acc + (t?.delta_ms || 0), 0) || 1;
    let offset = 0;
    const nice = (val: number) => (val >= 1000 ? `${(val/1000).toFixed(2)} s` : `${val} ms`);
    const rows = timeline.map((t: any, idx: number) => {
      const d = Math.max(0, t?.delta_ms || 0);
      const startPct = Math.min(99, Math.max(0, Math.round((offset / total) * 100)));
      const widthPct = Math.max(2, Math.min(100 - startPct, Math.round((d / total) * 100)));
      const startMs = offset;
      const endMs = offset + d;
      offset += d;
      const icon = t.type === 'generation' ? <MessageCircle size={14} className="text-blue-500"/>
        : t.type === 'thinking' ? <Brain size={14} className="text-purple-500"/>
        : t.type === 'tool_use' ? <Wrench size={14} className="text-amber-600"/>
        : t.type === 'user' ? <Mic size={14} className="text-yellow-600"/>
        : t.type === 'system' ? <Zap size={14} className="text-green-600"/>
        : <Code size={14} className="text-muted-foreground"/>;
      return (
        <div key={idx} className="py-2 border-b last:border-b-0 border-border/50">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {icon}
              <div className="text-sm text-foreground truncate" title={t.label}>{t.label}</div>
            </div>
            <div className="text-sm text-foreground/80 whitespace-nowrap">{nice(d)}</div>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Start {nice(startMs)}</span>
            <span>End {nice(endMs)}</span>
          </div>
          <div className="mt-1 h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden relative">
            <div className="absolute inset-y-0 bg-neutral-900 dark:bg-neutral-200 rounded-full" style={{ left: `${startPct}%`, width: `${widthPct}%` }} />
          </div>
        </div>
      );
    });
    const pop = (
      <div id="timeline-popover" className="pointer-events-auto fixed w-[380px] max-h-[70vh] overflow-auto bg-background border border-border/60 rounded-xl shadow-xl z-[100000] p-4"
           style={{ top: timelineAnchor?.top ?? 80, left: timelineAnchor?.left ?? 80 }}
           role="dialog" aria-label="Processing timeline">
        <div className="text-sm font-medium mb-2 text-foreground">Processing timeline</div>
        <div className="flex items-center justify-between text-[11px] text-foreground/70 mb-1">
          <span>Total</span>
          <span>{(total >= 1000 ? (total/1000).toFixed(2) + ' s' : total + ' ms')}</span>
        </div>
        <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-3">
          <div className="h-full w-full bg-neutral-900 dark:bg-neutral-200 rounded-full" />
        </div>
        <div className="space-y-2">{rows}</div>
      </div>
    );
    return createPortal(pop, document.body);
  };
  
  // 渲染消息内容的辅助函数
  const renderMessageContent = (content: string) => {
    // 强制使用新的结构化内容渲染系统
    return (
      <MessageContent 
        content={content}
        sessionId={sessionId}
      />
    );
  };

  const copyContent = async (content: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedBlocks(prev => new Set(prev).add(blockId));
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const next = new Set(prev);
          next.delete(blockId);
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle user messages
  if (message.type === 'user') {
    const content = typeof message.content === 'string' 
      ? message.content 
      : Array.isArray(message.content) 
        ? message.content.filter((block: any) => block.type === 'text').map((block: any) => block.text).join('\n')
        : '';
    
    // 先尝试解析命令标签，如果有命令则使用特殊渲染
    const contentParts = parseCommandTags(content);
    const hasCommandTags = contentParts.some(part => part.type === 'command' || part.type === 'resource');
    
    // 如果没有命令标签，使用普通渲染
    if (!hasCommandTags) {
      const lines = content.split('\n');
      const shouldShowExpandButton = lines.length > 8;
      const displayLines = isUserMessageExpanded ? lines : lines.slice(0, 8);
      const hiddenLinesCount = lines.length - 8;
      const displayContent = displayLines.join('\n');
      
      return (
        <div className="flex justify-end w-full">
          <div className="relative bg-card text-card-foreground rounded-xl p-3 max-w-[80%] min-w-[100px]">
            {shouldShowExpandButton && (
              <button
                onClick={() => setIsUserMessageExpanded(!isUserMessageExpanded)}
                className="absolute top-2 right-2 w-6 h-6 border-none bg-transparent text-neutral-600 cursor-pointer flex items-center justify-center p-0 z-10 hover:text-neutral-900"
                aria-label={isUserMessageExpanded ? "Show fewer lines" : "Show all lines"}
              >
                {isUserMessageExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
            <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap break-words pt-1">
              {renderMessageContent(displayContent)}
              {!isUserMessageExpanded && shouldShowExpandButton && (
                <span className="text-muted-foreground italic">
                  {'\n'}... +{hiddenLinesCount} lines
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // 有命令标签时，混合渲染文本和标签
    return (
      <div className="flex justify-end w-full">
        <div className="relative bg-card text-card-foreground rounded-xl p-3 max-w-[80%] min-w-[100px]">
          <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap break-words pt-1">
            {contentParts.map((part, index) => {
              if (part.type === 'command') {
                return (
                  <UniversalTag
                    key={`cmd-${index}`}
                    tag={{
                      type: 'command' as const,
                      commandType: (part.content as CommandTagType).command,
                      id: (part.content as CommandTagType).id,
                      display: (part.content as CommandTagType).display,
                      config: (part.content as CommandTagType).config,
                      isPending: false
                    }}
                    sessionId={sessionId}
                    readonly={true}
                    className="mx-1"
                  />
                );
              } else if (part.type === 'resource') {
                // Parse resource tag: @type://id
                const resourceText = part.content as string;
                const match = resourceText.match(/@(image|text|doc):\/\/([^\s@]+)/);
                if (match) {
                  const [, resourceType, id] = match;
                  const fileName = id.split('/').pop() || id;
                  const name = fileName.length > 20 ? fileName.slice(0, 17) + '...' : fileName;
                  
                  return (
                    <UniversalTag
                      key={`res-${index}`}
                      tag={{
                        type: 'resource' as const,
                        resourceType: resourceType as 'image' | 'text' | 'doc',
                        id,
                        name,
                        isPending: false
                      }}
                      sessionId={sessionId}
                      readonly={true}
                      className="mx-1"
                    />
                  );
                } else {
                  // Fallback to text if parsing fails
                  return (
                    <span key={`text-${index}`} className="whitespace-pre-wrap">
                      {part.content as string}
                    </span>
                  );
                }
              } else {
                return (
                  <span key={`text-${index}`} className="whitespace-pre-wrap">
                    {part.content as string}
                  </span>
                );
              }
            })}
          </div>
        </div>
      </div>
    );
  }

  // Handle tool_call messages
  if (message.type === 'tool_call') {
    const [isParamsExpanded, setIsParamsExpanded] = useState(false);
    const toolName = message.toolName || (message as any).toolUseId || 'Tool';
    const toolInput = message.toolInput || {};
    const hasParams = Object.keys(toolInput).length > 0;
    
    return (
      <div className="relative w-full flex flex-col gap-3 pl-5">
        {/* vertical line to align with assistant timeline */}
        <div className="absolute top-0 bottom-0 left-2 w-px bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex gap-2 items-start">
          <div className="w-4 flex-shrink-0 flex items-start justify-center text-foreground relative pt-1">
            {getToolIcon(toolName)}
          </div>
          <div className="flex-1 flex flex-col gap-2 min-w-0 break-words">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{toolName}</span>
              
              {hasParams && (
                <div className="mt-2">
                  <button
                    onClick={() => setIsParamsExpanded(!isParamsExpanded)}
                    className="inline-flex items-center gap-1.5 px-0 py-1 text-sm hover:text-foreground transition-colors duration-200 text-muted-foreground"
                  >
                    <CornerDownRight 
                      size={10} 
                      className={`transition-transform duration-300 ${isParamsExpanded ? 'rotate-90' : ''}`}
                    />
                    <span className="font-medium">parameters</span>
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isParamsExpanded ? 'max-h-screen mt-3' : 'max-h-0 mt-0'
                    }`}
                  >
                    
                    {/* Top Border */}
                    <div 
                      className={`border-t border-gray-200 dark:border-gray-600 transition-all duration-300 ${
                        isParamsExpanded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                      }`}
                      style={{
                        transformOrigin: 'left',
                        transitionDelay: isParamsExpanded ? '150ms' : '0ms'
                      }}
                    />
                    
                    {/* JSON Content */}
                    <div 
                      className={`transition-all duration-200 ease-out ${
                        isParamsExpanded ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'
                      }`}
                      style={{
                        transitionDelay: isParamsExpanded ? '250ms' : '0ms'
                      }}
                    >
                      <AnimatedJsonDisplay
                        jsonString={JSON.stringify(toolInput, null, 2)}
                        startDelay={300}
                        isExpanded={isParamsExpanded}
                      />
                    </div>
                    
                    {/* Bottom Border */}
                    <div 
                      className={`border-b border-gray-200 dark:border-gray-600 transition-all duration-300 ${
                        isParamsExpanded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                      }`}
                      style={{
                        transformOrigin: 'left',
                        transitionDelay: isParamsExpanded ? '800ms' : '0ms'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle tool_result messages
  if (message.type === 'tool_result') {
    const isError = message.isError || false;
    
    // Try to find the corresponding tool_call to get tool name
    const correspondingToolCall = allMessages.find((msg: ChatMessage) => 
      msg.type === 'tool_call' && msg.toolUseId === message.toolResultId
    );
    const toolName = correspondingToolCall?.toolName || 'Tool';
    
    const contentNode = toolName.startsWith('mcp__')
      ? (
        <ToolContent
          toolName={toolName}
          toolInput={correspondingToolCall?.toolInput || {}}
          toolResult={{ id: message.toolResultId, status: isError ? 'error' : 'completed', result: message.content, is_error: isError }}
        />
      )
      : (
        <ToolResultRenderer content={message.content} isError={isError} />
      )

    return (
      <div className="relative w-full flex flex-col gap-3 pl-5">
        {/* vertical line to align with assistant timeline */}
        <div className="absolute top-0 bottom-0 left-2 w-px bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex gap-2 items-start">
          <div className="w-4 flex-shrink-0 flex items-start justify-center text-foreground relative pt-1">
            <div className={`w-2.5 h-2.5 rounded-full ${isError ? 'bg-red-500' : 'bg-green-500'}`} />
          </div>
          <div className="flex-1 min-w-0 break-words">
            <div className="text-sm text-muted-foreground mb-2">
              <span className="font-medium">{toolName} {isError ? 'failed' : 'completed'}</span>
            </div>
            {contentNode}
          </div>
        </div>
      </div>
    );
  }

  // Handle assistant messages with timeline
  if (message.type === 'assistant') {
    const renderContent = () => {
      if (typeof message.content === 'string') {
        const lines = message.content.split('\n');
        const shouldShowExpandButton = lines.length > 50;
        const displayLines = isAssistantMessageExpanded ? lines : lines.slice(0, 50);
        const hiddenLinesCount = lines.length - 50;
        const displayContent = displayLines.join('\n');
        
        return (
            <div className="flex gap-2 items-start relative">
              <div className="w-4 flex-shrink-0" />
              <div className="flex-1 min-w-0 relative">
                {shouldShowExpandButton && (
                  <button
                    onClick={() => setIsAssistantMessageExpanded(!isAssistantMessageExpanded)}
                    className="absolute top-0 right-0 border-none bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 cursor-pointer flex items-center gap-1 px-2 py-1 z-10 hover:text-gray-900 dark:hover:text-gray-100 rounded backdrop-blur-sm"
                    aria-label={isAssistantMessageExpanded ? "Show fewer lines" : "Show all lines"}
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isAssistantMessageExpanded ? "收起" : "点击展开"}
                    </span>
                    {isAssistantMessageExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                )}
                {Array.isArray(message.timeline) && message.timeline.length > 0 && (
                  <button
                    onClick={(e) => openTimelineAt(e)}
                    className="absolute top-1 -left-7 border-none bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer flex items-center justify-center w-6 h-6 z-[10000]"
                    title="Timeline"
                    aria-label="Timeline"
                  >
                    <Clock size={14} />
                  </button>
                )}
                {showTimeline && Array.isArray(message.timeline) && renderTimelinePopover(message.timeline)}
                <div className="prose prose-sm max-w-none dark:prose-invert pt-1">
                  <SmartMarkdown text={displayContent} components={markdownComponents} />
                  {!isAssistantMessageExpanded && shouldShowExpandButton && (
                    <div className="text-muted-foreground italic text-sm mt-2">
                      ... +{hiddenLinesCount} lines
                    </div>
                  )}
                </div>
              </div>
            </div>
        );
      }
      
      // Check if message content is a special type (resource, memory, event)
      const specialContent = renderSpecialContent(message.content);
      if (specialContent) {
        return (
          <div className="flex gap-2 items-start">
            <div className="w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0 pt-1">
              {specialContent}
            </div>
          </div>
        );
      }

      if (Array.isArray(message.content)) {
        return (
          <div className="relative">
            {Array.isArray(message.timeline) && message.timeline.length > 0 && (
              <button
                onClick={(e) => openTimelineAt(e)}
                className="absolute top-1 -left-7 border-none bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer flex items-center justify-center w-6 h-6 z-[10000]"
                title="Timeline"
                aria-label="Timeline"
              >
                <Clock size={14} />
              </button>
            )}
            {showTimeline && Array.isArray(message.timeline) && renderTimelinePopover(message.timeline)}
            {message.content.map((block: any, index: number) => {
          const blockId = `${message.messageId}-${index}`;

          // Check if block is a special content type first
          const specialBlockContent = renderSpecialContent(block);
          if (specialBlockContent) {
            return (
              <div key={blockId} className="flex gap-2 items-start">
                <div className="w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0 pt-1">
                  {specialBlockContent}
                </div>
              </div>
            );
          }

          if (block.type === 'text') {
            return (
              <div key={blockId} className="flex gap-2 items-start">
                <div className="w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0 prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:my-1 prose-li:my-2 prose-pre:my-6 prose-headings:mb-5 prose-headings:mt-6 prose-ul:my-4 prose-ol:my-4 pt-1">
                  <SmartMarkdown text={block.text} components={markdownComponents} />
                </div>
              </div>
            );
          }

          if (block.type === 'thinking') {
            return (
              <div key={blockId} className="flex gap-2 items-start">
                <div className="w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0 prose prose-sm max-w-none italic text-muted-foreground dark:prose-invert pt-1">
                  <ReactMarkdown components={markdownComponents}>{block.thinking}</ReactMarkdown>
                </div>
              </div>
            );
          }

          if (block.type === 'tool_use') {
            const toolResult = toolResults[block.id];
            const isLoading = !toolResult || toolResult.status === 'pending';
            const shouldBlink = isLoading && isStreaming;
            
            return (
              <div key={blockId} className="flex gap-2 items-start">
                <div className={`w-4 flex-shrink-0 flex items-start justify-center text-foreground relative pt-1 ${shouldBlink ? 'animate-pulse' : ''}`}>
                  {getToolIcon(block.name)}
                </div>
                <div className="flex-1 flex flex-col gap-2 min-w-0 break-words">
                  <ToolUseRenderer
                    toolUse={block}
                    toolResult={toolResult}
                    toolResults={toolResults}
                    workingDirectory={message.workingDirectory}
                    childrenMessages={childrenMessages}
                    expandedTasks={expandedTasks}
                    onToggleTaskExpanded={onToggleTaskExpanded}
                  />
                </div>
              </div>
            );
          }

          // Default: render as JSON
          return (
            <div key={blockId} className="flex gap-2 items-start">
              <div className="w-4 flex-shrink-0 flex items-start justify-center text-foreground relative pt-1">
                <Code size={15} />
              </div>
              <div className="flex-1 text-sm leading-relaxed text-foreground min-w-0 break-words pt-1">
                <JsonViewer data={block} />
              </div>
            </div>
          );
            })}
          </div>
        );
      }

      // Fallback
      return (
        <div className="flex gap-2 items-start">
          <div className="w-4 flex-shrink-0" />
          <div className="flex-1 text-sm leading-relaxed text-foreground min-w-0 break-words">
            <JsonViewer data={message.content} />
          </div>
        </div>
      );
    };

    return (
      <div className="relative w-full flex flex-col gap-3 pl-5">
        {/* vertical timeline line on the left */}
        <div className="absolute top-0 bottom-0 left-2 w-px bg-neutral-200 dark:bg-neutral-700" />
        {renderContent()}
      </div>
    );
  }

  // Handle error messages
  if (message.type === 'error') {
    return (
      <div className="w-full my-2">
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
          {String(message.content)}
        </div>
      </div>
    );
  }

  // Default fallback
  return null;
}
