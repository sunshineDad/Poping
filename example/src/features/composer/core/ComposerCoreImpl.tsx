import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown, Mic, Send, Loader2, Sparkles, Laptop, Square, Check, X, MicOff, Zap, Bot, Code2, Gauge, Rocket, FileText, Paperclip } from 'lucide-react';
import { DropdownSelector, DropdownOption } from '@shared/ui';
import { PermissionDialog } from '@shared/ui';
import { WaveformVisualizer } from '@shared/ui';
import { Button } from '@shared/ui';
import { UnifiedEditor, type UnifiedEditorRef } from '@features/unified-editor';
import { TagManager } from '@features/composer/file-upload';
import { type EditorContent } from '@shared/types';
import { Tooltip } from '@shared/ui';
import { StyleSelector } from '@shared/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@shared/ui';
import type { PermissionRequest, Command } from '@shared/types';
import type { CommandTag as CommandTagType, SlashMenuState, MenuPosition, SlashCommand, CommandConfig } from '@shared/types';
import { SLASH_COMMANDS } from '@shared/types';
import { useLocalStorage } from '@shared/hooks';
import { useAudioRecording } from '@shared/hooks';
import { api } from '@services';

// Style interface
interface Style {
  id: string;
  name: string;
  preview: string;
}

// Aspect ratio configurations with pixel values
interface AspectRatioConfig {
  ratio: string;
  label: string;
  width: number;
  height: number;
  description: string;
}

const ASPECT_RATIOS: AspectRatioConfig[] = [
  { ratio: '1:1', label: '正方形', width: 1024, height: 1024, description: '1024×1024' },
  { ratio: '4:3', label: '标准', width: 1024, height: 768, description: '1024×768' },
  { ratio: '3:4', label: '竖屏标准', width: 768, height: 1024, description: '768×1024' },
  { ratio: '16:9', label: '横屏', width: 1024, height: 576, description: '1024×576' },
  { ratio: '9:16', label: '竖屏', width: 576, height: 1024, description: '576×1024' },
  { ratio: '21:9', label: '超宽屏', width: 1344, height: 576, description: '1344×576' },
  { ratio: '3:2', label: '照片横', width: 1152, height: 768, description: '1152×768' },
  { ratio: '2:3', label: '照片竖', width: 768, height: 1152, description: '768×1152' },
];
import { cn } from "@/lib/utils";

export interface FileSystemEntry {
  name: string;
  type: 'file' | 'directory';
  depth: number;
}

interface AutocompleteState {
  isActive: boolean;
  triggerIndex: number;
  query: string;
  suggestions: FileSystemEntry[] | Command[];
  focusedIndex: number;
  type: 'file' | 'command';
}

export interface ComposerProps {
  // Core functionality
  value?: string;
  onChange?: (value: string) => void;
  onSubmit: (message: string, workingDirectory?: string, model?: string, permissionMode?: string) => void;
  
  // New structured editor
  useStructuredEditor?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;

  // Feature flags
  showDirectorySelector?: boolean;
  showModelSelector?: boolean;
  enableFileAutocomplete?: boolean;
  showPermissionUI?: boolean;
  showStopButton?: boolean;
  
  // Session selector
  sessionSelector?: React.ReactNode;

  // Directory selection
  workingDirectory?: string;
  onDirectoryChange?: (directory: string) => void;
  recentDirectories?: Record<string, { lastDate: string; shortname: string }>;
  getMostRecentWorkingDirectory?: () => string | null;

  // Model selection
  model?: string;
  onModelChange?: (model: string) => void;
  availableModels?: string[];

  // Permission handling
  permissionRequest?: PermissionRequest | null;
  onPermissionDecision?: (requestId: string, action: 'approve' | 'deny', denyReason?: string) => void;

  // Stop functionality
  onStop?: () => void;

  // File autocomplete
  fileSystemEntries?: FileSystemEntry[];
  onFetchFileSystem?: (directory: string) => Promise<FileSystemEntry[]>;

  // Command autocomplete
  availableCommands?: Command[];
  onFetchCommands?: (workingDirectory?: string) => Promise<Command[]>;

  // File upload
  onFileUpload?: (files: FileList, sessionId?: string) => Promise<string[]>;
  currentSessionId?: string;
  enableFileUpload?: boolean;
  
  // Editor variant
  useConversationEditor?: boolean;
  useUnifiedEditor?: boolean;
}

export interface ComposerRef {
  focusInput: () => void;
  getPendingFiles: () => { sourceImage?: File } | null;
  clearPendingFiles: () => void;
}

interface DirectoryDropdownProps {
  selectedDirectory: string;
  recentDirectories: Record<string, { lastDate: string; shortname: string }>;
  onDirectorySelect: (directory: string) => void;
}

