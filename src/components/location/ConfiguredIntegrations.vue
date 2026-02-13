<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import toLocalDateTime from '@/filters/localdatetime'

const props =defineProps({
  locationId: {
    type: String,
    required: true
  }
});

type Integration = {
  id: string
  slug: string
  locationId: string
  data: Record<string, unknown>
  createdAt: string
}

const { getIntegrationsForLocation } = useIntegrationsForLocationQuery()
const { result: integrations } = getIntegrationsForLocation(props.locationId)

const integrationList = computed<Integration[]>(() => (integrations.value ?? []) as Integration[])

const expandedItems = ref<Record<string, boolean>>({})
const toggleExpand = (id: string) => {
  expandedItems.value[id] = !expandedItems.value[id]
}

function capitalizeLabel(key: string): string {
  const spaced = key.replace(/([A-Z])/g, ' $1')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function formatValue(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return String(value)
}

function getFieldValuePairs(item: Integration) {
  return [
    ['id', item.id],
    ['locationId', item.locationId],
    ...Object.entries(item.data)
  ].map(([field, value]) => ({
    field: capitalizeLabel(field),
    value: formatValue(value)
  }))
}
</script>

<template>
  <div class="p-4 max-w-full overflow-x-hidden">
    <h2 class="text-lg font-semibold mb-4">Integrations</h2>

    <div class="flex flex-col gap-4">
      <Card
        v-for="item in integrationList"
        :key="item.id"
        class="w-full border border-gray-200 shadow bg-surface-0 dark:bg-surface-900"
      >
        <template #content>
          <div class="flex flex-col gap-2 text-sm text-surface-700 dark:text-surface-200">

            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div class="flex flex-wrap gap-2 truncate-section">
                <div class="truncate-item">
                  {{ capitalizeLabel('name') }}: {{ capitalizeLabel(item.slug) }}
                </div>
                <div class="truncate-item">
                  {{ capitalizeLabel('createdDate') }}: {{ toLocalDateTime(item.createdAt) }}
                </div>
              </div>
              <Button
                text
                size="small"
                label="Details"
                icon="pi pi-chevron-down"
                :icon-pos="'right'"
                @click="toggleExpand(item.id)"
              />
            </div>

            <div
              v-if="expandedItems[item.id]"
              class="pt-2 text-sm text-gray-800 dark:text-gray-100 w-full"
            >
              <div class="flex flex-col border border-gray-300 dark:border-gray-600 rounded w-full overflow-hidden max-w-full">
                <!-- Header row for desktop -->
                <div class="hidden sm:flex bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 font-semibold text-sm">
                  <div class="px-4 py-2 border-r border-gray-300 dark:border-gray-600 w-1/2">Field</div>
                  <div class="px-4 py-2 w-1/2">Value</div>
                </div>


                <div
                  v-for="(pair, idx) in getFieldValuePairs(item)"
                  :key="idx"
                  class="flex flex-col sm:flex-row border-t border-gray-300 dark:border-gray-600 w-full text-sm"
                >
                  <div class="px-4 py-2 sm:w-1/2 border-b sm:border-b-0 sm:border-r border-gray-300 dark:border-gray-600 truncate-item">
                    <span class="block sm:hidden text-xs text-gray-500 dark:text-gray-400">Field:</span>
                    <span class="block font-medium truncate-text">
                      {{ pair.field }}
                    </span>
                  </div>
                  <div class="px-4 py-2 sm:w-1/2 truncate-item">
                    <span class="block sm:hidden text-xs text-gray-500 dark:text-gray-400">Value:</span>
                    <span class="block truncate-text">
                      {{ pair.value }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  word-wrap: break-word;
}

html,
body,
:host {
  max-width: 100vw;
  overflow-x: hidden;
}


.truncate-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
@media (min-width: 640px) {
  .truncate-section {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

/* Truncation and wrapping */
.truncate-item {
  min-width: 0;
  flex: 1 1 auto;
  word-wrap: break-word;
  overflow-wrap: anywhere;
}

.truncate-text {
  display: block;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  word-break: break-word;
  overflow-wrap: anywhere;
}

 
/* Prevent table overflow on desktop */
@media (min-width: 640px) {
  .sm\:w-1\/2 {
    width: 50%;
    min-width: 0;
    max-width: 50%;
  }
}
@media (min-width: 640px) {
  .truncate-text {
    white-space: normal; /* Changed from nowrap */
    max-width: 100%;
  }
}

/* Smaller font for small screen */
@media (max-width: 360px) {
  .text-sm {
    font-size: 0.75rem;
  }
  .text-xs {
    font-size: 0.65rem;
  }
}
</style>