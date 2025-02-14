<script lang="ts">
    import { onMount } from 'svelte';
    let isVisible = false;
    let activeCategory = 'general';
    let searchQuery = '';
    let activeQuestionId: string | null = null;

    interface FAQItem {
        id: string;
        question: string;
        answer: string;
        category: string;
    }

    const faqItems: FAQItem[] = [
        {
            id: '1',
            category: 'general',
            question: "What is RexChat?",
            answer: "RexChat is a unified platform that brings together multiple AI models including ChatGPT, Gemini, LLaMA, DeepSeek, and more. Our platform allows you to chat with different AI models all in one place, with a simple and intuitive interface."
        },
        {
            id: '2',
            category: 'general',
            question: "Which AI models are available for free?",
            answer: "Free users have access to ChatGPT models with unlimited messages. Premium features include access to additional AI models like Gemini, LLaMA, DeepSeek, and future AI models as they become available."
        },
        {
            id: '3',
            category: 'pricing',
            question: "How much does the Pro plan cost?",
            answer: "The Pro plan costs $8/month and gives you access to all available AI models, including Gemini, LLaMA, DeepSeek, and future models, plus priority support."
        },
        {
            id: '4',
            category: 'features',
            question: "Are there any message limits?",
            answer: "No, both free and pro plans come with unlimited messages. You can chat as much as you want with any available AI model based on your plan."
        },
        {
            id: '5',
            category: 'features',
            question: "Can I switch between different AI models?",
            answer: "Yes! Pro users can freely switch between all available AI models. Free users have access to ChatGPT models only."
        },
        {
            id: '6',
            category: 'technical',
            question: "How do you ensure service reliability?",
            answer: "We maintain direct integrations with all AI providers and ensure high availability of our services. Our platform is built on robust infrastructure to provide seamless access to all AI models."
        }
    ];

    const categories = [
        { id: 'general', name: 'General' },
        { id: 'pricing', name: 'Pricing' },
        { id: 'features', name: 'Features' },
        { id: 'technical', name: 'Technical' }
    ];

    $: filteredFAQs = faqItems
        .filter(item => item.category === activeCategory)
        .filter(item => 
            searchQuery === '' || 
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );

    function toggleQuestion(id: string) {
        activeQuestionId = activeQuestionId === id ? null : id;
    }

    onMount(() => {
        const faqElement = document.querySelector('#faq');
        if (!faqElement) return;

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

        observer.observe(faqElement);
        return () => observer.disconnect();
    });
</script>

<section id="faq" class="py-16 sm:py-20 md:py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
    
    <div class="container mx-auto px-4">
        <div class="text-center mb-12 sm:mb-16 transition-all duration-700 {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-4 sm:mb-6">
                Frequently Asked Questions
            </h2>
            <p class="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto px-4">
                Everything you need to know about our AI chat platform
            </p>
        </div>

        <div class="max-w-3xl mx-auto transition-all duration-700 delay-200 {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}">
            <div class="mb-6 sm:mb-8">
                <input
                    type="text"
                    placeholder="Search questions..."
                    class="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-primary border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-sm sm:text-base"
                    bind:value={searchQuery}
                />
            </div>

            <div class="flex flex-wrap gap-2 mb-6 sm:mb-8">
                {#each categories as category}
                    <button class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm {activeCategory === category.id ? 'bg-primary border-primary text-white' : 'border-white/10 text-white/60 hover:border-white/10 hover:bg-primary-hover'} border transition-colors duration-300" on:click={() => activeCategory = category.id}>
                        {category.name}
                    </button>
                {/each}
            </div>

            <div class="space-y-3 sm:space-y-4">
                {#each filteredFAQs as item}
                    <div class="border border-white/10 rounded-lg overflow-hidden">
                        <button class="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-primary-hover transition-colors duration-300" on:click={() => toggleQuestion(item.id)}>
                            <span class="text-sm sm:text-base text-white font-medium pr-4">{item.question}</span>
                            <i class="ri-arrow-down-s-line text-white/60 text-lg sm:text-xl transition-transform duration-300 {activeQuestionId === item.id ? 'rotate-180' : ''}"></i>
                        </button>
                        
                        {#if activeQuestionId === item.id}
                            <div class="px-4 sm:px-6 py-3 sm:py-4 bg-primary border-t border-white/10">
                                <p class="text-sm sm:text-base text-white/60">{item.answer}</p>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
</section> 