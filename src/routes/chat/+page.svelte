<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { chatWithGroq } from '$lib/ai/groq';
    import type { Message, AIModel } from '$lib/ai/types';
    import { MODEL_TYPES, MODEL_DISPLAY_NAMES, getAvailableModels } from '$lib/ai/types';
    import { marked } from 'marked';
    import type { MarkedOptions } from 'marked';
    import DOMPurify from 'dompurify';
    import Navbar from '../../components/Navbar.svelte';
    import Footer from '../../components/Footer.svelte';
    import { fade, scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { goto } from "$app/navigation";
    import { isValid } from "$lib/user/isValid";
    import { getUser } from "$lib/user/getUser";
    import { saveChat } from "$lib/chat/saveChat";
    import { getChats } from "$lib/chat/getChats";
    import ChatHistory from "../../components/ChatHistory.svelte";
    import { deleteChat } from "$lib/chat/deleteChat";

    const markedOptions: MarkedOptions = {
        gfm: true,
        breaks: true
    };

    marked.setOptions(markedOptions);

    function sanitizeHtml(html: string): string {
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['div', 'span', 'pre', 'code', 'button', 'i'],
            ALLOWED_ATTR: ['class', 'onclick']
        });
    }

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    function formatCodeBlock(match: string): string {
        const [_, lang = 'text', code] = match.match(/```(\w+)?\n([\s\S]*?)```/) || [];
        const escapedCode = code.trim().replace(/`/g, '\\`').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<div class="code-block relative group">
            <div class="code-header flex justify-between items-center px-4 py-2 bg-black/40 border-b border-white/10 rounded-t-xl">
                <span class="code-lang opacity-60 text-xs font-medium">${lang}</span>
                <button onclick="navigator.clipboard.writeText(\`${escapedCode}\`)" class="copy-button p-1.5 opacity-0 group-hover:opacity-40 hover:!opacity-90 transition-all duration-200">
                    <i class="ri-file-copy-line text-xs"></i>
                </button>
            </div>
            <pre class="!m-0 !p-4 overflow-x-auto bg-black/30 backdrop-blur border border-white/[0.03] rounded-b-xl"><code class="language-${lang}">${escapedCode}</code></pre>
        </div>`;
    }

    let messagesContainer: HTMLDivElement;
    let userInput = '';
    let chatMessages: { sender: 'user' | 'assistant'; text: string; thinking?: string; isThinkingOpen?: boolean }[] = [];
    let isThinking = false;
    let selectedModel: AIModel = 'chatgpt-4o';
    let showModelSelector = false;
    let messageHistory: Message[] = [];
    let user: any = null;
    let currentChatId: string | null = null;
    let showHistoryModal = false;
    let chatHistory: any[] = [];
    const models = getAvailableModels();
    let modelSearchQuery = '';
    let filteredModels = models;
    const quickPrompts = [
        { title: 'Introduce', prompt: 'Hello! Who are you and what can you do?' },
        { title: 'Write Code', prompt: 'Can you write me a simple React component?' },
        { title: 'Help', prompt: 'I have a problem, can you help me?' }
    ];

    function select(prompt: string) {
        userInput = prompt;
    }

    function copy(text: string) {
        navigator.clipboard.writeText(text);
    }

    async function scrollToBottom() {
        await tick();
        if (messagesContainer) {
            const scrollHeight = messagesContainer.scrollHeight;
            messagesContainer.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    function startNewChat() {
        messageHistory = [{
            role: 'system' as const,
            content: `You are a helpful AI assistant. You speak in English and help users with any topic and your name is Rex. UnoxDevs has created a team to use you in a project called RexChat. You don't have a version, you only know that the UnoxDevs team did it.`
        }];
        chatMessages = [];
        currentChatId = null;
        userInput = '';
    }

    async function clearChat() {
        if (confirm('Are you sure you want to clear this chat? This action cannot be undone.')) {
            if (currentChatId) {
                const deleted = await deleteChat(currentChatId);
                if (!deleted) {
                    alert('Failed to delete chat. Please try again.');
                    return;
                }
            }
            
            chatMessages = [];
            messageHistory = [{
                role: 'system' as const,
                content: 'You are a helpful AI assistant. You speak in English and help users with any topic.'
            }];
            currentChatId = null;
            userInput = '';
            await loadChatHistory();
        }
    }

    async function send() {
        if (!userInput.trim()) return;

        const userMessage = userInput.trim();
        userInput = '';
        isThinking = true;

        const newUserMessage = { role: 'user' as const, content: userMessage };
        messageHistory = [...messageHistory, newUserMessage];
        chatMessages = [...chatMessages, { sender: 'user', text: userMessage }];
        await scrollToBottom();

        try {
            let currentResponse = '';
            
            await chatWithGroq(
                messageHistory,
                {
                    model: selectedModel,
                    stream: true
                },
                (chunk) => {
                    currentResponse += chunk;

                    let thinking = '';
                    let cleanResponse = currentResponse;
                    
                    const thinkMatch = currentResponse.match(/<think>(.*?)<\/think>/s);
                    if (thinkMatch) {
                        thinking = thinkMatch[1].trim();
                        cleanResponse = currentResponse.replace(/<think>.*?<\/think>/gs, '').trim();
                    }
                    
                    const lastMessageIndex = chatMessages.length - 1;
                    const hasAssistantMessage = chatMessages[lastMessageIndex]?.sender === 'assistant';
                    
                    if (hasAssistantMessage) {
                        chatMessages[lastMessageIndex].text = cleanResponse;
                        chatMessages[lastMessageIndex].thinking = thinking;
                        chatMessages[lastMessageIndex].isThinkingOpen = false;
                        chatMessages = [...chatMessages];
                    } else {
                        chatMessages = [...chatMessages, { 
                            sender: 'assistant', 
                            text: cleanResponse,
                            thinking: thinking,
                            isThinkingOpen: false
                        }];
                    }
                    scrollToBottom();
                }
            );

            messageHistory = [...messageHistory, { role: 'assistant' as const, content: currentResponse }];
            
            await saveCurrentChat();

        } catch (error) {
            chatMessages = [
                ...chatMessages,
                { sender: 'assistant', text: 'Sorry, an error occurred. Please try again.' }
            ];
            await scrollToBottom();
        } finally {
            isThinking = false;
        }
    }

    function keydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            send();
        }
    }

    function isPremiumModel(model: AIModel): boolean {
        return MODEL_TYPES[model] === 'premium';
    }

    async function loadChatHistory() {
        if (user?.id) {
            chatHistory = await getChats(user.id);
        }
    }

    function handleChatSelect(event: CustomEvent) {
        const chat = event.detail;
        currentChatId = chat.id;
        messageHistory = chat.chatHistory;
        chatMessages = messageHistory
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                sender: msg.role as 'user' | 'assistant',
                text: msg.content
            }));
    }

    async function saveCurrentChat() {
        if (user?.id) {
            const result = await saveChat(user.id, messageHistory, currentChatId || undefined);
            if (!currentChatId && result && typeof result === 'object' && 'id' in result) {
                currentChatId = result.id;
            }
        }
    }

    $: {
        if (modelSearchQuery) {
            filteredModels = models.filter(model => {
                const name = MODEL_DISPLAY_NAMES[model].toLowerCase();
                const query = modelSearchQuery.toLowerCase();
                return name.includes(query);
            });
        } else {
            filteredModels = models;
        }
    }

    onMount(async () => {
        const isValidUser = await isValid();
        if (!isValidUser) {
            goto("/login");
            return;
        }

        user = await getUser();
        if (!user) {
            goto("/login");
            return;
        }

        if (user.accountType !== 'Premium' && isPremiumModel(selectedModel)) {
            selectedModel = 'llama-3.3-70b-versatile';
        }

        messageHistory = [{
            role: 'system' as const,
            content: 'You are a helpful AI assistant. You speak in English and help users with any topic.'
        }];

        await loadChatHistory();
    });
