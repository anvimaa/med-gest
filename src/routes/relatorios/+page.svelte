<script lang="ts">
  import { goto } from "$app/navigation";
  import { gerarPDF } from "$lib/utils/pdfGenerator.js";

  // Lucide Icons
  import {
    FileText,
    Printer,
    Download,
    FileDown,
    ListFilter,
    Calendar,
    Search,
    X,
    LayoutDashboard,
    Package,
    ArrowLeftRight,
    Trash2,
    BookAlert,
    Building2,
    Pill,
    Boxes,
    TrendingDown,
    ArrowDownToLine,
    ArrowUpFromLine,
    Check,
    CircleX,
    Clock,
    User,
    Hash,
    Activity,
    ChevronDown,
    Inbox,
    ShieldAlert,
    PackageX,
    CalendarX,
    CalendarClock,
    PackageMinus,
    ChartArea,
    ChartBarBig,
    ExternalLink,
    RefreshCw,
  } from "@lucide/svelte/icons";

  // Props do servidor
  let { data } = $props();

  // Estados reativos com $state
  let tipoRelatorio = $derived(data.filtros.tipoRelatorio);
  let dataInicio = $derived(data.filtros.dataInicio);
  let dataFim = $derived(data.filtros.dataFim);
  let medicamentoId = $derived(data.filtros.medicamentoId);
  let fornecedorId = $derived(data.filtros.fornecedorId);

  let showPdfMenu = $state(false);
  let isGeneratingPdf = $state(false);
  let isLoading = $state(false);

  // Definição das abas
  const abas = [
    { id: "geral", label: "Resumo Geral", icon: LayoutDashboard },
    { id: "estoque", label: "Estoque", icon: Package },
    { id: "movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
    { id: "eliminacoes", label: "Abates", icon: Trash2 },
    { id: "alertas", label: "Alertas", icon: BookAlert },
    { id: "fornecedores", label: "Fornecedores", icon: Building2 },
  ] as const;

  // Opções de exportação PDF
  const opcoesExportacao = [
    {
      id: "completo",
      label: "Relatório Completo",
      icon: FileText,
      desc: "Todos os dados",
    },
    {
      id: "resumo",
      label: "Resumo Geral",
      icon: LayoutDashboard,
      desc: "Visão geral",
    },
    { id: "estoque", label: "Estoque", icon: Package, desc: "Por medicamento" },
    {
      id: "movimentacoes",
      label: "Movimentações",
      icon: ArrowLeftRight,
      desc: "Entradas e saídas",
    },
    {
      id: "eliminacoes",
      label: "Abates",
      icon: Trash2,
      desc: "Registros de descarte",
    },
    {
      id: "alertas",
      label: "Alertas",
      icon: BookAlert,
      desc: "Vencimentos e estoque baixo",
    },
    {
      id: "fornecedores",
      label: "Fornecedores",
      icon: Building2,
      desc: "Por fornecedor",
    },
  ] as const;

  // Valores derivados com $derived
  let totalAlertas = $derived(
    data.lotesVencidos.length +
      data.lotesProximosVencimento.length +
      data.estoqueBaixo.length,
  );

  let abaAtual = $derived(abas.find((a) => a.id === tipoRelatorio) || abas[0]);

  let filtrosAtivos = $derived(
    !!(dataInicio || dataFim || medicamentoId || fornecedorId),
  );

  // Funções
  async function aplicarFiltros() {
    isLoading = true;
    const params = new URLSearchParams();
    if (tipoRelatorio) params.set("tipo", tipoRelatorio);
    if (dataInicio) params.set("dataInicio", dataInicio);
    if (dataFim) params.set("dataFim", dataFim);
    if (medicamentoId) params.set("medicamentoId", medicamentoId);
    if (fornecedorId) params.set("fornecedorId", fornecedorId);
    await goto(`/relatorios?${params.toString()}`);
    isLoading = false;
  }

  async function limparFiltros() {
    tipoRelatorio = "geral";
    dataInicio = "";
    dataFim = "";
    medicamentoId = "";
    fornecedorId = "";
    await goto("/relatorios");
  }

  async function mudarAba(novaAba: string) {
    tipoRelatorio = novaAba;
    await aplicarFiltros();
  }

  async function exportarPDF(tipo: string, abrirNovaAba: boolean = false) {
    isGeneratingPdf = true;
    showPdfMenu = false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      gerarPDF(data as any, tipo as any, {
        nomeEmpresa: "SIGMED - Sistema Integrado de Gestão de Medicamentos",
        abrirNovaAba,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      isGeneratingPdf = false;
    }
  }

  function exportarPDFAtual() {
    const mapaAbas: Record<string, string> = {
      geral: "resumo",
      estoque: "estoque",
      movimentacoes: "movimentacoes",
      eliminacoes: "eliminacoes",
      alertas: "alertas",
      fornecedores: "fornecedores",
    };
    exportarPDF(mapaAbas[tipoRelatorio] || "completo");
  }

  function fecharMenuPdf(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(".pdf-menu-container")) {
      showPdfMenu = false;
    }
  }

  function imprimirRelatorio() {
    window.print();
  }

  // Funções de formatação
  function formatarData(dateStr: string | Date): string {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatarDataHora(dateStr: string | Date): string {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function diasParaVencer(dataValidade: string | Date): number {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diff = validade.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function calcularTotalEstoque(lotes: { quantidadeAtual: number }[]): number {
    return lotes.reduce((acc, l) => acc + l.quantidadeAtual, 0);
  }

  function getStatusClass(dias: number, quantidade: number): string {
    if (quantidade === 0) return "bg-gray-100 text-gray-600";
    if (dias < 0) return "bg-red-100 text-red-700";
    if (dias <= 30) return "bg-orange-100 text-orange-700";
    return "bg-green-100 text-green-700";
  }

  function getQuantidadeClass(qtd: number): string {
    if (qtd === 0) return "text-red-600";
    if (qtd <= 10) return "text-orange-600";
    return "text-gray-900";
  }
</script>

<svelte:window onclick={fecharMenuPdf} />

<svelte:head>
  <title>Relatórios - Sistema de Estoque</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- ================================================ -->
  <!-- CABEÇALHO -->
  <!-- ================================================ -->
  <header class="bg-white shadow print:shadow-none">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <!-- Título -->
        <div class="flex items-center gap-3">
          <div
            class="rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 p-2.5 shadow-lg shadow-indigo-200"
          >
            <ChartArea class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p class="text-sm text-gray-500">
              Análise completa do estoque de medicamentos
            </p>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="flex items-center gap-3 print:hidden">
          <!-- Botão Imprimir -->
          <button
            onclick={imprimirRelatorio}
            class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300
						       bg-white px-4 py-2.5 text-sm font-medium text-gray-700
						       shadow-sm transition hover:bg-gray-50 hover:border-gray-400
						       active:scale-95"
          >
            <Printer class="h-4 w-4" />
            <span class="hidden sm:inline">Imprimir</span>
          </button>

          <!-- Dropdown Exportar PDF -->
          <div class="pdf-menu-container relative">
            <button
              onclick={(e) => {
                e.stopPropagation();
                showPdfMenu = !showPdfMenu;
              }}
              disabled={isGeneratingPdf}
              class="inline-flex cursor-pointer items-center gap-2 rounded-lg
							       bg-linear-to-r from-indigo-600 to-indigo-700 px-4 py-2.5
							       text-sm font-medium text-white shadow-lg shadow-indigo-200
							       transition hover:from-indigo-700 hover:to-indigo-800
							       active:scale-95 disabled:cursor-wait disabled:opacity-70"
            >
              {#if isGeneratingPdf}
                <RefreshCw class="h-4 w-4 animate-spin" />
                Gerando...
              {:else}
                <Download class="h-4 w-4" />
                Exportar PDF
                <ChevronDown
                  class="h-4 w-4 transition-transform {showPdfMenu
                    ? 'rotate-180'
                    : ''}"
                />
              {/if}
            </button>

            <!-- Menu Dropdown -->
            {#if showPdfMenu}
              <div
                class="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl
								       border border-gray-200 bg-white py-2 shadow-2xl
								       animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div class="border-b border-gray-100 px-4 py-2">
                  <p
                    class="text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Selecione o tipo de relatório
                  </p>
                </div>

                <div class="max-h-80 overflow-y-auto py-1">
                  {#each opcoesExportacao as opcao}
                    <button
                      onclick={() => exportarPDF(opcao.id)}
                      class="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5
											       text-left transition hover:bg-indigo-50"
                    >
                      <div class="rounded-lg bg-indigo-100 p-2">
                        <opcao.icon class="h-4 w-4 text-indigo-600" />
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">
                          {opcao.label}
                        </p>
                        <p class="text-xs text-gray-500">{opcao.desc}</p>
                      </div>
                      <FileDown class="h-4 w-4 text-gray-400" />
                    </button>
                  {/each}
                </div>

                <div class="border-t border-gray-100 px-3 pt-2 pb-1">
                  <button
                    onclick={() => exportarPDF("completo", true)}
                    class="flex w-full cursor-pointer items-center justify-center gap-2
										       rounded-lg bg-indigo-50 px-3 py-2.5 text-sm font-medium
										       text-indigo-600 transition hover:bg-indigo-100"
                  >
                    <ExternalLink class="h-4 w-4" />
                    Abrir em nova aba
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- ================================================ -->
    <!-- FILTROS -->
    <!-- ================================================ -->
    <section
      class="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:hidden"
    >
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ListFilter class="h-5 w-5 text-indigo-500" />
          <h2 class="text-lg font-semibold text-gray-800">Filtros</h2>
          {#if filtrosAtivos}
            <span
              class="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
            >
              Ativos
            </span>
          {/if}
        </div>
        {#if filtrosAtivos}
          <button
            onclick={limparFiltros}
            class="flex cursor-pointer items-center gap-1 text-sm text-gray-500
						       transition hover:text-red-600"
          >
            <X class="h-4 w-4" />
            Limpar filtros
          </button>
        {/if}
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <!-- Data Início -->
        <div class="space-y-1.5">
          <label
            for="dataInicio"
            class="flex items-center gap-1.5 text-sm font-medium text-gray-700"
          >
            <Calendar class="h-4 w-4 text-gray-400" />
            Data Início
          </label>
          <input
            type="date"
            id="dataInicio"
            bind:value={dataInicio}
            class="block w-full rounded-lg border border-gray-300 px-3 py-2.5
						       text-sm shadow-sm transition
						       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
						       focus:outline-none"
          />
        </div>

        <!-- Data Fim -->
        <div class="space-y-1.5">
          <label
            for="dataFim"
            class="flex items-center gap-1.5 text-sm font-medium text-gray-700"
          >
            <Calendar class="h-4 w-4 text-gray-400" />
            Data Fim
          </label>
          <input
            type="date"
            id="dataFim"
            bind:value={dataFim}
            class="block w-full rounded-lg border border-gray-300 px-3 py-2.5
						       text-sm shadow-sm transition
						       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
						       focus:outline-none"
          />
        </div>

        <!-- Medicamento -->
        <div class="space-y-1.5">
          <label
            for="medicamentoId"
            class="flex items-center gap-1.5 text-sm font-medium text-gray-700"
          >
            <Pill class="h-4 w-4 text-gray-400" />
            Medicamento
          </label>
          <select
            id="medicamentoId"
            bind:value={medicamentoId}
            class="block w-full rounded-lg border border-gray-300 px-3 py-2.5
						       text-sm shadow-sm transition
						       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
						       focus:outline-none"
          >
            <option value="">Todos</option>
            {#each data.medicamentos as med}
              <option value={med.id}>{med.nome}</option>
            {/each}
          </select>
        </div>

        <!-- Fornecedor -->
        <div class="space-y-1.5">
          <label
            for="fornecedorId"
            class="flex items-center gap-1.5 text-sm font-medium text-gray-700"
          >
            <Building2 class="h-4 w-4 text-gray-400" />
            Fornecedor
          </label>
          <select
            id="fornecedorId"
            bind:value={fornecedorId}
            class="block w-full rounded-lg border border-gray-300 px-3 py-2.5
						       text-sm shadow-sm transition
						       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
						       focus:outline-none"
          >
            <option value="">Todos</option>
            {#each data.fornecedores as forn}
              <option value={forn.id}>{forn.nome}</option>
            {/each}
          </select>
        </div>

        <!-- Botão Filtrar -->
        <div class="flex items-end">
          <button
            onclick={aplicarFiltros}
            disabled={isLoading}
            class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg
						       bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white
						       shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]
						       disabled:cursor-wait disabled:opacity-70"
          >
            {#if isLoading}
              <RefreshCw class="h-4 w-4 animate-spin" />
            {:else}
              <Search class="h-4 w-4" />
            {/if}
            Filtrar
          </button>
        </div>
      </div>
    </section>

    <!-- ================================================ -->
    <!-- NAVEGAÇÃO POR ABAS -->
    <!-- ================================================ -->
    <section
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden"
    >
      <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
      <nav class="flex flex-wrap gap-2" role="tablist">
        {#each abas as aba}
          {@const isActive = tipoRelatorio === aba.id}
          <button
            onclick={() => mudarAba(aba.id)}
            role="tab"
            aria-selected={isActive}
            class="inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5
						       text-sm font-medium transition-all duration-200
						       {isActive
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]'
              : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'}"
          >
            <aba.icon class="h-4 w-4" />
            {aba.label}
            {#if aba.id === "alertas" && totalAlertas > 0}
              <span
                class="rounded-full {isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-red-100 text-red-700'} 
							       px-1.5 py-0.5 text-xs font-bold"
              >
                {totalAlertas}
              </span>
            {/if}
          </button>
        {/each}
      </nav>

      <!-- Exportação rápida -->
      <button
        onclick={exportarPDFAtual}
        disabled={isGeneratingPdf}
        class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-indigo-200
				       bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600
				       transition hover:bg-indigo-100 hover:border-indigo-300
				       disabled:opacity-50 active:scale-95"
      >
        <FileDown class="h-4 w-4" />
        Exportar "{abaAtual.label}"
      </button>
    </section>

    <!-- ================================================ -->
    <!-- CONTEÚDO DAS ABAS -->
    <!-- ================================================ -->

    <!-- RESUMO GERAL -->
    {#if tipoRelatorio === "geral"}
      <div class="space-y-8 animate-in fade-in duration-300">
        <!-- Cards de Resumo -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Card Medicamentos -->
          <div
            class="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm
					           transition hover:border-indigo-200 hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500">Medicamentos</p>
                <p class="mt-1 text-3xl font-bold text-gray-900">
                  {data.resumo.totalMedicamentos}
                </p>
              </div>
              <div
                class="rounded-xl bg-blue-50 p-3 transition group-hover:bg-blue-100"
              >
                <Pill class="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <!-- Card Estoque -->
          <div
            class="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm
					           transition hover:border-green-200 hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500">Estoque Total</p>
                <p class="mt-1 text-3xl font-bold text-gray-900">
                  {data.resumo.estoqueTotal.toLocaleString("pt-BR")}
                </p>
                <p class="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <Boxes class="h-3 w-3" />
                  {data.resumo.totalLotes} lotes
                </p>
              </div>
              <div
                class="rounded-xl bg-green-50 p-3 transition group-hover:bg-green-100"
              >
                <Package class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <!-- Card Fornecedores -->
          <div
            class="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm
					           transition hover:border-purple-200 hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500">Fornecedores</p>
                <p class="mt-1 text-3xl font-bold text-gray-900">
                  {data.resumo.totalFornecedores}
                </p>
              </div>
              <div
                class="rounded-xl bg-purple-50 p-3 transition group-hover:bg-purple-100"
              >
                <Building2 class="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <!-- Card Alertas -->
          <div
            class="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm
					           transition hover:border-red-200 hover:shadow-md
					           {totalAlertas > 0 ? 'border-red-200 bg-red-50/30' : ''}"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500">Alertas Ativos</p>
                <p
                  class="mt-1 text-3xl font-bold {totalAlertas > 0
                    ? 'text-red-600'
                    : 'text-green-600'}"
                >
                  {totalAlertas}
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  {totalAlertas > 0 ? "Requerem atenção" : "Tudo em ordem"}
                </p>
              </div>
              <div
                class="rounded-xl {totalAlertas > 0
                  ? 'bg-red-100'
                  : 'bg-green-100'} p-3 transition"
              >
                {#if totalAlertas > 0}
                  <ShieldAlert class="h-6 w-6 text-red-600" />
                {:else}
                  <Check class="h-6 w-6 text-green-600" />
                {/if}
              </div>
            </div>
          </div>
        </div>

        <!-- Cards de Movimentação -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <!-- Entradas -->
          <div
            class="rounded-xl border border-green-200 bg-linear-to-br from-green-50 to-emerald-50 p-6"
          >
            <div class="flex items-center gap-4">
              <div class="rounded-full bg-green-100 p-3 shadow-sm">
                <ArrowDownToLine class="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-green-800">Entradas</p>
                <p class="text-2xl font-bold text-green-900">
                  +{data.resumo.totalEntradas.toLocaleString("pt-BR")}
                </p>
                <p class="flex items-center gap-1 text-xs text-green-600">
                  <Activity class="h-3 w-3" />
                  {data.resumo.countEntradas} movimentações
                </p>
              </div>
            </div>
          </div>

          <!-- Saídas -->
          <div
            class="rounded-xl border border-orange-200 bg-linear-to-br from-orange-50 to-amber-50 p-6"
          >
            <div class="flex items-center gap-4">
              <div class="rounded-full bg-orange-100 p-3 shadow-sm">
                <ArrowUpFromLine class="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-orange-800">Saídas</p>
                <p class="text-2xl font-bold text-orange-900">
                  -{data.resumo.totalSaidas.toLocaleString("pt-BR")}
                </p>
                <p class="flex items-center gap-1 text-xs text-orange-600">
                  <Activity class="h-3 w-3" />
                  {data.resumo.countSaidas} movimentações
                </p>
              </div>
            </div>
          </div>

          <!-- Abates -->
          <div
            class="rounded-xl border border-red-200 bg-linear-to-br from-red-50 to-rose-50 p-6"
          >
            <div class="flex items-center gap-4">
              <div class="rounded-full bg-red-100 p-3 shadow-sm">
                <Trash2 class="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p class="text-sm font-medium text-red-800">Abates</p>
                <p class="text-2xl font-bold text-red-900">
                  -{data.resumo.totalEliminacoes.toLocaleString("pt-BR")}
                </p>
                <p class="flex items-center gap-1 text-xs text-red-600">
                  <FileText class="h-3 w-3" />
                  {data.resumo.countEliminacoes} registros
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Painel de Alertas Rápido -->
        {#if totalAlertas > 0}
          <div
            class="rounded-xl border-2 border-red-200 bg-linear-to-r from-red-50 via-orange-50 to-yellow-50 p-6"
          >
            <div class="mb-4 flex items-center gap-2">
              <BookAlert class="h-5 w-5 text-red-600" />
              <h3 class="text-lg font-semibold text-red-800">
                Atenção Necessária
              </h3>
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onclick={() => mudarAba("alertas")}
                class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/80 p-4
								       transition hover:bg-white hover:shadow-md"
              >
                <CircleX class="h-5 w-5 text-red-500" />
                <div class="text-left">
                  <p class="text-sm font-semibold text-red-700">
                    {data.lotesVencidos.length} lote(s) vencido(s)
                  </p>
                  <p class="text-xs text-gray-500">Necessitam de abate</p>
                </div>
              </button>
              <button
                onclick={() => mudarAba("alertas")}
                class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/80 p-4
								       transition hover:bg-white hover:shadow-md"
              >
                <Clock class="h-5 w-5 text-orange-500" />
                <div class="text-left">
                  <p class="text-sm font-semibold text-orange-700">
                    {data.lotesProximosVencimento.length} próximo(s) do vencimento
                  </p>
                  <p class="text-xs text-gray-500">Nos próximos 30 dias</p>
                </div>
              </button>
              <button
                onclick={() => mudarAba("alertas")}
                class="flex cursor-pointer items-center gap-3 rounded-lg bg-white/80 p-4
								       transition hover:bg-white hover:shadow-md"
              >
                <TrendingDown class="h-5 w-5 text-yellow-600" />
                <div class="text-left">
                  <p class="text-sm font-semibold text-yellow-700">
                    {data.estoqueBaixo.length} com estoque baixo
                  </p>
                  <p class="text-xs text-gray-500">≤ 10 unidades</p>
                </div>
              </button>
            </div>
          </div>
        {:else}
          <div class="rounded-xl border border-green-200 bg-green-50 p-6">
            <div class="flex items-center gap-3">
              <Check class="h-6 w-6 text-green-600" />
              <div>
                <p class="font-semibold text-green-800">Tudo em ordem!</p>
                <p class="text-sm text-green-600">
                  Não há alertas ativos no momento.
                </p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- ESTOQUE POR MEDICAMENTO -->
    {#if tipoRelatorio === "estoque"}
      <div class="space-y-6 animate-in fade-in duration-300">
        <div class="flex items-center gap-2">
          <Package class="h-6 w-6 text-indigo-500" />
          <h2 class="text-xl font-bold text-gray-900">
            Estoque por Medicamento
          </h2>
          <span
            class="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
          >
            {data.estoquePorMedicamento.length} medicamento(s)
          </span>
        </div>

        {#each data.estoquePorMedicamento as med, index}
          {@const totalEstoque = calcularTotalEstoque(med.lotes)}
          <article
            class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm
					               transition hover:shadow-md"
          >
            <!-- Cabeçalho do Medicamento -->
            <header
              class="border-b border-gray-100 bg-linear-to-r from-gray-50 to-white px-6 py-4"
            >
              <div
                class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="flex items-start gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-lg
									           bg-indigo-100 text-sm font-bold text-indigo-600"
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      {med.nome}
                    </h3>
                    <div class="mt-1 flex flex-wrap gap-2">
                      {#if med.principioAtivo}
                        <span
                          class="inline-flex items-center rounded-full bg-blue-100
												       px-2.5 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {med.principioAtivo}
                        </span>
                      {/if}
                      {#if med.formaFarmaceutica}
                        <span
                          class="inline-flex items-center rounded-full bg-purple-100
												       px-2.5 py-0.5 text-xs font-medium text-purple-700"
                        >
                          {med.formaFarmaceutica}
                        </span>
                      {/if}
                      {#if med.concentracao}
                        <span
                          class="inline-flex items-center rounded-full bg-green-100
												       px-2.5 py-0.5 text-xs font-medium text-green-700"
                        >
                          {med.concentracao}
                        </span>
                      {/if}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">Estoque Total</p>
                  <p
                    class="text-2xl font-bold {getQuantidadeClass(
                      totalEstoque,
                    )}"
                  >
                    {totalEstoque.toLocaleString("pt-BR")}
                  </p>
                  <p
                    class="flex items-center justify-end gap-1 text-xs text-gray-400"
                  >
                    <Boxes class="h-3 w-3" />
                    {med.lotes.length} lote(s)
                  </p>
                </div>
              </div>
            </header>

            <!-- Tabela de Lotes -->
            {#if med.lotes.length > 0}
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-100 bg-gray-50/80">
                      <th class="px-6 py-3 text-left font-medium text-gray-500">
                        <span class="flex items-center gap-1.5">
                          <Hash class="h-3.5 w-3.5" />
                          Lote
                        </span>
                      </th>
                      <th class="px-6 py-3 text-left font-medium text-gray-500">
                        <span class="flex items-center gap-1.5">
                          <Building2 class="h-3.5 w-3.5" />
                          Fornecedor
                        </span>
                      </th>
                      <th
                        class="px-6 py-3 text-center font-medium text-gray-500"
                        >Inicial</th
                      >
                      <th
                        class="px-6 py-3 text-center font-medium text-gray-500"
                        >Atual</th
                      >
                      <th
                        class="px-6 py-3 text-center font-medium text-gray-500"
                      >
                        <span class="flex items-center justify-center gap-1.5">
                          <Calendar class="h-3.5 w-3.5" />
                          Validade
                        </span>
                      </th>
                      <th
                        class="px-6 py-3 text-center font-medium text-gray-500"
                        >Status</th
                      >
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    {#each med.lotes as lote}
                      {@const dias = diasParaVencer(lote.dataValidade)}
                      <tr class="transition hover:bg-indigo-50/30">
                        <td
                          class="px-6 py-3.5 font-mono font-medium text-gray-900"
                        >
                          {lote.numeroLote}
                        </td>
                        <td class="px-6 py-3.5 text-gray-600">
                          {lote.fornecedor.nome}
                        </td>
                        <td class="px-6 py-3.5 text-center text-gray-500">
                          {lote.quantidadeInicial}
                        </td>
                        <td
                          class="px-6 py-3.5 text-center font-semibold {getQuantidadeClass(
                            lote.quantidadeAtual,
                          )}"
                        >
                          {lote.quantidadeAtual}
                        </td>
                        <td class="px-6 py-3.5 text-center text-gray-600">
                          {formatarData(lote.dataValidade)}
                        </td>
                        <td class="px-6 py-3.5 text-center">
                          <span
                            class="inline-flex items-center gap-1 rounded-full px-2.5 py-1
													       text-xs font-medium {getStatusClass(dias, lote.quantidadeAtual)}"
                          >
                            {#if lote.quantidadeAtual === 0}
                              <PackageX class="h-3 w-3" />
                              Esgotado
                            {:else if dias < 0}
                              <CircleX class="h-3 w-3" />
                              Vencido
                            {:else if dias <= 30}
                              <Clock class="h-3 w-3" />
                              {dias}d
                            {:else}
                              <Check class="h-3 w-3" />
                              Válido
                            {/if}
                          </span>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <div
                class="flex flex-col items-center justify-center px-6 py-12 text-gray-400"
              >
                <Inbox class="h-12 w-12 text-gray-300" />
                <p class="mt-2 font-medium">Nenhum lote registrado</p>
              </div>
            {/if}
          </article>
        {/each}

        {#if data.estoquePorMedicamento.length === 0}
          <div
            class="flex flex-col items-center justify-center rounded-xl bg-white p-16 shadow-sm"
          >
            <Inbox class="h-16 w-16 text-gray-300" />
            <p class="mt-4 text-lg font-medium text-gray-500">
              Nenhum medicamento encontrado
            </p>
            <p class="text-sm text-gray-400">
              Ajuste os filtros para ver resultados
            </p>
          </div>
        {/if}
      </div>
    {/if}

    <!-- MOVIMENTAÇÕES -->
    {#if tipoRelatorio === "movimentacoes"}
      <div class="space-y-6 animate-in fade-in duration-300">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-2">
            <ArrowLeftRight class="h-6 w-6 text-indigo-500" />
            <h2 class="text-xl font-bold text-gray-900">Movimentações</h2>
          </div>
          <div class="flex gap-3">
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-green-100
						       px-3 py-1.5 text-sm font-medium text-green-700"
            >
              <ArrowDownToLine class="h-4 w-4" />
              Entradas: +{data.resumo.totalEntradas.toLocaleString("pt-BR")}
            </span>
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-orange-100
						       px-3 py-1.5 text-sm font-medium text-orange-700"
            >
              <ArrowUpFromLine class="h-4 w-4" />
              Saídas: -{data.resumo.totalSaidas.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          {#if data.movimentacoes.length > 0}
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50">
                    <th class="px-6 py-3.5 text-left font-medium text-gray-500">
                      <span class="flex items-center gap-1.5">
                        <Calendar class="h-3.5 w-3.5" />
                        Data/Hora
                      </span>
                    </th>
                    <th class="px-6 py-3.5 text-left font-medium text-gray-500"
                      >Tipo</th
                    >
                    <th class="px-6 py-3.5 text-left font-medium text-gray-500">
                      <span class="flex items-center gap-1.5">
                        <Pill class="h-3.5 w-3.5" />
                        Medicamento
                      </span>
                    </th>
                    <th class="px-6 py-3.5 text-left font-medium text-gray-500">
                      <span class="flex items-center gap-1.5">
                        <Hash class="h-3.5 w-3.5" />
                        Lote
                      </span>
                    </th>
                    <th
                      class="px-6 py-3.5 text-center font-medium text-gray-500"
                      >Qtd.</th
                    >
                    <th class="px-6 py-3.5 text-left font-medium text-gray-500">
                      <span class="flex items-center gap-1.5">
                        <User class="h-3.5 w-3.5" />
                        Responsável
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  {#each data.movimentacoes as mov}
                    {@const isEntrada = mov.tipoMovimentacao === "ENTRADA"}
                    <tr class="transition hover:bg-gray-50">
                      <td class="whitespace-nowrap px-6 py-3.5 text-gray-600">
                        {formatarDataHora(mov.dataMovimentacao)}
                      </td>
                      <td class="px-6 py-3.5">
                        <span
                          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
												       text-xs font-medium
												       {isEntrada
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'}"
                        >
                          {#if isEntrada}
                            <ArrowDownToLine class="h-3 w-3" />
                            Entrada
                          {:else}
                            <ArrowUpFromLine class="h-3 w-3" />
                            Saída
                          {/if}
                        </span>
                      </td>
                      <td class="px-6 py-3.5 font-medium text-gray-900">
                        {mov.lote.medicamento.nome}
                      </td>
                      <td class="px-6 py-3.5 font-mono text-gray-600">
                        {mov.lote.numeroLote}
                      </td>
                      <td
                        class="px-6 py-3.5 text-center font-bold
											   {isEntrada ? 'text-green-600' : 'text-orange-600'}"
                      >
                        {isEntrada ? "+" : "-"}{mov.quantidade}
                      </td>
                      <td class="px-6 py-3.5 text-gray-600">
                        <span class="flex items-center gap-1.5">
                          <User class="h-3.5 w-3.5 text-gray-400" />
                          {mov.user.name || mov.user.email}
                        </span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div
              class="flex flex-col items-center justify-center px-6 py-16 text-gray-400"
            >
              <Inbox class="h-12 w-12 text-gray-300" />
              <p class="mt-2 text-lg font-medium">
                Nenhuma movimentação encontrada
              </p>
              <p class="text-sm">Ajuste os filtros para ver resultados</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Abates -->
    {#if tipoRelatorio === "eliminacoes"}
      <div class="space-y-6 animate-in fade-in duration-300">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-2">
            <Trash2 class="h-6 w-6 text-red-500" />
            <h2 class="text-xl font-bold text-gray-900">Abates</h2>
          </div>
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-red-100
					       px-3 py-1.5 text-sm font-medium text-red-700"
          >
            <PackageMinus class="h-4 w-4" />
            Total: {data.resumo.totalEliminacoes.toLocaleString("pt-BR")} unidades
          </span>
        </div>

        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          {#if data.eliminacoes.length > 0}
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200 bg-red-50">
                    <th class="px-6 py-3.5 text-left font-medium text-gray-600">
                      <span class="flex items-center gap-1.5">
                        <Calendar class="h-3.5 w-3.5" />
                        Data/Hora
                      </span>
                    </th>
                    <th class="px-6 py-3.5 text-left font-medium text-gray-600">
                      <span class="flex items-center gap-1.5">
                        <Pill class="h-3.5 w-3.5" />
                        Medicamento
                      </span>
                    </th>
                    <th class="px-6 py-3.5 text-left font-medium text-gray-600">
                      <span class="flex items-center gap-1.5">
                        <Hash class="h-3.5 w-3.5" />
                        Lote
                      </span>
                    </th>
                    <th
                      class="px-6 py-3.5 text-center font-medium text-gray-600"
                      >Qtd.</th
                    >
                    <th class="px-6 py-3.5 text-left font-medium text-gray-600">
                      <span class="flex items-center gap-1.5">
                        <BookAlert class="h-3.5 w-3.5" />
                        Motivo
                      </span>
                    </th>
                    <th class="px-6 py-3.5 text-left font-medium text-gray-600">
                      <span class="flex items-center gap-1.5">
                        <User class="h-3.5 w-3.5" />
                        Responsável
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  {#each data.eliminacoes as elim}
                    <tr class="transition hover:bg-red-50/50">
                      <td class="whitespace-nowrap px-6 py-3.5 text-gray-600">
                        {formatarDataHora(elim.dataEliminacao)}
                      </td>
                      <td class="px-6 py-3.5 font-medium text-gray-900">
                        {elim.lote.medicamento.nome}
                      </td>
                      <td class="px-6 py-3.5 font-mono text-gray-600">
                        {elim.lote.numeroLote}
                      </td>
                      <td
                        class="px-6 py-3.5 text-center font-bold text-red-600"
                      >
                        -{elim.quantidade}
                      </td>
                      <td class="max-w-xs px-6 py-3.5">
                        <span
                          class="inline-flex items-center rounded-full bg-red-100
												       px-2.5 py-1 text-xs font-medium text-red-700"
                        >
                          {elim.motivo}
                        </span>
                      </td>
                      <td class="px-6 py-3.5 text-gray-600">
                        <span class="flex items-center gap-1.5">
                          <User class="h-3.5 w-3.5 text-gray-400" />
                          {elim.user.name || elim.user.email}
                        </span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div
              class="flex flex-col items-center justify-center px-6 py-16 text-green-500"
            >
              <Check class="h-12 w-12 text-green-300" />
              <p class="mt-2 text-lg font-medium">
                Nenhum abate registrada
              </p>
              <p class="text-sm text-gray-400">No período selecionado</p>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- ALERTAS -->
    {#if tipoRelatorio === "alertas"}
      <div class="space-y-8 animate-in fade-in duration-300">
        <div class="flex items-center gap-2">
          <BookAlert class="h-6 w-6 text-red-500" />
          <h2 class="text-xl font-bold text-gray-900">Painel de Alertas</h2>
          {#if totalAlertas > 0}
            <span
              class="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-bold text-red-700"
            >
              {totalAlertas} alerta(s)
            </span>
          {/if}
        </div>

        <!-- Lotes Vencidos -->
        <section
          class="overflow-hidden rounded-xl border-2 border-red-200 bg-white shadow-sm"
        >
          <header
            class="flex items-center gap-3 border-b border-red-100 bg-linear-to-r from-red-50 to-red-100/50 px-6 py-4"
          >
            <div class="rounded-full bg-red-100 p-2 shadow-sm">
              <CalendarX class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3
                class="flex items-center gap-2 text-lg font-semibold text-red-800"
              >
                Lotes Vencidos
                <span
                  class="rounded-full bg-red-200 px-2.5 py-0.5 text-sm font-bold"
                >
                  {data.lotesVencidos.length}
                </span>
              </h3>
              <p class="text-sm text-red-600">
                Medicamentos com validade expirada que ainda possuem estoque
              </p>
            </div>
          </header>

          {#if data.lotesVencidos.length > 0}
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50/50">
                    <th class="px-6 py-3 text-left font-medium text-gray-500"
                      >Medicamento</th
                    >
                    <th class="px-6 py-3 text-left font-medium text-gray-500"
                      >Lote</th
                    >
                    <th class="px-6 py-3 text-left font-medium text-gray-500"
                      >Fornecedor</th
                    >
                    <th class="px-6 py-3 text-center font-medium text-gray-500"
                      >Qtd.</th
                    >
                    <th class="px-6 py-3 text-center font-medium text-gray-500"
                      >Venceu em</th
                    >
                    <th class="px-6 py-3 text-center font-medium text-gray-500"
                      >Dias</th
                    >
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  {#each data.lotesVencidos as lote}
                    {@const dias = Math.abs(diasParaVencer(lote.dataValidade))}
                    <tr class="bg-red-50/30 transition hover:bg-red-50">
                      <td class="px-6 py-3.5 font-medium text-gray-900">
                        <span class="flex items-center gap-2">
                          <Pill class="h-4 w-4 text-red-400" />
                          {lote.medicamento.nome}
                        </span>
                      </td>
                      <td class="px-6 py-3.5 font-mono text-gray-600">
                        {lote.numeroLote}
                      </td>
                      <td class="px-6 py-3.5 text-gray-600">
                        {lote.fornecedor.nome}
                      </td>
                      <td
                        class="px-6 py-3.5 text-center font-bold text-red-600"
                      >
                        {lote.quantidadeAtual}
                      </td>
                      <td class="px-6 py-3.5 text-center text-red-600">
                        {formatarData(lote.dataValidade)}
                      </td>
                      <td class="px-6 py-3.5 text-center">
                        <span
                          class="inline-flex items-center gap-1 rounded-full
												       bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700"
                        >
                          <CircleX class="h-3 w-3" />
                          {dias}d
                        </span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div
              class="flex items-center justify-center gap-2 px-6 py-10 text-green-600"
            >
              <Check class="h-5 w-5" />
              <span class="font-medium">Nenhum lote vencido com estoque</span>
            </div>
          {/if}
        </section>

        <!-- Próximos do Vencimento -->
        <section
          class="overflow-hidden rounded-xl border-2 border-orange-200 bg-white shadow-sm"
        >
          <header
            class="flex items-center gap-3 border-b border-orange-100 bg-linear-to-r from-orange-50 to-orange-100/50 px-6 py-4"
          >
            <div class="rounded-full bg-orange-100 p-2 shadow-sm">
              <CalendarClock class="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3
                class="flex items-center gap-2 text-lg font-semibold text-orange-800"
              >
                Próximos do Vencimento
                <span
                  class="rounded-full bg-orange-200 px-2.5 py-0.5 text-sm font-bold"
                >
                  {data.lotesProximosVencimento.length}
                </span>
              </h3>
              <p class="text-sm text-orange-600">
                Lotes que vencem nos próximos 30 dias
              </p>
            </div>
          </header>

          {#if data.lotesProximosVencimento.length > 0}
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50/50">
                    <th class="px-6 py-3 text-left font-medium text-gray-500"
                      >Medicamento</th
                    >
                    <th class="px-6 py-3 text-left font-medium text-gray-500"
                      >Lote</th
                    >
                    <th class="px-6 py-3 text-left font-medium text-gray-500"
                      >Fornecedor</th
                    >
                    <th class="px-6 py-3 text-center font-medium text-gray-500"
                      >Qtd.</th
                    >
                    <th class="px-6 py-3 text-center font-medium text-gray-500"
                      >Validade</th
                    >
                    <th class="px-6 py-3 text-center font-medium text-gray-500"
                      >Restam</th
                    >
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  {#each data.lotesProximosVencimento as lote}
                    {@const dias = diasParaVencer(lote.dataValidade)}
                    <tr class="transition hover:bg-orange-50/50">
                      <td class="px-6 py-3.5 font-medium text-gray-900">
                        <span class="flex items-center gap-2">
                          <Pill class="h-4 w-4 text-orange-400" />
                          {lote.medicamento.nome}
                        </span>
                      </td>
                      <td class="px-6 py-3.5 font-mono text-gray-600">
                        {lote.numeroLote}
                      </td>
                      <td class="px-6 py-3.5 text-gray-600">
                        {lote.fornecedor.nome}
                      </td>
                      <td
                        class="px-6 py-3.5 text-center font-semibold text-gray-900"
                      >
                        {lote.quantidadeAtual}
                      </td>
                      <td class="px-6 py-3.5 text-center text-gray-600">
                        {formatarData(lote.dataValidade)}
                      </td>
                      <td class="px-6 py-3.5 text-center">
                        <span
                          class="inline-flex items-center gap-1 rounded-full px-2.5 py-1
												       text-xs font-bold
												       {dias <= 7
                            ? 'bg-red-100 text-red-700'
                            : dias <= 15
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'}"
                        >
                          <Clock class="h-3 w-3" />
                          {dias}d
                        </span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div
              class="flex items-center justify-center gap-2 px-6 py-10 text-green-600"
            >
              <Check class="h-5 w-5" />
              <span class="font-medium">Nenhum lote próximo do vencimento</span>
            </div>
          {/if}
        </section>

        <!-- Estoque Baixo -->
        <section
          class="overflow-hidden rounded-xl border-2 border-yellow-300 bg-white shadow-sm"
        >
          <header
            class="flex items-center gap-3 border-b border-yellow-100 bg-linear-to-r from-yellow-50 to-yellow-100/50 px-6 py-4"
          >
            <div class="rounded-full bg-yellow-100 p-2 shadow-sm">
              <TrendingDown class="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3
                class="flex items-center gap-2 text-lg font-semibold text-yellow-800"
              >
                Estoque Baixo
                <span
                  class="rounded-full bg-yellow-200 px-2.5 py-0.5 text-sm font-bold"
                >
                  {data.estoqueBaixo.length}
                </span>
              </h3>
              <p class="text-sm text-yellow-700">
                Lotes com quantidade igual ou inferior a 10 unidades
              </p>
            </div>
          </header>

          {#if data.estoqueBaixo.length > 0}
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50/50">
                    <th class="px-6 py-3 text-left font-medium text-gray-500"
                      >Medicamento</th
                    >
                    <th class="px-6 py-3 text-left font-medium text-gray-500"
                      >Lote</th
                    >
                    <th class="px-6 py-3 text-left font-medium text-gray-500"
                      >Fornecedor</th
                    >
                    
                    <th class="px-6 py-3 text-center font-medium text-gray-500"
                      >Atual</th
                    >
                    
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  {#each data.estoqueBaixo as lote}
                    
                    <tr class="transition hover:bg-yellow-50/50">
                      <td class="px-6 py-3.5 font-medium text-gray-900">
                        <span class="flex items-center gap-2">
                          <Pill class="h-4 w-4 text-yellow-500" />
                          {lote.medicamento.nome}
                        </span>
                      </td>
                      <td class="px-6 py-3.5 font-mono text-gray-600">
                        {lote.numeroLote}
                      </td>
                      <td class="px-6 py-3.5 text-gray-600">
                        {lote.fornecedor.nome}
                      </td>
                     
                      <td
                        class="px-6 py-3.5 text-center font-bold text-orange-600"
                      >
                        {lote.quantidadeAtual}
                      </td>
                      
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <div
              class="flex items-center justify-center gap-2 px-6 py-10 text-green-600"
            >
              <Check class="h-5 w-5" />
              <span class="font-medium"
                >Todos os lotes com estoque adequado</span
              >
            </div>
          {/if}
        </section>
      </div>
    {/if}

    <!-- FORNECEDORES -->
    {#if tipoRelatorio === "fornecedores"}
      <div class="space-y-6 animate-in fade-in duration-300">
        <div class="flex items-center gap-2">
          <Building2 class="h-6 w-6 text-indigo-500" />
          <h2 class="text-xl font-bold text-gray-900">
            Relatório por Fornecedor
          </h2>
          <span
            class="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
          >
            {data.estoquePorFornecedor.length} fornecedor(es)
          </span>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {#each data.estoquePorFornecedor as forn}
            {@const totalInicial = forn.lotes.reduce(
              (a, l) => a + l.quantidadeInicial,
              0,
            )}
            {@const totalAtual = forn.lotes.reduce(
              (a, l) => a + l.quantidadeAtual,
              0,
            )}
            {@const medicamentosUnicos = [
              ...new Set(forn.lotes.map((l) => l.medicamento.nome)),
            ]}
            {@const percentualConsumo =
              totalInicial > 0
                ? Math.round(((totalInicial - totalAtual) / totalInicial) * 100)
                : 0}

            <article
              class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm
						               transition hover:border-indigo-300 hover:shadow-lg"
            >
              <header class="mb-5 flex items-start justify-between">
                <div class="flex items-start gap-3">
                  <div
                    class="rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 p-2.5 shadow-lg shadow-indigo-200"
                  >
                    <Building2 class="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">
                      {forn.nome}
                    </h3>
                    <p class="flex items-center gap-1 text-sm text-gray-500">
                      <Boxes class="h-3.5 w-3.5" />
                      {forn.lotes.length} lote(s) fornecido(s)
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-indigo-600">
                    {totalAtual.toLocaleString("pt-BR")}
                  </p>
                  <p class="text-xs text-gray-400">em estoque</p>
                </div>
              </header>

              <!-- Barra de consumo -->
              <div class="mb-5">
                <div class="mb-2 flex justify-between text-xs">
                  <span
                    class="flex items-center gap-1 font-medium text-gray-600"
                  >
                    <ChartArea class="h-3 w-3" />
                    Consumido
                  </span>
                  <span class="font-bold text-indigo-600"
                    >{percentualConsumo}%</span
                  >
                </div>
                <div class="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    class="h-full rounded-full bg-linear-to-r from-indigo-400 via-indigo-500 to-indigo-600
										       transition-all duration-700 ease-out"
                    style="width: {percentualConsumo}%"
                  ></div>
                </div>
                <div class="mt-2 flex justify-between text-xs text-gray-400">
                  <span>Inicial: {totalInicial.toLocaleString("pt-BR")}</span>
                  <span>Atual: {totalAtual.toLocaleString("pt-BR")}</span>
                </div>
              </div>

              <!-- Medicamentos fornecidos -->
              {#if medicamentosUnicos.length > 0}
                <div>
                  <p
                    class="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    <Pill class="h-3 w-3" />
                    Medicamentos ({medicamentosUnicos.length})
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    {#each medicamentosUnicos as nome}
                      <span
                        class="inline-flex items-center rounded-full bg-indigo-50
											       px-2.5 py-1 text-xs font-medium text-indigo-700
											       transition hover:bg-indigo-100"
                      >
                        {nome}
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}
            </article>
          {/each}
        </div>

        {#if data.estoquePorFornecedor.length === 0}
          <div
            class="flex flex-col items-center justify-center rounded-xl bg-white p-16 shadow-sm"
          >
            <Inbox class="h-16 w-16 text-gray-300" />
            <p class="mt-4 text-lg font-medium text-gray-500">
              Nenhum fornecedor encontrado
            </p>
            <p class="text-sm text-gray-400">
              Ajuste os filtros para ver resultados
            </p>
          </div>
        {/if}
      </div>
    {/if}

    <!-- ================================================ -->
    <!-- RODAPÉ DO RELATÓRIO (Impressão) -->
    <!-- ================================================ -->
    <footer class="mt-12 hidden border-t border-gray-200 pt-4 print:block">
      <div class="flex items-center justify-between text-xs text-gray-400">
        <span class="flex items-center gap-1">
          <Calendar class="h-3 w-3" />
          Gerado em {formatarDataHora(new Date())}
        </span>
        <span class="flex items-center gap-1">
          <Pill class="h-3 w-3" />
          Sistema de Gestão de Estoque de Medicamentos
        </span>
      </div>
    </footer>
  </main>
</div>

<!-- ================================================ -->
<!-- ESTILOS -->
<!-- ================================================ -->
<style>
  /* Animações */
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slide-in-from-top {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-in {
    animation-fill-mode: both;
  }

  .fade-in {
    animation-name: fade-in;
  }

  .slide-in-from-top-2 {
    animation-name: slide-in-from-top;
  }

  .duration-200 {
    animation-duration: 200ms;
  }

  .duration-300 {
    animation-duration: 300ms;
  }

  /* Estilos de impressão */
  @media print {
    :global(body) {
      font-size: 11px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    :global(nav),
    :global(.print\\:hidden) {
      display: none !important;
    }

    .rounded-xl {
      border-radius: 4px;
    }

    .shadow-sm,
    .shadow-md,
    .shadow-lg {
      box-shadow: none;
    }
  }
</style>
