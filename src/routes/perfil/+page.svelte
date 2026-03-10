<script lang="ts">
  import { enhance } from "$app/forms";
  import { toast } from "$lib/utils/toasts.svelte";
  import type { PageData, ActionData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);
  let dismissedErrors = $state<Set<string>>(new Set());

  let displayErrors = $derived.by(() => {
    const errors = form && "errors" in form ? (form.errors as Record<string, string[]>) : null;
    if (!errors) return {};
    const filtered: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(errors)) {
      if (!dismissedErrors.has(key)) filtered[key] = value;
    }
    return filtered;
  });

  $effect(() => {
    if (form && "success" in form && form.success) {
      toast.success("Perfil atualizado com sucesso!");
    } else if (form && "message" in form && form.message) {
      toast.error(form.message);
    } else if (form && "errors" in form && form.errors) {
      toast.error("Existem erros no formulário.");
      dismissedErrors.clear();
    }
  });

  function clearError(field: string) {
    dismissedErrors.add(field);
  }
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-slate-900">O meu Perfil</h1>
    <p class="text-slate-500">Gerencie as suas informações pessoais e de contacto.</p>
  </div>

  <div class="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
    <div class="p-8 border-b border-slate-100 flex items-center space-x-6">
      <div class="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-bold border-2 border-blue-200 shadow-inner">
        {data.user?.name?.charAt(0).toUpperCase()}
      </div>
      <div>
        <h2 class="text-xl font-bold text-slate-900">{data.user?.name}</h2>
        <p class="text-slate-500">{data.user?.email}</p>
      </div>
    </div>

    <form
      method="POST"
      action="?/update"
      use:enhance={() => {
        loading = true;
        return async ({ result, update }) => {
          try {
            await update({ reset: false });
          } finally {
            loading = false;
          }
        };
      }}
      class="p-8 space-y-6"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="col-span-1 md:col-span-2">
          <label for="name" class="block text-sm font-semibold text-slate-700 mb-1">Nome Completo *</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={form?.data?.name ?? data.user?.name ?? ""}
            oninput={() => clearError("name")}
            placeholder="Seu nome"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.name ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          {#if displayErrors.name}
            <p class="mt-1 text-xs text-red-600 font-medium">{displayErrors.name[0]}</p>
          {/if}
        </div>

        <div class="col-span-1 md:col-span-2">
          <label for="email" class="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={form?.data?.email ?? data.user?.email ?? ""}
            oninput={() => clearError("email")}
            placeholder="seu@email.com"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.email ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          {#if displayErrors.email}
            <p class="mt-1 text-xs text-red-600 font-medium">{displayErrors.email[0]}</p>
          {/if}
        </div>
      </div>

      <div class="pt-6 flex items-center justify-end space-x-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          class="px-8 py-3 bg-blue-600 rounded-xl shadow-lg text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-all transform active:scale-95 flex items-center"
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            A atualizar...
          {:else}
            Atualizar Informações
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
