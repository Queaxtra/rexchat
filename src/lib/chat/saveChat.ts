import db from '../db/connect';

export async function saveChat(userId: string, messages: any[], chatId?: string) {
    try {
        const chatName = messages[1]?.content?.substring(0, 50) + '...' || 'New Chat';
        
        const data = {
            chatName: chatName,
            chatHistory: messages,
            user: userId
        };

        if (chatId) {
            await db.collection('history').update(chatId, data);
        } else {
            return await db.collection('history').create(data);
        }
        return true;
    } catch (error) {
        return false;
    }
} 