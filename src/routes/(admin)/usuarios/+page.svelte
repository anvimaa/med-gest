<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData, ActionData } from "./$types";
  import { toast } from "$lib/utils/toasts.svelte";
  import { invalidateAll } from "$app/navigation";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let search = $state("");
  let showCreateModal = $state(false);
  let isSubmitting = $state(false);

  let userToDelete = $state<string | null>(null);

  const filteredUsers = $derived(
    data.users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("pt-PT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
</script>

<div
  class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500"
>
  <div
    class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4"
  >
    <div>
      <h1 class="text-3xl font-black text-slate-900 tracking-tight">
        Utilizadores
      </h1>
      <p class="text-slate-500 mt-1">
        Efetue a gestão das credenciais de acesso e das funções da equipa.
      </p>
    </div>

    <button
      onclick={() => (showCreateModal = true)}
      class="inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span>Adicionar Utilizador</span>
    </button>
  </div>

  <!-- Search & Filter Bar -->
  <div
    class="bg-white p-4 rounded-t-2xl border border-b-0 border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between"
  >
    <div class="relative w-full max-w-md">
      <div
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <input
        type="text"
        bind:value={search}
        placeholder="Pesquisar por nome ou e-mail..."
        class="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
      />
    </div>
  </div>

  <!-- User Table -->
  <div
    class="bg-white rounded-b-2xl shadow-sm border border-slate-200 overflow-hidden"
  >
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-100">
        <thead class="bg-slate-50/80">
          <tr>
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >Perfil do Utilizador</th
            >
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >Acesso</th
            >
            <th
              scope="col"
              class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >Data de Registo</th
            >
            <th
              scope="col"
              class="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >Ações</th
            >
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#each filteredUsers as user (user.id)}
            <tr class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-4">
                  <div
                    class="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 border border-blue-200/50 flex items-center justify-center text-blue-700 font-bold shadow-inner"
                  >
                    {#if user.image}
                      <img
                        class="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 border border-blue-200/50 flex items-center justify-center text-blue-700 font-bold shadow-inner"
                        src={user.image}
                        alt={user.name}
                      />
                    {:else}
                      {user.name.charAt(0).toUpperCase()}
                    {/if}
                  </div>
                  <div>
                    <div class="font-semibold text-slate-900">{user.name}</div>
                    <div class="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {#if user.role === "admin"}
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-md"
                  >
                    <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    Administrador
                  </span>
                {:else}
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-md"
                  >
                    <div class="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    Operador
                  </span>
                {/if}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {formatDate(user.createdAt)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div
                  class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {#if data.user.id !== user.id}
                    <button
                      onclick={() => (userToDelete = user.id)}
                      class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar Conta"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  {:else}
                    <span class="text-xs text-slate-400 italic py-2"
                      >Sua Conta</span
                    >
                  {/if}
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="4" class="px-6 py-16 text-center">
                <div
                  class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-slate-900 mb-1">
                  Nenhum utilizador encontrado
                </h3>
                <p class="text-sm text-slate-500">
                  {search
                    ? `Não foi possível encontrar "${search}".`
                    : "Adicione membros à equipa para começarem a utilizar o sistema."}
                </p>
                {#if search}
                  <button
                    onclick={() => (search = "")}
                    class="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Limpar pesquisa
                  </button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Create User Modal -->
{#if showCreateModal}
  <div
    class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
      onclick={(e) => e.stopPropagation()}
    >
      <div
        class="flex items-center justify-between p-6 border-b border-slate-100"
      >
        <div>
          <h2 class="text-xl font-bold text-slate-900">Novo Utilizador</h2>
          <p class="text-sm text-slate-500 mt-1">
            Acesso seguro à plataforma SIGMED.
          </p>
        </div>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
          onclick={() => (showCreateModal = false)}
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <form
        method="POST"
        action="?/createUser"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ result }) => {
            isSubmitting = false;
            if (result.type === "success") {
              showCreateModal = false;
              userToDelete = null;
              toast.success("Utilizador criado com sucesso!");
              invalidateAll();
            } else {
              toast.error(result.data?.message as string);
            }
          };
        }}
        class="p-6 space-y-5"
      >
        <div>
          <label
            for="name"
            class="block text-sm font-medium text-slate-700 mb-1.5"
            >Nome Completo</label
          >
          <input
            id="name"
            name="name"
            type="text"
            required
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-sm"
            placeholder="Ex: João Maria"
          />
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-medium text-slate-700 mb-1.5"
            >Endereço de E-mail</label
          >
          <input
            id="email"
            name="email"
            type="email"
            required
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-sm"
            placeholder="exemplo@medgest.com"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-slate-700 mb-1.5"
            >Palavra-passe Inicial</label
          >
          <input
            id="password"
            name="password"
            type="password"
            required
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-sm font-mono tracking-wider"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            for="role"
            class="block text-sm font-medium text-slate-700 mb-1.5"
            >Nível de Acesso</label
          >
          <div class="relative">
            <select
              id="role"
              name="role"
              class="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-sm pr-10"
            >
              <option value="user">Operador (Gestão de Stock)</option>
              <option value="admin">Administrador (Acesso Total)</option>
            </select>
            <div
              class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100"
        >
          <button
            type="button"
            onclick={() => (showCreateModal = false)}
            class="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-200 transition-all flex items-center disabled:opacity-70"
          >
            {#if isSubmitting}
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processando...
            {:else}
              Registar Conta
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if userToDelete}
  <div
    class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div
      class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200"
    >
      <div
        class="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-8 w-8 text-red-600"
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
      <h3 class="text-lg font-bold text-slate-900 mb-2">
        Eliminar Utilizador?
      </h3>
      <p class="text-sm text-slate-500 mb-6">
        Esta ação não pode ser revertida. O acesso deste utilizador ao sistema
        será removido imediatamente.
      </p>

      <div class="flex gap-3">
        <button
          onclick={() => (userToDelete = null)}
          class="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <form
          method="POST"
          action="?/deleteUser"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === "success") {
                userToDelete = null;
                toast.success("Utilizador eliminado com sucesso!");
                invalidateAll();
              } else {
                toast.error(result.data?.message as string);
              }
            };
          }}
          class="flex-1"
        >
          <input type="hidden" name="id" value={userToDelete} />
          <button
            type="submit"
            class="w-full px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
          >
            Eliminar
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}
