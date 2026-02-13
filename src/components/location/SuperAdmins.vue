<script setup lang="ts">
import { computed } from 'vue'
import toLocalDateTime from '@/filters/localdatetime'

const props = defineProps<{
  locationId: string
}>()

type User = {
  id: string
  name: string
  createdAt: string
}

const { getAdminUsersForLocation } = useAdminUsersForLocationQuery()
const { result: usersResult } = getAdminUsersForLocation(props.locationId)

const userList = computed<User[]>(() => (usersResult.value ?? []) as User[])

const usersWithFields = computed(() =>
  userList.value.map(user => ({
    id: user.id,
    fields: [
      { label: 'Id', value: user.id },
      { label: 'Name', value: user.name },
      { label: 'Created At', value: toLocalDateTime(user.createdAt) }
    ]
  }))
)
</script>

<template>
  <div class="p-4 max-w-full overflow-x-hidden">
    <h2 class="text-lg font-semibold mb-4">Admin Users</h2>
    <div class="flex flex-col gap-4">
      <InfoCard
        v-for="user in usersWithFields"
        :key="user.id"
        :fields="user.fields"
      />
    </div>
  </div>
</template>
