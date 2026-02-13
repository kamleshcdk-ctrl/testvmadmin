
<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import JobLogDataDialog from '@/components/tools/JobLogDataDialog.vue'
type StatusType = 'active' | 'failed' | 'delayed' | 'completed' | 'waiting'

type JobLog = {
  name: string;
  counts: Record<StatusType, number>;
}

const { getAllTaskQueue } = useAllTaskQueueQuery()
const raw = getAllTaskQueue()
const queues = computed<JobLog[]>(() => raw.queues.value as JobLog[])

const showDialog = ref(false)
const jobName = ref("")
const status = ref("")

function getNonZeroStatuses(queue: JobLog) {
  const result = Object.entries(queue.counts)
    .filter(([_, val]) => val > 0)
    .map(([key, val]) => ({ type: key as StatusType, count: val }))

  return result.length > 0 ? result : [{ type: "No Jobs", count: 0 }]
}


function handleClick(queue: JobLog, type: string, count: number) {
  if (count > 0) {
    jobName.value = queue.name
    status.value = type
    showDialog.value = true
  }
}
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<template>
<div class="p-3">
  <h2 class="text-lg font-semibold mb-3">All Queues</h2>

  <div class="flex flex-wrap gap-3">
    <Card v-for="queue in queues" :key="queue.name"
      class="w-full sm:w-[48%] md:w-[32%] lg:w-[24%] border border-gray-200 shadow bg-surface-0 dark:bg-surface-900">
      <template #content>
        <div class="flex flex-col text-sm text-surface-700 dark:text-surface-200">
          <span class="font-semibold truncate mb-2">{{ queue.name }}</span>

          <span v-for="info in getNonZeroStatuses(queue)" :key="info.type"
            class="flex justify-between items-center px-1 py-1 hover:bg-gray-100 rounded cursor-pointer"
            @click="handleClick(queue, info.type, info.count)">
            <span>{{ capitalize(info.type) }}</span>
            <span class="font-medium">{{ info.count }}</span>
          </span>
        </div>
      </template>
    </Card>
  </div>
</div>
<Dialog v-model:visible="showDialog" modal header="Job Log Info" class="w-[90vw] md:w-[50vw]">
  <JobLogDataDialog v-if="jobName && status" :key="jobName + status" :job-name="jobName" :status="status" />
</Dialog>
</template>

<style scoped>
.p-card {
  padding: 0.75rem;}
</style>
