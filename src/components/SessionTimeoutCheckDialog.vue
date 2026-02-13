
<script setup lang="ts">
const { notAuthenticated } = useAuthCheck()

async function loginNewTab() {
  await navigateTo({
    path: `/`,
  }, {
    open: {
      target: '_blank',
    }
  })
}

async function loginSameTab() {
  reloadNuxtApp()
}
</script>

<template>
<div v-if="notAuthenticated" class="backdrop-blur-xs overlay" />

<Dialog v-model:visible="notAuthenticated" append-to="body" modal :breakpoints="{ '960px': '75vw', '640px': '80vw' }"
  :style="{ width: '40rem' }" :draggable="false" :resizable="false" :show-header="false" class="shadow-sm rounded-2xl">
  <div class="bg-gray-200 dark:bg-gray-700 rounded-2xl">
    <div class="flex flex-col gap-6 p-6 m-6">
      <div class="flex items-start gap-4">
        <div class="flex-1 flex flex-col gap-2">
          <h1 class="m-0 text-surface-900 dark:text-surface-0 font-semibold text-xl leading-normal">
            You are no longer logged in
          </h1>
          <span class="text-surface-500 dark:text-surface-400 text-base leading-normal">
            Please log in to continue. </span>
        </div>
        <Button icon="pi pi-times" text rounded severity="secondary" class="w-10 h-10 !p-2" @click="loginSameTab()" />
      </div>

      <div class="flex justify-end gap-4">
        <Button label="New Tab Login" outlined @click="loginNewTab()" />
        <Button label="Login" @click="loginSameTab()" />
      </div>
    </div>
  </div>
</Dialog>
</template>
