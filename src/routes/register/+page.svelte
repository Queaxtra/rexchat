<script lang="ts">
    import { createUser } from "$lib/user/create";
    import { goto } from "$app/navigation";
    import { isValid } from "$lib/user/isValid";
    import { onMount } from "svelte";

    let formData = {
        name: "",
        username: "",
        email: "",
        password: "",
        passwordConfirm: ""
    };

    let loading = false;
    let error = "";
    let success = "";

    onMount(async () => {
        const user = await isValid();
        if (user) {
            goto("/chat");
        }
    });

    async function handleSubmit() {
        loading = true;
        error = "";
        success = "";

        try {
            const result = await createUser(formData);
            
            if (result.success) {
                success = "Account created successfully! Redirecting...";
                setTimeout(() => {
                    goto("/login");
                }, 2000);
            } else {
                error = result.message;
            }
        } catch (e) {
            error = "An unexpected error occurred. Please try again.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center py-16 sm:py-20">
    <div class="container px-4 mx-auto">
        <div class="max-w-md mx-auto">
            <div class="text-center mb-8 sm:mb-10">
                <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-4">
                    Create Account
                </h1>
                <p class="text-white/60 text-base sm:text-lg">
                    Join RexChat to start chatting with AI models
                </p>
            </div>

            <form on:submit|preventDefault={handleSubmit} class="space-y-4 sm:space-y-6">
                <div>
                    <label for="name" class="block text-sm sm:text-base text-white/80 mb-2">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        bind:value={formData.name}
                        class="w-full px-4 py-2.5 rounded-lg bg-primary border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                        placeholder="John Doe"
                        required
                    />
                </div>

                <div>
                    <label for="username" class="block text-sm sm:text-base text-white/80 mb-2">Username</label>
                    <input
                        type="text"
                        id="username"
                        bind:value={formData.username}
                        class="w-full px-4 py-2.5 rounded-lg bg-primary border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                        placeholder="johndoe"
                        required
                    />
                </div>

                <div>
                    <label for="email" class="block text-sm sm:text-base text-white/80 mb-2">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        bind:value={formData.email}
                        class="w-full px-4 py-2.5 rounded-lg bg-primary border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                        placeholder="john@example.com"
                        required
                    />
                </div>

                <div>
                    <label for="password" class="block text-sm sm:text-base text-white/80 mb-2">Password</label>
                    <input
                        type="password"
                        id="password"
                        bind:value={formData.password}
                        class="w-full px-4 py-2.5 rounded-lg bg-primary border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                        placeholder="••••••••"
                        required
                        minlength="8"
                    />
                </div>

                <div>
                    <label for="passwordConfirm" class="block text-sm sm:text-base text-white/80 mb-2">Confirm Password</label>
                    <input
                        type="password"
                        id="passwordConfirm"
                        bind:value={formData.passwordConfirm}
                        class="w-full px-4 py-2.5 rounded-lg bg-primary border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                        placeholder="••••••••"
                        required
                        minlength="8"
                    />
                </div>

                {#if error}
                    <div class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </div>
                {/if}

                {#if success}
                    <div class="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                        {success}
                    </div>
                {/if}

                <button type="submit" class="w-full py-3 px-6 rounded-lg bg-primary border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 relative disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !formData.name || !formData.username || !formData.email || !formData.password || !formData.passwordConfirm}>
                    {#if loading}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        </div>
                        <span class="opacity-0">Create Account</span>
                    {:else}
                        Create Account
                    {/if}
                </button>

                <p class="text-center text-sm text-white/60">
                    Already have an account?
                    <a href="/login" class="text-white hover:text-white/80 transition-colors duration-300">Login</a>
                </p>
            </form>
        </div>
    </div>
</div> 