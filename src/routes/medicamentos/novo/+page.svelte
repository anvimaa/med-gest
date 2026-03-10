<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();

  let loading = $state(false);
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8 flex items-center space-x-4">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <a href="/medicamentos" class="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </a>
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Novo Medicamento</h1>
      <p class="text-slate-500">Registe um novo medicamento no catálogo.</p>
    </div>
  </div>

  <div class="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
    <form
      method="POST"
      use:enhance={() => {
        loading = true;
        return ({ result }) => {
          loading = false;
        };
      }}
      class="p-8 space-y-8"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="col-span-1 md:col-span-2">
          <label for="nome" class="block text-sm font-semibold text-slate-700 mb-1">Nome do Medicamento *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            required
            value={form?.data?.nome ?? ''}
            placeholder="Ex: Paracetamol 500mg"
            class="block w-full px-4 py-3 rounded-xl border {form?.errors?.nome ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if form?.errors?.nome}
            <p class="mt-1 text-xs text-red-600 font-medium">{form.errors.nome[0]}</p>
          {/if}
        </div>

        <div class="col-span-1 md:col-span-2">
            <label for="descricao" class="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              rows="3"
              placeholder="Informações adicionais sobre o medicamento..."
              class="block w-full px-4 py-3 rounded-xl border {form?.errors?.descricao ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            >{form?.data?.descricao ?? ''}</textarea>
            {#if form?.errors?.descricao}
                <p class="mt-1 text-xs text-red-600 font-medium">{form.errors.descricao[0]}</p>
            {/if}
          </div>

        <div>
          <label for="principioAtivo" class="block text-sm font-semibold text-slate-700 mb-1">Princípio Ativo</label>
          <input
            type="text"
            id="principioAtivo"
            name="principioAtivo"
            value={form?.data?.principioAtivo ?? ''}
            placeholder="Ex: Paracetamol"
            class="block w-full px-4 py-3 rounded-xl border {form?.errors?.principioAtivo ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if form?.errors?.principioAtivo}
            <p class="mt-1 text-xs text-red-600 font-medium">{form.errors.principioAtivo[0]}</p>
          {/if}
        </div>

        <div>
          <label for="formaFarmaceutica" class="block text-sm font-semibold text-slate-700 mb-1">Forma Farmacêutica</label>
          <input
            type="text"
            id="formaFarmaceutica"
            name="formaFarmaceutica"
            value={form?.data?.formaFarmaceutica ?? ''}
            placeholder="Ex: Comprimido, Xarope"
            class="block w-full px-4 py-3 rounded-xl border {form?.errors?.formaFarmaceutica ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if form?.errors?.formaFarmaceutica}
            <p class="mt-1 text-xs text-red-600 font-medium">{form.errors.formaFarmaceutica[0]}</p>
          {/if}
        </div>

        <div>
          <label for="concentracao" class="block text-sm font-semibold text-slate-700 mb-1">Concentração</label>
          <input
            type="text"
            id="concentracao"
            name="concentracao"
            value={form?.data?.concentracao ?? ''}
            placeholder="Ex: 500mg, 10mg/ml"
            class="block w-full px-4 py-3 rounded-xl border {form?.errors?.concentracao ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if form?.errors?.concentracao}
            <p class="mt-1 text-xs text-red-600 font-medium">{form.errors.concentracao[0]}</p>
          {/if}
        </div>

        <div>
          <label for="codigoBarras" class="block text-sm font-semibold text-slate-700 mb-1">Código de Barras</label>
          <input
            type="text"
            id="codigoBarras"
            name="codigoBarras"
            value={form?.data?.codigoBarras ?? ''}
            placeholder="Ex: 5601234567890"
            class="block w-full px-4 py-3 rounded-xl border {form?.errors?.codigoBarras ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          {#if form?.errors?.codigoBarras}
            <p class="mt-1 text-xs text-red-600 font-medium">{form.errors.codigoBarras[0]}</p>
          {/if}
        </div>

        <div class="col-span-1 md:col-span-2">
            <label for="fabricante" class="block text-sm font-semibold text-slate-700 mb-1">Fabricante</label>
            <input
              type="text"
              id="fabricante"
              name="fabricante"
              value={form?.data?.fabricante ?? ''}
              placeholder="Ex: Pfizer, Bial"
              class="block w-full px-4 py-3 rounded-xl border {form?.errors?.fabricante ? 'border-red-500' : 'border-slate-300'} shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
            {#if form?.errors?.fabricante}
                <p class="mt-1 text-xs text-red-600 font-medium">{form.errors.fabricante[0]}</p>
            {/if}
          </div>
      </div>

      {#if form?.message}
        <div class="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-700 shadow-sm animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm font-medium">{form.message}</p>
        </div>
      {/if}

      <div class="pt-4 flex items-center justify-end space-x-4 border-t border-slate-100">
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
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
