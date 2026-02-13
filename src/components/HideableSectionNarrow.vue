
<script setup>
const emit = defineEmits(['titleClicked'])
const props = defineProps({
  hidden: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  }
})

</script>

<template>
<div class="pt-2">
  <div class="flex flex-col gap-1 rounded-md border border-solid border-surface-200 dark:border-surface-700">
    <div v-styleclass="{
      selector: '@next',
      enterFromClass: 'hidden',
      enterActiveClass: 'animate-slidedown',
      leaveToClass: 'hidden',
      leaveActiveClass: 'animate-slideup'
    }"
      class="flex items-center cursor-pointer p-3 gap-4 rounded-md text-surface-900 dark:text-surface-0 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700"
      @click="emit('titleClicked')">
      <span class="text-base leading-tight">
        <slot name="title">{{ title }}</slot>
      </span>
      <i class="pi pi-angle-down !text-base !leading-none text-surface-500 dark:text-surface-400 ml-auto" />
    </div>
    <div :class="props.hidden ? 'hidden ml-3 overflow-hidden' : 'ml-3 overflow-hidden'">
      <slot>....</slot>
    </div>
  </div>
</div>
</template>
