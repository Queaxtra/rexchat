import db from "$lib/db/connect";

interface LoginResponse {
    success: boolean;
    message: string;
    data?: any;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: "Invalid email format"
            };
        }

        if (password.length < 8) {
            return {
                success: false,
                message: "Password must be at least 8 characters long"
            };
        }

        const authData = await db.collection('users').authWithPassword(email, password);

        if (authData) {
            return {
                success: true,
                message: "Login successful",
                data: authData
            };
        }

        return {
            success: false,
            message: "Invalid email or password"
        };

    } catch (error: any) {
        if (error.status === 400) {
            return {
                success: false,
                message: "Invalid email or password"
            };
        }

        return {
            success: false,
            message: "An error occurred while logging in"
        };
    }
}