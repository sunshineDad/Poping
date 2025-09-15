/**
 * [File Overview]
 * ===============
 * - Purpose: 斜杠命令主菜单，显示在光标右侧的命令选择界面
 * - Data Flow: SlashCommand[] → 分组渲染 → 选择/配置 → CommandTag
 * - Core Data Structures: 
 *   - SlashCommand（命令定义）
 *   - MenuPosition（位置信息）
 *   - NavigationState（导航状态）
 * - Main Functions:
 *   1. renderCommandGroups() - 渲染分组命令
 *   2. handleCommandSelect() - 处理命令选择
 *   3. handleSearch() - 搜索过滤
 *   4. calculatePosition() - 计算菜单位置
 * - Related Files:
 *     @/types/slash-commands.ts → 类型定义
 *     @/components/SlashCommand/CommandConfigDialog.tsx → 配置对话框
 *     @/components/SlashCommand/CommandTag.tsx → 标签组件
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ArrowRight, Sparkles, Image, FileText, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@shared/ui';
import { 
  SlashCommand, 
  SlashMenuItem, 
  MenuPosition, 
  NavigationState,
  ResponsiveConfig
} from '@shared/types';

/**
 * [Props Interface]
 * =================
 * - commands: 可用命令列表
 * - position: 菜单显示位置
 * - onCommandSelect: 命令选择回调
 * - onClose: 关闭菜单回调
 * - isOpen: 菜单是否打开
 * - searchQuery: 初始搜索查询
 */
export interface SlashCommandMenuProps {
  commands: SlashCommand[];
  position: MenuPosition;
  onCommandSelect: (command: SlashCommand) => void;
  onClose: () => void;
  isOpen: boolean;
  searchQuery?: string;
  className?: string;
  
  // 响应式配置
  responsive?: ResponsiveConfig;
  
  // 键盘导航
  initialFocusedIndex?: number;
  onNavigationChange?: (state: NavigationState) => void;
}

/**
 * [Category Icons]
 * ================
 * - 为每个命令分类提供对应图标
 * - 保持视觉一致性和直观性
 */
const getCategoryIcon = (category: SlashCommand['category']) => {
  switch (category) {
    case 'ai':
      return <Zap size={16} />;
    case 'media':
      return <Image size={16} />;
    case 'file':
      return <FileText size={16} />;
    case 'workflow':
      return <Settings size={16} />;
    case 'custom':
      return <Sparkles size={16} />;
    default:
      return <Sparkles size={16} />;
  }
};

/**
 * [Category Labels]
 * =================
 * - 分类显示名称的国际化映射
 * - 便于后续多语言支持
 */
const getCategoryLabel = (category: SlashCommand['category']) => {
  switch (category) {
    case 'ai':
      return 'AI 工具';
    case 'media':
      return '媒体生成';
    case 'file':
      return '文件操作';
    case 'workflow':
      return '工作流';
    case 'custom':
      return '自定义';
    default:
      return '其他';
  }
};

/**
 * [SlashCommandMenu Component]
 * ============================
 * - 主菜单组件，负责命令的展示和交互
 * - 支持搜索、分组、键盘导航
 * - 自动位置计算和响应式适配
 */
