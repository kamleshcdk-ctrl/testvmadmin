<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <div class="py-10">
    <div class="flex flex-col items-center justify-center">
      <div class="mt-7 pt-7 text-lg font-semibold text-surface-900 dark:text-surface-0">
        Visitor Management Administration Utility.
      </div>
      <div class="mt-7 pt-7">
        <img src="~/assets/visitu_pmk.png" class="max-w-[256px] " />
      </div>
      <div class="mt-7 pt-7">
        <span class="text-sm font-medium text-surface-500 dark:text-surface-400">
          {{ config.public.gitRef }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
