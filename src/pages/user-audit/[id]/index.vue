
<script setup lang="ts">
import { useVisituUsersStore } from '@/store/visituUsers'
import Select from '@/volt/Select.vue';

const route = useRoute();
const userStore = useVisituUsersStore()

const { getUsersInTenantLocationsCount } = useUsersInTenantCountQuery()
const { count: tenantUserCount, userCountForEachLocation }
  = getUsersInTenantLocationsCount(route.params.id)

const { getTenantById } = useTenantByIdQuery()
const { onResult: onTenantResult } = getTenantById(route.params.id)

const selectedLocation = ref(userStore.activeTenantsSelectedLocation);
const tenantLocations = ref([]);

onTenantResult(async (loadedResult) => {
  if (!loadedResult.loading) {
    const domain = loadedResult?.data?.adminTenant?.domain
    userStore.setupByDomain(domain)
    tenantLocations.value = loadedResult?.data?.adminTenant?.locations || [];
  }
})

async function loadTenantOrLocationUsers() {
  // delete all stored info for the tenant
  userStore.deleteAllActiveTenantUsers()

  if (selectedLocation.value) {
    userStore.loadLocationUsers(selectedLocation.value.id)
  } else {
    userStore.loadTenantUsers(`${route.params.id}`)
  }
  // @ts-expect-error selectedLocation type
  userStore.setActiveTenantsSelectedLocation(selectedLocation.value);
}

const userCount = computed(() => {
  if (userStore.activeTenantsSelectedLocation) {
    return (userCountForEachLocation.value.get(userStore.activeTenantsSelectedLocation?.id))?.count
  }
  return (tenantUserCount.value || 0)
});
</script>

<template>
<div>
  <div class="flex flex-1 items-center justify-left p-2">
    <div class="flex flex-col gap-2  p-2 m-2">
      <Select v-model="selectedLocation" :options="tenantLocations" option-label="name"
        placeholder="Select Location (all)" checkmark show-clear class="w-full md:w-56 max-w-[200px] truncate" />
    </div>
    <div class="flex flex-col gap-2  p-2 m-2">
      <Button :class="(userStore.activeTenantUsers?.size || 0) > 0
        ? 'bg-surface-300 border-surface-200' : 'bg-primary-400 border-primary-200'"
        @click="loadTenantOrLocationUsers()">
        Load Users
      </Button>
    </div>
    <div class="flex flex-col gap-2 p-2 m-2">
      <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
        Loaded {{ userStore.activeTenantUsers?.size || 0 }} of {{ userCount }}
        in
        {{ userStore.activeTenantsSelectedLocation ?
          userStore.activeTenantsSelectedLocation?.name : 'Tenant' }}
      </div>
    </div>
  </div>
  <div class="pt-5">
    <DefaultUserAgGrid :loading="userStore.loading" :users-with-role-names="userStore.getActiveTenantUsers"
      :tenant-id="`${route.params.id}`" :loaded-user-count="userStore.activeTenantUsers?.size || 0"
      :duplicate-user-count="userStore.getUsersWithDuplicatedNames?.length || 0" />
  </div>
</div>
</template>
