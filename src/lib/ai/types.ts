export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export type GroqModel = 'llama-3.3-70b-versatile' | 'deepseek-r1-distill-llama-70b' | 'gemma2-9b-it';
export type GeminiModel = 'gemini-1.5-flash' | 'gemini-2.0-flash-exp';
export type ChatGPTModel = 'chatgpt-4o';
export type WebChatModel = 'web-chat';
export type AIModel = GroqModel | GeminiModel | ChatGPTModel | WebChatModel;

export const MODEL_DISPLAY_NAMES: Record<AIModel, string> = {
    'llama-3.3-70b-versatile': 'Llama 3.3',
    'deepseek-r1-distill-llama-70b': 'DeepSeek R1',
    'gemma2-9b-it': 'Gemma 2 9B',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
    'gemini-2.0-flash-exp': 'Gemini 2.0 Flash',
    'chatgpt-4o': 'ChatGPT-4o',
    'web-chat': 'Web Chat'
};

export const MODEL_TYPES = {
    'llama-3.3-70b-versatile': 'premium',
    'deepseek-r1-distill-llama-70b': 'premium',
    'gemma2-9b-it': 'premium',
    'gemini-1.5-flash': 'premium',
    'gemini-2.0-flash-exp': 'premium',
    'chatgpt-4o': 'free',
    'web-chat': 'free'
} as const;

export function getAvailableModels(): AIModel[] {
    return [
        'chatgpt-4o',
        'web-chat',
        'llama-3.3-70b-versatile', 
        'deepseek-r1-distill-llama-70b', 
        'gemma2-9b-it', 
        'gemini-1.5-flash',
        'gemini-2.0-flash-exp'
    ];
}

export function createUserMessage(content: string): Message {
    return { role: 'user', content };
}

export function createAssistantMessage(content: string): Message {
    return { role: 'assistant', content };
}

export function createSystemMessage(content: string): Message {
    return { role: 'system', content };
} 