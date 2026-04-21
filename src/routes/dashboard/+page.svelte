<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-slate-900">Inicial</h1>
    <p class="text-slate-500">
      Bem-vindo ao sistema de gestão de medicamentos. Aqui está o resumo do seu
      inventário.
    </p>
  </div>

  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
    <!-- Stat Card: Total Medications -->
    <div
      class="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center">
        <div class="shrink-0 bg-blue-100 rounded-lg p-3">
          <svg
            class="h-6 w-6 text-blue-600"
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
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-slate-500 truncate">
              Total Medicamentos
            </dt>
            <dd class="text-2xl font-bold text-slate-900 leading-tight">
              {data.stats.totalMedicamentos}
            </dd>
          </dl>
        </div>
      </div>
    </div>

    <!-- Stat Card: Total Lotes -->
    <div
      class="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center">
        <div class="shrink-0 bg-indigo-100 rounded-lg p-3">
          <svg
            class="h-6 w-6 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-slate-500 truncate">
              Total Lotes
            </dt>
            <dd class="text-2xl font-bold text-slate-900 leading-tight">
              {data.stats.totalLotes}
            </dd>
          </dl>
        </div>
      </div>
    </div>

    <!-- Stat Card: Stock Baixo -->
    <div
      class="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center">
        <div
          class="shrink-0 {data.stats.stockBaixo > 0
            ? 'bg-amber-100'
            : 'bg-slate-100'} rounded-lg p-3"
        >
          <svg
            class="h-6 w-6 {data.stats.stockBaixo > 0
              ? 'text-amber-600'
              : 'text-slate-600'}"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-slate-500 truncate">
              Stock Baixo
            </dt>
            <dd
              class="text-2xl font-bold {data.stats.stockBaixo > 0
                ? 'text-amber-600'
                : 'text-slate-900'} leading-tight"
            >
              {data.stats.stockBaixo}
            </dd>
          </dl>
        </div>
      </div>
    </div>

    <!-- Stat Card: Expirados -->
    <div
      class="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center">
        <div
          class="shrink-0 {data.stats.expirados > 0
            ? 'bg-red-100'
            : 'bg-slate-100'} rounded-lg p-3"
        >
          <svg
            class="h-6 w-6 {data.stats.expirados > 0
              ? 'text-red-600'
              : 'text-slate-600'}"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-slate-500 truncate">
              Expirados / Próx. Vencimento
            </dt>
            <dd
              class="text-2xl font-bold {data.stats.expirados > 0
                ? 'text-red-600'
                : 'text-slate-900'} leading-tight"
            >
              {data.stats.expirados}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Recent Medications -->
    <div
      class="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden"
    >
      <div
        class="px-6 py-4 border-b border-slate-200 flex justify-between items-center"
      >
        <h3 class="text-lg font-semibold text-slate-900">Produtos Recentes</h3>
        <a
          href="/medicamentos"
          class="text-sm font-medium text-blue-600 hover:text-blue-500"
          >Ver todos</a
        >
      </div>
      <div class="divide-y divide-slate-100">
        {#each data.recentMedicamentos as medicamento}
          <div class="px-6 py-4 hover:bg-slate-50 transition-colors">
            <div class="flex justify-between">
              <div>
                <p class="text-sm font-medium text-slate-900">
                  {medicamento.nome}
                </p>
                <p class="text-xs text-slate-500">
                  {medicamento.principioAtivo || "N/A"} - {medicamento.formaFarmaceutica ||
                    "N/A"}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-400">Cadastrado em</p>
                <p class="text-xs font-medium text-slate-700">
                  {new Date(medicamento.dataCadastro).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        {:else}
          <div class="px-6 py-12 text-center text-slate-500">
            Nenhum produto cadastrado ainda.
          </div>
        {/each}
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white shadow-sm rounded-xl border border-slate-200 p-6">
      <h3 class="text-lg font-semibold text-slate-900 mb-6">Ações Rápidas</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/medicamentos/novo"
          class="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
        >
          <div
            class="p-2 bg-blue-600 rounded-lg text-white group-hover:bg-blue-700 transition-colors"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <span class="ml-4 font-medium text-slate-700">Novo Produto</span>
        </a>
        <a
          href="/lotes"
          class="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
        >
          <div
            class="p-2 bg-slate-600 rounded-lg text-white group-hover:bg-slate-700 transition-colors"
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
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </div>
          <span class="ml-4 font-medium text-slate-700">Listar Estoque</span>
        </a>
      </div>
    </div>
  </div>
</div>