</script>

<Navbar />

<div class="relative min-h-screen flex flex-col text-white/90 overflow-hidden">
    <div bind:this={messagesContainer} 
         class="flex-1 overflow-y-auto px-2 sm:px-6 py-4 sm:py-6 pt-14 sm:pt-20 max-w-3xl mx-auto w-full relative 
                [&::-webkit-scrollbar]:w-1.5 
                [&::-webkit-scrollbar-track]:bg-black/10 
                [&::-webkit-scrollbar-thumb]:bg-white/5 
                [&::-webkit-scrollbar-thumb]:rounded-full 
                [&::-webkit-scrollbar-thumb]:hover:bg-white/10 
                scroll-smooth">
        {#if chatMessages.length === 0}
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-6 sm:gap-8 px-4 pt-14 sm:pt-20">
            <div class="text-center">
                <h1 class="text-xl sm:text-2xl font-medium tracking-wide mb-4">
                    How can I help you?
                </h1>
                <p class="text-sm sm:text-base opacity-60 max-w-md mx-auto">
                    As your AI-powered chat assistant, I'm here to help you with anything you need.
                </p>
            </div>
        </div>
        {/if}
    
        <div class="space-y-5 sm:space-y-6 py-4 sm:py-6">
            {#each chatMessages as message}
            <div class="group flex items-start {message.sender === 'user' ? 'justify-end' : 'justify-start'} relative gap-3 
                        animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out">
                {#if message.sender === 'assistant'}
                <button on:click={() => copy(message.text)} 
                        class="p-1.5 opacity-0 hover:opacity-100 hover:bg-white/5 rounded-lg transition-all duration-300 
                               group-hover:opacity-100 hidden sm:flex items-center justify-center self-start mt-2" 
                        aria-label="Copy message">
                    <i class="ri-file-copy-line text-xs opacity-60 hover:opacity-90"></i>
                </button>
                {/if}
                <div class="max-w-[92%] sm:max-w-[85%] {message.sender === 'user' ? 'bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg rounded-br-sm border border-white/5' : 'bg-white/[0.03] rounded-lg rounded-bl-sm border border-white/5'} px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-sm transition-all duration-300">
                    {#if message.sender === 'assistant'}
                        {#if message.thinking}
                        <div class="mb-3">
                            <button 
                                on:click={() => {
                                    const index = chatMessages.findIndex(m => m === message);
                                    chatMessages[index].isThinkingOpen = !chatMessages[index].isThinkingOpen;
                                    chatMessages = [...chatMessages];
                                }}
                                class="w-full flex items-center justify-between px-4 py-2 text-[13px] sm:text-sm 
                                       bg-black/20 hover:bg-black/30 rounded-lg border border-white/5 
                                       transition-all duration-300 group"
                            >
                                <div class="flex items-center gap-2 opacity-60">
                                    <i class="ri-brain-line"></i>
                                    <span>Thinking Process</span>
                                </div>
                                <i class="ri-arrow-down-s-line transform transition-transform duration-300 
                                          {message.isThinkingOpen ? 'rotate-180' : ''} opacity-40 group-hover:opacity-90"></i>
                            </button>
                            {#if message.isThinkingOpen}
                            <div class="mt-2 px-4 py-3 text-[13px] sm:text-sm opacity-60 bg-black/20 
                                        rounded-lg border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div class="whitespace-pre-wrap break-words leading-relaxed">
                                    {message.thinking}
                                </div>
                            </div>
                            {/if}
                        </div>
                        {/if}
                        <div class="whitespace-pre-wrap break-words leading-relaxed text-[13px] sm:text-sm 
                            [&_.code-block]:relative [&_.code-block]:my-4 
                            [&_.code-header]:flex [&_.code-header]:justify-between [&_.code-header]:items-center [&_.code-header]:px-4 [&_.code-header]:py-2 [&_.code-header]:bg-black/40 [&_.code-header]:border-b [&_.code-header]:border-white/10 [&_.code-header]:rounded-t-xl
                            [&_.code-lang]:opacity-60 [&_.code-lang]:text-xs [&_.code-lang]:font-medium
                            [&_.copy-button]:p-1.5 [&_.copy-button]:opacity-40 [&_.copy-button]:hover:opacity-90 [&_.copy-button]:transition-colors
                            [&_pre]:font-mono [&_pre]:text-[0.9em] [&_pre]:leading-relaxed [&_pre]:my-0 
                            [&_pre]:bg-black/30 [&_pre]:backdrop-blur [&_pre]:border [&_pre]:border-white/[0.03] 
                            [&_pre]:rounded-b-xl [&_pre]:p-4 [&_pre]:overflow-x-auto
                            [&_code]:font-mono [&_code]:text-[0.9em]">
                            {@html sanitizeHtml(marked(message.text))}
                        </div>
                    {:else}
                    <p class="whitespace-pre-wrap break-words leading-relaxed text-[13px] sm:text-sm">{message.text}</p>
                    {/if}
                </div>
                {#if message.sender === 'user'}
                <button on:click={() => copy(message.text)} class="p-1.5 opacity-0 hover:opacity-100 hover:bg-white/5 rounded-lg transition-all duration-200 group-hover:opacity-100 hidden sm:block self-center" aria-label="Copy message">
                    <i class="ri-file-copy-line text-xs opacity-60 hover:opacity-90"></i>
                </button>
                {/if}
            </div>
            {/each}
            {#if isThinking}
            <div class="flex justify-start animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div class="bg-white/[0.03] rounded-lg rounded-bl-sm px-5 py-3 backdrop-blur-sm border border-white/5">
                    <div class="flex items-center gap-1.5">
                        <div class="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"></div>
                        <div class="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse [animation-delay:150ms]"></div>
                        <div class="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse [animation-delay:300ms]"></div>
                    </div>
                </div>
            </div>
            {/if}
        </div>
    </div>

    <div class="max-w-3xl w-full px-2 sm:px-6 mx-auto mb-4 sm:mb-6 mt-2 relative z-10">
        <div class="flex flex-wrap gap-1.5 sm:gap-2 mb-4 justify-center items-center">
            <div class="flex items-center gap-1.5 sm:gap-2">
                <button on:click={startNewChat} class="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm border-white/10 opacity-60 hover:opacity-90 hover:border-white/10 hover:bg-primary-hover transition-all duration-200 border backdrop-blur-sm whitespace-nowrap">
                    New Chat
                </button>
                <button on:click={() => { showHistoryModal = true; loadChatHistory(); }} class="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm border-white/10 opacity-60 hover:opacity-90 hover:border-white/10 hover:bg-primary-hover transition-all duration-200 border backdrop-blur-sm whitespace-nowrap">
                    History
                </button>
            </div>
            <div class="hidden sm:block h-6 w-[1px] bg-white/10 mx-1"></div>
            <div class="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                {#each quickPrompts as prompt}
                <button on:click={() => select(prompt.prompt)} class="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm border-white/10 opacity-60 hover:opacity-90 hover:border-white/10 hover:bg-primary-hover transition-all duration-200 border backdrop-blur-sm whitespace-nowrap">
                    {prompt.title}
                </button>
                {/each}
            </div>
        </div>
        <form on:submit|preventDefault={send} class="relative group">
            <textarea 
                bind:value={userInput} 
                on:keydown={keydown} 
                placeholder="Type a message or select a quick prompt..." 
                class="w-full bg-primary/90 placeholder:opacity-30 text-[13px] sm:text-sm font-normal 
                       border border-white/5 rounded-lg px-4 py-3 sm:px-5 sm:py-4 pr-24 
                       resize-none focus:outline-none focus:border-white/10 focus:bg-primary/95
                       transition-all duration-300 ease-out
                       min-h-[48px] sm:min-h-[56px] max-h-[160px] sm:max-h-[200px] 
                       backdrop-blur-sm overflow-y-auto"
                style="scrollbar-width: thin;"
            ></textarea>
            <div class="absolute bottom-[10px] sm:bottom-[14px] right-3 sm:right-4 flex items-center space-x-2">
                <button type="button" on:click={() => showModelSelector = !showModelSelector} class="p-1.5 opacity-40 hover:opacity-90 hover:scale-110 rounded-full transition-all duration-300 group-focus-within:opacity-90 active:scale-95 hover:rotate-12" aria-label="Select Model">
                    <i class="ri-cpu-line text-base"></i>
                </button>
                <button disabled={userInput.trim() === ""} type="submit" class="p-1.5 opacity-40 hover:opacity-90 hover:scale-110 rounded-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0 group-focus-within:opacity-90 active:scale-95 hover:rotate-12" aria-label="Send message">
                    <i class="ri-send-plane-line text-base"></i>
                </button>
            </div>
        </form>
    </div>
</div>

{#if showModelSelector}
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" 
     on:click={() => showModelSelector = false} 
     transition:fade={{ duration: 300, easing: quintOut }}>
    <div class="bg-primary/95 rounded-lg border border-white/10 p-6 max-w-md w-full backdrop-blur-xl 
                animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out relative" 
         on:click|stopPropagation>
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium">Select Model</h2>
            <button on:click={() => showModelSelector = false} class="text-white/40 hover:text-white/90 transition-colors">
                <i class="ri-close-line text-xl"></i>
            </button>
        </div>

        <div class="relative mb-4">
            <input
                type="text"
                bind:value={modelSearchQuery}
                placeholder="Search models..."
                class="w-full bg-white/[0.03] text-white/90 placeholder:text-white/30 text-sm font-normal border border-white/5 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-white/10 transition-all duration-200 backdrop-blur-sm"
            />
            <i class="ri-search-line absolute right-3 top-1/2 -translate-y-1/2 text-white/30"></i>
        </div>

        <div class="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 pr-2">
            {#each filteredModels as model}
            <button 
                on:click={() => { 
                    if (isPremiumModel(model) && user?.accountType !== 'Premium') {
                        goto('/premium');
                        return;
                    }
                    selectedModel = model; 
                    showModelSelector = false; 
                }} 
                class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all duration-200 {selectedModel === model ? 'bg-white/5 border border-white/10' : 'border border-transparent'}"
            >
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-white/5">
                        <i class="ri-cpu-line text-lg"></i>
                    </div>
                    <div class="text-left">
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-medium">{MODEL_DISPLAY_NAMES[model]}</span>
                            {#if isPremiumModel(model)}
                                <span class="px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                                    PREMIUM
                                </span>
                            {/if}
                        </div>
                        <div class="text-xs text-white/40">
                            {#if !isPremiumModel(model)}
                                Free model, balanced performance
                            {:else}
                                Premium model, optimized responses
                            {/if}
                        </div>
                    </div>
                </div>
                {#if selectedModel === model}
                <div class="text-white">
                    <i class="ri-check-line text-lg"></i>
                </div>
                {/if}
            </button>
            {/each}
        </div>

        {#if user?.accountType !== 'Premium'}
        <div class="sticky bottom-0 left-0 right-0 mt-4 p-4 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 
                    border border-amber-500/20 backdrop-blur-sm">
            <div class="flex items-start gap-3">
                <i class="ri-information-line text-amber-500 text-lg mt-0.5"></i>
                <div>
                    <p class="text-sm text-amber-500 font-medium mb-2">Premium Models Available</p>
                    <p class="text-xs text-amber-500/80">Upgrade to Premium to access all AI models and advanced features.</p>
                    <a href="/premium" class="inline-block mt-3 px-4 py-1.5 text-xs font-medium bg-amber-500 text-black rounded-lg 
                                   hover:bg-amber-400 transition-all duration-300 ease-out">
                        Upgrade Now
                    </a>
                </div>
            </div>
        </div>
        {/if}
    </div>
</div>
{/if}

<ChatHistory 
    bind:show={showHistoryModal}
    chats={chatHistory}
    userId={user?.id}
    on:select={handleChatSelect}
    on:clear={() => {
        startNewChat();
        loadChatHistory();
    }}
/>

<Footer />