export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  commands,
  position,
  onCommandSelect,
  onClose,
  isOpen,
  searchQuery = '',
  className,
  responsive,
  initialFocusedIndex = 0,
  onNavigationChange,
}) => {
  // ===== 状态管理 =====
  const [navigation, setNavigation] = useState<NavigationState>({
    focusedIndex: initialFocusedIndex,
    focusedGroup: undefined,
    isSearching: !!searchQuery,
    searchQuery: searchQuery,
  });

  const [actualPosition, setActualPosition] = useState<MenuPosition>(position);
  
  // ===== Refs =====
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  // ===== 计算过滤和分组的命令 =====
  const filteredAndGroupedCommands = useMemo(() => {
    // STEP 1: 过滤命令
    let filtered = commands;
    if (navigation.searchQuery.trim()) {
      const query = navigation.searchQuery.toLowerCase();
      filtered = commands.filter(cmd => 
        cmd.name.toLowerCase().includes(query) ||
        cmd.displayName.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // STEP 2: 按分类分组
    const grouped = filtered.reduce((acc, cmd) => {
      const category = cmd.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: cmd.id,
        command: cmd,
        isVisible: true,
      } as SlashMenuItem);
      return acc;
    }, {} as Record<SlashCommand['category'], SlashMenuItem[]>);

    // STEP 3: 转换为有序数组
    const categoryOrder: SlashCommand['category'][] = ['ai', 'media', 'file', 'workflow', 'custom'];
    return categoryOrder
      .filter(category => grouped[category] && grouped[category].length > 0)
      .map(category => ({
        category,
        label: getCategoryLabel(category),
        icon: getCategoryIcon(category),
        items: grouped[category],
      }));
  }, [commands, navigation.searchQuery]);

  // ===== 扁平化所有可见命令（用于键盘导航） =====
  const flatCommands = useMemo(() => {
    return filteredAndGroupedCommands.reduce((acc, group) => {
      return acc.concat(group.items.map(item => item.command));
    }, [] as SlashCommand[]);
  }, [filteredAndGroupedCommands]);

  // ===== 位置计算 =====
  const calculateActualPosition = useCallback(() => {
    if (!menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let { x, y } = position;
    let anchorPosition = position.anchorPosition;

    // 水平边界检查
    if (x + menuRect.width > viewportWidth - 20) {
      x = Math.max(20, viewportWidth - menuRect.width - 20);
      anchorPosition = 'right';
    }

    // 垂直边界检查
    if (y + menuRect.height > viewportHeight - 20) {
      y = Math.max(20, y - menuRect.height);
      anchorPosition = anchorPosition === 'top' ? 'bottom' : anchorPosition;
    }

    setActualPosition({
      ...position,
      x,
      y,
      anchorPosition,
      maxHeight: Math.min(position.maxHeight || 400, viewportHeight - y - 40),
    });
  }, [position]);

  // ===== 事件处理 =====
  
  /**
   * [Function: handleCommandSelect]
   * ===============================
   * - Input: SlashCommand
   * - Output: void (触发回调)
   * - Role in Flow: 用户选择命令 → 关闭菜单 → 触发配置或直接执行
   * - Logic:
   *   1. 调用父组件回调
   *   2. 关闭菜单
   *   3. 重置导航状态
   */
  const handleCommandSelect = useCallback((command: SlashCommand) => {
    onCommandSelect(command);
    onClose();
    
    // 重置导航状态
    setNavigation(prev => ({
      ...prev,
      focusedIndex: 0,
      searchQuery: '',
      isSearching: false,
    }));
  }, [onCommandSelect, onClose]);

  /**
   * [Function: handleSearchChange]
   * ==============================
   * - Input: string (搜索查询)
   * - Output: void
   * - Role in Flow: 用户输入 → 过滤命令 → 更新导航状态
   * - Logic:
   *   1. 更新搜索查询
   *   2. 重置聚焦索引
   *   3. 通知导航状态变化
   */
  const handleSearchChange = useCallback((query: string) => {
    const newNavigation = {
      ...navigation,
      searchQuery: query,
      isSearching: query.length > 0,
      focusedIndex: 0, // 搜索时重置聚焦
    };
    
    setNavigation(newNavigation);
    onNavigationChange?.(newNavigation);
  }, [navigation, onNavigationChange]);

  /**
   * [Function: handleKeyDown]
   * =========================
   * - Input: KeyboardEvent
   * - Output: void
   * - Role in Flow: 键盘输入 → 导航控制 → 状态更新
   * - Logic:
   *   1. 检查按键类型
   *   2. 执行对应导航操作
   *   3. 阻止默认行为
   *   4. 更新聚焦状态
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setNavigation(prev => {
          const nextIndex = Math.min(prev.focusedIndex + 1, flatCommands.length - 1);
          const newNav = { ...prev, focusedIndex: nextIndex };
          onNavigationChange?.(newNav);
          return newNav;
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setNavigation(prev => {
          const nextIndex = Math.max(prev.focusedIndex - 1, 0);
          const newNav = { ...prev, focusedIndex: nextIndex };
          onNavigationChange?.(newNav);
          return newNav;
        });
        break;
        
      case 'Enter':
        e.preventDefault();
        if (flatCommands.length > 0 && navigation.focusedIndex < flatCommands.length) {
          handleCommandSelect(flatCommands[navigation.focusedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
        
      case '/':
        // 如果不在搜索模式，进入搜索
        if (!navigation.isSearching && searchRef.current) {
          e.preventDefault();
          searchRef.current.focus();
          setNavigation(prev => ({ ...prev, isSearching: true }));
        }
        break;
        
      default:
        // 字母数字键自动进入搜索模式
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && searchRef.current) {
          searchRef.current.focus();
          setNavigation(prev => ({ 
            ...prev, 
            isSearching: true,
            searchQuery: prev.searchQuery + e.key
          }));
        }
        break;
    }
  }, [flatCommands, navigation, handleCommandSelect, onClose, onNavigationChange]);

  // ===== Effects =====
  
  useEffect(() => {
    if (isOpen) {
      calculateActualPosition();
      
      // 延迟聚焦，确保DOM已渲染
      const timer = setTimeout(() => {
        if (navigation.isSearching && searchRef.current) {
          searchRef.current.focus();
        } else if (itemRefs.current[navigation.focusedIndex]) {
          itemRefs.current[navigation.focusedIndex]?.focus();
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, calculateActualPosition, navigation.isSearching, navigation.focusedIndex]);

  // 监听窗口大小变化，重新计算位置
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => calculateActualPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, calculateActualPosition]);

  // 聚焦索引变化时，滚动到对应项目
  useEffect(() => {
    const focusedElement = itemRefs.current[navigation.focusedIndex];
    if (focusedElement && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const itemRect = focusedElement.getBoundingClientRect();
      
      if (itemRect.bottom > menuRect.bottom) {
        focusedElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
      } else if (itemRect.top < menuRect.top) {
        focusedElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }
  }, [navigation.focusedIndex]);

  // ===== 渲染逻辑 =====
  
  if (!isOpen) return null;

  /**
   * [Function: renderCommandItem]
   * =============================
   * - 渲染单个命令项
   * - 包含图标、名称、描述、快捷键等
   * - 支持聚焦状态和hover效果
   */
  const renderCommandItem = (command: SlashCommand, globalIndex: number) => {
    const isFocused = navigation.focusedIndex === globalIndex;
    
    return (
      <Button
        key={command.id}
        ref={el => { itemRefs.current[globalIndex] = el; }}
        variant="ghost"
        className={cn(
          "w-full justify-start p-3 h-auto text-left transition-colors duration-150",
          isFocused ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
        )}
        onClick={() => handleCommandSelect(command)}
        onMouseEnter={() => {
          setNavigation(prev => ({ ...prev, focusedIndex: globalIndex }));
        }}
        tabIndex={isFocused ? 0 : -1}
        aria-selected={isFocused}
        role="option"
      >
        <div className="flex items-center gap-3 w-full">
          <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center">
            {command.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm truncate">
                {command.displayName}
              </span>
              {command.hasConfig && (
                <Settings size={12} className="text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {command.description}
            </p>
          </div>
          <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
        </div>
      </Button>
    );
  };

  /**
   * [Function: renderCommandGroup]
   * ==============================
   * - 渲染命令分组
   * - 包含分组标题和命令列表
   * - 计算全局索引用于键盘导航
   */
  const renderCommandGroup = (group: typeof filteredAndGroupedCommands[0], startIndex: number) => {
    return (
      <div key={group.category} className="py-2">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground/80 bg-muted/30 rounded-md mb-2">
          {group.icon}
          <span>{group.label}</span>
        </div>
        <div className="space-y-1">
          {group.items.map((item, index) => 
            renderCommandItem(item.command, startIndex + index)
          )}
        </div>
      </div>
    );
  };

  const menuContent = (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-50 w-80 bg-background border border-border rounded-lg shadow-lg",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        responsive?.isMobile && "w-screen max-w-sm",
        className
      )}
      style={{
        left: actualPosition.x,
        top: actualPosition.y,
        maxHeight: actualPosition.maxHeight,
      }}
      onKeyDown={handleKeyDown}
      role="listbox"
      aria-label="选择斜杠命令"
    >
      {/* 搜索栏 */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="搜索命令..."
            value={navigation.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      {/* 命令列表 */}
      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {filteredAndGroupedCommands.length > 0 ? (
          <div className="p-2">
            {(() => {
              let globalIndex = 0;
              return filteredAndGroupedCommands.map((group) => {
                const groupElement = renderCommandGroup(group, globalIndex);
                globalIndex += group.items.length;
                return groupElement;
              });
            })()}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Search size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">没有找到匹配的命令</p>
            <p className="text-xs mt-1">试试其他关键词</p>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>↑↓ 导航</span>
            <span>Enter 选择</span>
            <span>Esc 关闭</span>
          </div>
          <span>{flatCommands.length} 个命令</span>
        </div>
      </div>
    </div>
  );

  // 使用 Portal 渲染到 body，避免 z-index 问题
  return createPortal(menuContent, document.body);
};
