<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { createEventDispatcher } from 'svelte';
    import { deleteChat } from '$lib/chat/deleteChat';

    export let show = false;
    export let chats: any[] = [];
    export let userId: string;
    
    const dispatch = createEventDispatcher();

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getFirstMessage(chatHistory: any): string {
        try {
            const firstUserMessage = chatHistory.find((msg: any) => msg.role === 'user');
            return firstUserMessage?.content || 'Empty chat';
        } catch (error) {
            return 'Failed to load chat';
        }
    }

    function selectChat(chat: any) {
        try {
            dispatch('select', chat);
            show = false;
        } catch (error) {
            alert('An error occurred while loading the chat. Please try again.');
        }
    }

    async function clearAllChats() {
        if (confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
            try {
                const deletePromises = chats.map(chat => deleteChat(chat.id));
                await Promise.all(deletePromises);
                dispatch('clear');
                chats = [];
            } catch (error) {
                alert('Failed to delete all chats. Please try again.');
            }
        }
    }
</script>

{#if show}
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
    on:click={() => show = false} 
    transition:fade={{ duration: 300, easing: quintOut }}>
    
    <div class="bg-primary rounded-lg border border-white/10 p-6 max-w-2xl w-full backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300 h-[600px] flex flex-col" 
        on:click|stopPropagation 
        transition:scale={{ duration: 300, easing: quintOut }}>
        
        <div class="flex items-center justify-between mb-6 flex-shrink-0">
            <div class="flex items-center gap-4">
                <h2 class="text-lg font-medium text-white/90">Chat History</h2>
                {#if chats.length > 0}
                    <button on:click={clearAllChats} 
                        class="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm border-white/10 text-white/60 hover:border-white/10 hover:bg-primary-hover transition-all duration-200 border backdrop-blur-sm">
                        <i class="ri-delete-bin-line mr-1"></i>
                        Clear All
                    </button>
                {/if}
            </div>
            <button on:click={() => show = false} 
                class="text-white/40 hover:text-white/90 transition-colors">
                <i class="ri-close-line text-xl"></i>
            </button>
        </div>

        <div class="overflow-y-auto flex-1 -mx-6 px-6 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
            {#if chats.length === 0}
                <div class="text-center py-8">
                    <p class="text-white/60">No chats found yet.</p>
                </div>
            {:else}
                <div class="space-y-2 pb-2">
                    {#each chats as chat}
                        <button on:click={() => selectChat(chat)}
                            class="w-full flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10 group">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-white/5 flex-shrink-0">
                                <i class="ri-message-3-line text-lg text-white/60"></i>
                            </div>
                            <div class="text-left flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <h3 class="text-sm font-medium text-white/90 truncate">
                                        {chat.chatName}
                                    </h3>
                                    <span class="text-[11px] text-white/40 flex-shrink-0">
                                        {formatDate(chat.created)}
                                    </span>
                                </div>
                                <p class="text-xs text-white/40 mt-1 line-clamp-2">
                                    {getFirstMessage(chat.chatHistory)}
                                </p>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
{/if} 