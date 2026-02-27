import { invoke } from '@tauri-apps/api/core';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import type {
  LLMConfig,
  LLMMessage,
  LLMRequest,
  LLMResponse,
} from '../types/llm';

let openaiClient: ReturnType<typeof createOpenAI> | null = null;
let currentConfig: LLMConfig | null = null;

/**
 * Initialize LLM client with configuration
 * Note: Configuration is managed by the Rust backend. This method only initializes
 * the client with the current configuration retrieved from the backend.
 */
export async function initLLMClient(): Promise<void> {
  currentConfig = await getLLMConfig();
  openaiClient = createOpenAI({
    baseURL: currentConfig.baseUrl,
    apiKey: currentConfig.apiKey,
  });
}

/**
 * Get current LLM configuration from backend
 */
export async function getLLMConfig(): Promise<LLMConfig> {
  const config = await invoke<LLMConfig>('get_llm_config');
  currentConfig = config;
  return config;
}

/**
 * Test LLM connection
 */
export async function testLLMConnection(): Promise<boolean> {
  try {
    await invoke('test_llm_connection');
    return true;
  } catch (error) {
    console.error('LLM connection test failed:', error);
    return false;
  }
}

/**
 * Send a chat completion request (non-streaming)
 */
export async function chatCompletion(request: LLMRequest): Promise<LLMResponse> {
  if (!currentConfig) {
    await getLLMConfig();
  }

  if (!openaiClient) {
    throw new Error('LLM client not initialized');
  }

  try {
    const result = await generateText({
      model: openaiClient(currentConfig!.model),
      messages: request.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens ?? 2000,
    });

    return {
      id: Date.now().toString(),
      choices: [
        {
          message: {
            role: 'assistant',
            content: result.text,
          },
          finishReason: 'stop',
        },
      ],
      usage: {
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
      },
    };
  } catch (error) {
    console.error('Chat completion failed:', error);
    throw error;
  }
}

/**
 * Send a chat completion request (streaming)
 */
export async function* chatCompletionStream(
  request: LLMRequest,
): AsyncGenerator<string, void, unknown> {
  if (!currentConfig) {
    await getLLMConfig();
  }

  if (!openaiClient) {
    throw new Error('LLM client not initialized');
  }

  try {
    const result = streamText({
      model: openaiClient(currentConfig!.model),
      messages: request.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens ?? 2000,
    });

    for await (const textPart of result.textStream) {
      yield textPart;
    }
  } catch (error) {
    console.error('Chat completion stream failed:', error);
    throw error;
  }
}

