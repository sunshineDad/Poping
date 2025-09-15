/**
 * [File Overview]
 * ===============
 * - Purpose: 通用命令配置对话框，支持不同命令类型的配置界面
 * - Data Flow: SlashCommand → 配置表单 → 验证 → CommandConfig → CommandTag
 * - Core Data Structures:
 *   - CommandConfig（配置数据）
 *   - ConfigField（配置字段定义）
 *   - ValidationResult（验证结果）
 * - Main Functions:
 *   1. renderConfigFields() - 动态渲染配置字段
 *   2. validateConfig() - 验证配置完整性
 *   3. handleSubmit() - 提交配置并生成标签
 *   4. handlePreview() - 预览配置效果
 * - Related Files:
 *     @/types/slash-commands.ts → 类型定义
 *     @/components/SlashCommand/ImageGenerationDialog.tsx → 图片专用配置
 *     @/components/SlashCommand/CommandTag.tsx → 生成的标签组件
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Settings, Eye, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@shared/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/ui/dialog';
import { Input } from '@shared/ui';
import { Label } from '@shared/ui/label';
import { Textarea } from '@shared/ui';
import { Switch } from '@shared/ui/switch';
import { Badge } from '@shared/ui/badge';
import { Tooltip } from '@shared/ui';
import {
  SlashCommand,
  CommandConfig,
  CommandConfigProps,
  CommandContext,
} from '@shared/types';

/**
 * [配置字段类型定义]
 * =================
 * - 支持多种输入类型和验证规则
 * - 可扩展的字段配置系统
 */
export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'switch' | 'number' | 'slider' | 'multi-select';
  required?: boolean;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  options?: Array<{ value: string; label: string; description?: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => string | null;
  };
  conditional?: {
    field: string;
    value: unknown;
    operator?: 'eq' | 'neq' | 'in' | 'nin';
  };
}

/**
 * [对话框Props]
 * =============
 * - 扩展基础ConfigProps
 * - 添加对话框特有的控制属性
 */
interface CommandConfigDialogProps extends CommandConfigProps {
  command: SlashCommand;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  context?: CommandContext;
  
  // 自定义配置字段（如果命令没有专用配置组件）
  customFields?: ConfigField[];
  
  // 预览功能
  enablePreview?: boolean;
  onPreview?: (config: CommandConfig) => Promise<string | React.ReactNode>;
}

/**
 * [预设配置模板]
 * =============
 * - 常见命令类型的配置字段定义
 * - 减少重复配置，提高开发效率
 */
const getDefaultConfigFields = (command: SlashCommand): ConfigField[] => {
  const baseFields: ConfigField[] = [
    {
      key: 'displayName',
      label: '显示名称',
      type: 'text',
      required: true,
      placeholder: '为这个命令起个名字...',
      defaultValue: command.displayName,
      validation: {
        min: 1,
        max: 50,
      },
    },
  ];

  // 根据命令类别添加特定字段
  switch (command.category) {
    case 'ai':
      return [
        ...baseFields,
        {
          key: 'prompt',
          label: 'AI 提示词',
          type: 'textarea',
          required: true,
          placeholder: '描述你希望AI做什么...',
          description: '清晰的提示词可以获得更好的结果',
          validation: {
            min: 10,
            max: 2000,
          },
        },
        {
          key: 'model',
          label: '模型选择',
          type: 'select',
          options: [
            { value: 'gpt-4', label: 'GPT-4', description: '最强性能，适合复杂任务' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: '快速响应，适合日常对话' },
            { value: 'claude-3', label: 'Claude 3', description: '擅长分析和创作' },
          ],
          defaultValue: 'gpt-4',
        },
        {
          key: 'temperature',
          label: '创造性',
          type: 'slider',
          defaultValue: 0.7,
          validation: { min: 0, max: 2 },
          description: '较低值更保守，较高值更有创意',
        },
      ];

    case 'media':
      return [
        ...baseFields,
        {
          key: 'prompt',
          label: '图片描述',
          type: 'textarea',
          required: true,
          placeholder: '详细描述你想要的图片...',
          validation: { min: 5, max: 1000 },
        },
      ];

    case 'file':
      return [
        ...baseFields,
        {
          key: 'targetPath',
          label: '目标路径',
          type: 'text',
          placeholder: '/path/to/file',
          description: '文件操作的目标位置',
        },
        {
          key: 'includeHidden',
          label: '包含隐藏文件',
          type: 'switch',
          defaultValue: false,
        },
      ];

    case 'workflow':
      return [
        ...baseFields,
        {
          key: 'steps',
          label: '工作流步骤',
          type: 'textarea',
          placeholder: '1. 第一步\n2. 第二步\n3. 第三步',
          description: '每行一个步骤，按顺序执行',
        },
        {
          key: 'autoExecute',
          label: '自动执行',
          type: 'switch',
          defaultValue: false,
          description: '创建后立即执行工作流',
        },
      ];

    default:
      return baseFields;
  }
};

