<script lang="ts">
  import { enhance } from "$app/forms";
  import Logo from "$lib/components/logo.svelte";
  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
  let showPassword = $state(false);
  let isSubmitting = $state(false);
</script>

<div class="h-screen w-screen overflow-hidden bg-slate-50 flex text-[14px]">
  <!-- Left Side: Brand presentation -->
  <div
    class="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-blue-600 overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[url('/back_login.jpg')] bg-cover bg-center opacity-40"
    ></div>
    <!-- Abstract pattern background -->
    <div
      class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"
    ></div>
    <div
      class="absolute inset-0 bg-linear-to-t from-blue-900/90 to-transparent"
    ></div>

    <div
      class="relative z-10 flex flex-col justify-between p-8 xl:p-16 text-white w-full h-full"
    >
      <div>
        <div
          class="bg-white/10 p-2.5 rounded-2xl w-fit backdrop-blur-md mb-4 border border-white/20 shadow-xl"
        >
          <Logo />
        </div>
        <h1
          class="text-3xl xl:text-4xl font-black mb-3 tracking-tight leading-tight"
        >
          SIGMED
        </h1>
        <p
          class="text-blue-100 text-base max-w-sm font-medium leading-relaxed opacity-90"
        >
          Sistema integrado de Gestão de Medicamentos
        </p>
      </div>

      <div
        class="flex items-center space-x-3 border-t border-white/20 pt-4 mt-6 bg-white/5 p-4 rounded-2xl backdrop-blur-sm"
      >
        <div class="flex -space-x-2.5 shrink-0">
          <div
            class="h-8 w-8 rounded-full border-2 border-blue-600 bg-blue-300 shadow-sm"
          ></div>
          <div
            class="h-8 w-8 rounded-full border-2 border-blue-600 bg-blue-200 shadow-sm"
          ></div>
          <div
            class="h-8 w-8 rounded-full border-2 border-blue-600 bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-800 shadow-sm"
          >
            +
          </div>
        </div>
        <p class="text-sm font-medium text-blue-100 leading-tight">
          Tornamos a gestão de <span class="text-white font-bold"
            >Medicamentos</span
          > mais eficiente.
        </p>
      </div>
    </div>
  </div>

  <!-- Right Side: Login Form -->
  <div
    class="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-24 relative bg-slate-50 h-full overflow-hidden"
  >
    <!-- Decorative blobs -->
    <div
      class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-200/50 blur-3xl opacity-60 pointer-events-none"
    ></div>
    <div
      class="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-200/50 blur-3xl opacity-60 pointer-events-none"
    ></div>

    <div
      class="w-full max-w-sm mx-auto relative z-10 flex flex-col justify-center h-full max-h-[90vh]"
    >
      <div class="mb-6 text-center lg:text-left shrink-0">
        <div
          class="lg:hidden bg-blue-600 p-2.5 rounded-2xl w-fit mx-auto shadow-lg shadow-blue-200 mb-4 border border-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <h2
          class="text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5"
        >
          Bem-vindo de volta
        </h2>
        <p class="text-sm text-slate-500 font-medium">
          Insira as suas credenciais para aceder.
        </p>
      </div>

      <div
        class="bg-white/80 backdrop-blur-xl p-5 sm:p-6 xl:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 shrink-0"
      >
        <form
          class="space-y-4"
          method="POST"
          action="?/signInEmail"
          use:enhance={() => {
            isSubmitting = true;
            return async ({ update }) => {
              await update();
              isSubmitting = false;
            };
          }}
        >
          <div>
            <label
              for="email"
              class="block text-[13px] font-bold text-slate-700 mb-1"
            >
              Endereço de E-mail
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4.5 w-4.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-[14px] font-medium shadow-sm hover:border-slate-300"
                placeholder="nome@clinica.com"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label
                for="password"
                class="block text-[13px] font-bold text-slate-700"
              >
                Palavra-passe
              </label>
            </div>

            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4.5 w-4.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                class="block w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-[14px] font-mono tracking-wider shadow-sm hover:border-slate-300"
                required
                placeholder="••••"
              />

              <button
                type="button"
                onclick={() => (showPassword = !showPassword)}
                tabindex="-1"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors focus:outline-none group"
              >
                {#if showPassword}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4.5 w-4.5 group-hover:scale-110 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fill-rule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                {:else}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4.5 w-4.5 group-hover:scale-110 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clip-rule="evenodd"
                    />
                    <path
                      d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
                    />
                  </svg>
                {/if}
              </button>
            </div>
          </div>

          {#if form?.message}
            <div
              class="rounded-xl bg-red-50 p-3 border border-red-100 flex items-start gap-2 animate-in slide-in-from-top-2 duration-300 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <h3 class="text-[13px] font-bold text-red-800 leading-snug">
                {form.message}
              </h3>
            </div>
          {/if}

          <div class="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              class="group relative w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl text-[14px] font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-75 disabled:hover:translate-y-0 disabled:shadow-none overflow-hidden"
            >
              <div
                class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform ease-out duration-300"
              ></div>
              <div class="relative flex items-center">
                {#if isSubmitting}
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4.5 w-4.5 text-white"
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
                  A validar...
                {:else}
                  Entrar no Sistema
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4.5 w-4.5 ml-1.5 group-hover:translate-x-1 transition-transform duration-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 10a1 1 0 011-1h12.586l-4.293-4.293a1 1 0 111.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 11H4a1 1 0 01-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                {/if}
              </div>
            </button>
          </div>
        </form>
      </div>

      <div
        class="mt-4 text-center text-[12px] text-slate-500 font-medium shrink-0"
      >
        Problemas a aceder? <br /><span
          class="text-blue-600 hover:text-blue-700 transition-colors"
          >Entre em contacto com o Administrador do Sistema</span
        >
      </div>
    </div>
  </div>
</div>
