<script setup lang="ts">
const props =defineProps({
  title: {
    type: String,
    default:'Continue'
  }
})
</script>

<template>
  <div class="flex w-full relative items-center my-4 px-2 max-w-5xl mx-auto">
      <div class="border-t border-surface-200 dark:border-surface-700 flex-1" />
      <div class="px-2 flex items-center gap-2">
          <i class="pi pi-sparkles !text-base !leading-none text-surface-900 dark:text-surface-0" />
          <span class="text-surface-900 dark:text-surface-0 font-normal">{{props.title}}</span>
      </div>
      <div class="border-t border-surface-200 dark:border-surface-700 flex-1" />
  </div>
</template>
