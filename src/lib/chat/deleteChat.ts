import db from '../db/connect';

export async function deleteChat(chatId: string) {
    try {
        await db.collection('history').delete(chatId);
        return true;
    } catch (error) {
        console.error('Chat deleting error:', error);
        return false;
    }
} 