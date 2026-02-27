export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finishReason: string | null;
  }>;
  usage?: {
    inputTokens: number | undefined;
    outputTokens: number | undefined;
    totalTokens: number | undefined;
  };
}

export interface LLMStreamChunk {
  id: string;
  choices: Array<{
    delta: {
      role?: string;
      content?: string;
    };
    finishReason: string | null;
  }>;
}

export interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}
