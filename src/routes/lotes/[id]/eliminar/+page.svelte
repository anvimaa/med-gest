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
      <h1 class="text-2xl font-bold text-red-600">Eliminar Medicamentos</h1>
      <p class="text-slate-500">
        Registe a eliminação de itens do lote <strong
          >{data.lote.numeroLote}</strong
        >.
      </p>
    </div>
  </div>

  <div class="bg-red-50 p-6 rounded-xl border border-red-100 mb-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-bold text-red-400 uppercase tracking-wider">
          Medicamento
        </p>
        <p class="text-lg font-bold text-red-900">
          {data.lote.medicamento.nome}
        </p>
      </div>
      <div class="text-right">
        <p class="text-xs font-bold text-red-400 uppercase tracking-wider">
          Stock Disponível
        </p>
        <p class="text-2xl font-black text-red-600">
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
              toast.success("Eliminação registada com sucesso!");
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
        <label
          for="quantidade"
          class="block text-sm font-semibold text-slate-700 mb-1"
          >Quantidade a Eliminar *</label
        >
        <input
          type="number"
          id="quantidade"
          name="quantidade"
          required
          min="1"
          max={data.lote.quantidadeAtual}
          value={form?.data?.quantidade ?? ""}
          oninput={() => clearError("quantidade")}
          placeholder="Ex: 5"
          class="block w-full px-4 py-3 rounded-xl border {displayErrors.quantidade
            ? 'border-red-500'
            : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-red-500 transition-all outline-none"
        />
        {#if displayErrors.quantidade}
          <p class="mt-1 text-xs text-red-600 font-medium">
            {displayErrors.quantidade[0]}
          </p>
        {/if}
      </div>

      <div>
        <label
          for="motivo"
          class="block text-sm font-semibold text-slate-700 mb-1"
          >Motivo da Eliminação *</label
        >
        <textarea
          id="motivo"
          name="motivo"
          required
          rows="3"
          oninput={() => clearError("motivo")}
          placeholder="Ex: Medicamento fora da validade, embalagem danificada..."
          class="block w-full px-4 py-3 rounded-xl border {displayErrors.motivo
            ? 'border-red-500'
            : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-red-500 transition-all outline-none"
          >{form?.data?.motivo ?? ""}</textarea
        >
        {#if displayErrors.motivo}
          <p class="mt-1 text-xs text-red-600 font-medium">
            {displayErrors.motivo[0]}
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
          class="px-8 py-3 bg-red-600 rounded-xl shadow-lg text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {#if loading}A guardar...{:else}Confirmar Eliminação{/if}
        </button>
      </div>
    </form>
  </div>
</div>
