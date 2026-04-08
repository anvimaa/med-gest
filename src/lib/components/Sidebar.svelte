<script lang="ts">
  import { page } from "$app/state";
  import { enhance } from "$app/forms";
  import SidebarItem from "./SidebarItem.svelte";
  import NavIcons from "./NavIcons.svelte";
  import { MAIN_NAV_ITEMS, SETTINGS_NAV_ITEMS } from "$lib/config/navigation";
  import { fade, fly } from "svelte/transition";

  let { user, open = $bindable(false) } = $props();

  const filteredMainItems = $derived(
    MAIN_NAV_ITEMS.filter(
      (item) => !item.roles || item.roles.includes(user.role),
    ),
  );

  function close() {
    open = false;
  }
</script>

{#snippet sidebarContent()}
  <div class="flex flex-col h-full bg-white border-r border-slate-200">
    <div class="p-6 flex items-center space-x-3">
      <div class="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
        <NavIcons name="medicamentos" class="h-6 w-6 text-white" />
      </div>
      <span class="text-2xl font-black tracking-tight text-slate-800"
        >MedGest</span
      >
    </div>

    <nav class="grow px-4 pb-4 space-y-1 overflow-y-auto">
      {#each filteredMainItems as item}
        <SidebarItem href={item.href} label={item.label} onclick={close}>
          {#snippet icon()}
            <NavIcons name={item.icon} />
          {/snippet}
        </SidebarItem>
      {/each}

      <div class="pt-6 pb-2 px-4">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest"
          >Configurações</span
        >
      </div>

      {#each SETTINGS_NAV_ITEMS as item}
        <SidebarItem href={item.href} label={item.label} onclick={close}>
          {#snippet icon()}
            <NavIcons name={item.icon} />
          {/snippet}
        </SidebarItem>
      {/each}
    </nav>

    <!-- User Profile Section -->
    <div class="p-4 border-t border-slate-100 bg-slate-50/50">
      <div
        class="flex items-center p-3 rounded-2xl bg-white border border-slate-200 shadow-sm mb-3"
      >
        <div
          class="shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 overflow-hidden"
        >
          {#if user.image}
            <img src={user.image} alt="" class="w-full h-full object-cover" />
          {:else}
            {user.name.charAt(0).toUpperCase()}
          {/if}
        </div>
        <div class="ml-3 min-w-0 flex-1">
          <p class="text-sm font-bold text-slate-900 truncate">{user.name}</p>
          <p class="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
      </div>

      <form method="POST" action="/logout" use:enhance>
        <button
          type="submit"
          class="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-100 transition-all duration-200 group"
        >
          <NavIcons
            name="logout"
            class="h-5 w-5 group-hover:scale-110 transition-transform"
          />
          <span>Sair do sistema</span>
        </button>
      </form>
    </div>
  </div>
{/snippet}

<!-- Desktop Sidebar -->
<aside class="hidden md:flex w-72 flex-col sticky top-0 h-screen z-50">
  {@render sidebarContent()}
</aside>

<!-- Mobile Drawer -->
{#if open}
  <div class="fixed inset-0 z-100 md:hidden">
    <button
      aria-label="d"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      transition:fade={{ duration: 200 }}
      onclick={close}
    ></button>

    <!-- Drawer Panel -->
    <div
      class="fixed inset-y-0 left-0 w-[280px] shadow-2xl"
      transition:fly={{ x: -280, duration: 300, opacity: 1 }}
    >
      {@render sidebarContent()}
    </div>
  </div>
{/if}
