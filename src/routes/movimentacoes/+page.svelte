<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleString('pt-PT');
  }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-slate-900">Histórico de Movimentações</h1>
    <p class="text-slate-500">Consulte todas as entradas e saídas de stock efectuadas no sistema.</p>
  </div>

  <div class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data / Hora</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Medicamento / Lote</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qtd.</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Utilizador</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          {#each data.movimentacoes as mov}
            <tr class="hover:bg-slate-50 transition-colors text-sm">
              <td class="px-6 py-4 whitespace-nowrap text-slate-600">
                {formatDate(mov.dataMovimentacao)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-[10px] font-bold rounded-full {mov.tipoMovimentacao === "ENTRADA" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}">
                  {mov.tipoMovimentacao}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-900">{mov.lote.medicamento.nome}</div>
                <div class="text-xs text-slate-400 font-mono">Lote: {mov.lote.numeroLote}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap font-bold {mov.tipoMovimentacao === "ENTRADA" ? "text-green-600" : "text-blue-600"}">
                {mov.tipoMovimentacao === "ENTRADA" ? "+" : "-"}{mov.quantidade}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-slate-500">
                {mov.user.name}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                Nenhuma movimentação registada.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
