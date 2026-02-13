
<script setup>
import ShieldCheckboxIcon from "@/components/icons/ShieldCheckboxIcon"
import SettingsCogIcon from "@/components/icons/SettingsCogIcon"
import { useDark, useToggle } from "@vueuse/core";
import ProgressBar from "@/volt/ProgressBar.vue"
import { useVisituUsersStore } from '@/store/visituUsers'

const userStore = useVisituUsersStore()
const isDark = useDark();
const toggleDark = useToggle(isDark);

const anyGraphqlQueryLoading = useGlobalQueryLoading()
const runtimeConfig = useRuntimeConfig();
const logoutUrl = runtimeConfig.public.LOGOUT_URL || '/logout';
</script>

<template>
<div
  class="bg-surface-0 dark:bg-surface-900 py-4 px-8 flex items-center justify-between border-b border-surface-200 dark:border-surface-700">

  <div class="flex items-center gap-4">

    <!-- menu toggle -->
    <a v-styleclass="{
      selector: '#app-sidebar-floating',
      enterFromClass: 'hidden',
      enterActiveClass: 'animate-fadeinleft',
      leaveToClass: 'hidden',
      leaveActiveClass: 'animate-fadeoutleft',
      hideOnOutsideClick: true
    }" class="cursor-pointer flex items-center justify-center lg:hidden text-surface-700 dark:text-surface-100">
      <i class="pi pi-bars !text-xl !leading-none" />
    </a>

    <!-- shield checkbox icon and name of application -->
    <router-link to='/' class="flex items-center gap-4 lg:w-[280px] mr-8">

      <ShieldCheckboxIcon class="min-w-12" />
      <span class="text-lg font-semibold leading-tight text-surface-900 dark:text-surface-0">
        Admin&nbsp;Dashboard
      </span>
    </router-link>
  </div>

  <div class="flex items-center justify-between flex-1">
    <div class="hidden md:flex">
      <BreadCrumbs />
    </div>

    <!-- settings icon -->
    <div class="flex items-center gap-4 md:gap-8 ml-auto">
      <a :href="logoutUrl"
        class="text-surface-500 dark:text-surface-500 hover:underline">Logout</a>
      <button class="py-1 px-2 bg-black text-white rounded-md dark:bg-white dark:text-black" @click="toggleDark()">
        <SettingsCogIcon />
      </button>
    </div>
  </div>
</div>

<div
  class="md:hidden flex items-center py-3 px-8 bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
  <BreadCrumbs />
</div>
<ProgressBar v-if="anyGraphqlQueryLoading || userStore.loading" mode="indeterminate" style="height: 6px">
</ProgressBar>
<ProgressBar v-else style="height: 6px" />
</template>
