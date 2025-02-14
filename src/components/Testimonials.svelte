<script lang="ts">
    import { onMount } from 'svelte';
    
    let isVisible = false;
    let currentSlide = 0;

    interface Testimonial {
        name: string;
        role: string;
        avatar: string;
        comment: string;
        model: string;
    }

    const testimonials: Testimonial[] = [
        {
            name: "Javier Morales",
            role: "Full-Stack Developer",
            avatar: "https://ui-avatars.com/api/?name=Javier+Morales&background=141414&color=fff",
            comment: "When I was struggling with refactoring legacy Node.js code, switching between ChatGPT for quick syntax fixes and Gemini's architectural suggestions helped me cut debugging time by 40%. The model comparison feature is a game-changer!",
            model: "ChatGPT & Gemini"
        },
        {
            name: "Priya Mehta",
            role: "Content Strategist",
            avatar: "https://ui-avatars.com/api/?name=Priya+Mehta&background=141414&color=fff",
            comment: "As someone creating 30+ social posts weekly, ChatGPT's quick ideation saves me 10 hours/month. The tone customization helps maintain our brand voice across blog outlines and LinkedIn captions seamlessly.",
            model: "ChatGPT"
        },
        {
            name: "Aisha Al-Mansoori",
            role: "ML Engineer",
            avatar: "https://ui-avatars.com/api/?name=Aisha+Al-Mansoori&background=141414&color=fff",
            comment: "During our supply chain optimization project, running parallel experiments with LLaMA's NLP capabilities and DeepSeek's pattern recognition provided insights that improved our prediction accuracy by 28%.",
            model: "LLaMA & DeepSeek"
        },
        {
            name: "Emily Zhang",
            role: "Startup Founder",
            avatar: "https://ui-avatars.com/api/?name=Emily+Zhang&background=141414&color=fff",
            comment: "From drafting investor pitches to technical docs, having different AI personalities helps tremendously. We use ChatGPT for initial drafts and Claude for refining complex medical terminology.",
            model: "ChatGPT & Claude"
        },
        {
            name: "Oluwaseun Adebayo",
            role: "EdTech Consultant",
            avatar: "https://ui-avatars.com/api/?name=Oluwaseun+Adebayo&background=141414&color=fff",
            comment: "Creating multilingual lesson plans became effortless - Gemini helps translate cultural references while Mistral optimizes content for different age groups. The collaboration features need a special shoutout!",
            model: "Gemini & Mistral"
        }
    ];

    onMount(() => {
        const testimonialsElement = document.querySelector('#testimonials');
        if (!testimonialsElement) return;

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

        observer.observe(testimonialsElement);

        const interval = setInterval(() => {
            currentSlide = (currentSlide + 1) % testimonials.length;
        }, 5000);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    });

    function setSlide(index: number): void {
        currentSlide = index;
    }

    function nextSlide(): void {
        currentSlide = (currentSlide + 1) % testimonials.length;
    }

    function prevSlide(): void {
        currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
    }
</script>

<section id="testimonials" class="py-16 sm:py-20 md:py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
    
    <div class="container mx-auto px-4">
        <div class="text-center mb-12 sm:mb-16 transition-all duration-700 {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-4 sm:mb-6">
                User Experiences
            </h2>
            <p class="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto px-4">
                See how users are leveraging different AI models for their needs
            </p>
        </div>

        <div class="max-w-4xl mx-auto transition-all duration-700 delay-200 {isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}">
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <div class="relative">
                <div class="overflow-hidden">
                    <div class="flex transition-transform duration-500" style="transform: translateX(-{currentSlide * 100}%)">
                        {#each testimonials as testimonial}
                            <div class="w-full flex-shrink-0 px-4">
                                <div class="p-6 sm:p-8 rounded-xl sm:rounded-lg border border-white/10 bg-primary backdrop-blur-sm">
                                    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 sm:mb-6">
                                        <img src={testimonial.avatar} alt={testimonial.name} class="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10">
                                        <div class="flex-1">
                                            <h3 class="text-base sm:text-lg font-semibold text-white">{testimonial.name}</h3>
                                            <p class="text-xs sm:text-sm text-white/60">{testimonial.role}</p>
                                        </div>
                                        <div class="-mt-3 sm:mt-0">
                                            <span class="text-xs sm:text-sm text-white/60">Using: {testimonial.model}</span>
                                        </div>
                                    </div>
                                    <p class="text-sm sm:text-base text-white/80">{testimonial.comment}</p>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-primary border border-white/10 flex items-center justify-center text-white hover:bg-primary-hover transition-colors duration-300" on:click={prevSlide}>
                    <i class="ri-arrow-left-s-line text-lg sm:text-2xl"></i>
                </button>

                <button class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-primary border border-white/10 flex items-center justify-center text-white hover:bg-primary-hover transition-colors duration-300" on:click={nextSlide}>
                    <i class="ri-arrow-right-s-line text-lg sm:text-2xl"></i>
                </button>
            </div>

            <div class="flex justify-center gap-2 mt-6 sm:mt-8">
                {#each testimonials as _, i}
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-300 {currentSlide === i ? 'bg-white' : 'bg-white/20'}" on:click={() => setSlide(i)}></button>
                {/each}
            </div>
        </div>
    </div>
</section> 
