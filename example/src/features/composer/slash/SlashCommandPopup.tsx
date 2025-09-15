import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ArrowRight, Settings, Sparkles, Image, FileText, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@shared/ui';
import { SLASH_COMMANDS, ASPECT_RATIO_OPTIONS, SlashCommand, CommandConfig, Style, CommandTag } from '@shared/types';
import { api } from '@services';

interface SlashCommandPopupProps {
  position: { x: number; y: number };
  visible: boolean;
  onInsertTag: (tag: CommandTag) => void;
  onClose: () => void;
  sessionId?: string;
}

export function SlashCommandPopup({ position, visible, onInsertTag, onClose, sessionId }: SlashCommandPopupProps) {
  console.log('SlashCommandPopup render:', { visible, position, sessionId });
  
  const [step, setStep] = useState<'menu' | 'config'>('menu');
  const [selectedCommand, setSelectedCommand] = useState<SlashCommand['id'] | null>(null);
  const [config, setConfig] = useState<CommandConfig>({ prompt: '' });
  const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const configPanelRef = useRef<HTMLDivElement>(null);

  // Clamp position within viewport
  const getClampedPosition = useCallback((x: number, y: number) => {
    const width = 320; // menu width
    const height = 400; // approx
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = Math.min(Math.max(margin, x), Math.max(margin, vw - width - margin));
    const cy = Math.min(Math.max(margin, y), Math.max(margin, vh - height - margin));
    return { x: cx, y: cy };
  }, []);

  // 处理文件选择
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setConfig({...config, source_image: file.name});
      setSourceImageFile(file);
      
      // 创建预览URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
    // 重置input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [config]);

  // 触发文件选择
  const handleImageUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 分类图标映射 - 使用Lucide图标保持一致
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

  // 计算过滤和分组的命令
  const filteredAndGroupedCommands = useMemo(() => {
    // 过滤命令
    let filtered = SLASH_COMMANDS;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = SLASH_COMMANDS.filter(cmd => 
        cmd.name.toLowerCase().includes(query) ||
        cmd.displayName.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // 按分类分组
    const grouped = filtered.reduce((acc, cmd) => {
      const category = cmd.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: cmd.id,
        command: cmd,
        isVisible: true,
      });
      return acc;
    }, {} as Record<SlashCommand['category'], any[]>);

    // 转换为有序数组
    const categoryOrder: SlashCommand['category'][] = ['ai', 'media', 'file', 'workflow', 'custom'];
    return categoryOrder
      .filter(category => grouped[category] && grouped[category].length > 0)
      .map(category => ({
        category,
        label: getCategoryLabel(category),
        icon: getCategoryIcon(category),
        items: grouped[category],
      }));
  }, [searchQuery]);

  // 扁平化所有可见命令
  const flatCommands = useMemo(() => {
    return filteredAndGroupedCommands.reduce((acc, group) => {
      return acc.concat(group.items.map(item => item.command));
    }, [] as SlashCommand[]);
  }, [filteredAndGroupedCommands]);
  
  // 加载数据
  const loadData = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      // 加载风格列表 - 复用现有API
      const client = await api.getOrCreateAIGentsClient(sessionId);
      const stylesResult = await client.listStyles();
      setStyles(stylesResult || []);
    } catch (error) {
      console.error('Failed to load styles:', error);
      setStyles([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);
  
  const handleCommandSelect = useCallback((command: SlashCommand) => {
    if (command.hasConfig) {
      // 需要配置的命令，显示配置界面
      setSelectedCommand(command.id);
      setStep('config');
      
      // 设置默认配置
      setConfig({
        prompt: '',
        aspect_ratio: '1:1',
        ...(command.id === 'image_to_image' && { strength: 0.7 })
      });
      
      loadData();
    } else {
      // 不需要配置的命令，直接插入
      const tag: CommandTag = {
        type: 'command',
        commandType: command.id,
        id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        display: command.displayName,
        config: { prompt: '' },
        isPending: false
      };
      onInsertTag(tag);
      onClose();
    }
  }, [loadData, onInsertTag, onClose]);
  
  // 自动聚焦处理 & click outside to close
  useEffect(() => {
    if (!visible) return;
    
    if (step === 'menu' && popupRef.current) {
      // 菜单步骤：聚焦主菜单
      setTimeout(() => {
        popupRef.current?.focus();
      }, 50);
    } else if (step === 'config') {
      // 配置步骤：聚焦到文本输入框
      setTimeout(() => {
        const configPanel = document.querySelector('[data-config-panel="true"]');
        const textareaElement = configPanel?.querySelector('textarea');
        if (textareaElement) {
          textareaElement.focus();
        }
      }, 100); // 稍微长一点的延迟确保配置面板已渲染
    }

    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const inMenu = popupRef.current?.contains(target);
      const inConfig = configPanelRef.current?.contains(target);
      if (!inMenu && !inConfig) onClose();
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [visible, step]);

  // 清理预览URL以防止内存泄漏
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);
  
  const handleConfirm = () => {
    if (!selectedCommand || !config.prompt.trim()) return;
    
    const tag: CommandTag = {
      type: 'command',
      commandType: selectedCommand,
      id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      display: generateDisplayText(selectedCommand, config),
      config,
      isPending: selectedCommand === 'image_to_image' && !!sourceImageFile,
      pendingFiles: selectedCommand === 'image_to_image' && sourceImageFile ? {
        sourceImage: sourceImageFile
      } : undefined
    };
    
    onInsertTag(tag);
    onClose();
    
    // 重置状态
    setStep('menu');
    setSelectedCommand(null);
    setConfig({ prompt: '' });
    setSourceImageFile(null);
    setImagePreviewUrl(null);
    setSelectedIndex(0);
    setSearchQuery('');
  };
  
  const generateDisplayText = (command: SlashCommand['id'], config: CommandConfig): string => {
    const commandName = command === 'text_to_image' ? '文生图' : '图生图';
    const prompt = config.prompt.length > 20 
      ? config.prompt.slice(0, 20) + '...' 
      : config.prompt;
    return `${commandName}: ${prompt}`;
  };
  
  if (!visible) return null;

  const clamped = getClampedPosition(position.x, position.y);

  return createPortal(
    <>
      {/* 主菜单 */}
      <div 
        ref={popupRef}
        className="fixed z-50 w-80 bg-background border border-border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-100 focus:outline-none"
        style={{
          left: clamped.x,
          top: clamped.y,
          maxHeight: 400,
        }}
        tabIndex={-1}
        onKeyDown={(e) => {
          // 直接在组件上处理按键事件，阻止传播到编辑器
          if (step === 'menu') {
            switch (e.key) {
              case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                setSelectedIndex(prev => Math.min(prev + 1, flatCommands.length - 1));
                break;
              case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                break;
              case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                if (flatCommands.length > 0 && selectedIndex < flatCommands.length) {
                  handleCommandSelect(flatCommands[selectedIndex]);
                }
                break;
              case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                onClose();
                break;
            }
          }
        }}
      >
        {/* 命令菜单 - 始终显示 */}
          {/* 搜索栏 */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索命令..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                    const startIndex = globalIndex;
                    globalIndex += group.items.length;
                    return (
                      <div key={group.category} className="py-2">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground/80 bg-muted/30 rounded-md mb-2">
                          {group.icon}
                          <span>{group.label}</span>
                        </div>
                        <div className="space-y-1">
                          {group.items.map((item, index) => {
                            const itemIndex = startIndex + index;
                            const isFocused = selectedIndex === itemIndex;
                            return (
                              <Button
                                key={item.command.id}
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start p-3 h-auto text-left transition-colors duration-150",
                                  isFocused ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                                )}
                                onClick={() => handleCommandSelect(item.command)}
                                onMouseEnter={() => setSelectedIndex(itemIndex)}
                                tabIndex={isFocused ? 0 : -1}
                                aria-selected={isFocused}
                                role="option"
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center">
                                    {item.command.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm truncate">
                                        {item.command.displayName}
                                      </span>
                                      {item.command.hasConfig && (
                                        <Settings size={12} className="text-muted-foreground flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {item.command.description}
                                    </p>
                                  </div>
                                  <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
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
      
      {/* 右侧配置面板 */}
      {step === 'config' && selectedCommand && (
        <div 
          data-config-panel="true"
          ref={configPanelRef}
          className="fixed z-50 w-96 bg-background border border-border rounded-lg shadow-lg animate-in fade-in-0 slide-in-from-left-2 duration-200 focus:outline-none"
          style={{
            left: Math.min(clamped.x + 320 + 8, window.innerWidth - 384 - 8),
            top: clamped.y,
            maxHeight: 500,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              // 配置面板按Esc只返回主菜单，不关闭整个菜单
              setStep('menu');
              setSelectedCommand(null);
              setConfig({ prompt: '' });
              setSourceImageFile(null);
              setImagePreviewUrl(null);
              setSelectedIndex(0);
            }
          }}
          tabIndex={-1}
        >
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* 标题 */}
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="text-lg">{SLASH_COMMANDS.find(c => c.id === selectedCommand)?.icon}</span>
              <span className="font-medium">{SLASH_COMMANDS.find(c => c.id === selectedCommand)?.displayName}</span>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
              </div>
            ) : (
              <>
                {/* Prompt输入 */}
                <div>
                  <label className="block text-sm font-medium mb-1">描述文本 *</label>
                  <textarea
                    value={config.prompt}
                    onChange={(e) => setConfig({...config, prompt: e.target.value})}
                    placeholder="请输入图片描述..."
                    className="w-full px-3 py-2 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    rows={3}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        // textarea按Esc只返回主菜单，不关闭整个菜单
                        setStep('menu');
                        setSelectedCommand(null);
                        setConfig({ prompt: '' });
                        setSourceImageFile(null);
                        setImagePreviewUrl(null);
                        setSelectedIndex(0);
                      }
                    }}
                  />
                </div>
                
                {/* 风格选择 */}
                {styles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">生成风格</label>
                    <select
                      value={config.style_id || ''}
                      onChange={(e) => setConfig({...config, style_id: e.target.value || undefined})}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">默认风格</option>
                      {styles.map(style => (
                        <option key={style.id} value={style.id}>{style.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* 宽高比选择 */}
                <div>
                  <label className="block text-sm font-medium mb-2">宽高比</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ASPECT_RATIO_OPTIONS.map(ratio => (
                      <button
                        key={ratio.value}
                        type="button"
                        onClick={() => setConfig({...config, aspect_ratio: ratio.value})}
                        className={`px-3 py-2 text-sm rounded border transition-colors ${
                          config.aspect_ratio === ratio.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:bg-muted/50'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 图生图特有字段 */}
                {selectedCommand === 'image_to_image' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">参考图片 *</label>
                      <div className="border border-dashed border-border rounded-md p-4 text-center bg-muted/20">
                        {imagePreviewUrl ? (
                          <div className="space-y-3">
                            <div className="relative">
                              <img 
                                src={imagePreviewUrl} 
                                alt="预览图片"
                                className="max-w-full max-h-32 rounded-md mx-auto object-contain"
                              />
                            </div>
                            <div className="text-xs text-green-600">
                              已选择图片: {config.source_image}
                            </div>
                            <button 
                              type="button"
                              onClick={handleImageUploadClick}
                              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                            >
                              重新选择
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">上传图片或选择已有图片</div>
                            <button 
                              type="button"
                              onClick={handleImageUploadClick}
                              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                            >
                              选择图片
                            </button>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            
            {/* 底部按钮 */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  // 返回按钮只返回主菜单
                  setStep('menu');
                  setSelectedCommand(null);
                  setConfig({ prompt: '' });
                  setSourceImageFile(null);
                  setImagePreviewUrl(null);
                  setSelectedIndex(0);
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← 返回
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!config.prompt.trim() || loading || (selectedCommand === 'image_to_image' && !config.source_image)}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
