import db from '../db/connect';

export async function getChats(userId: string) {
    try {
        const chats = await db.collection('history').getList(1, 50, {
            filter: `user = "${userId}"`,
            sort: '-created'
        });
        
        return chats.items;
    } catch (error) {
        return [];
    }
} 