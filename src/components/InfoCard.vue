<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  fields: Array<{ label: string; value: string | number; colspan?: number }>
}>()

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    // eslint-disable-next-line
    console.log('Copied to clipboard:', text)
  })
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUUID(value: unknown): boolean {
  return typeof value === 'string' && uuidRegex.test(value)
}

function getColspanClass(span?: number): string {
  if (!span || span < 2) return ''
  if (span >= 3) return `col-span-3`
  return `col-span-${span} lg:col-span-${span}`
}

const fieldRows = computed(() => {
  const rows: typeof props.fields[] = []
  let currentRow: typeof props.fields = []
  let currentSpan = 0

  props.fields.forEach(field => {
    const span = field.colspan ?? 1

    if (span === 3) {
      if (currentRow.length) {
        rows.push(currentRow)
        currentRow = []
        currentSpan = 0
      }
      rows.push([field])
    } else {
      if (currentSpan + span > 3) {
        rows.push(currentRow)
        currentRow = []
        currentSpan = 0
      }
      currentRow.push(field)
      currentSpan += span
    }
  })

  if (currentRow.length) {
    rows.push(currentRow)
  }

  return rows
})
</script>

<template>
  <div
    class="w-full border border-gray-300 dark:border-gray-700 rounded"
  >
    <div
      v-for="(row, rowIndex) in fieldRows"
      :key="rowIndex"
      :class="[
        'grid grid-cols-3 gap-x-1 gap-y-4 text-surface-700 dark:text-surface-200 text-sm sm:text-base',
        rowIndex > 0 ? 'border-t border-gray-300 dark:border-gray-700 pt-4 mt-4' : ''
      ]"
    >
      <div
        v-for="(field, index) in row"
        :key="index"
        :class="[
          'flex flex-col gap-1 break-words min-w-0 px-1',
          getColspanClass(field.colspan),
          index === 0 ? '' : 'border-l border-gray-300 dark:border-gray-700 pl-1',
          field.colspan === 3 ? 'whitespace-normal sm:whitespace-nowrap' : ''
        ]"
        style="overflow-wrap: anywhere;"
      >
        <span
          class="font-semibold text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap break-words"
        >
          {{ field.label }}:
        </span>

        <template v-if="isUUID(field.value)">
          <div class="relative group w-fit">
            <button
              class="text-blue-600 text-xs hover:underline"
              title="Copy to clipboard"
              @click="copyToClipboard(String(field.value))">
              Copy
            </button>
            <span
              class="absolute left-full top-0 ml-2 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 shadow group-hover:block hidden z-10 whitespace-nowrap max-w-xs"
            >
              {{ field.value }}
            </span>
          </div>
        </template>

        <template v-else>
          <span>{{ field.value }}</span>
        </template>
      </div>
    </div>
  </div>
</template>
