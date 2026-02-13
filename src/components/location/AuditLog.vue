<script setup lang="ts">
import { computed } from 'vue'
import toLocalDateTime from '@/filters/localdatetime'

const props = defineProps<{
  locationId: string
}>()

type AuditLog = {
  id: string
  target: string
  key: string
  newValue: string
  oldValue: string
  changedBy: {
    name: string
  }
  createdAt: string
}

const { getLocationAuditLogs } = useLocationAuditLogs()
const { result: auditLogsResult, loading } = getLocationAuditLogs(props.locationId)

const auditLogs = computed<AuditLog[]>(() => (auditLogsResult.value ?? []) as AuditLog[])

const logsWithFields = computed(() =>
  auditLogs.value.map(log => ({
    id: log.id,
    fields: [
      { label: 'ID', value: log.id },
      { label: 'Target', value: log.target },
      { label: 'Changed At', value: toLocalDateTime(log.createdAt) },
      { label: 'Old Value', value: log.oldValue || '—' },
      { label: 'New Value', value: log.newValue || '—' },
      { label: 'Changed By', value: log.changedBy?.name ?? '—' },
      { label: 'Key', value: log.key },
    ]
  }))
)
</script>

<template>
  <div class="p-4 max-w-full overflow-x-hidden">
    <h2 class="text-lg font-semibold mb-4">Audit Logs</h2>

    <div v-if="!loading">
      <div class="flex flex-col gap-4">
        <InfoCard
          v-for="log in logsWithFields"
          :key="log.id"
          :fields="log.fields"
        />
      </div>
    </div>

    <div v-else>
      Loading...
    </div>
  </div>
</template>

<style scoped></style>
