<script lang="ts">
    import { onMount } from 'svelte';
    import { isValid } from "$lib/user/isValid";
    import { goto } from "$app/navigation";
    import { logout } from "$lib/user/logout";
    
    let scrolled = false;
    let user: any;

    onMount(() => {
        const handleScroll = () => {
            scrolled = window.scrollY > 20;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    });

    onMount(async () => {
        user = await isValid();
    });

    async function handleLogout() {
        await logout();
        goto('/login');
    }
</script>

<nav class="fixed top-0 left-0 right-0 w-full h-16 border-b border-white/5 transition-all duration-300 z-50 {scrolled ? 'bg-primary/50 backdrop-blur-lg' : ''}">
    <div class="container mx-auto h-full px-4">
        <div class="h-full flex items-center justify-between">
            <a href="/" class="text-xl font-bold">
                RexChat
            </a>
            <div class="flex items-center gap-4">
                {#if user}
                    <a href="/chat" class="px-6 sm:px-8 py-2 rounded-lg bg-primary border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 text-base sm:text-lg">
                        Chat
                    </a>
                    <button on:click={handleLogout} class="px-6 sm:px-8 py-2 rounded-lg border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 text-base sm:text-lg">
                        Logout
                    </button>
                {:else}
                    <a href="/login" class="px-6 sm:px-8 py-2 rounded-lg bg-primary border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 text-base sm:text-lg">
                        Login
                    </a>
                    <a href="/register" class="px-6 sm:px-8 py-2 rounded-lg border border-white/10 text-white hover:bg-primary-hover transition-colors duration-300 text-base sm:text-lg">
                        Register
                    </a>
                {/if}
            </div>
        </div>
    </div>
</nav>