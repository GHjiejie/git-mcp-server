export interface MCPServer {
  name: string;
  description: string;
  connected: boolean;
  tools: Tool[];
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, PropertySchema>;
    required: string[];
  };
}

export interface PropertySchema {
  type: string;
  description: string;
  default?: any;
  enum?: string[];
  items?: { type: string };
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  streaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
