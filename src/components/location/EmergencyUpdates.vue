<script setup lang="ts">
import { computed } from 'vue'
import toLocalDateTime from '@/filters/localdatetime'

const props = defineProps<{
  locationId: string
}>()

type EmergencyUpdate = {
  id: string
  status: string
  sentCount: number
  targetCount: number
  message: string
  completedAt: string | null
  createdAt: string
}

const { getEmergencyUpdatesForLocation } = useEmergencyUpdatesForLocationQuery()
const { result: emergencyUpdatesResult, loading } = getEmergencyUpdatesForLocation(props.locationId)

const emergencyUpdates = computed<EmergencyUpdate[]>(() =>
  (emergencyUpdatesResult.value ?? []) as EmergencyUpdate[]
)

const updatesWithFields = computed(() =>
  emergencyUpdates.value.map(update => ({
    id: update.id,
    fields: [
      { label: 'Id', value: update.id },
      { label: 'Status', value: update.status },
      { label: 'Completed At', value: update.completedAt ? toLocalDateTime(update.completedAt) : '—' },
      { label: 'Target Count', value: update.targetCount.toString() },   
      { label: 'Sent Count', value: update.sentCount.toString() },
      { label: 'Created At', value: toLocalDateTime(update.createdAt) },
      { label: 'Message', value: update.message, colspan: 3  },  
    ]
  }))
)
</script>

<template>
  <div class="p-4 max-w-full overflow-x-hidden">
    <h2 class="text-lg font-semibold mb-4">Emergency Updates</h2>

    <div v-if="!loading">
      <div class="flex flex-col gap-4">
        <InfoCard
          v-for="update in updatesWithFields"
          :key="update.id"
          :fields="update.fields"
        />
      </div>
    </div>

    <div v-else>
      Loading...
    </div>
  </div>
</template>

<style scoped></style>
