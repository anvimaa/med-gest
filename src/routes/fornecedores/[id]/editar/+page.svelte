<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { PageData, ActionData } from "./$types";
  import { toast } from "$lib/utils/toasts.svelte";

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let dismissedErrors = $state<Set<string>>(new Set());
  let loading = $state(false);

  let displayErrors = $derived.by(() => {
    const errors =
      form && "errors" in form
        ? (form.errors as Record<string, string[]>)
        : null;
    if (!errors) return {};

    const filtered: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(errors)) {
      if (!dismissedErrors.has(key)) {
        filtered[key] = value;
      }
    }
    return filtered;
  });

  $effect(() => {
    if (form && "message" in form && form.message) {
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
  <div class="mb-8 flex items-center space-x-4">
    <a
      href="/fornecedores"
      class="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Editar Fornecedor</h1>
      <p class="text-slate-500">Atualize os dados do fornecedor <strong>{data.fornecedor.nome}</strong>.</p>
    </div>
  </div>

  <div class="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
    <form
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ result, update }) => {
          try {
            if (result.type === "success") {
              toast.success("Fornecedor atualizado com sucesso!");
              await goto("/fornecedores");
            }
            await update({ reset: false });
          } finally {
            loading = false;
          }
        };
      }}
      class="p-8 space-y-8"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="col-span-1 md:col-span-2">
          <label for="nome" class="block text-sm font-semibold text-slate-700 mb-1">Nome do Fornecedor *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            required
            value={form?.data?.nome ?? data.fornecedor.nome ?? ""}
            oninput={() => clearError("nome")}
            placeholder="Ex: Farmacêutica Nacional Lda"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.nome ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.nome}
            <p class="mt-1 text-xs text-red-600 font-medium">{displayErrors.nome[0]}</p>
          {/if}
        </div>

        <div>
          <label for="nif" class="block text-sm font-semibold text-slate-700 mb-1">NIF</label>
          <input
            type="text"
            id="nif"
            name="nif"
            value={form?.data?.nif ?? data.fornecedor.nif ?? ""}
            oninput={() => clearError("nif")}
            placeholder="Ex: 500123456"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.nif ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.nif}
            <p class="mt-1 text-xs text-red-600 font-medium">{displayErrors.nif[0]}</p>
          {/if}
        </div>

        <div>
          <label for="telefone" class="block text-sm font-semibold text-slate-700 mb-1">Telefone</label>
          <input
            type="text"
            id="telefone"
            name="telefone"
            value={form?.data?.telefone ?? data.fornecedor.telefone ?? ""}
            oninput={() => clearError("telefone")}
            placeholder="Ex: +244 923 000 000"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.telefone ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.telefone}
            <p class="mt-1 text-xs text-red-600 font-medium">{displayErrors.telefone[0]}</p>
          {/if}
        </div>

        <div class="col-span-1 md:col-span-2">
          <label for="email" class="block text-sm font-semibold text-slate-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form?.data?.email ?? data.fornecedor.email ?? ""}
            oninput={() => clearError("email")}
            placeholder="Ex: contacto@fornecedor.com"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.email ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.email}
            <p class="mt-1 text-xs text-red-600 font-medium">{displayErrors.email[0]}</p>
          {/if}
        </div>

        <div class="col-span-1 md:col-span-2">
          <label for="endereco" class="block text-sm font-semibold text-slate-700 mb-1">Endereço</label>
          <textarea
            id="endereco"
            name="endereco"
            rows="2"
            placeholder="Rua, Cidade, Província..."
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.endereco ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            oninput={() => clearError("endereco")}
          >{form?.data?.endereco ?? data.fornecedor.endereco ?? ""}</textarea>
          {#if displayErrors.endereco}
            <p class="mt-1 text-xs text-red-600 font-medium">{displayErrors.endereco[0]}</p>
          {/if}
        </div>
      </div>

      {#if form?.message}
        <div class="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-700 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-medium">{form.message}</p>
        </div>
      {/if}

      <div class="pt-4 flex items-center justify-end space-x-4 border-t border-slate-100">
        <a
          href="/fornecedores"
          class="px-6 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={loading}
          class="px-8 py-3 bg-blue-600 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {#if loading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            A guardar...
          {:else}
            Atualizar Fornecedor
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
