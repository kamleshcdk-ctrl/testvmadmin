<script setup lang="ts">
import { computed } from 'vue'
import toLocalDateTime from '@/filters/localdatetime'
import InfoCard from '@/components/InfoCard.vue'

const props = defineProps<{
  locationId: string
}>()

type Device = {
  id: string
  name: string
  mode: string
  model: string
  externalIp: string
  internalIp: string
  osVersion: string
  appVersion: string
  printerStatus: string
  seenAt: string
  createdAt: string
  updatedAt: string
  tenantId: string
  hasPrinter: boolean
  compliantFailures: number
}

const { getLocationDevices } = useLocationDevices()
const { result: devicesResult, loading } = getLocationDevices(props.locationId)

const devices = computed<Device[]>(() => (devicesResult.value ?? []) as Device[])

const deviceCards = computed(() =>
  devices.value.map(device => ({
    id: device.id,
    fields: [
      { label: 'ID', value: device.id},
      { label: 'Name', value: device.name },
      { label: 'Mode', value: device.mode },
      { label: 'Model', value: device.model },
      { label: 'External IP', value: device.externalIp },
      { label: 'Internal IP', value: device.internalIp },
      { label: 'OS Version', value: device.osVersion },
      { label: 'App Version', value: device.appVersion },
      { label: 'Printer Status', value: device.printerStatus },
      { label: 'Seen At', value: toLocalDateTime(device.seenAt) },
      { label: 'Created At', value: toLocalDateTime(device.createdAt) },
      { label: 'Updated At', value: toLocalDateTime(device.updatedAt) },
      { label: 'Tenant ID', value: device.tenantId},
      { label: 'Has Printer', value: device.hasPrinter ? 'Yes' : 'No' },
      { label: 'Compliant Failures', value: device.compliantFailures }
    ]
  }))
)
</script>

<template>
  <div class="p-4 max-w-full overflow-x-hidden">
    <h2 class="text-lg font-semibold mb-4">Location Devices</h2>

    <div v-if="!loading">
      <div class="flex flex-col gap-4">
        <InfoCard
          v-for="device in deviceCards"
          :key="device.id"
          :fields="device.fields"
        />
      </div>
    </div>

    <div v-else>
      Loading...
    </div>
  </div>
</template>

<style scoped></style>
