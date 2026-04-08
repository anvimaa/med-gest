<script lang="ts">
  import { page } from "$app/state";
  import type { Snippet } from "svelte";

  let {
    href,
    label,
    active = false,
    icon,
    onclick,
  }: {
    href: string;
    label: string;
    active?: boolean;
    icon?: Snippet;
    onclick?: () => void;
  } = $props();

  let isActive = $derived(
    page.url.pathname === href ||
      (href !== "/dashboard" && page.url.pathname.startsWith(href)),
  );
</script>

<a
  {href}
  {onclick}
  class="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
    {isActive
    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
    : 'text-slate-600 hover:bg-slate-100'}"
>
  {#if icon}
    <div
      class="mr-3 {isActive
        ? 'text-white'
        : 'text-slate-400 group-hover:text-blue-600'} transition-colors"
    >
      {@render icon()}
    </div>
  {/if}
  <span>{label}</span>

  {#if isActive}
    <div class="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80"></div>
  {/if}
</a>
