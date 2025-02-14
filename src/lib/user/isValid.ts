import db from "$lib/db/connect";

export const isValid = async () => {
    const user = await db.authStore.model;
    return user;
};