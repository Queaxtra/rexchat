import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Message, AIModel } from '$lib/ai/types';
import { chatWithGroq } from '$lib/ai/groq';
import { chatWithGemini } from '$lib/ai/gemini';
import { chatGPT, webChat } from '$lib/ai/brainman';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API_URLS = {
    'gemini-1.5-flash': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'gemini-2.0-flash-exp': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
};

interface ModelConfig {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK?: number;
}

const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
    'llama-3.3-70b-versatile': {
        temperature: 0.7,
        maxTokens: 1024,
        topP: 1
    },
    'deepseek-r1-distill-llama-70b': {
        temperature: 0.6,
        maxTokens: 4096,
        topP: 0.95
    },
    'gemma2-9b-it': {
        temperature: 1,
        maxTokens: 1024,
        topP: 1
    },
    'gemini-1.5-flash': {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 1
    },
    'gemini-2.0-flash-exp': {
        temperature: 1,
        maxTokens: 8192,
        topP: 0.95,
        topK: 40
    },
    'chatgpt-4o': {
        temperature: 0.7,
        maxTokens: 1024,
        topP: 1
    },
    'web-chat': {
        temperature: 0.7,
        maxTokens: 1024,
        topP: 1
    }
};

async function handleGroqChat(messages: Message[], config: any) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_APP_GROQ_API_KEY}`
    };

    const body = {
        messages,
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
        stream: config.stream,
        stop: config.stop
    };

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return new Response(response.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}

async function handleGeminiChat(messages: Message[], config: any) {
    try {
        const lastMessage = messages[messages.length - 1];
        
        const headers = {
            'Content-Type': 'application/json'
        };

        const body = {
            contents: [{
                parts: [{
                    text: lastMessage.content
                }]
            }],
            generationConfig: {
                temperature: config.temperature,
                maxOutputTokens: config.maxTokens,
                topP: config.topP,
                topK: config.topK
            }
        };

        const apiUrl = GEMINI_API_URLS[config.model as keyof typeof GEMINI_API_URLS];
        if (!apiUrl) {
            throw new Error('Invalid Gemini model specified');
        }

        const response = await fetch(`${apiUrl}?key=${import.meta.env.VITE_APP_GEMINI_API_KEY}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid Gemini response:', data);
            throw new Error('Invalid response format from Gemini API');
        }

        const content = data.candidates[0].content.parts[0].text;

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    choices: [{
                        delta: { content },
                        finish_reason: 'stop'
                    }]
                })}\n\n`));
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    } catch (error) {
        console.error('Gemini Chat Error:', error);
        throw error;
    }
}

async function handleChatGPT(messages: Message[]) {
    try {
        const lastMessage = messages[messages.length - 1];
        
        if (!lastMessage || !lastMessage.content) {
            throw new Error('Invalid message format');
        }

        const data = await chatGPT(lastMessage.content);
        const content = data.answer;

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    choices: [{
                        delta: { content },
                        finish_reason: 'stop'
                    }]
                })}\n\n`));
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    } catch (error) {
        console.error('ChatGPT Error:', error);
        throw error;
    }
}

async function handleWebChat(messages: Message[]) {
    try {
        const lastMessage = messages[messages.length - 1];
        
        if (!lastMessage || !lastMessage.content) {
            throw new Error('Invalid message format');
        }

        const data = await webChat(lastMessage.content);
        const content = data.answer;

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    choices: [{
                        delta: { content },
                        finish_reason: 'stop'
                    }]
                })}\n\n`));
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });
    } catch (error) {
        console.error('Web Chat Error:', error);
        throw error;
    }
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { messages, config } = await request.json();
        const model = (config?.model || 'llama-3.3-70b-versatile') as AIModel;
        const modelConfig = MODEL_CONFIGS[model];

        const finalConfig = {
            temperature: modelConfig.temperature,
            maxTokens: modelConfig.maxTokens,
            topP: modelConfig.topP,
            topK: modelConfig.topK,
            stream: true,
            stop: null,
            ...config,
            model
        };

        if (model === 'chatgpt-4o') {
            return handleChatGPT(messages);
        } else if (model === 'web-chat') {
            return handleWebChat(messages);
        } else if (model.startsWith('gemini-')) {
            return handleGeminiChat(messages, finalConfig);
        } else {
            return handleGroqChat(messages, finalConfig);
        }
    } catch (error) {
        console.error('Chat API Error:', error);
        return json({ error: 'An error occurred while processing your request.' }, { status: 500 });
    }
}; 