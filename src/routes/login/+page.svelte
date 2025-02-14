<script lang="ts">
    import { loginUser } from "$lib/user/login";
    import { isValid } from "$lib/user/isValid";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let formData = {
        email: "",
        password: ""
    };

    let loading = false;
    let error = "";

    onMount(async () => {
        const user = await isValid();
        if (user) {
            goto("/chat");
        }
    });

    async function handleSubmit() {
        loading = true;
        error = "";

        try {
            const result = await loginUser(formData.email, formData.password);
            
            if (result.success) {
                goto("/chat");
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
                    Welcome Back
                </h1>
                <p class="text-white/60 text-base sm:text-lg">
                    Login to continue chatting with AI models
                </p>
            </div>

            <form on:submit|preventDefault={handleSubmit} class="space-y-4 sm:space-y-6">
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

                {#if error}
                    <div class="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </div>
                {/if}

                <button type="submit" class="w-full py-3 px-6 rounded-lg bg-primary border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 relative disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !formData.email || !formData.password}>
                    {#if loading}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        </div>
                        <span class="opacity-0">Login</span>
                    {:else}
                        Login
                    {/if}
                </button>

                <p class="text-center text-sm text-white/60">
                    Don't have an account?
                    <a href="/register" class="text-white hover:text-white/80 transition-colors duration-300">Create Account</a>
                </p>
            </form>
        </div>
    </div>
</div> 