<script setup>
const props =defineProps({
  hidden: {
    type: Boolean,
    default: false
  },
  title:{
    type: String,
    required: true
  }
})

</script>

<template>
  <div class="p-1">
    <div v-styleclass="{
      selector: '@next',
      enterFromClass: 'hidden',
      enterActiveClass: 'animate-slidedown',
      leaveToClass: 'hidden',
      leaveActiveClass: 'animate-slideup'
    }"
      class="flex w-full relative items-center my-2 px-2 max-w-5xl mx-auto">
        <div class="border-t border-surface-200 dark:border-surface-700 w-8" />
        <div class="px-2 flex items-center gap-2">
            <!-- <i class="pi pi-book !text-base !leading-none text-surface-900 dark:text-surface-0" /> -->
            <span class="text-surface-900 dark:text-surface-0 font-normal text-lg">
              {{ props.title }}
            </span>
        </div>
        <div class="border-t border-surface-200 dark:border-surface-700 flex-1" />
        <Button label="show/hide" rounded severity="secondary" class="bg-surface-400 border-surface-200"/>
        <div class="border-t border-surface-200 dark:border-surface-700 w-8" />
    </div>
    <ul class="list-none m-0 overflow-hidden flex flex-col gap-1 mt-1" :class="props.hidden ? 'hidden' : ''">
      <li>
        <slot>...</slot>
      </li>
    </ul>
  </div>

</template>
