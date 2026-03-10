<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleString('pt-PT');
  }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-slate-900">Registro de Eliminações</h1>
    <p class="text-slate-500">Consulte todos os medicamentos eliminados do stock e os respetivos motivos.</p>
  </div>

  <div class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data / Hora</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Medicamento / Lote</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qtd.</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Motivo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Utilizador</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          {#each data.eliminacoes as elim}
            <tr class="hover:bg-slate-50 transition-colors text-sm">
              <td class="px-6 py-4 whitespace-nowrap text-slate-600">
                {formatDate(elim.dataEliminacao)}
              </td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-900">{elim.lote.medicamento.nome}</div>
                <div class="text-xs text-slate-400 font-mono">Lote: {elim.lote.numeroLote}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap font-bold text-red-600">
                -{elim.quantidade}
              </td>
              <td class="px-6 py-4 text-slate-600 max-w-xs truncate">
                {elim.motivo}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-slate-500">
                {elim.user.name}
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                Nenhuma eliminação registada.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
