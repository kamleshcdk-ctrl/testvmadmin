<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  locationId: { type: String, required: true }
})

type Role = {
  id: string
  name: string
  userCount: number
  syncAutoRemove: boolean
  integrationRoleIds: string[] | null
}

const { getRolesForLocation } = useRolesForLocationQuery()
const { result: rolesForLocation } = getRolesForLocation(props.locationId)

const rolesList = computed<Role[]>(() => (rolesForLocation.value ?? []) as Role[])

const rolesWithFields = computed(() =>
  rolesList.value.map(role => ({
    id: role.id,
    fields: [
      { label: 'Name', value: role.name, colspan: 3  },
      { label: 'Id', value: role.id },
      { label: 'User Count', value: role.userCount },
      { label: 'Sync Auto Remove', value: role.syncAutoRemove ? 'Yes' : 'No' },
      { label: 'Integration Role Ids', value: role.integrationRoleIds?.join(', ') ?? '—' }
    ]
  }))
)
</script>

<template>
  <div class="p-4 max-w-full overflow-x-hidden">
    <h2 class="text-lg font-semibold mb-4">Roles</h2>
    <div class="flex flex-col gap-4">
      <InfoCard
        v-for="role in rolesWithFields"
        :key="role.id"
        :fields="role.fields"
      />
    </div>
  </div>
</template>
