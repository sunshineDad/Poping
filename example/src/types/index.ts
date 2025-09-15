export interface ChatMessage {
  id: string;
  messageId: string;
  type: 'user' | 'assistant' | 'system' | 'error' | 'tool_call' | 'tool_result';
  content: string | any[];
  timestamp: string;
  workingDirectory?: string;
  // Optional per-query processing timeline (attached to first assistant message)
  timeline?: TimelineEntry[];
  // For tool_call messages
  toolUseId?: string;
  toolName?: string;
  toolInput?: any;
  // For tool_result messages  
  toolResultId?: string;
  isError?: boolean;
}

export interface TimelineEntry {
  type: 'user' | 'assistant' | 'system' | 'generation' | 'tool_use' | 'tool_result' | 'thinking' | string;
  label: string;
  timestamp: string;
  delta_ms: number;
  tool_use_id?: string;
  tool_name?: string;
}

export interface ConversationMessage {
  uuid: string;
  type: 'user' | 'assistant' | 'system';
  message: any;
  timestamp: string;
  cwd?: string;
  isSidechain?: boolean;
}

export interface ConversationDetailsResponse {
  messages: ConversationMessage[];
}

export interface ConversationSummary {
  projectPath?: string;
}

export interface SendMessageRequest {
  cuiSessionId: string;
  workingDirectory: string;
  initialPrompt: string;
  model?: string;
  permissionMode?: string;
  streamingMode?: boolean;
}

export interface PermissionRequest {
  id: string;
  streamingId: string;
  toolName: string;
  toolInput: Record<string, unknown>;
  timestamp: string;
  status: 'pending' | 'approved' | 'denied' | 'timeout';
  modifiedInput?: Record<string, unknown>;
  denyReason?: string;
}

export interface Command {
  name: string;
  description: string;
  category?: string;
}

export interface ToolResult {
  id?: string;
  status: 'pending' | 'success' | 'error' | 'completed';
  output?: any;
  error?: string;
  result?: any;
  is_error?: boolean;
}

export type StreamStatus = 'idle' | 'streaming' | 'completed' | 'error';
