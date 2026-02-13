<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import toLocalDateTime from '@/filters/localdatetime'
import { useAdminAllIntegrationErrorsQuery } from '@/composables/useIntegrationQueries'


type LogEntry = {
  id: string
  slug: string
  message: string
  createdAt: string
  integration: { id: string; slug: string }
}

type LocationWithLogs = {
  id: string
  name: string
  slug: string
  logs: LogEntry[]
}

const { getAdminAllIntegrationErrors } = useAdminAllIntegrationErrorsQuery()
const { locations } = getAdminAllIntegrationErrors()

// Define the raw location type from the API
interface LocationWithRawLogs {
  id: string
  name?: string
  slug: string
  logs?: Array<{
    id: string
    integrationSlug: string
    message: string
    createdAt: string
    integration?: { id: string; slug: string }
    integrationId?: string
  }>
  errors?: Array<{
    id: string
    integrationSlug: string
    message: string
    createdAt: string
    integration?: { id: string; slug: string }
    integrationId?: string
  }>
}

const locationList = computed<LocationWithLogs[]>(() =>
  ((locations.value as unknown as LocationWithRawLogs[]) ?? []).map((loc) => ({
    id: loc.id,
    name: loc.name ?? 'Unknown location',
    slug: loc.slug,
    logs: (loc.logs ?? loc.errors ?? []).map((log) => ({
      id: log.id,
      slug: log.integrationSlug,
      message: log.message,
      createdAt: log.createdAt,
      integration: log.integration ?? { id: log.integrationId ?? '', slug: log.integrationSlug },
    })),
  }))
)

const expandedItems = ref<Record<string, boolean>>({})
const toggleExpand = (id: string) => {
  expandedItems.value[id] = !expandedItems.value[id]
}

 

</script>

<template>
  <div class="p-4 max-w-full overflow-x-hidden">
    <h2 class="text-lg font-semibold mb-4">Integration Errors</h2>

    <div class="flex flex-col gap-4">
      <Card
        v-for="loc in locationList"
        :key="loc.id"
        class="w-full border border-gray-200 shadow bg-surface-0 dark:bg-surface-900"
      >
        <template #content>
          <div class="flex flex-col gap-2 text-sm text-surface-700 dark:text-surface-200">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div class="flex flex-wrap gap-2 truncate-section">
                <div class="truncate-item">
                  Location: {{ loc.name }}
                </div>
                <div class="truncate-item">
                  Integration: {{ loc.slug }}
                </div>
                <div class="truncate-item">
                  Errors: {{ loc.logs.length }}
                </div>
              </div>
              <Button
                text
                size="small"
                label="Details"
                icon="pi pi-chevron-down"
                :icon-pos="'right'"
                @click="toggleExpand(loc.id)"
              />
            </div>

            <div
              v-if="expandedItems[loc.id]"
              class="pt-2 text-sm text-gray-800 dark:text-gray-100 w-full"
            >
              <div class="overflow-x-auto max-w-full border border-gray-300 dark:border-gray-600 rounded">
                <table class="w-full max-w-full table-fixed text-left text-sm">
                  <thead class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                    <tr>
                      <th class="px-4 py-2 w-1/2">Message</th>
                      <th class="px-4 py-2 w-1/4">Integration</th>
                      <th class="px-4 py-2 w-1/4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="log in loc.logs"
                      :key="log.id"
                      class="border-t border-gray-300 dark:border-gray-600 align-top"
                    >
                      <td class="px-4 py-2 align-top vertical-align-top">
                         
                        <div class="truncate-text whitespace-pre-wrap">{{ log.message }}</div>
                      </td>
                      <td class="px-4 py-2 align-top vertical-align-top">
                    
                        <div class="truncate-text whitespace-normal">{{ log.integration?.slug ?? log.slug }}</div>
                      </td>
                      <td class="px-4 py-2 align-top vertical-align-top">
                       
                        <div class="truncate-text whitespace-normal">{{ toLocalDateTime(log.createdAt) }}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  align-items: center;
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
}

@media (min-width: 640px) {
  .truncate-text {
    white-space: nowrap;
  }
}

/* Responsive table styling */
.overflow-x-auto {
  overflow-x: auto;
  max-width: 100vw;
}

.w-full {
  max-width: 100%;
}

/* Table fixed layout */
.table-fixed {
  table-layout: fixed;
  width: 100%;
  max-width: 100%;
}

/* Table cell width constraints */
.table-fixed th:nth-child(1),
.table-fixed td:nth-child(1) {
  width: 50%;
}

.table-fixed th:nth-child(2),
.table-fixed td:nth-child(2) {
  width: 25%;
}

.table-fixed th:nth-child(3),
.table-fixed td:nth-child(3) {
  width: 25%;
}

/* Ensure proper vertical alignment */
.vertical-align-top {
  vertical-align: top !important;
}

/* Table cell styling for consistent alignment */
table td {
  vertical-align: top !important;
}

/* Message text styling */
.whitespace-pre-wrap {
  white-space: pre-wrap !important;
  word-wrap: break-word;
  overflow-wrap: anywhere;
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