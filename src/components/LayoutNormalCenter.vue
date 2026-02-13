
<script setup>
const props = defineProps({
  pageName: {
    type: String,
    default: '...'
  },
  pageDescription: {
    type: String,
    default: '...'
  }
});
</script>

<template>
<div
  class="border-2 border-surface-200 dark:border-surface-700 rounded-2xl p-5 h-full text-surface-700 dark:text-surface-200">
  <div class="flex flex-col gap-10">
    <div class="flex flex-col gap-2">
      <div class="text-surface-900 dark:text-surface-0 font-medium text-2xl">{{ props.pageName }}</div>
      <p class="m-0 p-0 text-surface-600 dark:text-surface-200 leading-normal">{{ props.pageDescription }}</p>
    </div>
    <slot />

  </div>
</div>
</template>
