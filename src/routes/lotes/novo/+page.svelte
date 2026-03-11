<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { PageData, ActionData } from "./$types";
  import { toast } from "$lib/utils/toasts.svelte";

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);
  let dismissedErrors = $state<Set<string>>(new Set());

  let displayErrors = $derived.by(() => {
    const errors =
      form && "errors" in form
        ? (form.errors as Record<string, string[]>)
        : null;
    if (!errors) return {};
    const filtered: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(errors)) {
      if (!dismissedErrors.has(key)) filtered[key] = value;
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
      aria-label="ok"
      href="/lotes"
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
      <h1 class="text-2xl font-bold text-slate-900">Entrada de Lote</h1>
      <p class="text-slate-500">
        Registe a entrada de um novo lote de medicamento.
      </p>
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
          try {
            if (result.type === "success") {
              toast.success("Entrada de lote registada com sucesso!");
              await goto("/lotes");
            }
            await update({ reset: result.type === "success" });
          } finally {
            loading = false;
          }
        };
      }}
      class="p-8 space-y-8"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="col-span-1 md:col-span-2">
          <label
            for="medicamentoId"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Medicamento *</label
          >
          <select
            id="medicamentoId"
            name="medicamentoId"
            required
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.medicamentoId
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
            onchange={() => clearError("medicamentoId")}
          >
            <option value="">Selecione um medicamento...</option>
            {#each data.medicamentos as med}
              <option
                value={med.id}
                selected={form?.data?.medicamentoId === med.id}
                >{med.nome}</option
              >
            {/each}
          </select>
          {#if displayErrors.medicamentoId}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.medicamentoId[0]}
            </p>
          {/if}
        </div>

        <div class="col-span-1">
          <label
            for="numeroLote"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Número do Lote *</label
          >
          <input
            type="text"
            id="numeroLote"
            name="numeroLote"
            required
            value={form?.data?.numeroLote ?? ""}
            oninput={() => clearError("numeroLote")}
            placeholder="Ex: ABC123XYZ"
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.numeroLote
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.numeroLote}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.numeroLote[0]}
            </p>
          {/if}
        </div>

        <div class="col-span-1">
          <label
            for="fornecedorId"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Fornecedor *</label
          >
          <select
            id="fornecedorId"
            name="fornecedorId"
            required
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.fornecedorId
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
            onchange={() => clearError("fornecedorId")}
          >
            <option value="">Selecione um fornecedor...</option>
            {#each data.fornecedores as forn}
              <option
                value={forn.id}
                selected={form?.data?.fornecedorId === forn.id}
                >{forn.nome}</option
              >
            {/each}
          </select>
          {#if displayErrors.fornecedorId}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.fornecedorId[0]}
            </p>
          {/if}
        </div>

        <div>
          <label
            for="dataFabricacao"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Data de Fabricação *</label
          >
          <input
            type="date"
            id="dataFabricacao"
            name="dataFabricacao"
            required
            value={form?.data?.dataFabricacao ?? ""}
            oninput={() => clearError("dataFabricacao")}
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.dataFabricacao
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.dataFabricacao}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.dataFabricacao[0]}
            </p>
          {/if}
        </div>

        <div>
          <label
            for="dataValidade"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Data de Validade *</label
          >
          <input
            type="date"
            id="dataValidade"
            name="dataValidade"
            required
            value={form?.data?.dataValidade ?? ""}
            oninput={() => clearError("dataValidade")}
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.dataValidade
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.dataValidade}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.dataValidade[0]}
            </p>
          {/if}
        </div>

        <div>
          <label
            for="quantidadeInicial"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Quantidade Entrou *</label
          >
          <input
            type="number"
            id="quantidadeInicial"
            name="quantidadeInicial"
            required
            min="1"
            value={form?.data?.quantidadeInicial ?? ""}
            oninput={(e) => {
              clearError("quantidadeInicial");
              // Auto-fill quantidadeAtual with initial if not set
              const target = e.target as HTMLInputElement;
              const currentInput = document.getElementById(
                "quantidadeAtual",
              ) as HTMLInputElement;
              if (!currentInput.value) currentInput.value = target.value;
            }}
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.quantidadeInicial
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.quantidadeInicial}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.quantidadeInicial[0]}
            </p>
          {/if}
        </div>

        <div>
          <label
            for="quantidadeAtual"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Quantidade em Stock *</label
          >
          <input
            type="number"
            id="quantidadeAtual"
            name="quantidadeAtual"
            required
            min="0"
            value={form?.data?.quantidadeAtual ?? ""}
            oninput={() => clearError("quantidadeAtual")}
            class="block w-full px-4 py-3 rounded-xl border {displayErrors.quantidadeAtual
              ? 'border-red-500'
              : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if displayErrors.quantidadeAtual}
            <p class="mt-1 text-xs text-red-600 font-medium">
              {displayErrors.quantidadeAtual[0]}
            </p>
          {/if}
        </div>
      </div>

      <div
        class="pt-4 flex items-center justify-end space-x-4 border-t border-slate-100"
      >
        <a
          href="/lotes"
          class="px-6 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >Cancelar</a
        >
        <button
          type="submit"
          disabled={loading}
          class="px-8 py-3 bg-blue-600 rounded-xl shadow-lg text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {#if loading}A guardar...{:else}Registar Entrada{/if}
        </button>
      </div>
    </form>
  </div>
</div>
