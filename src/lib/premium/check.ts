import db from "$lib/db/connect";

interface ValidateResponse {
    status: string;
    customer?: {
        email: string;
        name: string;
    };
}

export const validatePremiumKey = async (key: string): Promise<boolean> => {
    try {
        if (!key.startsWith('PREMIUM-')) {
            return false;
        }

        const response = await fetch(`${import.meta.env.VITE_APP_POLARSH_URL}/v1/customer-portal/license-keys/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                key,
                organization_id: import.meta.env.VITE_APP_ORGANIZATION_ID,
                increment_usage: 1
            })
        });

        const data: ValidateResponse = await response.json();

        if (data.status === 'granted') {
            const user = await db.authStore.model;
            if (user) {
                await db.collection('users').update(user.id, {
                    accountType: 'Premium'
                });
            }
            return true;
        }

        return false;
    } catch (error) {
        return false;
    }
};