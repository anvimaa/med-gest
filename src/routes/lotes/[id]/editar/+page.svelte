<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { PageData, ActionData } from "./$types";
  import { toast } from "$lib/utils/toasts.svelte";

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let loading = $state(false);

  function formatDate(date: Date | string) {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  }

  $effect(() => {
    if (form && "error" in form && form.error) {
      toast.error(form.error);
    }
  });
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8 flex items-center space-x-4">
    <a
      aria-label="voltar"
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
      <h1 class="text-2xl font-bold text-slate-900">Editar Lote</h1>
      <p class="text-slate-500">
        Atualize os dados do lote <strong>{data.lote.numeroLote}</strong>.
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
        return async ({ result }) => {
          if (result.type === "success") {
            toast.success("Lote atualizado com sucesso!");
            await goto("/lotes");
          } else if (result.type === "failure") {
            // @ts-ignore
            toast.error(result.data?.error || "Erro ao atualizar lote.");
          }
          loading = false;
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
            class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-slate-50 text-slate-500 cursor-not-allowed"
            disabled
          >
            {#each data.medicamentos as med}
              <option
                value={med.id}
                selected={data.lote.medicamentoId === med.id}>{med.nome}</option
              >
            {/each}
          </select>
          <input
            type="hidden"
            name="medicamentoId"
            value={data.lote.medicamentoId}
          />
          <p class="mt-1 text-xs text-slate-400">
            O medicamento não pode ser alterado após o registo do lote.
          </p>
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
            value={form?.data?.numeroLote ?? data.lote.numeroLote}
            placeholder="Ex: ABC123XYZ"
            class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
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
            class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
          >
            <option value="">Selecione um fornecedor...</option>
            {#each data.fornecedores as forn}
              <option
                value={forn.id}
                selected={(form?.data?.fornecedorId ??
                  data.lote.fornecedorId) === forn.id}>{forn.nome}</option
              >
            {/each}
          </select>
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
            value={form?.data?.dataFabricacao ??
              formatDate(data.lote.dataFabricacao)}
            class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
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
            value={form?.data?.dataValidade ??
              formatDate(data.lote.dataValidade)}
            class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
        </div>

        <div>
          <input
            type="hidden"
            id="quantidadeInicial"
            name="quantidadeInicial"
            required
            min="0"
            value={form?.data?.quantidadeInicial ?? data.lote.quantidadeInicial}
            class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
        </div>

        <div>
          <input
            type="hidden"
            id="quantidadeAtual"
            name="quantidadeAtual"
            required
            min="0"
            value={form?.data?.quantidadeAtual ?? data.lote.quantidadeAtual}
            class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
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
          {#if loading}A guardar...{:else}Guardar Alterações{/if}
        </button>
      </div>
    </form>
  </div>
</div>
