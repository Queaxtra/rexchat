<script lang="ts">
    import { validatePremiumKey } from "$lib/premium/check";
    import { goto } from "$app/navigation";
    import { isValid } from "$lib/user/isValid";
    import { onMount } from "svelte";

    let premiumKey = "";
    let loading = false;
    let error = "";
    let success = "";

    onMount(async () => {
        const user = await isValid();
        if (!user) {
            goto("/login");
        }
    });

    async function handleSubmit() {
        loading = true;
        error = "";
        success = "";

        try {
            if (!premiumKey) {
                error = "Please enter a premium key";
                return;
            }

            const result = await validatePremiumKey(premiumKey);
            
            if (result) {
                success = "Premium activated successfully! Redirecting...";
                setTimeout(() => {
                    goto("/chat");
                }, 2000);
            } else {
                error = "Invalid premium key. Please try again.";
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
                    Upgrade to Premium
                </h1>
                <p class="text-white/60 text-base sm:text-lg">
                    Enter your premium key to unlock all features
                </p>
            </div>

            <form on:submit|preventDefault={handleSubmit} class="space-y-4 sm:space-y-6">
                <div>
                    <label for="premiumKey" class="block text-sm sm:text-base text-white/80 mb-2">Premium Key</label>
                    <input
                        type="text"
                        id="premiumKey"
                        bind:value={premiumKey}
                        class="w-full px-4 py-2.5 rounded-lg bg-primary border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                        placeholder="PREMIUM-XXXX-XXXX-XXXX"
                        required
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

                <button type="submit" class="w-full py-3 px-6 rounded-lg bg-primary border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 relative disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || !premiumKey}>
                    {#if loading}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        </div>
                        <span class="opacity-0">Activate Premium</span>
                    {:else}
                        Activate Premium
                    {/if}
                </button>

                <div class="text-center text-sm text-white/60">
                    <p>Don't have a premium key?</p>
                    <a href="https://sandbox.polar.sh/queaxtra-polar-test/products/8564696a-afb7-476d-a1d5-42a3ab3ff566" target="_blank" rel="noopener noreferrer" class="text-white hover:text-white/80 transition-colors duration-300">
                        Purchase Premium
                    </a>
                </div>
            </form>
        </div>
    </div>
</div> 