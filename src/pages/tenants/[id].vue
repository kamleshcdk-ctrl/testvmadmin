<script setup lang="ts">
import Column from 'primevue/column';

const route = useRoute();

const { getTenantById } = useTenantByIdQuery()
const { result: tenant } = getTenantById(route.params.id)

</script>

<template>
  <LayoutNormalCenter
    :page-name="tenant?.name + ' (District Tenant)'"
    page-description=
    "View or edit details about the selected school district tenant.">

    <NuxtPage/>

    <!-- School locations within district tenant -->
    <DataTable :value="tenant?.locations" data-key="id">
      <template #empty>
          <div class="p-4">No locations found.</div>
      </template>

      <Column field="id" header="" >
          <template #body="{ data }">
          <router-link :to="'/locations/'+data.id">
              <Button icon="pi pi-building-columns" rounded outlined severity="secondary" icon-only class="shrink-0" />
            </router-link>
          </template>
      </Column>

      <Column field="name" header="School Location" style="min-width: 5rem">
          <template #body="{ data }">
          <router-link :to="'/locations/'+data.id">
              {{ data.name }}
          </router-link>
          </template>
      </Column>

      <Column field="pmkSchoolId" header="Pmk School Id">
          <template #body="{ data }">
            {{ data.pmkSchoolId }}
          </template>
      </Column>
    </DataTable>

    <!-- Tenant adminn users -->
    <HideableSection title="Tenant Admin Users" :hidden="true">
      <div class="flex gap-3">
        <div v-if="tenant?.admins?.length > 0">
          <div v-for="tenantAdmin in tenant?.admins" :key="tenantAdmin.id">
            <router-link :to="'/users/'+tenantAdmin.user.id"
                class="text-surface-800 dark:text-surface-50 pl-4">
                <Button icon="pi pi-users" rounded outlined severity="secondary" icon-only
                class="shrink-0 pr-5 mr-5" />
                {{ tenantAdmin.user.name }}
            </router-link>
          </div>
        </div>
        <div v-else class="p-4">
          None found.
        </div>
      </div>
    </HideableSection>

    <!-- Full JSON -->
    <HideableSection title="Full Json for District Tenant" :hidden="true">
      <JsonDisplay :value="tenant" />
    </HideableSection>

  </LayoutNormalCenter>
</template>
