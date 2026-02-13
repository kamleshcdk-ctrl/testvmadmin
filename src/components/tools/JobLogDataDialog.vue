<script setup lang="ts">
import Panel from 'primevue/panel'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
// 1. Define the JobLogItem interface
interface JobLogItem {
  name: string;
  location: string;
  createdBy: string;
  processedOn: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}
const props = defineProps({
  jobName: {
    type: String,
    default: "WriteAttendance",
  },
  status: {
    type: String,
    default: "failed",
  },
  value: {
    type: [Object],
    default: () => { },
  },
});
const { getJobLogs } =  useJobLogsQuery();
const queryResult = getJobLogs(props.jobName, props.status);
const data = computed<JobLogItem[]>(() => {
  return (queryResult.jobLogs.value || []) as JobLogItem[];
});
</script>
<template>
    <div class="p-4 text-surface-700 dark:text-surface-200 bg-surface-0 dark:bg-surface-900">
      <Panel class="mb-4 bg-surface-0 dark:bg-surface-900" header="Job Logs">
        <div v-if="data && data.length > 0" class="flex flex-wrap">
          <div
            v-for="item in data"
            :key="item.name"
            class="w-full md:w-1/2 border border-gray-300 p-3"
          >
            <div class="text-sm text-surface-700! dark:text-surface-200!">
              <div><b>Name:</b> {{ item.name }}</div>
              <div><b>Status:</b> {{ props.status }}</div>
              <div><b>Location:</b> {{ item.location }}</div>
              <div><b>Created By:</b> {{ item.createdBy }}</div>
              <div><b>Processed On:</b> {{ item.processedOn }}</div>
  
              <Accordion class="mt-2">
                <AccordionTab header="View JSON Data">
                  <JsonDisplay :value="item?.data" />
                </AccordionTab>
              </Accordion>
            </div>
          </div>
        </div>
  
        <div v-else class="text-gray-500 text-sm">No job logs found.</div>
      </Panel>
    </div>
</template>

<style scoped>
    pre {
    white-space: pre-wrap;
    word-break: break-word;
    }
</style>