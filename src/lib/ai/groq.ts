import type { Message } from './types';

export interface GroqResponse {
    id: string;
    choices: {
        index: number;
        message: Message;
        finish_reason: string;
    }[];
}

export interface GroqStreamResponse {
    id: string;
    choices: {
        index: number;
        delta: {
            content?: string;
            role?: string;
        };
        finish_reason: string | null;
    }[];
}

export interface GroqConfig {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
    stop?: string[] | null;
}

export async function chatWithGroq(
    messages: Message[],
    config: GroqConfig = {},
    onChunk?: (chunk: string) => void
): Promise<string> {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages, config })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (config.stream && onChunk) {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let buffer = '';

            if (!reader) throw new Error('No reader available');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                buffer += chunk;

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const jsonStr = trimmedLine.slice(6);
                            const data: GroqStreamResponse = JSON.parse(jsonStr);
                            
                            if (data.choices && data.choices[0]?.delta?.content) {
                                const content = data.choices[0].delta.content;
                                fullResponse += content;
                                onChunk(content);
                            }
                        } catch (parseError) {
                            continue;
                        }
                    }
                }
            }

            return fullResponse;
        } else {
            const data: GroqResponse = await response.json();
            return data.choices[0]?.message?.content || '';
        }
    } catch (error) {
        throw error;
    }
}

export interface GeminiResponse {
    candidates: {
        content: {
            parts: {
                text: string;
            }[];
        };
        finishReason: string;
    }[];
}

export type GroqModel = 'llama-3.3-70b-versatile' | 'deepseek-r1-distill-llama-70b' | 'gemma2-9b-it';
export type GeminiModel = 'gemini-1.5-flash' | 'gemini-2.0-flash-exp' | 'gemini-2.0-flash-thinking-exp-01-21';
export type ChatGPTModel = 'chatgpt-4o';
export type WebChatModel = 'web-chat';
export type AIModel = GroqModel | GeminiModel | ChatGPTModel | WebChatModel;

export const MODEL_DISPLAY_NAMES: Record<AIModel, string> = {
    'llama-3.3-70b-versatile': 'Llama 3.3',
    'deepseek-r1-distill-llama-70b': 'DeepSeek R1',
    'gemma2-9b-it': 'Gemma 2 9B',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
    'gemini-2.0-flash-exp': 'Gemini 2.0 Flash',
    'gemini-2.0-flash-thinking-exp-01-21': 'Gemini 2.0 Flash Thinking',
    'chatgpt-4o': 'ChatGPT-4o',
    'web-chat': 'Web Chat'
};

export const MODEL_TYPES = {
    'llama-3.3-70b-versatile': 'premium',
    'deepseek-r1-distill-llama-70b': 'premium',
    'gemma2-9b-it': 'premium',
    'gemini-1.5-flash': 'premium',
    'gemini-2.0-flash-exp': 'premium',
    'gemini-2.0-flash-thinking-exp-01-21': 'premium',
    'chatgpt-4o': 'free',
    'web-chat': 'free'
} as const;

export function createUserMessage(content: string): Message {
    return { role: 'user', content };
}

export function createAssistantMessage(content: string): Message {
    return { role: 'assistant', content };
}

export function createSystemMessage(content: string): Message {
    return { role: 'system', content };
}

export function getAvailableModels(): AIModel[] {
    return [
        'chatgpt-4o',
        'web-chat',
        'llama-3.3-70b-versatile', 
        'deepseek-r1-distill-llama-70b', 
        'gemma2-9b-it', 
        'gemini-1.5-flash',
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash-thinking-exp-01-21'
    ];
}

export interface ChatGPTResponse {
    answer: string;
    error?: string;
}

export async function chatGPT(prompt: string): Promise<ChatGPTResponse> {
    const url = 'https://brainman.is-a-cool.dev/api/v1/chat';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: prompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.answer) {
            throw new Error('Invalid response format from server');
        }

        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Server error occurred');
        }
        throw new Error('An unexpected error occurred');
    }
}

export interface WebChatResponse {
    answer: string;
    error?: string;
}

export async function webChat(prompt: string): Promise<WebChatResponse> {
    const url = 'https://brainman.is-a-cool.dev/api/web/chat';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: prompt })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.answer) {
            throw new Error('Invalid response format from server');
        }

        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message || 'Server error occurred');
        }
        throw new Error('An unexpected error occurred');
    }
}