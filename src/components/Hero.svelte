<script lang="ts">
    import { onMount } from 'svelte';
    import { isValid } from '$lib/user/isValid';

    let isVisible = false;
    let user: any = null;

    onMount(async () => {
        isVisible = true;
        user = await isValid();
    });
</script>

<section class="min-h-[90vh] relative flex items-center py-16 sm:py-20 md:py-24">
    <div class="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
    
    <div class="container mx-auto px-4 relative">
        <div class="max-w-4xl mx-auto text-center transition-all duration-1000 {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}">
            <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-4 sm:mb-6">
                All AI Models<br class="hidden sm:block" /> One Platform
            </h1>
            <p class="text-lg sm:text-xl md:text-2xl text-white/60 mb-8 sm:mb-12 max-w-2xl mx-auto px-4 sm:px-6">
                Access ChatGPT, Gemini, LLaMA, DeepSeek and more in one place. Start chatting instantly with the world's most advanced AI models.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <a href={user ? "/chat" : "/register"} class="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-primary border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 text-base sm:text-lg">
                    {user ? "Chat Now" : "Get Started Free"}
                </a>
                <a href="#features" class="px-6 sm:px-8 py-3 sm:py-4 rounded-lg border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 text-base sm:text-lg">
                    Explore Models
                </a>
            </div>
        </div>
    </div>
</section>