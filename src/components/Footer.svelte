<script lang="ts">
    const currentYear = new Date().getFullYear();
</script>

<footer class="py-6 sm:py-8 relative">
    <div class="container mx-auto px-4">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10 pt-6 sm:pt-8">
            <p class="text-xs sm:text-sm text-white/60">
                © {currentYear} RexChat. All rights reserved.
            </p>
            
            <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div class="flex items-center gap-4 sm:gap-6">
                    <a href="/" class="text-xs sm:text-sm text-white/60 hover:text-white transition-colors duration-300">
                        Terms of Service
                    </a>
                    <a href="/" class="text-xs sm:text-sm text-white/60 hover:text-white transition-colors duration-300">
                        Privacy Policy
                    </a>
                </div>
                
                <div class="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
                
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <div class="flex items-center gap-4">
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <a href="/" target="_blank" rel="noopener noreferrer" class="text-white/60 hover:text-white transition-colors duration-300">
                        <i class="ri-twitter-x-fill text-base sm:text-lg"></i>
                    </a>
                    <a href="/" target="_blank" rel="noopener noreferrer" class="text-white/60 hover:text-white transition-colors duration-300">
                        <i class="ri-instagram-fill text-base sm:text-lg"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
</footer> 