import type { Message } from './types';

export interface BrainmanResponse {
    answer: string;
    error?: string;
}

export async function chatGPT(prompt: string): Promise<BrainmanResponse> {
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

export async function webChat(prompt: string): Promise<BrainmanResponse> {
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