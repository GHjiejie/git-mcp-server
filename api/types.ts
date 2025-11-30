// API 类型定义

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface MCPRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: {
    name: string;
    arguments: any;
  };
}

export interface MCPResponse {
  jsonrpc?: string;
  id?: number;
  result?: {
    content: Array<{ text: string }>;
  };
  error?: {
    message: string;
  };
}

export interface ToolCallRequest {
  tool: string;
  params: any;
}

export interface ChatRequest {
  message: string;
}
