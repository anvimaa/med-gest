<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { toast } from "$lib/utils/toasts.svelte";
  import type { PageData, ActionData } from "./$types";
  import { fade, scale } from "svelte/transition";

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let { user } = $derived(data);
  let loadingProfile = $state(false);
  let loadingPassword = $state(false);
  let loadingImage = $state(false);
  let showPasswordModal = $state(false);

  $effect(() => {
    if (form && "success" in form && form.success) {
      if ((form as any).passwordChanged) {
        toast.success("Palavra-passe alterada com sucesso!");
        showPasswordModal = false;
      } else if ((form as any).imageUrl) {
        toast.success("Foto de perfil atualizada!");
      } else {
        toast.success("Perfil atualizado com sucesso!");
      }
    } else if (form && "error" in form && form.error) {
      toast.error(form.error);
    }
  });
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
  <div class="mb-8 flex justify-between items-end">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">O meu Perfil</h1>
      <p class="text-slate-500">
        Gerencie as suas informações pessoais e de contacto.
      </p>
    </div>
    <button
      onclick={() => (showPasswordModal = true)}
      class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 mr-2 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      Mudar Senha
    </button>
  </div>

  <div
    class="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden"
  >
    <div class="p-8 border-b border-slate-100 flex items-center space-x-8">
      <div class="relative group">
        <div
          class="w-24 h-24 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-700 text-4xl font-bold border-4 border-white shadow-lg overflow-hidden"
        >
          {#if user?.image}
            <img
              src={user.image}
              alt={user.name}
              class="w-full h-full object-cover"
            />
          {:else}
            {user?.name?.charAt(0).toUpperCase()}
          {/if}
        </div>
        <form
          method="POST"
          action="?/updateImage"
          enctype="multipart/form-data"
          use:enhance={() => {
            loadingImage = true;
            return async ({ result }) => {
              if (result.type === "success") {
                toast.success("Foto atualizada!");
                invalidateAll();
              } else {
                // @ts-ignore
                toast.error(result.data?.error || "Erro ao carregar imagem");
              }
              loadingImage = false;
            };
          }}
        >
          <label
            class="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl {loadingImage
              ? 'opacity-100'
              : ''}"
          >
            <input
              type="file"
              name="image"
              class="hidden"
              onchange={(e) =>
                (e.target as HTMLInputElement).form?.requestSubmit()}
              accept="image/*"
            />
            {#if loadingImage}
              <svg
                class="animate-spin h-8 w-8 text-white"
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
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            {/if}
          </label>
        </form>
      </div>
      <div>
        <h2 class="text-xl font-bold text-slate-900">{user?.name}</h2>
        <p class="text-slate-500">{user?.email}</p>
      </div>
    </div>

    <form
      method="POST"
      action="?/update"
      use:enhance={() => {
        loadingProfile = true;
        return async ({ result, update }) => {
          if (result.type === "success") {
            toast.success("Perfil atualizado com sucesso!");
          } else {
            // @ts-ignore
            toast.error(result.data?.error || "Erro ao atualizar perfil");
          }
          await update();
          loadingProfile = false;
        };
      }}
      class="p-8 space-y-6"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="col-span-1 md:col-span-2">
          <label
            for="name"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Nome Completo *</label
          >
          <input
            type="text"
            id="name"
            name="name"
            required
            value={data.user?.name ?? ""}
            placeholder="Seu nome"
            class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>

        <div class="col-span-1 md:col-span-2">
          <label
            for="email"
            class="block text-sm font-semibold text-slate-700 mb-1"
            >Email *</label
          >
          <input
            type="email"
            id="email"
            name="email"
            required
            value={data.user?.email ?? ""}
            placeholder="seu@email.com"
            class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      <div
        class="pt-6 flex items-center justify-end space-x-4 border-t border-slate-100"
      >
        <button
          type="submit"
          disabled={loadingProfile}
          class="px-8 py-3 bg-blue-600 rounded-xl shadow-lg text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-all transform active:scale-95 flex items-center"
        >
          {#if loadingProfile}
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            A atualizar...
          {:else}
            Atualizar Informações
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>

{#if showPasswordModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      transition:scale={{ duration: 300, start: 0.95 }}
    >
      <div
        class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50"
      >
        <div>
          <h3 class="text-xl font-bold text-slate-900">Mudar Palavra-passe</h3>
          <p class="text-xs text-slate-500">Mantenha a sua conta segura.</p>
        </div>
        <button
          onclick={() => (showPasswordModal = false)}
          aria-label="Fechar"
          class="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form
        method="POST"
        action="?/changePassword"
        use:enhance={() => {
          loadingPassword = true;
          return async ({ result, update }) => {
            if (result.type === "success") {
              toast.success("Palavra-passe alterada!");
              showPasswordModal = false;
            } else {
              // @ts-ignore
              toast.error(result.data?.error || "Erro ao mudar senha");
            }
            loadingPassword = false;
          };
        }}
        class="p-6 space-y-6"
      >
        <div class="space-y-4">
          <div>
            <label
              for="currentPassword"
              class="block text-sm font-semibold text-slate-700 mb-1"
              >Palavra-passe Atual</label
            >
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              required
              placeholder="••••••••"
              class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>

          <div>
            <label
              for="newPassword"
              class="block text-sm font-semibold text-slate-700 mb-1"
              >Nova Palavra-passe</label
            >
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              required
              placeholder="••••••••"
              class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-semibold text-slate-700 mb-1"
              >Confirmar Nova Palavra-passe</label
            >
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              placeholder="••••••••"
              class="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        <div class="pt-4 flex items-center justify-end space-x-3">
          <button
            type="button"
            onclick={() => (showPasswordModal = false)}
            class="px-6 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loadingPassword}
            class="px-8 py-2.5 bg-slate-900 rounded-xl shadow-lg text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all transform active:scale-95 flex items-center"
          >
            {#if loadingPassword}
              <svg
                class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
              A guardar...
            {:else}
              Alterar
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
