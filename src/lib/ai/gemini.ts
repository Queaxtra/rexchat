import type { Message } from './types';

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

export interface GeminiConfig {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK?: number;
}

export async function chatWithGemini(
    messages: Message[],
    config: GeminiConfig
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

        const data: GeminiResponse = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
        throw error;
    }
} 