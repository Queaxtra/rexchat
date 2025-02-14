<script lang="ts">
    import { onMount } from 'svelte';
    import { getUser } from '$lib/user/getUser';

    let isVisible = false;
    let userAccountType: any = null;

    interface PricingFeature {
        name: string;
        free: boolean;
        pro: boolean;
    }

    const features: PricingFeature[] = [
        { name: "Access to ChatGPT Models", free: true, pro: true },
        { name: "Unlimited Messages", free: true, pro: true },
        { name: "Basic Chat Features", free: true, pro: true },
        { name: "Access to Gemini", free: false, pro: true },
        { name: "Access to LLaMA", free: false, pro: true },
        { name: "Access to DeepSeek", free: false, pro: true },
        { name: "Access to Future AI Models", free: false, pro: true },
        { name: "Priority Support", free: false, pro: true }
    ];

    onMount(() => {
        const pricingElement = document.querySelector('#pricing');
        if (!pricingElement) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        isVisible = true;
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(pricingElement);

        getUser().then(user => {
            if (user !== null) {
                userAccountType = user.accountType;
            }
        });

        return () => observer.disconnect();
    });
</script>

<section id="pricing" class="py-16 sm:py-20 md:py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
    
    <div class="container mx-auto px-4">
        <div class="text-center mb-12 sm:mb-16 transition-all duration-700 {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-4 sm:mb-6">
                Simple, Transparent Pricing
            </h2>
            <p class="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto px-4">
                Start free with ChatGPT, upgrade for access to all AI models
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto transition-all duration-700 delay-200 {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}">
            <div class="p-6 sm:p-8 rounded-xl sm:rounded-lg border border-white/10 bg-primary backdrop-blur-sm relative group transition-all duration-300">
                <h3 class="text-xl sm:text-2xl font-bold text-white mb-2">Free Plan</h3>
                <p class="text-sm sm:text-base text-white/60 mb-6">Start with ChatGPT</p>
                
                <div class="flex items-baseline gap-2 mb-6 sm:mb-8">
                    <span class="text-3xl sm:text-4xl font-bold text-white">$0</span>
                    <span class="text-sm sm:text-base text-white/60">/month</span>
                </div>

                {#if userAccountType === "Premium"}
                <button disabled class="w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 mb-6 sm:mb-8 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                    You Are On Premium
                </button>
                {:else}
                <button class="w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 mb-6 sm:mb-8 text-sm sm:text-base">
                    Get Started
                </button>
                {/if}

                <div class="space-y-3 sm:space-y-4">
                    {#each features as feature}
                        <div class="flex items-center gap-3">
                            {#if feature.free}
                                <i class="ri-checkbox-circle-fill text-white text-base sm:text-lg"></i>
                                <span class="text-sm sm:text-base text-white">{feature.name}</span>
                            {:else}
                                <i class="ri-close-circle-line text-white/20 text-base sm:text-lg"></i>
                                <span class="text-sm sm:text-base text-white/40">{feature.name}</span>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>

            <div class="p-6 sm:p-8 rounded-xl sm:rounded-lg border border-white/10 bg-primary backdrop-blur-sm relative group transition-all duration-300">                
                <div class="absolute -top-3 right-4 sm:right-6 border border-white/10 bg-primary text-white text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    Popular Choice
                </div>

                <h3 class="text-xl sm:text-2xl font-bold text-white mb-2">Pro Plan</h3>
                <p class="text-sm sm:text-base text-white/60 mb-6">Access All AI Models</p>
                
                <div class="flex items-baseline gap-2 mb-6 sm:mb-8">
                    <span class="text-3xl sm:text-4xl font-bold text-white">$10</span>
                    <span class="text-sm sm:text-base text-white/60">/month</span>
                </div>

                {#if userAccountType === "Premium"}
                <button disabled class="w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg bg-primary border border-white/10 hover:bg-primary-hover text-white transition-colors duration-300 mb-6 sm:mb-8 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                    You Are On Premium
                </button>
                {:else}
                <a href="https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_Dr0Gv6Bq6wnCBF6QmU6hljn3WizMoVkmxC0mu1BnI75/redirect" data-polar-checkout data-polar-checkout-theme="dark">Purchase Premium</a>
                {/if}

                <div class="space-y-3 sm:space-y-4">
                    {#each features as feature}
                        <div class="flex items-center gap-3">
                            {#if feature.pro}
                                <i class="ri-checkbox-circle-fill text-white text-base sm:text-lg"></i>
                                <span class="text-sm sm:text-base text-white">{feature.name}</span>
                            {:else}
                                <i class="ri-close-circle-line text-white/20 text-base sm:text-lg"></i>
                                <span class="text-sm sm:text-base text-white/40">{feature.name}</span>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</section>