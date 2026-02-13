<script setup lang="ts">
import { computed } from 'vue'
import toLocalDateTime from '@/filters/localdatetime'

const props = defineProps<{
  locationId: string
}>()

type Activity = {
  id: string
  message: string
  createdAt: string
}

const { getRecentActivities } = userRecentActivities()
const { result: activitiesResult, loading } = getRecentActivities(props.locationId)

const activities = computed<Activity[]>(() =>
  (activitiesResult.value ?? []) as Activity[]
)

const activityCards = computed(() =>
  activities.value.map(activity => ({
    id: activity.id,
    fields: [
      { label: 'ID', value: activity.id },   
      { label: 'Created At', value: toLocalDateTime(activity.createdAt) },
      { label: 'Message', value: activity.message ,colspan: 3 }
    ]
  }))
)
</script>

<template>
  <div class="p-4 max-w-full overflow-x-hidden">
    <h2 class="text-lg font-semibold mb-4">Recent Activities</h2>

    <div v-if="!loading">
      <div class="flex flex-col gap-4">
        <InfoCard
          v-for="activity in activityCards"
          :key="activity.id"
          :fields="activity.fields"
        />
      </div>
    </div>

    <div v-else>
      Loading...
    </div>
  </div>
</template>

<style scoped></style>
