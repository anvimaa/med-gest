<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
</script>

<div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-slate-900">
      Crie a sua conta
    </h2>
    <p class="mt-2 text-center text-sm text-slate-600">
      Ou
      <a href="/login" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
        faça login na sua conta existente
      </a>
    </p>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">
      <form class="space-y-6" method="POST" action="?/signUpEmail" use:enhance>
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700">
            Nome Completo
          </label>
          <div class="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              required
              class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              placeholder="João Silva"
            />
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-slate-700">
            Email
          </label>
          <div class="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              placeholder="joao@exemplo.com"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700">
            Palavra-passe
          </label>
          <div class="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {#if form?.message}
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {form.message}
                </h3>
              </div>
            </div>
          </div>
        {/if}

        <div>
          <button
            type="submit"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform active:scale-[0.98]"
          >
            Registar
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
