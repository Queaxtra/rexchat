<script lang="ts">
    import { onMount } from 'svelte';
    let isVisible = false;

    interface Feature {
        title: string;
        description: string;
        icon: string;
    }

    const features: Feature[] = [
        {
            title: "Multiple AI Models",
            description: "Access to ChatGPT, Gemini, LLaMA, DeepSeek and more advanced AI models in one unified platform.",
            icon: "ri-robot-line"
        },
        {
            title: "Free ChatGPT Access",
            description: "Start with free access to ChatGPT models and upgrade for premium AI models.",
            icon: "ri-message-3-line"
        },
        {
            title: "Seamless Experience",
            description: "Simple and intuitive interface for instant conversations with any AI model.",
            icon: "ri-magic-line"
        },
        {
            title: "Real-time Chat",
            description: "Engage in real-time conversations with unlimited messages across all models.",
            icon: "ri-chat-3-line"
        }
    ];

    onMount(() => {
        const featuresElement = document.querySelector('#features');
        if (!featuresElement) return;

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

        observer.observe(featuresElement);
        return () => observer.disconnect();
    });
</script>

<section id="features" class="py-16 sm:py-20 md:py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
    
    <div class="container mx-auto px-4">
        <div class="text-center mb-12 sm:mb-16 transition-all duration-700 {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-4 sm:mb-6">
                One Platform, All AI Models
            </h2>
            <p class="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto px-4">
                Experience the power of multiple AI models in one place, with a seamless and intuitive interface.
            </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto transition-all duration-700 delay-200 {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}">
            {#each features as feature}
                <div class="p-4 sm:p-6 rounded-xl sm:rounded-lg border border-white/10 bg-primary backdrop-blur-sm relative group">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-hover flex items-center justify-center mb-4 border border-white/10">
                        <i class="{feature.icon} text-xl sm:text-2xl text-white"></i>
                    </div>
                    <h3 class="text-lg sm:text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p class="text-sm sm:text-base text-white/60">{feature.description}</p>
                </div>
            {/each}
        </div>
    </div>
</section> 