/**
 * [CommandConfigDialog Component]
 * ===============================
 * - 主配置对话框组件
 * - 支持动态字段渲染和实时验证
 * - 包含预览和快速配置功能
 */
export const CommandConfigDialog: React.FC<CommandConfigDialogProps> = ({
  command,
  isOpen,
  onOpenChange,
  initialConfig,
  onConfigChange,
  onConfirm,
  onCancel,
  isEditing = false,
  context,
  customFields,
  enablePreview = false,
  onPreview,
}) => {
  // ===== 状态管理 =====
  const [config, setConfig] = useState<CommandConfig>(() => ({
    commandId: command.id,
    displayName: command.displayName,
    isValid: false,
    errors: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...initialConfig,
  }));

  const [isValidating, setIsValidating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | React.ReactNode | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');

  // ===== 配置字段定义 =====
  const configFields = useMemo(() => {
    return customFields || getDefaultConfigFields(command);
  }, [command, customFields]);

  // ===== 验证逻辑 =====
  
  /**
   * [Function: validateField]
   * =========================
   * - Input: ConfigField, value
   * - Output: string | null (错误信息)
   * - Role in Flow: 字段值变化 → 验证 → 更新错误状态
   * - Logic:
   *   1. 检查必填字段
   *   2. 执行格式验证
   *   3. 运行自定义验证
   *   4. 返回错误信息或null
   */
  const validateField = useCallback((field: ConfigField, value: unknown): string | null => {
    // 必填验证
    if (field.required) {
      if (value === undefined || value === null || value === '') {
        return `${field.label}是必填项`;
      }
    }

    // 类型特定验证
    if (value && field.validation) {
      const { min, max, pattern, custom } = field.validation;

      if (typeof value === 'string') {
        if (min && value.length < min) return `${field.label}至少需要${min}个字符`;
        if (max && value.length > max) return `${field.label}不能超过${max}个字符`;
        if (pattern && !pattern.test(value)) return `${field.label}格式不正确`;
      }

      if (typeof value === 'number') {
        if (min && value < min) return `${field.label}不能小于${min}`;
        if (max && value > max) return `${field.label}不能大于${max}`;
      }

      // 自定义验证
      if (custom) {
        const customError = custom(value);
        if (customError) return customError;
      }
    }

    return null;
  }, []);

  /**
   * [Function: validateAllFields]
   * =============================
   * - Input: CommandConfig
   * - Output: { isValid: boolean, errors: Record<string, string> }
   * - Role in Flow: 配置提交前 → 全量验证 → 决定是否允许提交
   * - Logic:
   *   1. 遍历所有配置字段
   *   2. 检查条件显示逻辑
   *   3. 验证每个字段值
   *   4. 收集错误信息
   */
  const validateAllFields = useCallback((configToValidate: CommandConfig) => {
    const errors: Record<string, string> = {};

    configFields.forEach(field => {
      // 检查条件显示
      if (field.conditional) {
        const { field: condField, value: condValue, operator = 'eq' } = field.conditional;
        const actualValue = configToValidate.options?.[condField];
        
        let shouldShow = false;
        switch (operator) {
          case 'eq':
            shouldShow = actualValue === condValue;
            break;
          case 'neq':
            shouldShow = actualValue !== condValue;
            break;
          case 'in':
            shouldShow = Array.isArray(condValue) && condValue.includes(actualValue);
            break;
          case 'nin':
            shouldShow = Array.isArray(condValue) && !condValue.includes(actualValue);
            break;
        }
        
        if (!shouldShow) return; // 跳过隐藏字段
      }

      const value = field.key === 'displayName' 
        ? configToValidate.displayName 
        : field.key === 'prompt'
          ? configToValidate.prompt
          : configToValidate.options?.[field.key];

      const error = validateField(field, value);
      if (error) {
        errors[field.key] = error;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [configFields, validateField]);

  // ===== 事件处理 =====

  /**
   * [Function: handleFieldChange]
   * =============================
   * - Input: fieldKey, value
   * - Output: void
   * - Role in Flow: 用户输入 → 更新配置 → 触发验证
   * - Logic:
   *   1. 更新配置值
   *   2. 实时验证
   *   3. 更新状态
   *   4. 通知父组件
   */
  const handleFieldChange = useCallback((fieldKey: string, value: unknown) => {
    setConfig(prev => {
      const newConfig: CommandConfig = {
        ...prev,
        updatedAt: new Date().toISOString(),
      };

      // 更新字段值
      if (fieldKey === 'displayName') {
        newConfig.displayName = value as string;
      } else if (fieldKey === 'prompt') {
        newConfig.prompt = value as string;
      } else {
        newConfig.options = {
          ...prev.options,
          [fieldKey]: value,
        };
      }

      // 实时验证
      const validation = validateAllFields(newConfig);
      newConfig.isValid = validation.isValid;
      newConfig.errors = validation.errors;

      onConfigChange(newConfig);
      return newConfig;
    });
  }, [validateAllFields, onConfigChange]);

  /**
   * [Function: handlePreview]
   * =========================
   * - Input: void
   * - Output: Promise<void>
   * - Role in Flow: 预览按钮点击 → 调用预览接口 → 显示预览内容
   */
  const handlePreview = useCallback(async () => {
    if (!onPreview || !config.isValid) return;

    setIsPreviewing(true);
    try {
      const content = await onPreview(config);
      setPreviewContent(content);
      setActiveTab('preview');
    } catch (error) {
      console.error('Preview failed:', error);
      setPreviewContent('预览失败，请检查配置是否正确');
    } finally {
      setIsPreviewing(false);
    }
  }, [onPreview, config]);

  /**
   * [Function: handleSubmit]
   * ========================
   * - Input: void
   * - Output: void
   * - Role in Flow: 确认按钮点击 → 最终验证 → 提交配置
   */
  const handleSubmit = useCallback(() => {
    setIsValidating(true);
    
    // 最终验证
    const validation = validateAllFields(config);
    if (!validation.isValid) {
      setConfig(prev => ({
        ...prev,
        isValid: false,
        errors: validation.errors,
      }));
      setIsValidating(false);
      return;
    }

    // 确保配置有效
    const finalConfig: CommandConfig = {
      ...config,
      isValid: true,
      errors: {},
      updatedAt: new Date().toISOString(),
    };

    onConfirm(finalConfig);
    onOpenChange(false);
    setIsValidating(false);
  }, [config, validateAllFields, onConfirm, onOpenChange]);

  // ===== Effects =====
  
  useEffect(() => {
    if (isOpen && initialConfig) {
      setConfig({
        ...initialConfig,
        updatedAt: new Date().toISOString(),
      });
      setActiveTab('config');
      setPreviewContent(null);
    }
  }, [isOpen, initialConfig]);

  // ===== 渲染函数 =====

  /**
   * [Function: renderConfigField]
   * =============================
   * - 根据字段类型渲染对应的输入组件
   * - 包含标签、描述、验证错误显示
   */
  const renderConfigField = (field: ConfigField) => {
    // 检查条件显示
    if (field.conditional) {
      const { field: condField, value: condValue, operator = 'eq' } = field.conditional;
      const actualValue = config.options?.[condField];
      
      let shouldShow = false;
      switch (operator) {
        case 'eq': shouldShow = actualValue === condValue; break;
        case 'neq': shouldShow = actualValue !== condValue; break;
        case 'in': shouldShow = Array.isArray(condValue) && condValue.includes(actualValue); break;
        case 'nin': shouldShow = Array.isArray(condValue) && !condValue.includes(actualValue); break;
      }
      
      if (!shouldShow) return null;
    }

    const value = field.key === 'displayName' 
      ? config.displayName 
      : field.key === 'prompt'
        ? config.prompt
        : config.options?.[field.key] ?? field.defaultValue;

    const error = config.errors?.[field.key];
    const hasError = !!error;

    const commonProps = {
      value: value ?? '',
      onChange: (newValue: unknown) => handleFieldChange(field.key, newValue),
      className: cn(hasError && "border-destructive focus-visible:ring-destructive"),
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${field.key}-error` : undefined,
    };

    let inputElement: React.ReactNode;

    switch (field.type) {
      case 'text':
        inputElement = (
          <Input
            {...commonProps}
            placeholder={field.placeholder}
            onChange={(e) => commonProps.onChange(e.target.value)}
          />
        );
        break;

      case 'textarea':
        inputElement = (
          <Textarea
            {...commonProps}
            placeholder={field.placeholder}
            rows={4}
            onChange={(e) => commonProps.onChange(e.target.value)}
          />
        );
        break;

      case 'select':
        inputElement = (
          <select
            {...commonProps}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              commonProps.className
            )}
            onChange={(e) => commonProps.onChange(e.target.value)}
          >
            <option value="">请选择...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        break;

      case 'switch':
        inputElement = (
          <Switch
            checked={!!value}
            onCheckedChange={(checked) => commonProps.onChange(checked)}
            className={commonProps.className}
          />
        );
        break;

      case 'number':
        inputElement = (
          <Input
            {...commonProps}
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
            placeholder={field.placeholder}
            onChange={(e) => commonProps.onChange(parseFloat(e.target.value) || 0)}
          />
        );
        break;

      case 'slider':
        inputElement = (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={field.validation?.min ?? 0}
              max={field.validation?.max ?? 1}
              step={0.1}
              value={value as number || field.defaultValue as number || 0}
              onChange={(e) => commonProps.onChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-mono w-12 text-center">
              {typeof value === 'number' ? value.toFixed(1) : '0.0'}
            </span>
          </div>
        );
        break;

      default:
        inputElement = (
          <Input
            {...commonProps}
            placeholder={field.placeholder}
            onChange={(e) => commonProps.onChange(e.target.value)}
          />
        );
    }

    return (
      <div key={field.key} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.key} className={cn("text-sm font-medium", hasError && "text-destructive")}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.description && (
            <Tooltip content={field.description}>
              <AlertCircle size={14} className="text-muted-foreground cursor-help" />
            </Tooltip>
          )}
        </div>
        {inputElement}
        {hasError && (
          <p id={`${field.key}-error`} className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
        {field.description && !hasError && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center">
              {command.icon}
            </div>
            <div>
              <span>{isEditing ? '编辑' : '配置'} {command.displayName}</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {command.description}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* 标签页 */}
          {enablePreview && (
            <div className="flex space-x-1 border-b border-border mb-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-none border-b-2 border-transparent px-4 py-2",
                  activeTab === 'config' && "border-primary bg-muted/50"
                )}
                onClick={() => setActiveTab('config')}
              >
                <Settings size={16} className="mr-2" />
                配置
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-none border-b-2 border-transparent px-4 py-2",
                  activeTab === 'preview' && "border-primary bg-muted/50"
                )}
                onClick={() => setActiveTab('preview')}
                disabled={!config.isValid}
              >
                <Eye size={16} className="mr-2" />
                预览
              </Button>
            </div>
          )}

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'config' ? (
              <div className="space-y-6">
                {configFields.map(renderConfigField)}
              </div>
            ) : (
              <div className="p-4 border border-border rounded-lg bg-muted/20">
                {previewContent ? (
                  typeof previewContent === 'string' ? (
                    <div className="text-sm whitespace-pre-wrap">{previewContent}</div>
                  ) : (
                    previewContent
                  )
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Eye size={32} className="mx-auto mb-2 opacity-50" />
                    <p>点击预览按钮查看配置效果</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              {/* 配置状态指示 */}
              <div className="flex items-center gap-2">
                {config.isValid ? (
                  <Badge variant="success" className="text-xs">
                    <Check size={12} className="mr-1" />
                    配置完整
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle size={12} className="mr-1" />
                    {Object.keys(config.errors || {}).length} 个错误
                  </Badge>
                )}
              </div>

              {/* 预览按钮 */}
              {enablePreview && activeTab === 'config' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={!config.isValid || isPreviewing}
                >
                  {isPreviewing ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      预览中...
                    </>
                  ) : (
                    <>
                      <Eye size={14} className="mr-2" />
                      预览
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onCancel}>
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!config.isValid || isValidating}
              >
                {isValidating ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    验证中...
                  </>
                ) : (
                  <>
                    <Check size={14} className="mr-2" />
                    {isEditing ? '更新' : '确认'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
