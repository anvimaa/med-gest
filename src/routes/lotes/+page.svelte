<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";
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

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('pt-PT');
  }

  function isExpired(date: Date | string) {
    return new Date(date) < new Date();
  }

  function isExpiringSoon(date: Date | string) {
    const threeMonths = 3 * 30 * 24 * 60 * 60 * 1000;
    const diff = new Date(date).getTime() - new Date().getTime();
    return diff > 0 && diff < threeMonths;
  }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Lotes & Inventário</h1>
      <p class="text-slate-500">
        Gira os lotes de medicamentos, validades e quantidades em stock.
      </p>
    </div>
    {#if data.user?.role === 'admin'}
    <div class="mt-4 md:mt-0">
      <a
        href="/lotes/novo"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Entrada de Lote
      </a>
    </div>
    {/if}
  </div>

  <div class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
    <div class="p-4 border-b border-slate-200 bg-slate-50">
      <form
        method="GET"
        action="/lotes"
        class="flex items-center max-w-sm"
      >
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            bind:value={search}
            placeholder="Pesquisar por lote, medicamento..."
            class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          />
        </div>
        <button type="submit" class="hidden">Pesquisar</button>
      </form>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Medicamento / Lote</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Validade</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fornecedor</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          {#each data.lotes as lote}
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-slate-900">
                  {lote.medicamento.nome}
                </div>
                <div class="text-xs text-slate-500 font-mono">
                  Lote: {lote.numeroLote}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-sm {isExpired(lote.dataValidade) ? 'text-red-600 font-bold' : isExpiringSoon(lote.dataValidade) ? 'text-amber-600 font-semibold' : 'text-slate-700'}">
                    {formatDate(lote.dataValidade)}
                  </span>
                  {#if isExpired(lote.dataValidade)}
                    <span class="text-[10px] uppercase font-black text-red-500">Expirado</span>
                  {:else if isExpiringSoon(lote.dataValidade)}
                    <span class="text-[10px] uppercase font-black text-amber-500">Próximo da validade</span>
                  {/if}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold {lote.quantidadeAtual <= 5 ? 'text-red-600' : 'text-slate-900'}">
                  {lote.quantidadeAtual}
                </div>
                <div class="text-[10px] text-slate-400">
                  Inicial: {lote.quantidadeInicial}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {lote.fornecedor.nome}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  {#if data.user?.role === 'admin'}
                    <a
                      href="/lotes/{lote.id}/editar"
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
                  {/if}

                  <!-- Quick Actions -->
                  <a
                    href="/lotes/{lote.id}/movimentar"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                    title="Movimentar Stock (Entrada/Saída)"
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
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </a>

                  {#if data.user?.role === 'admin'}
                    <a
                      href="/lotes/{lote.id}/eliminar"
                      class="text-amber-600 hover:text-amber-900 p-1 rounded-md hover:bg-amber-50 transition-colors"
                      title="Eliminar Medicamento"
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
                    </a>
                    <form
                      method="POST"
                      action="?/delete"
                      use:enhance={() => {
                        return async ({ result, update }) => {
                          if (result.type === "success") {
                            toast.success("Lote apagado com sucesso!");
                          }
                          await update();
                        };
                      }}
                    >
                      <input type="hidden" name="id" value={lote.id} />
                      <button
                        type="submit"
                        class="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="Apagar"
                        onclick={(e) => {
                          if (
                            !confirm("Tem a certeza que deseja apagar este lote?")
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
                  {/if}
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center">
                  <svg class="h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p class="text-slate-500 text-lg font-medium">Nenhum lote encontrado.</p>
                  {#if search}
                    <button onclick={() => (search = "")} class="mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium">Limpar pesquisa</button>
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
