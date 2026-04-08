<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { page } from "$app/state";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import NavIcons from "$lib/components/NavIcons.svelte";
  import Toasts from "$lib/components/Toasts.svelte";

  let { children, data } = $props();

  let user = $derived(data.user);
  let isAuthPage = $derived(
    page.url.pathname === "/login" || page.url.pathname === "/signup",
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

<div
  class="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 overflow-x-hidden"
>
  {#if !isAuthPage && user}
    <Sidebar {user} bind:open={mobileMenuOpen} />

    <!-- mobile header -->
    <header
      class="md:hidden bg-white border-b border-slate-200 sticky top-0 z-40"
    >
      <div class="flex items-center justify-between h-16 px-4">
        <div class="flex items-center space-x-2">
          <div class="p-1.5 bg-blue-600 rounded-lg shadow-sm shadow-blue-100">
            <NavIcons name="medicamentos" class="h-5 w-5 text-white" />
          </div>
          <span class="text-xl font-bold tracking-tight text-slate-800"
            >MedGest</span
          >
        </div>

        <button
          onclick={toggleMobileMenu}
          class="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          aria-label="Opções"
        >
          <NavIcons name="menu" class="h-6 w-6" />
        </button>
      </div>
    </header>
  {/if}

  <main class="grow flex flex-col min-h-0 min-w-0">
    <div class="grow overflow-y-auto">
      {@render children()}
    </div>

    {#if !isAuthPage && user}
      <footer
        class="bg-white/50 backdrop-blur-sm border-t border-slate-200 py-6 px-4 mt-auto"
      >
        <div class="max-w-7xl mx-auto text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} MedGest.
        </div>
      </footer>
    {/if}
  </main>
</div>
