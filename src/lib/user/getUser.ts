import db from "$lib/db/connect";

interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    accountType: 'Normal' | 'Premium';
    createdAt: string;
    updatedAt: string;
}

export const getUser = async (): Promise<User | null> => {
    try {
        const user = await db.authStore.model;
        if (!user) return null;

        const userData = await db.collection('users').getOne(user.id);
        if (!userData) return null;

        return {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            username: userData.username,
            accountType: userData.accountType || 'Normal',
            createdAt: userData.created,
            updatedAt: userData.updated
        };
    } catch (error) {
        return null;
    }
}; 