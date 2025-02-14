import db from "$lib/db/connect";

interface CreateUserData {
    password: string;
    passwordConfirm: string;
    name: string;
    username: string;
    email: string;
    accountType?: "Normal" | "Premium";
}

interface UserResponse {
    success: boolean;
    message: string;
    data?: any;
}

export async function createUser(userData: CreateUserData): Promise<UserResponse> {
    try {
        if (!userData.password || !userData.passwordConfirm || !userData.name || !userData.username || !userData.email) {
            return {
                success: false,
                message: "All fields are required"
            };
        }

        if (userData.password !== userData.passwordConfirm) {
            return {
                success: false,
                message: "Passwords do not match"
            };
        }

        if (userData.password.length < 8) {
            return {
                success: false,
                message: "Password must be at least 8 characters long"
            };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return {
                success: false,
                message: "Invalid email format"
            };
        }

        const data = {
            password: userData.password,
            passwordConfirm: userData.passwordConfirm,
            name: userData.name,
            username: userData.username,
            email: userData.email,
            verified: false,
            emailVisibility: true,
            accountType: userData.accountType || "Normal"
        };

        const record = await db.collection('users').create(data);

        return {
            success: true,
            message: "User created successfully",
            data: record
        };

    } catch (error: any) {
        if (error.status === 400) {
            return {
                success: false,
                message: "Username or email already exists"
            };
        }

        return {
            success: false,
            message: "An error occurred while creating user"
        };
    }
}