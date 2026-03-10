<script lang="ts">
  import { toast } from "$lib/utils/toasts.svelte";
  import Toast from "./Toast.svelte";
  import { flip } from "svelte/animate";
  import { fade, fly } from "svelte/transition";
</script>

<div
  class="fixed top-6 right-6 z-9999 flex flex-col space-y-3 pointer-events-none"
>
  {#each toast.toasts as item (item.id)}
    <div in:fly={{ x: 50, duration: 300 }} out:fade={{ duration: 200 }}>
      <Toast {item} />
    </div>
  {/each}
</div>
