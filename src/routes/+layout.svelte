<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { page } from "$app/state";
  import { enhance } from "$app/forms";
  import SidebarItem from "$lib/components/SidebarItem.svelte";
  import Toasts from "$lib/components/Toasts.svelte";

  let { children } = $props();


  let user = $derived(page.data.user);
  let isAuthPage = $derived(
    page.url.pathname === "/login" || page.url.pathname === "/signup"
  );

  let mobileMenuOpen = $state(false);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Gestão de Medicamentos</title>
</svelte:head>

<Toasts />

<div class="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">

  {#if !isAuthPage && user}
    <!-- desktop sidebar -->
    <aside class="hidden md:flex w-72 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-50">
      <div class="p-6 flex items-center space-x-3">
        <div class="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <span class="text-2xl font-black tracking-tight text-slate-800">MedGest</span>
      </div>

      <nav class="flex-grow px-4 pb-4 space-y-2 overflow-y-auto">
        <SidebarItem href="/dashboard" label="Dashboard">
          {#snippet icon()}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          {/snippet}
        </SidebarItem>

        <SidebarItem href="/medicamentos" label="Medicamentos">
          {#snippet icon()}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          {/snippet}
        </SidebarItem>

        <div class="pt-6 pb-2 px-4">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Configurações</span>
        </div>

        <SidebarItem href="/perfil" label="O meu Perfil">
            {#snippet icon()}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            {/snippet}
        </SidebarItem>
      </nav>

      <!-- user section -->
      <div class="p-4 border-t border-slate-100 bg-slate-50/50">
        <div class="flex items-center p-3 rounded-2xl bg-white border border-slate-200 shadow-sm mb-3">
          <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div class="ml-3 min-w-0 flex-1">
            <p class="text-sm font-bold text-slate-900 truncate">{user.name}</p>
            <p class="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        <form method="POST" action="/logout" use:enhance>
          <button type="submit" class="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-100 transition-all duration-200 group">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair do sistema</span>
          </button>
        </form>
      </div>
    </aside>

    <!-- mobile header -->
    <header class="md:hidden bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="flex items-center justify-between h-16 px-4">
            <div class="flex items-center space-x-2">
                <div class="p-1.5 bg-blue-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <span class="text-xl font-bold tracking-tight">MedGest</span>
            </div>
            
            <button onclick={toggleMobileMenu} class="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                {#if mobileMenuOpen}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                {/if}
            </button>
        </div>

        {#if mobileMenuOpen}
            <div class="absolute inset-x-0 bg-white border-b border-slate-200 shadow-xl py-4 flex flex-col px-4 space-y-2 animate-in slide-in-from-top duration-300">
                <a href="/dashboard" onclick={toggleMobileMenu} class="flex items-center px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50">Dashboard</a>
                <a href="/medicamentos" onclick={toggleMobileMenu} class="flex items-center px-4 py-3 rounded-xl text-slate-600 font-medium hover:bg-slate-50">Medicamentos</a>
                <form method="POST" action="/logout" use:enhance>
                    <button type="submit" class="w-full flex items-center px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50">Sair</button>
                </form>
            </div>
        {/if}
    </header>
  {/if}

  <main class="flex-grow flex flex-col min-h-0 min-w-0">
    <div class="flex-grow overflow-y-auto">
        {@render children()}
    </div>
    
    {#if !isAuthPage && user}
        <footer class="bg-white/50 backdrop-blur-sm border-t border-slate-200 py-6 px-4 mt-auto">
            <div class="max-w-7xl mx-auto text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} MedGest - Sistema Inteligente de Gestão. Elaborado com SvelteKit & Prisma.
            </div>
        </footer>
    {/if}
  </main>
</div>
