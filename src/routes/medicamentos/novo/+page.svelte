<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { ActionData } from "./$types";
  import { toast } from "$lib/utils/toasts.svelte";

  let { form }: { form: ActionData } = $props();
  let dismissedErrors = $state<Set<string>>(new Set());
  let loading = $state(false);

  // Computed errors that exclude dismissed ones
  let displayErrors = $derived.by(() => {
    if (!form?.errors) return {};
    const filtered: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(form.errors)) {
      if (!dismissedErrors.has(key)) {
        filtered[key] = value as string[];
      }
    }
    return filtered;
  });

  $effect(() => {
    if (form?.message) {
      toast.error(form.message);
    } else if (form?.errors) {
      toast.error("Existem erros no formulário.");
      // Reset dismissed errors when a new form result arrives
      dismissedErrors.clear();
    }
  });

  function clearError(field: string) {
    dismissedErrors.add(field);
  }
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8 flex items-center space-x-4">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <a
      href="/medicamentos"
      class="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
    </a>
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Novo Medicamento</h1>
      <p class="text-slate-500">Registe um novo medicamento no catálogo.</p>
    </div>
  </div>

  <div
    class="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden"
  >
    <form
      method="POST"
      use:enhance={() => {
        loading = true;
        return async ({ result, update }) => {
          loading = false;
          if (result.type === "success") {
            toast.success("Medicamento criado com sucesso!");
            await goto("/medicamentos");
          }
          await update();
        };
      }}
      class="p-8 space-y-8"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="col-span-1 md:col-span-2">
          <label
            for="nome"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Nome do Medicamento *</label
          >
          <input
            type="text"
            id="nome"
            name="nome"
            required
            value={form?.data?.nome ?? ""}
            oninput={() => clearError("nome")}
            placeholder="Ex: Paracetamol 500mg"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.nome
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.nome}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.nome[0]}
            </p>
          {/if}
        </div>

        <div class="col-span-1 md:col-span-2">
          <label
            for="descricao"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Descrição</label
          >
          <textarea
            id="descricao"
            name="descricao"
            rows="3"
            placeholder="Informações adicionais sobre o medicamento..."
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.descricao
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            oninput={() => clearError("descricao")}
            >{form?.data?.descricao ?? ""}</textarea
          >

          {#if displayErrors.descricao}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.descricao[0]}
            </p>
          {/if}
        </div>

        <div>
          <label
            for="principioAtivo"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Princípio Ativo</label
          >
          <input
            type="text"
            id="principioAtivo"
            name="principioAtivo"
            value={form?.data?.principioAtivo ?? ""}
            oninput={() => clearError("principioAtivo")}
            placeholder="Ex: Paracetamol"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.principioAtivo
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.principioAtivo}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.principioAtivo[0]}
            </p>
          {/if}
        </div>

        <div>
          <label
            for="formaFarmaceutica"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Forma Farmacêutica</label
          >
          <input
            type="text"
            id="formaFarmaceutica"
            name="formaFarmaceutica"
            value={form?.data?.formaFarmaceutica ?? ""}
            oninput={() => clearError("formaFarmaceutica")}
            placeholder="Ex: Comprimido, Xarope"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.formaFarmaceutica
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.formaFarmaceutica}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.formaFarmaceutica[0]}
            </p>
          {/if}
        </div>

        <div>
          <label
            for="concentracao"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Concentração</label
          >
          <input
            type="text"
            id="concentracao"
            name="concentracao"
            value={form?.data?.concentracao ?? ""}
            oninput={() => clearError("concentracao")}
            placeholder="Ex: 500mg, 10mg/ml"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.concentracao
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.concentracao}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.concentracao[0]}
            </p>
          {/if}
        </div>

        <div>
          <label
            for="codigoBarras"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Código de Barras</label
          >
          <input
            type="text"
            id="codigoBarras"
            name="codigoBarras"
            value={form?.data?.codigoBarras ?? ""}
            oninput={() => clearError("codigoBarras")}
            placeholder="Ex: 5601234567890"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.codigoBarras
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.codigoBarras}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.codigoBarras[0]}
            </p>
          {/if}
        </div>

        <div class="col-span-1 md:col-span-2">
          <label
            for="fabricante"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Fabricante</label
          >
          <input
            type="text"
            id="fabricante"
            name="fabricante"
            value={form?.data?.fabricante ?? ""}
            oninput={() => clearError("fabricante")}
            placeholder="Ex: Pfizer, Bial"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.fabricante
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.fabricante}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.fabricante[0]}
            </p>
          {/if}
        </div>
      </div>

      {#if form?.message}
        <div
          class="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-700 shadow-sm animate-pulse"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-sm font-medium">{form.message}</p>
        </div>
      {/if}

      <div
        class="pt-4 flex items-center justify-end space-x-4 border-t border-slate-100"
      >
        <a
          href="/medicamentos"
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
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            A guardar...
          {:else}
            Guardar Medicamento
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
