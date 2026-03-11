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

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <h1 class="text-2xl font-bold text-slate-900">Movimentar Stock</h1>
      <p class="text-slate-500">
        Registe uma entrada ou saída para o lote <strong
          >{data.lote.numeroLote}</strong
        >.
      </p>
    </div>
  </div>

  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Medicamento
        </p>
        <p class="text-lg font-bold text-slate-900">
          {data.lote.medicamento.nome}
        </p>
      </div>
      <div class="text-right">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Stock Atual
        </p>
        <p class="text-2xl font-black text-blue-600">
          {data.lote.quantidadeAtual}
        </p>
      </div>
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
              toast.success("Movimentação registada com sucesso!");
              await goto("/lotes");
            }
            await update({ reset: result.type === "success" });
          } finally {
            loading = false;
          }
        };
      }}
      class="p-8 space-y-6"
    >
      <div>
        <span class="block text-sm font-semibold text-slate-700 mb-3"
          >Tipo de Movimentação *</span
        >
        <div class="grid grid-cols-2 gap-4">
          <label
            class="relative flex items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all {form
              ?.data?.tipoMovimentacao === 'ENTRADA'
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
              : 'border-slate-200'}"
          >
            <input
              type="radio"
              name="tipoMovimentacao"
              value="ENTRADA"
              required
              class="sr-only"
              checked={form?.data?.tipoMovimentacao === "ENTRADA"}
            />
            <span class="text-sm font-bold text-slate-900">Entrada (+)</span>
          </label>
          <label
            class="relative flex items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all {form
              ?.data?.tipoMovimentacao === 'SAIDA'
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
              : 'border-slate-200'}"
          >
            <input
              type="radio"
              name="tipoMovimentacao"
              value="SAIDA"
              required
              class="sr-only"
              checked={form?.data?.tipoMovimentacao === "SAIDA"}
            />
            <span class="text-sm font-bold text-slate-900">Saída (-)</span>
          </label>
        </div>
        {#if displayErrors.tipoMovimentacao}
          <p class="mt-1 text-xs text-red-600 font-medium">
            {displayErrors.tipoMovimentacao[0]}
          </p>
        {/if}
      </div>

      <div>
        <label
          for="quantidade"
          class="block text-sm font-semibold text-slate-700 mb-1"
          >Quantidade *</label
        >
        <input
          type="number"
          id="quantidade"
          name="quantidade"
          required
          min="1"
          value={form?.data?.quantidade ?? ""}
          oninput={() => clearError("quantidade")}
          placeholder="Ex: 10"
          class="block w-full px-4 py-3 rounded-xl border {displayErrors.quantidade
            ? 'border-red-500'
            : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
        />
        {#if displayErrors.quantidade}
          <p class="mt-1 text-xs text-red-600 font-medium">
            {displayErrors.quantidade[0]}
          </p>
        {/if}
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
          {#if loading}A guardar...{:else}Registar Movimentação{/if}
        </button>
      </div>
    </form>
  </div>
</div>