function DirectoryDropdown({ 
  selectedDirectory, 
  recentDirectories, 
  onDirectorySelect 
}: DirectoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Convert recentDirectories to sorted array and create options
  const options: DropdownOption<string>[] = Object.entries(recentDirectories)
    .map(([path, data]) => ({
      value: path,
      label: data.shortname,
    }))
    .sort((a, b) => {
      const dateA = recentDirectories[a.value].lastDate;
      const dateB = recentDirectories[b.value].lastDate;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  // Get shortname for display
  const displayText = selectedDirectory === 'Select directory' 
    ? selectedDirectory
    : recentDirectories[selectedDirectory]?.shortname || selectedDirectory.split('/').pop() || selectedDirectory;

  return (
    <DropdownSelector
      options={options}
      value={selectedDirectory}
      onChange={(value) => {
        onDirectorySelect(value);
        setIsOpen(false);
      }}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placeholder="Enter a directory..."
      showFilterInput={true}
      filterPredicate={(option, searchText) => {
        // Allow filtering by path
        if (option.value.toLowerCase().includes(searchText.toLowerCase())) {
          return true;
        }
        // If the search text looks like a path and doesn't match any existing option,
        // the user can press Enter to add it as a new directory
        return false;
      }}
      renderTrigger={({ onClick }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:bg-muted/50 rounded-full"
          onClick={onClick}
          aria-label="View all code environments"
        >
          <span className="flex items-center gap-1.5">
            <Laptop size={14} />
            <span className="block max-w-[128px] overflow-hidden text-ellipsis whitespace-nowrap">{displayText}</span>
            <ChevronDown size={14} />
          </span>
        </Button>
      )}
    />
  );
}

interface ModelDropdownProps {
  selectedModel: string;
  availableModels: string[];
  onModelSelect: (model: string) => void;
}

function ModelDropdown({
  selectedModel,
  availableModels,
  onModelSelect
}: ModelDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get icon for model
  const getModelIcon = (model: string) => {
    switch (model) {
      case 'sonnet':
        return <Zap size={14} />;
      case 'opus':
        return <Bot size={14} />;
      case 'default':
        return <Bot size={14} />;
      default:
        return <Bot size={14} />;
    }
  };

  // Create options from available models
  const options: DropdownOption<string>[] = availableModels.map(model => ({
    value: model,
    label: model === 'default' ? 'Default' : model.charAt(0).toUpperCase() + model.slice(1),
  }));

  // Get display text for the selected model
  const displayText = selectedModel === 'default' ? 'Default' : selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1);

  return (
    <DropdownSelector
      options={options}
      value={selectedModel}
      onChange={(value) => {
        onModelSelect(value);
        setIsOpen(false);
      }}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      showFilterInput={false}
      renderOption={(option) => (
        <div className="flex items-center gap-2 w-full">
          {getModelIcon(option.value)}
          <span className="text-sm font-medium">{option.label}</span>
        </div>
      )}
      renderTrigger={({ onClick }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:bg-muted/50 rounded-full"
          onClick={onClick}
          aria-label="Select AI model"
        >
          <span className="flex items-center gap-1.5">
            {getModelIcon(selectedModel)}
            <span className="block max-w-[128px] overflow-hidden text-ellipsis whitespace-nowrap">{displayText}</span>
            <ChevronDown size={14} />
          </span>
        </Button>
      )}
    />
  );
}

interface AutocompleteDropdownProps {
  suggestions: FileSystemEntry[] | Command[];
  onSelect: (path: string) => void;
  onClose: () => void;
  isOpen: boolean;
  focusedIndex: number;
  type: 'file' | 'command';
  onFocusReturn?: () => void;
}

function AutocompleteDropdown({
  suggestions,
  onSelect,
  onClose,
  isOpen,
  focusedIndex,
  type,
  onFocusReturn,
}: AutocompleteDropdownProps) {
  if (!isOpen) return null;

  const options = suggestions.map((entry) => {
    if (type === 'command') {
      const command = entry as Command;
      return {
        value: command.name,
        label: command.name,
        description: command.description,
        disabled: false
      };
    } else {
      const fileEntry = entry as FileSystemEntry;
      return {
        value: fileEntry.name,
        label: fileEntry.name,
        disabled: false
      };
    }
  });

  return (
    <DropdownSelector
      options={options}
      value={undefined}
      onChange={onSelect}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      showFilterInput={false}
      maxVisibleItems={-1}
      initialFocusedIndex={focusedIndex}
      focusedIndexControlled={focusedIndex}
      visualFocusOnly={true}
      onFocusReturn={onFocusReturn}
      renderOption={type === 'command' ? (option) => (
        <div className="flex flex-col items-start gap-0.5 w-full">
          <span className="text-sm">{option.label}</span>
          {option.description && (
            <span className="text-xs text-muted-foreground/80">{option.description}</span>
          )}
        </div>
      ) : undefined}
      renderTrigger={() => (
        <div className="w-0 h-0 pointer-events-none opacity-0" />
      )}
    />
  );
}

interface ComposerCache {
  selectedPermissionMode: string;
  draft: string;
}

interface SelectedStyle {
  id: string;
  name: string;
}

export const Composer = forwardRef<ComposerRef, ComposerProps>(function Composer({
  value: controlledValue,
  onChange: onControlledChange,
  onSubmit,
  placeholder = "Type a message...",
  isLoading = false,
  disabled = false,
  showDirectorySelector = false,
  showModelSelector = false,
  enableFileAutocomplete = false,
  showPermissionUI = false,
  showStopButton = false,
  sessionSelector,
  workingDirectory = '',
  onDirectoryChange,
  recentDirectories = {},
  getMostRecentWorkingDirectory,
  model = 'default',
  onModelChange,
  availableModels = ['default', 'opus', 'sonnet'],
  permissionRequest,
  onPermissionDecision,
  onStop,
  fileSystemEntries = [],
  onFetchFileSystem,
  availableCommands = [],
  onFetchCommands,
  onFileUpload,
  currentSessionId,
  enableFileUpload = false,
  useConversationEditor = false,
  useStructuredEditor = false,
  useUnifiedEditor = false,
}: ComposerProps, ref: React.Ref<ComposerRef>) {
  // Load cached state
  const [cachedState, setCachedState] = useLocalStorage<ComposerCache>('cui-composer', {
    selectedPermissionMode: 'default',
    draft: '',
  });

  // Use controlled or uncontrolled value
  const [uncontrolledValue, setUncontrolledValue] = useState(cachedState.draft);
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const setValue = (newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue);
    }
    onControlledChange?.(newValue);
  };

  const [selectedDirectory, setSelectedDirectory] = useState(workingDirectory || 'Select directory');
  const [selectedModel, setSelectedModel] = useState(model);
  const [selectedPermissionMode, setSelectedPermissionMode] = useState<string>(() => {
    // Map AIGents API modes back to Composer modes
    const mapFromAIGentsMode = (apiMode?: string): string => {
      switch (apiMode) {
        case 'yolo': return 'bypassPermissions'
        case 'auto': return 'acceptEdits'
        case 'ask': return 'default'
        // Coerce any unknown/legacy values (e.g., 'disabled') to Ask
        default: return cachedState.selectedPermissionMode || 'default'
      }
    };
    const currentMode = localStorage.getItem('aigents_permission_mode');
    return mapFromAIGentsMode(currentMode || undefined);
  });
  const [isPermissionDropdownOpen, setIsPermissionDropdownOpen] = useState(false);
  const [localFileSystemEntries, setLocalFileSystemEntries] = useState<FileSystemEntry[]>(fileSystemEntries);
  const [localCommands, setLocalCommands] = useState<Command[]>(availableCommands);
  const [autocomplete, setAutocomplete] = useState<AutocompleteState>({
    isActive: false,
    triggerIndex: -1,
    query: '',
    suggestions: [],
    focusedIndex: -1,
    type: 'file',
  });
  const [selectedStyle, setSelectedStyle] = useState<SelectedStyle | null>(null);
  
  // Slash command menu state
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const [slashInsertPosition, setSlashInsertPosition] = useState(0);
  const [commandConfig, setCommandConfig] = useState<CommandConfig>({ prompt: '' });
  const [availableStyles, setAvailableStyles] = useState<Style[]>([]);
  const [loadingStyles, setLoadingStyles] = useState(false);
  
  // Store command tags by ID for retrieval during submission
  const commandTagsMapRef = useRef<Map<string, CommandTagType>>(new Map());
  
  const richTextRef = useRef<UnifiedEditorRef>(null);
  
  // Structured editor content
  const [structuredContent, setStructuredContent] = useState<EditorContent>(() => 
    TagManager.parseText(value)
  );
  const composerRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceImageInputRef = useRef<HTMLInputElement>(null);
  
  // File upload state
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  
  // Pending files to be uploaded on submit
  const [pendingSourceImageFile, setPendingSourceImageFile] = useState<File | null>(null);
  // Store the complete EditorContent for temp-session handling
  const [pendingEditorContent, setPendingEditorContent] = useState<any>(null);
  
  // Audio recording state
  const { 
    state: audioState, 
    startRecording, 
    stopRecording, 
    resetToIdle,
    error: audioError, 
    duration: recordingDuration,
    isSupported: isAudioSupported,
    audioData
  } = useAudioRecording();

  // Expose focusInput method via ref
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (richTextRef.current) {
        richTextRef.current.focus();
      }
    },
    getPendingFiles: () => {
      console.log('🔍 getPendingFiles called, pendingSourceImageFile:', pendingSourceImageFile?.name || 'null');
      if (pendingSourceImageFile) {
        return {
          sourceImage: pendingSourceImageFile
        };
      }
      return null;
    },
    clearPendingFiles: () => {
      console.log('🧹 clearPendingFiles called');
      setPendingSourceImageFile(null);
    }
  }), [pendingSourceImageFile]);

  // Update local state when props change
  useEffect(() => {
    if (workingDirectory) {
      setSelectedDirectory(workingDirectory);
    }
  }, [workingDirectory]);

  useEffect(() => {
    if (model) {
      setSelectedModel(model);
    }
  }, [model]);

  useEffect(() => {
    if (fileSystemEntries.length > 0) {
      setLocalFileSystemEntries(fileSystemEntries);
    }
  }, [fileSystemEntries]);

  useEffect(() => {
    if (availableCommands.length > 0) {
      setLocalCommands(availableCommands);
    }
  }, [availableCommands]);

  // Listen for style selection events from ToolResultRenderer
  useEffect(() => {
    const handleStyleSelect = (event: CustomEvent) => {
      const { styleId, styleName } = event.detail;
      setSelectedStyle({ id: styleId, name: styleName });
    };

    window.addEventListener('selectStyle', handleStyleSelect as EventListener);
    
    return () => {
      window.removeEventListener('selectStyle', handleStyleSelect as EventListener);
    };
  }, []);

  // Update cache when state changes
  useEffect(() => {
    try {
      // Don't cache draft if it contains resource tags to avoid localStorage quota issues
      const shouldCacheDraft = !value.includes('@image://') && !value.includes('@text://') && !value.includes('@doc://');
      
      setCachedState({
        selectedPermissionMode,
        draft: shouldCacheDraft ? value : '',
      });
    } catch (error) {
      console.warn('Failed to update composer cache:', error);
      // Fallback: only cache permission mode
      try {
        setCachedState({
          selectedPermissionMode,
          draft: '',
        });
      } catch (fallbackError) {
        console.error('Failed to cache even basic composer state:', fallbackError);
      }
    }
  }, [selectedPermissionMode, value]);

  // Auto-select most recent directory on mount (for Home usage)
  useEffect(() => {
    if (showDirectorySelector && (!workingDirectory || selectedDirectory === 'Select directory') && Object.keys(recentDirectories).length > 0 && getMostRecentWorkingDirectory) {
      const mostRecent = getMostRecentWorkingDirectory();
      if (mostRecent) {
        setSelectedDirectory(mostRecent);
        onDirectoryChange?.(mostRecent);
        
        // Fetch file system entries for the auto-selected directory
        if (enableFileAutocomplete && onFetchFileSystem) {
          onFetchFileSystem(mostRecent)
            .then(entries => setLocalFileSystemEntries(entries))
            .catch(error => console.error('Failed to fetch file system entries:', error));
        }
      }
    }
  }, [workingDirectory, selectedDirectory, recentDirectories, getMostRecentWorkingDirectory, showDirectorySelector, onDirectoryChange, enableFileAutocomplete, onFetchFileSystem]);

  // Fetch file system entries when composer is focused (for autocomplete)
  useEffect(() => {
    if (!enableFileAutocomplete || !onFetchFileSystem) return;
    
    // File system fetching on focus is handled by RichTextInput component
  }, [selectedDirectory, enableFileAutocomplete, onFetchFileSystem]);

  // Fetch commands when composer is focused (for autocomplete)
  useEffect(() => {
    if (!onFetchCommands) return;

    const fetchCommands = async () => {
      try {
        const commands = await onFetchCommands(selectedDirectory !== 'Select directory' ? selectedDirectory : undefined);
        setLocalCommands(commands);
      } catch (error) {
        console.error('Failed to fetch commands:', error);
      }
    };

    // Fetch commands immediately
    fetchCommands();

    // Command fetching on focus is handled by RichTextInput component
  }, [selectedDirectory, onFetchCommands]);

  const detectAutocomplete = (value: string, cursorPosition: number) => {
    // Find the last @ before cursor
    const beforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) return null;
    
    // Check if there's a space or newline between @ and cursor
    const afterAt = beforeCursor.substring(lastAtIndex + 1);
    if (afterAt.includes(' ') || afterAt.includes('\n')) return null;
    
    return {
      triggerIndex: lastAtIndex,
      query: afterAt,
      type: 'file' as const,
    };
  };

  const detectSlashCommandAutocomplete = (value: string, cursorPosition: number) => {
    // Find the last / before cursor
    const beforeCursor = value.substring(0, cursorPosition);
    const lastSlashIndex = beforeCursor.lastIndexOf('/');
    
    if (lastSlashIndex === -1) return null;
    
    // Check if the slash is at the beginning of the input or after whitespace/newline or after a command tag
    const beforeSlash = beforeCursor.substring(0, lastSlashIndex);
    
    // Allow slash at beginning, after whitespace/newline, or after a command tag (ending with ']')
    const validSlashPositions = beforeSlash.trim() === '' || 
                               beforeSlash.endsWith('\n') || 
                               beforeSlash.endsWith(' ') ||
                               beforeSlash.endsWith(']'); // After command tag
    
    if (!validSlashPositions) return null;
    
    // Check if there's a space or newline between / and cursor
    const afterSlash = beforeCursor.substring(lastSlashIndex + 1);
    if (afterSlash.includes(' ') || afterSlash.includes('\n')) return null;
    
    return {
      triggerIndex: lastSlashIndex,
      query: afterSlash,
      type: 'command' as const,
    };
  };

  const filterSuggestions = (query: string): FileSystemEntry[] => {
    if (!localFileSystemEntries) return []; // Return empty array if entries not loaded
    if (!query) return localFileSystemEntries.slice(0, 50); // Show first 50 entries when no query
    
    const lowerQuery = query.toLowerCase();
    return localFileSystemEntries
      .filter(entry => entry.name.toLowerCase().includes(lowerQuery))
      .slice(0, 50); // Limit to 50 results
  };

  const filterCommandSuggestions = (query: string): Command[] => {
    if (!localCommands) return []; // Return empty array if commands not loaded
    if (!query) return localCommands.slice(0, 50); // Show first 50 commands when no query
    
    const lowerQuery = query.toLowerCase();
    return localCommands
      .filter(command => command.name.toLowerCase().includes(lowerQuery))
      .slice(0, 50); // Limit to 50 results
  };

  const resetAutocomplete = () => {
    setAutocomplete({
      isActive: false,
      triggerIndex: -1,
      query: '',
      suggestions: [],
      focusedIndex: -1,
      type: 'file',
    });
  };

  const getPermissionModeLabel = (mode: string): string => {
    switch (mode) {
      case 'default': return 'Ask';
      case 'acceptEdits': return 'Auto';
      case 'bypassPermissions': return 'Yolo';
      default: return 'Ask';
    }
  };

  const getPermissionModeTitle = (mode: string): string => {
    switch (mode) {
      case 'default': return 'Ask - Ask for permissions as needed';
      case 'acceptEdits': return 'Auto - Allow Claude to make changes directly';
      case 'bypassPermissions': return 'Yolo - Skip all permission prompts';
      default: return 'Ask - Ask for permissions as needed';
    }
  };

  const getPermissionModeIcon = (mode: string) => {
    switch (mode) {
      case 'default':
        return <Code2 size={14} />;
      case 'acceptEdits':
        return <Gauge size={14} />;
      case 'bypassPermissions':
        return <Rocket size={14} />;
      default:
        return <Code2 size={14} />;
    }
  };

  const handleAutocompleteSelection = (selection: string) => {
    if (!richTextRef.current) return;
    
    const cursorPos = richTextRef.current.selectionStart;
    
    if (autocomplete.type === 'command') {
      // For commands, replace the entire trigger sequence (including the /) with the selected command
      const newText = value.substring(0, autocomplete.triggerIndex) + selection + ' ' + value.substring(cursorPos);
      setValue(newText);
      
      // Reset autocomplete state immediately
      resetAutocomplete();
      
      // Set cursor position after the inserted selection and adjust height
      setTimeout(() => {
        if (richTextRef.current) {
          const newCursorPos = autocomplete.triggerIndex + selection.length + 1;
          richTextRef.current.setSelectionRange(newCursorPos, newCursorPos);
          richTextRef.current.focus();
          // Height adjustment handled by RichTextInput
        }
      }, 0);
    } else {
      // For files, keep the existing behavior (append after the @ symbol)
      const newText = value.substring(0, autocomplete.triggerIndex + 1) + selection + ' ' + value.substring(cursorPos);
      setValue(newText);
      
      // Reset autocomplete state immediately
      resetAutocomplete();
      
      // Set cursor position after the inserted selection and adjust height
      setTimeout(() => {
        if (richTextRef.current) {
          const newCursorPos = autocomplete.triggerIndex + 1 + selection.length + 1;
          richTextRef.current.setSelectionRange(newCursorPos, newCursorPos);
          richTextRef.current.focus();
          // Height adjustment handled by RichTextInput
        }
      }, 0);
    }
  };

  const handleTextChange = (newValue: string) => {
    setValue(newValue);
    
    // Use setTimeout to ensure cursor position is updated
    setTimeout(() => {
      // Detect autocomplete triggers
      const cursorPos = richTextRef.current?.getPlainTextCursorPosition?.() || newValue.length;
        
      // Check for slash command autocomplete first (higher priority)
      // Skip this if using UnifiedEditor (it has its own slash command system)
      const commandAutocompleteInfo = !useUnifiedEditor ? detectSlashCommandAutocomplete(newValue, cursorPos) : null;
      
      if (commandAutocompleteInfo) {
        // Save the insertion position for later use
        setSlashInsertPosition(commandAutocompleteInfo.triggerIndex);
        // Show shadcn dropdown menu
        const position = calculateSlashMenuPosition(cursorPos);
        setSlashMenuPosition(position);
        setSlashQuery(commandAutocompleteInfo.query);
        
        // Initialize config with defaults
        setCommandConfig({
          prompt: '',
          aspect_ratio: '1:1' as const,
          width: 1024,
          height: 1024,
          strength: 0.7
        });
        
        setSlashMenuOpen(true);
        
        // Load styles when slash menu opens
        loadImageStyles();
        
        // Don't show the normal autocomplete for commands
        resetAutocomplete();
        return;
      } else {
        // Hide slash menu if no slash detected
        setSlashMenuOpen(false);
        setSlashQuery('');
        setCommandConfig({ prompt: '' });
      }
      
      // Check for file autocomplete if enabled
      if (enableFileAutocomplete) {
        const fileAutocompleteInfo = detectAutocomplete(newValue, cursorPos);
        if (fileAutocompleteInfo) {
          const suggestions = filterSuggestions(fileAutocompleteInfo.query);
          
          setAutocomplete(prev => ({
            isActive: true,
            triggerIndex: fileAutocompleteInfo.triggerIndex,
          query: fileAutocompleteInfo.query,
          suggestions,
          type: fileAutocompleteInfo.type,
          // Keep focusedIndex if it's still valid, otherwise reset to -1 (no selection)
          focusedIndex: prev.focusedIndex >= 0 && prev.focusedIndex < suggestions.length ? prev.focusedIndex : -1,
        }));
        return;
      }
    }
    
    // No autocomplete triggers found
    resetAutocomplete();
    }, 0);
  };

  // Get actual cursor position in pixels
  const getCursorPixelPosition = (): { x: number; y: number } | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // If rect has no dimensions, try to get position from the container
    if (rect.width === 0 && rect.height === 0) {
      const container = range.startContainer;
      if (container.nodeType === Node.TEXT_NODE && container.parentElement) {
        const parentRect = container.parentElement.getBoundingClientRect();
        return { x: parentRect.left, y: parentRect.top };
      }
    }
    
    return { x: rect.left, y: rect.top };
  };

  // Calculate slash menu position - based on actual cursor position
  const calculateSlashMenuPosition = (cursorPos: number): { x: number; y: number } => {
    // Try to get the real cursor position
    const cursorPixelPos = getCursorPixelPosition();
    
    if (cursorPixelPos) {
      console.log('Using actual cursor position:', cursorPixelPos);
      return {
        x: cursorPixelPos.x + 8, // Small offset to the right
        y: cursorPixelPos.y + 24, // Below the cursor line
      };
    }
    
    // Fallback to textarea-based calculation
    if (!richTextRef.current) {
      console.log('No richTextRef available, using fallback');
      return { x: 200, y: 200 };
    }
    
    const element = richTextRef.current as any;
    let textarea = element.textareaRef?.current || element;
    
    if (!textarea || !textarea.getBoundingClientRect) {
      const composerForm = document.querySelector('[data-composer-form]');
      textarea = composerForm?.querySelector('textarea') || 
                composerForm?.querySelector('[contenteditable]') || 
                document.querySelector('textarea') ||
                document.querySelector('[contenteditable="true"]');
      
      if (!textarea) {
        console.log('No input element found, using default fallback');
        return { x: 300, y: 300 };
      }
    }
    
    const rect = textarea.getBoundingClientRect();
    console.log('Using textarea fallback position calculation');
    
    return {
      x: rect.left + 20,
      y: rect.top + 30,
    };
  };

  // Handle command tag insertion
  const handleInsertCommandTag = (tag: CommandTagType) => {
    if (!richTextRef.current) return;
    
    // Store command tag in map for later retrieval
    commandTagsMapRef.current.set(tag.id, tag);
    
    if (useUnifiedEditor && richTextRef.current && 'insertCommandTag' in richTextRef.current) {
      // UnifiedEditor: 需要先删除斜杠和查询文本，然后插入命令标签
      const slashEndPos = slashInsertPosition + 1 + slashQuery.length;
      const textBeforeSlash = value.substring(0, slashInsertPosition);
      const textAfterSlash = value.substring(slashEndPos);
      const newValue = textBeforeSlash + textAfterSlash;
      setValue(newValue);
      
      // 然后插入命令标签
      setTimeout(() => {
        if (richTextRef.current && 'insertCommandTag' in richTextRef.current) {
          richTextRef.current.insertCommandTag({
            commandType: tag.command,
            id: tag.id,
            display: tag.display,
            config: tag.config
          });
        }
      }, 0);
    } else {
      // 其他编辑器: 使用文本占位符方法
      const slashEndPos = slashInsertPosition + 1 + slashQuery.length;
      const textBeforeSlash = value.substring(0, slashInsertPosition);
      const textAfterSlash = value.substring(slashEndPos);
      
      // Insert the command tag placeholder at slash position
      const placeholder = `[cmd:${tag.id}]`;
      const newValue = textBeforeSlash + placeholder + textAfterSlash;
      setValue(newValue);
      
      // Set cursor after the inserted tag
      setTimeout(() => {
        if (richTextRef.current) {
          const newCursorPos = slashInsertPosition + placeholder.length;
          richTextRef.current.setSelectionRange(newCursorPos, newCursorPos);
          richTextRef.current.focus();
        }
      }, 0);
    }
    
    // Close slash menu
    setSlashMenuOpen(false);
    setSlashQuery('');
  };


  // Load image styles
  const loadImageStyles = async () => {
    if (loadingStyles || availableStyles.length > 0) return; // Don't reload if already loaded
    
    setLoadingStyles(true);
    try {
      const result = await api.getImageStyles();
      if (result.success) {
        setAvailableStyles(result.data);
      }
    } catch (error) {
      console.error('Failed to load image styles:', error);
    } finally {
      setLoadingStyles(false);
    }
  };

  // Convert command tags to text for submission
  const generateCommandText = (tag: CommandTagType): string => {
    const config = tag.config;
    let text = '';
    
    if (tag.command === 'text_to_image') {
      text = `请使用文生图功能生成图片：${config.prompt}`;
      if (config.width && config.height) {
        text += `，尺寸：${config.width}×${config.height}`;
      }
      if (config.style_id) {
        // 找到风格名称
        const styleName = availableStyles.find(s => s.id === config.style_id)?.name;
        text += `，使用风格：${styleName || config.style_id}，finetune_id：${config.style_id}`;
      }
    } else if (tag.command === 'image_to_image') {
      text = `请使用图生图功能：${config.prompt}`;
      if (config.source_image) text += `，参考图片ID：${config.source_image}`;
      if (config.width && config.height) {
        text += `，尺寸：${config.width}×${config.height}`;
      }
      if (config.style_id) {
        // 找到风格名称
        const styleName = availableStyles.find(s => s.id === config.style_id)?.name;
        text += `，使用风格：${styleName || config.style_id}，finetune_id：${config.style_id}`;
      }
    }
    
    // Ensure a clear terminator so renderer can split correctly
    if (!/[。.!?]$/.test(text)) {
      text += '。';
    }
    return text;
  };

  const handleSubmit = async (permissionMode: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue || isLoading) return;

    // For Home usage with directory/model
    if (showDirectorySelector && selectedDirectory === 'Select directory') return;

    let finalMessage: string;

    if ((useStructuredEditor || useUnifiedEditor) && richTextRef.current && 'exportForSubmission' in richTextRef.current) {
      // 新的结构化编辑器系统和统一编辑器
      try {
        // 总是调用exportForSubmission来提取结构化内容
        // 如果没有sessionId，先创建带权限模式的会话用于文件上传
        let sessionIdForExport = currentSessionId && currentSessionId !== 'undefined' ? currentSessionId : undefined;
        if (!sessionIdForExport) {
          const mapToAIGentsMode = (composerMode?: string): 'yolo' | 'auto' | 'ask' => {
            switch (composerMode) {
              case 'bypassPermissions': return 'yolo'
              case 'acceptEdits': return 'auto'
              case 'default': return 'ask'
              default: return 'auto'
            }
          };
          const client = await api.getOrCreateAIGentsClient(undefined, mapToAIGentsMode(permissionMode));
          sessionIdForExport = client.getSessionId() || 'temp-session';
        }
        finalMessage = await richTextRef.current.exportForSubmission!(sessionIdForExport);
        
        console.log('🔍 Composer exportForSubmission result:', finalMessage);
        
        // 添加选中的风格信息
        if (selectedStyle) {
          finalMessage += `\n\n使用风格: ${selectedStyle.name} (ID: ${selectedStyle.id})`;
        }
      } catch (error) {
        console.error('Structured/Unified editor export failed:', error);
        // 显示错误给用户
        return;
      }
    } else {
      // 原有的正则表达式系统（向后兼容）
      
      // First, upload any pending files and update command tags
      if (pendingSourceImageFile && currentSessionId) {
        console.log('✅ Uploading pending source image file before submit...');
        try {
          const result = await api.uploadFileToSession(currentSessionId, pendingSourceImageFile, ['source_image']);
          console.log('Pending source image uploaded successfully:', result);
          
          // Update command tags that have pending source images
          commandTagsMapRef.current.forEach((tag, tagId) => {
            if (tag.config.source_image && tag.config.source_image.startsWith('pending:')) {
              const updatedTag = {
                ...tag,
                config: {
                  ...tag.config,
                  source_image: result.resourceId
                }
              };
              commandTagsMapRef.current.set(tagId, updatedTag);
              console.log(`Updated command tag ${tagId} with uploaded resource ID:`, result.resourceId);
            }
          });
          
          // Clear pending file
          setPendingSourceImageFile(null);
        } catch (error) {
          console.error('Failed to upload pending source image:', error);
          // Show error to user or handle gracefully
          return; // Don't submit if file upload fails
        }
      }

      // Parse and convert command tags from text
      finalMessage = trimmedValue;
      
      // Find all [cmd:id] patterns and replace with readable text
      finalMessage = finalMessage.replace(/\[cmd:([^\]]+)\]/g, (match, tagId) => {
        const tag = commandTagsMapRef.current.get(tagId);
        if (tag) {
          return generateCommandText(tag);
        }
        return match; // Keep original if tag not found
      });
      
      // Add selected style info if style is selected
      if (selectedStyle) {
        finalMessage += `\n\n使用风格: ${selectedStyle.name} (ID: ${selectedStyle.id})`;
      }
    }

    onSubmit(
      finalMessage,
      showDirectorySelector ? selectedDirectory : undefined,
      showModelSelector ? selectedModel : undefined,
      permissionMode
    );
    
    // Clear input content after submit
    setValue('');
    if (useStructuredEditor || useUnifiedEditor) {
      setStructuredContent(TagManager.parseText(''));
      // Clear the editor content explicitly
      if (richTextRef.current && 'clear' in (richTextRef.current as any)) {
        (richTextRef.current as any).clear();
      }
    }
    setSelectedStyle(null); // Clear selected style after submit
    commandTagsMapRef.current.clear(); // Clear command tags map after submit
    // Note: Don't clear pending files here - parent will call clearPendingFiles() after collecting them
    resetAutocomplete();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (autocomplete.isActive) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (autocomplete.suggestions.length > 0) {
            setAutocomplete(prev => ({
              ...prev,
              focusedIndex: prev.focusedIndex < 0 ? 0 : (prev.focusedIndex + 1) % prev.suggestions.length
            }));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (autocomplete.suggestions.length > 0) {
            setAutocomplete(prev => ({
              ...prev,
              focusedIndex: prev.focusedIndex < 0
                ? prev.suggestions.length - 1
                : prev.focusedIndex === 0
                  ? prev.suggestions.length - 1
                  : prev.focusedIndex - 1
            }));
          }
          break;
        case 'Enter':
        case 'Tab':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            if (autocomplete.suggestions.length > 0) {
              // Select the currently focused suggestion, or first if none
              const targetIndex = autocomplete.focusedIndex >= 0 ? autocomplete.focusedIndex : 0;
              const suggestion = autocomplete.suggestions[targetIndex];
              const suggestionName = autocomplete.type === 'command' 
                ? (suggestion as Command).name 
                : (suggestion as FileSystemEntry).name;
              handleAutocompleteSelection(suggestionName);
            }
          }
          break;
        case ' ':
          // Don't prevent default for space - let it insert the character
          resetAutocomplete();
          break;
        case 'Escape':
          e.preventDefault();
          resetAutocomplete();
          // Ensure focus returns to textarea
          setTimeout(() => richTextRef.current?.focus(), 0);
          break;
      }
    } else if (e.key === 'Enter') {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        handleSubmit(selectedPermissionMode);
      }
    }
  };

  // Height adjustment is handled by RichTextInput component internally

  const handleDirectorySelect = (directory: string) => {
    setSelectedDirectory(directory);
    onDirectoryChange?.(directory);
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    onModelChange?.(model);
  };

  // Audio recording handlers
  const handleMicClick = async () => {
    if (audioState === 'idle') {
      await startRecording();
    }
  };

  const handleAcceptRecording = async () => {
    if (audioState === 'recording') {
      const result = await stopRecording();
      if (result) {
        try {
          const transcription = await api.transcribeAudio(result.audioBase64, result.mimeType);
          
          // Insert transcribed text at cursor position
          if (richTextRef.current && transcription.text.trim()) {
            const textarea = richTextRef.current;
            const cursorPos = textarea.selectionStart;
            const textBefore = value.substring(0, cursorPos);
            const textAfter = value.substring(cursorPos);
            const transcribedText = transcription.text.trim();
            
            // Add space before if needed
            const needsSpaceBefore = textBefore.length > 0 && !textBefore.endsWith(' ') && !textBefore.endsWith('\n');
            const finalText = (needsSpaceBefore ? ' ' : '') + transcribedText;
            
            const newText = textBefore + finalText + textAfter;
            setValue(newText);
            
            // Set cursor position after inserted text
            setTimeout(() => {
              if (richTextRef.current) {
                const newCursorPos = cursorPos + finalText.length;
                richTextRef.current.setSelectionRange(newCursorPos, newCursorPos);
                richTextRef.current.focus();
                // Height adjustment handled by RichTextInput
              }
            }, 0);
          } else if (!transcription.text.trim()) {
            console.warn('No speech detected in audio');
            // Could show a toast message here
          }
        } catch (error) {
          console.error('Transcription failed:', error);
          // Could show an error toast here
        } finally {
          // Always reset to idle after transcription attempt
          resetToIdle();
        }
      } else {
        // If no result, also reset to idle
        resetToIdle();
      }
    }
  };

  const handleRejectRecording = async () => {
    if (audioState === 'recording' || audioState === 'processing') {
      await stopRecording();
      // Just stop and discard, no transcription
      resetToIdle();
    }
  };

  // File upload handlers
  const handleFileButtonClick = () => {
    console.log('File button clicked');
    fileInputRef.current?.click();
  };

  // Source image selection handler for image-to-image commands (store file, upload on submit)
  const handleSourceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('handleSourceImageUpload called, files:', files?.length);
    
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }
    
    const file = files[0];
    console.log('Selected source image file:', file.name, 'size:', file.size, 'type:', file.type);
    
    // Store the file for later upload on submit
    setPendingSourceImageFile(file);
    console.log('✅ Stored pending source image file:', file.name);
    
    // Set a temporary placeholder in config to show selection
    setCommandConfig(prev => ({
      ...prev,
      source_image: `pending:${file.name}`
    }));
    
    // Clear the input value so the same file can be selected again if needed
    event.target.value = '';
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange called');
    const files = event.target.files;
    console.log('Files selected:', files?.length);
    console.log('onFileUpload exists:', !!onFileUpload);
    console.log('currentSessionId:', currentSessionId);
    console.log('selectedSessionId from parent:', currentSessionId);
    console.log('richTextRef.current exists:', !!richTextRef.current);

    if (!files || files.length === 0 || !richTextRef.current) {
      console.log('Early return from handleFileChange');
      return;
    }

    try {
      setUploadingFiles(Array.from(files).map(f => f.name));
      console.log('Starting file upload for:', Array.from(files).map(f => f.name));

      if (onFileUpload) {
        // Pass undefined sessionId, let handleFileUpload create one if needed
        const resourceTags = await onFileUpload(files, currentSessionId);
        console.log('Got resource tags:', resourceTags);

        // Insert each resource tag string into the editor
        if (resourceTags && resourceTags.length > 0) {
          resourceTags.forEach(tag => {
            console.log('Inserting resource tag:', tag, 'with currentSessionId:', currentSessionId);
            if ('insertResourceTag' in (richTextRef.current as any)) {
              (richTextRef.current as any).insertResourceTag(tag);
            }
          });
          console.log('Upload successful, currentSessionId should be available for preview');
        } else {
          console.log('No resource tags returned from upload');
        }
      } else {
        // No upload handler: insert as pending File so TagManager uploads on submit
        Array.from(files).forEach(file => {
          console.log('Inserting pending file as resource tag:', file.name);
          if ('insertResourceTag' in (richTextRef.current as any)) {
            (richTextRef.current as any).insertResourceTag(file);
          }
        });
      }
    } catch (error) {
      console.error('File upload failed:', error);
      // Could show error toast here
    } finally {
      setUploadingFiles([]);
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form 
      ref={composerRef}
      className="w-full relative" 
      data-composer-form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(selectedPermissionMode);
      }}
    >
      <div 
        className="flex flex-col items-center justify-center w-full bg-transparent border border-border rounded-3xl shadow-sm cursor-text transition-all duration-300"
        onClick={(e) => {
          // Only focus if clicking on the container itself, not on buttons or other interactive elements
          const target = e.target as HTMLElement;
          if (e.target === e.currentTarget || (!target.closest('button') && !target.closest('[role="button"]') && !target.closest('[data-resource-tag="true"]'))) {
            richTextRef.current?.focus();
          }
        }}
      >
        <div className="relative flex items-end w-full min-h-[120px]">
          <div className="relative flex flex-1 items-start ml-3 mr-5 min-h-[120px]">
            {audioState === 'recording' || audioState === 'processing' ? (
              <div className="w-full min-h-[120px] pb-[34px] bg-transparent overflow-hidden flex items-center justify-start">
                <WaveformVisualizer
                  audioData={audioData}
                  isRecording={audioState === 'recording'}
                  isPaused={audioState === 'processing'}
                />
              </div>
            ) : useUnifiedEditor ? (
              <UnifiedEditor
                ref={richTextRef as React.RefObject<UnifiedEditorRef>}
                mode={useStructuredEditor ? 'structured' : useConversationEditor ? 'conversation' : 'simple'}
                value={value}
                onChange={handleTextChange}
                onStructuredChange={useStructuredEditor ? (content: EditorContent) => {
                  setStructuredContent(content);
                  const plainText = TagManager.serializeToText(content);
                  handleTextChange(plainText);
                } : undefined}
                onKeyDown={handleKeyDown}
                placeholder={permissionRequest && showPermissionUI ? "Deny and tell Claude what to do" : placeholder}
                disabled={(isLoading || disabled) && !(permissionRequest && showPermissionUI)}
                currentSessionId={currentSessionId}
                enableSlashCommands={true}
                enableFileUpload={enableFileUpload}
                getCommandTagInfo={(tagId: string) => commandTagsMapRef.current.get(tagId)}
              />
            ) : (
              <UnifiedEditor
                ref={richTextRef as React.RefObject<UnifiedEditorRef>}
                mode={useStructuredEditor ? 'structured' : (useConversationEditor ? 'conversation' : 'simple')}
                value={value}
                onChange={handleTextChange}
                onStructuredChange={(content: EditorContent) => {
                  setStructuredContent(content);
                  const plainText = TagManager.serializeToText(content);
                  handleTextChange(plainText);
                }}
                onKeyDown={handleKeyDown}
                placeholder={permissionRequest && showPermissionUI ? "Deny and tell Claude what to do" : placeholder}
                disabled={(isLoading || disabled) && !(permissionRequest && showPermissionUI)}
                currentSessionId={currentSessionId}
                enableSlashCommands={true}
                enableFileUpload={enableFileUpload}
                getCommandTagInfo={(tagId: string) => commandTagsMapRef.current.get(tagId)}
              />
            )}
            
            {/* Hidden textarea during processing for text insertion */}
            {audioState === 'processing' && (
              <textarea
                className="absolute opacity-0 pointer-events-none -top-[9999px]"
                value={value}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={1}
                disabled
              />
            )}
            
          </div>

          {((showDirectorySelector || showModelSelector) || sessionSelector || selectedStyle) && audioState === 'idle' && (
            <div className="absolute bottom-2 left-3 right-10 flex items-center justify-center overflow-visible">
              <div className="flex gap-2 w-full justify-between">
                <div className="flex gap-2">
                  {/* Session Selector */}
                  {sessionSelector && (
                    <div>{sessionSelector}</div>
                  )}
                  
                  {/* Selected Style Tag - next to Conversation */}
                  {selectedStyle && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                      <Sparkles size={12} />
                      <span className="max-w-[120px] truncate">{selectedStyle.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="w-4 h-4 p-0 hover:bg-primary/20 rounded-full"
                        onClick={() => setSelectedStyle(null)}
                        aria-label="Remove selected style"
                      >
                        <X size={10} />
                      </Button>
                    </div>
                  )}
                  
                  
                  {/* Working Directory Selector */}
                  {showDirectorySelector && (
                    <DirectoryDropdown
                      selectedDirectory={selectedDirectory}
                      recentDirectories={recentDirectories}
                      onDirectorySelect={handleDirectorySelect}
                    />
                  )}

                  {/* Model Selector */}
                  {showModelSelector && (
                    <ModelDropdown
                      selectedModel={selectedModel}
                      availableModels={availableModels}
                      onModelSelect={handleModelSelect}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Action Button */}
          <div className="absolute right-2.5 bottom-2 flex items-center justify-center gap-2">
            {audioState === 'recording' || audioState === 'processing' ? (
              /* Recording/Processing State: Show tick and cross */
              <div className="flex items-center gap-2">
                <Tooltip content={audioState === 'processing' ? 'Processing...' : 'Accept recording'}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="w-8 h-8 hover:scale-[1.03]"
                    onClick={handleAcceptRecording}
                    disabled={audioState === 'processing'}
                  >
                    {audioState === 'processing' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                  </Button>
                </Tooltip>
                <Tooltip content="Discard recording">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="w-8 h-8 hover:scale-[1.03]"
                    onClick={handleRejectRecording}
                    disabled={audioState === 'processing'}
                  >
                    <X size={16} />
                  </Button>
                </Tooltip>
              </div>
            ) : (
              /* Idle State: Show mic and file upload buttons */
              <div className="flex items-center gap-2">
                {/* File Upload Button */}
                {enableFileUpload && (
                  <Tooltip content={
                    uploadingFiles.length > 0 
                      ? `Uploading ${uploadingFiles.length} file(s)...` 
                      : 'Attach files'
                  }>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:bg-muted/50 rounded-full"
                      onClick={(e) => {
                        console.log('Button clicked!', e);
                        handleFileButtonClick();
                      }}
                      disabled={disabled || uploadingFiles.length > 0}
                    >
                      {uploadingFiles.length > 0 ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Paperclip size={16} />
                      )}
                    </Button>
                  </Tooltip>
                )}

                {/* Mic Button */}
                {isAudioSupported && (
                  <Tooltip content={audioError ? `Error: ${audioError}` : 'Start voice recording'}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-2 text-muted-foreground hover:bg-muted/50 rounded-full",
                        audioError && "bg-red-300 text-red-900 hover:bg-red-400 hover:text-red-950"
                      )}
                      onClick={handleMicClick}
                      disabled={disabled}
                    >
                      {audioError ? <MicOff size={16} /> : <Mic size={16} />}
                    </Button>
                  </Tooltip>
                )}
              </div>
            )}
            
            {permissionRequest && showPermissionUI ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="h-8 min-w-[60px] px-3 py-0.5 bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-none rounded-full flex items-center gap-1.5"
                  onClick={() => onPermissionDecision?.(permissionRequest.id, 'approve')}
                >
                  <Check size={14} />
                  <span>Accept</span>
                </Button>
                <Button
                  type="button"
                  className="h-8 min-w-[60px] px-3 py-0.5 bg-muted text-muted-foreground hover:bg-muted/80 border-0 shadow-none rounded-full flex items-center gap-1.5"
                  onClick={() => {
                    const denyReason = value.trim();
                    onPermissionDecision?.(permissionRequest.id, 'deny', denyReason || undefined);
                    setValue('');
                  }}
                >
                  <X size={14} />
                  <span>Deny</span>
                </Button>
              </div>
            ) : isLoading && showStopButton ? (
              <Tooltip content="Stop generation">
                <Button
                  type="button"
                  size="icon"
                  className="w-8 h-8 hover:scale-[1.03] rounded-full bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => onStop?.()}
                >
                  <Square size={16} className="fill-current" />
                </Button>
              </Tooltip>
            ) : audioState === 'idle' && (
              <div className="flex items-center gap-2">
                {/* Combined Permission Mode Button with Dropdown */}
                <div className={`flex items-center rounded-full overflow-hidden ${
                  (!value.trim() || isLoading || disabled || (showDirectorySelector && selectedDirectory === 'Select directory'))
                    ? 'bg-foreground/5 text-foreground/50'
                    : 'bg-foreground text-background'
                }`}>
                  <Tooltip content={getPermissionModeTitle(selectedPermissionMode)}>
                    <Button
                      type="button"
                      className="h-8 min-w-[42px] w-[42px] pl-2 pr-0 py-0.5 bg-transparent text-inherit hover:bg-white/10 border-0 shadow-none text-center"
                      disabled={!value.trim() || isLoading || disabled || (showDirectorySelector && selectedDirectory === 'Select directory')}
                      onClick={() => handleSubmit(selectedPermissionMode)}
                    >
                      {getPermissionModeLabel(selectedPermissionMode)}
                    </Button>
                  </Tooltip>
                  <DropdownSelector
                    options={[
                      { value: 'default', label: 'Ask', description: 'Ask before making changes' },
                      { value: 'acceptEdits', label: 'Auto', description: 'Apply edits automatically' },
                      { value: 'bypassPermissions', label: 'Yolo', description: 'No permission prompts' },
                    ]}
                    value={selectedPermissionMode}
                    onChange={(value) => {
                      setSelectedPermissionMode(value);
                      // Map Composer permission modes to AIGents API modes and save to localStorage
                      const mapToAIGentsMode = (composerMode: string): 'yolo' | 'auto' | 'ask' => {
                        switch (composerMode) {
                          case 'bypassPermissions': return 'yolo'
                          case 'acceptEdits': return 'auto'
                          case 'default': return 'ask'
                          default: return 'auto'
                        }
                      };
                      localStorage.setItem('aigents_permission_mode', mapToAIGentsMode(value));
                      // If we have an active session, also update server-side mode immediately
                      try {
                        if (currentSessionId && currentSessionId !== 'undefined') {
                          api.updatePermissionMode(currentSessionId, mapToAIGentsMode(value));
                        }
                      } catch (e) {
                        console.warn('Failed to update server permission mode:', e);
                      }
                    }}
                    isOpen={isPermissionDropdownOpen}
                    onOpenChange={setIsPermissionDropdownOpen}
                    showFilterInput={false}
                    dropdownClassName="w-64"
                    renderOption={(option) => (
                      <div className="flex flex-col items-start gap-0.5 w-full">
                        <div className="flex items-center gap-2">
                          {getPermissionModeIcon(option.value)}
                          <span className="text-sm font-medium">{option.label}</span>
                        </div>
                        {option.description && (
                          <span className="text-xs text-muted-foreground/80 pl-[22px]">{option.description}</span>
                        )}
                      </div>
                    )}
                    renderTrigger={({ onClick }) => (
                      <Button
                        type="button"
                        className="w-8 h-8 bg-transparent text-inherit border-l border-white/20 opacity-80 hover:opacity-100 hover:bg-white/10 border-0 shadow-none rounded-none flex items-center justify-center p-0"
                        onClick={onClick}
                        disabled={!value.trim() || isLoading || disabled || (showDirectorySelector && selectedDirectory === 'Select directory')}
                        aria-label="Select permission mode"
                      >
                        <ChevronDown size={14} />
                      </Button>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Autocomplete Dropdown */}
      {(enableFileAutocomplete || onFetchCommands) && (
        <AutocompleteDropdown
          suggestions={autocomplete.suggestions}
          onSelect={handleAutocompleteSelection}
          onClose={resetAutocomplete}
          isOpen={autocomplete.isActive && autocomplete.suggestions.length > 0}
          focusedIndex={autocomplete.focusedIndex}
          type={autocomplete.type}
          onFocusReturn={() => richTextRef.current?.focus()}
        />
      )}
      
      {/* Permission Dialog */}
      {permissionRequest && showPermissionUI && (
        <PermissionDialog 
          request={permissionRequest}
          onDecision={(decision) => {
            if (decision.action === 'approve') {
              onPermissionDecision?.(permissionRequest.id, 'approve');
            } else {
              onPermissionDecision?.(permissionRequest.id, 'deny', decision.denyReason);
            }
          }}
        />
      )}
      
      {/* Hidden File Input */}
      {enableFileUpload && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*,text/*,.md,.txt,.csv,.json,.pdf,.doc,.docx"
        />
      )}
      
      {/* Slash Command Menu using shadcn DropdownMenu */}
      {slashMenuOpen && !useUnifiedEditor && (
        <div 
          className="fixed z-[9999]"
          style={{
            left: slashMenuPosition.x,
            top: slashMenuPosition.y,
          }}
        >
          <DropdownMenu open={slashMenuOpen} onOpenChange={setSlashMenuOpen}>
            <DropdownMenuTrigger asChild>
              <div className="w-0 h-0 opacity-0" />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent 
                className="w-64 max-h-[400px] overflow-y-auto"
                align="start"
                side="bottom"
                sideOffset={0}
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                  richTextRef.current?.focus();
                }}
              >
                {/* Commands with sub-menus for configuration */}
                {SLASH_COMMANDS
                  .filter(command => 
                    slashQuery === '' || 
                    command.displayName.toLowerCase().includes(slashQuery.toLowerCase()) ||
                    command.description.toLowerCase().includes(slashQuery.toLowerCase()) ||
                    command.keywords.some(k => k.toLowerCase().includes(slashQuery.toLowerCase()))
                  )
                  .map((command) => (
                    <DropdownMenuSub key={command.id}>
                      <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2.5">
                        <span className="text-lg">{command.icon}</span>
                        <div className="flex flex-col items-start">
                          <div className="font-medium text-sm">{command.displayName}</div>
                          <div className="text-xs text-muted-foreground">{command.description}</div>
                        </div>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent 
                        className="w-[500px] max-h-[500px] overflow-y-auto p-4"
                        sideOffset={8}
                      >
                        {/* Direct configuration panel inside submenu */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <span className="text-lg">{command.icon}</span>
                            <span className="font-medium">{command.displayName} 配置</span>
                          </div>
                          
                          {/* Prompt Input */}
                          <div>
                            <label className="block text-sm font-medium mb-1">描述文本 *</label>
                            <textarea
                              value={commandConfig.prompt}
                              onChange={(e) => setCommandConfig(prev => ({ ...prev, prompt: e.target.value }))}
                              placeholder="请输入图片描述..."
                              className="w-full px-3 py-2 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              rows={3}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                          
                          {/* Aspect Ratio */}
                          <div>
                            <label className="block text-sm font-medium mb-2">图片尺寸</label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {ASPECT_RATIOS.map(ratioConfig => (
                                <button
                                  key={ratioConfig.ratio}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCommandConfig(prev => ({ 
                                      ...prev, 
                                      aspect_ratio: ratioConfig.ratio as any,
                                      width: ratioConfig.width,
                                      height: ratioConfig.height
                                    }));
                                  }}
                                  className={`px-1.5 py-2 text-xs rounded border transition-colors text-center ${
                                    commandConfig.aspect_ratio === ratioConfig.ratio
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-background border-border hover:bg-muted/50'
                                  }`}
                                >
                                  {/* Aspect Ratio Icon */}
                                  <div className="flex items-center justify-center mb-1">
                                    <div 
                                      className={`border-2 ${
                                        commandConfig.aspect_ratio === ratioConfig.ratio
                                          ? 'border-primary-foreground'
                                          : 'border-current'
                                      } opacity-60`}
                                      style={{
                                        width: ratioConfig.width > ratioConfig.height ? '16px' : `${16 * (ratioConfig.width / ratioConfig.height)}px`,
                                        height: ratioConfig.height > ratioConfig.width ? '16px' : `${16 * (ratioConfig.height / ratioConfig.width)}px`,
                                        minWidth: '8px',
                                        minHeight: '8px'
                                      }}
                                    />
                                  </div>
                                  <div className="font-medium leading-tight">{ratioConfig.label}</div>
                                  <div className="text-xs opacity-75 leading-tight">{ratioConfig.description}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Style Selection */}
                          <div>
                            <label className="block text-sm font-medium mb-2">风格选择 (可选)</label>
                            {loadingStyles ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="text-sm text-muted-foreground">加载风格中...</div>
                              </div>
                            ) : availableStyles.length > 0 ? (
                              <div className="grid grid-cols-4 gap-2">
                                {/* 风格选项 - 四列布局，上下结构 */}
                                {availableStyles.map((style) => (
                                  <button
                                    key={style.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCommandConfig(prev => ({ ...prev, style_id: style.id }));
                                    }}
                                    className={`relative overflow-hidden rounded border transition-all hover:scale-[1.02] ${
                                      commandConfig.style_id === style.id
                                        ? 'border-primary ring-1 ring-primary/30'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                                  >
                                    {/* Style Preview - 上方 */}
                                    <div className="relative aspect-square bg-muted/30 overflow-hidden">
                                      <img
                                        src={style.preview}
                                        alt={style.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEwzNiAyOEgyOEwzMiAyMFoiIGZpbGw9IiM5ZmEzYTgiLz4KPHBhdGggZD0iTTMyIDQ0QzM2LjQxODMgNDQgNDAgNDAuNDE4MyA0MCAzNkM0MCAzMS41ODE3IDM2LjQxODMgMjggMzIgMjhDMjcuNTgxNyAyOCAyNCAzMS41ODE3IDI0IDM2QzI0IDQwLjQxODMgMjcuNTgxNyA0NCAzMiA0NFoiIGZpbGw9IiM5ZmEzYTgiLz4KPC9zdmc+Cg==';
                                        }}
                                      />
                                      
                                      {/* Selection Indicator */}
                                      {commandConfig.style_id === style.id && (
                                        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                            <polyline points="20,6 9,17 4,12"/>
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Style Name - 下方 */}
                                    <div className="p-2">
                                      <div className="text-xs font-medium truncate text-center">
                                        {style.name}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-xs text-muted-foreground border rounded">
                                暂无可用风格
                              </div>
                            )}
                          </div>
                          
                          {/* Image-to-image specific fields */}
                          {command.id === 'image_to_image' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium mb-1">参考图片 *</label>
                                {/* Debug info - remove later */}
                                <div className="text-xs text-gray-500 mb-1">
                                  Debug: pendingSourceImageFile = {pendingSourceImageFile?.name || 'null'}
                                </div>
                                {pendingSourceImageFile ? (
                                  <div className="border border-solid border-blue-200 rounded-md p-3 text-center bg-blue-50">
                                    <div className="text-sm text-blue-800 mb-2">📎 参考图片已选择</div>
                                    <div className="text-xs text-blue-600 mb-2">
                                      文件: {pendingSourceImageFile.name} ({Math.round(pendingSourceImageFile.size / 1024)}KB)
                                    </div>
                                    <div className="text-xs text-blue-500 mb-2">将在提交时上传</div>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        sourceImageInputRef.current?.click();
                                      }}
                                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                      重新选择
                                    </button>
                                    <input
                                      ref={sourceImageInputRef}
                                      type="file"
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      onChange={handleSourceImageUpload}
                                    />
                                  </div>
                                ) : (
                                  <div className="border border-dashed border-border rounded-md p-3 text-center bg-muted/20">
                                    <div className="text-sm text-muted-foreground mb-2">选择参考图片</div>
                                    <input
                                      ref={sourceImageInputRef}
                                      type="file"
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      onChange={handleSourceImageUpload}
                                    />
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        sourceImageInputRef.current?.click();
                                      }}
                                      className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                                    >
                                      选择图片
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                            </>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSlashMenuOpen(false);
                                setCommandConfig({ prompt: '' });
                              }}
                              className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!commandConfig.prompt.trim()) return;
                                if (command.id === 'image_to_image' && !commandConfig.source_image) return;
                                
                                // Create command tag
                                const tag: CommandTagType = {
                                  id: `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                                  command: command.id,
                                  config: commandConfig,
                                  display: `${command.displayName}: ${
                                    commandConfig.prompt.length > 20 
                                      ? commandConfig.prompt.substring(0, 20) + '...' 
                                      : commandConfig.prompt
                                  }`,
                                  created_at: new Date().toISOString()
                                };
                                
                                // Insert tag using new method
                                handleInsertCommandTag(tag);
                              }}
                              disabled={!commandConfig.prompt.trim() || (command.id === 'image_to_image' && !commandConfig.source_image)}
                              className="px-4 py-1.5 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              确定
                            </button>
                          </div>
                        </div>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                
                {SLASH_COMMANDS.filter(command => 
                  slashQuery === '' || 
                  command.displayName.toLowerCase().includes(slashQuery.toLowerCase()) ||
                  command.description.toLowerCase().includes(slashQuery.toLowerCase()) ||
                  command.keywords.some(k => k.toLowerCase().includes(slashQuery.toLowerCase()))
                ).length === 0 && (
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">没有找到匹配的命令</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>
      )}

    </form>
  );
});

export default Composer;
