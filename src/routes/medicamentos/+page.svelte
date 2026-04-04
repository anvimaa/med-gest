<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";
  import { page } from "$app/state";

  import { toast } from "$lib/utils/toasts.svelte";
  let { data, form }: { data: PageData; form: ActionData } = $props();

  let search = $derived(data.search);

  $effect(() => {
    if (form?.message) {
      toast.error(form.message);
    } else if ((form as any)?.errors) {
      toast.error("Existem erros no formulário.");
    }
  });
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div
    class="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
  >
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Medicamentos</h1>
      <p class="text-slate-500">
        Gira o catálogo de medicamentos disponíveis no sistema.
      </p>
    </div>
    {#if data.user?.role === 'admin'}
    <div class="mt-4 md:mt-0">
      <a
        href="/medicamentos/novo"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Novo Medicamento
      </a>
    </div>
    {/if}
  </div>

  <div
    class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden"
  >
    <div class="p-4 border-b border-slate-200 bg-slate-50">
      <form
        method="GET"
        action="/medicamentos"
        class="flex items-center max-w-sm"
      >
        <div class="relative w-full">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              class="h-5 w-5 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            bind:value={search}
            placeholder="Pesquisar por nome, princípio ativo..."
            class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          />
        </div>
        <button type="submit" class="hidden">Pesquisar</button>
      </form>
    </div>

    {#if form?.message}
      <div class="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm">
        {form.message}
      </div>
    {/if}

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >Nome</th
            >
            <th
              class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >Princípio Ativo</th
            >
            <th
              class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >Forma / Conc.</th
            >
            <th
              class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >Cód. Barras</th
            >
            <th
              class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
              >Ações</th
            >
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          {#each data.medicamentos as medicamento}
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-3">
                  <div class="shrink-0 h-10 w-10">
                    {#if medicamento.imagemUrl}
                      <img class="h-10 w-10 rounded-lg object-cover border border-slate-200" src={medicamento.imagemUrl} alt={medicamento.nome} />
                    {:else}
                      <div class="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                        <svg class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    {/if}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-slate-900">
                      {medicamento.nome}
                    </div>
                    <div class="text-xs text-slate-500 truncate max-w-xs">
                      {medicamento.fabricante || "Sem fabricante"}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700"
                >
                  {medicamento.principioAtivo || "N/A"}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-600">
                  {medicamento.formaFarmaceutica || "N/A"}
                </div>
                <div class="text-xs text-slate-400">
                  {medicamento.concentracao || ""}
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono"
              >
                {medicamento.codigoBarras || "-"}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                {#if data.user?.role === 'admin'}
                <div class="flex justify-end space-x-2">
                  <a
                    href="/medicamentos/{medicamento.id}/editar"
                    class="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                    title="Editar"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </a>
                  <form
                    method="POST"
                    action="?/delete"
                    use:enhance={() => {
                      return async ({ result, update }) => {
                        if (result.type === "success") {
                          toast.success("Medicamento apagado com sucesso!");
                        }
                        await update();
                      };
                    }}
                  >
                    <input type="hidden" name="id" value={medicamento.id} />
                    <button
                      type="submit"
                      class="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Apagar"
                      onclick={(e) => {
                        if (
                          !confirm(
                            "Tem a certeza que deseja apagar este medicamento?",
                          )
                        )
                          e.preventDefault();
                      }}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </form>
                </div>
                {:else}
                  <span class="text-slate-400 italic text-xs">Visualização apenas</span>
                {/if}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center">
                  <svg
                    class="h-12 w-12 text-slate-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p class="text-slate-500 text-lg font-medium">
                    Nenhum medicamento encontrado.
                  </p>
                  {#if search}
                    <button
                      onclick={() => (search = "")}
                      class="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >Limpar pesquisa</button
                    >
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
