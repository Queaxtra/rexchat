import db from "$lib/db/connect";

export const logout = async () => {
    await db.authStore.clear();
};