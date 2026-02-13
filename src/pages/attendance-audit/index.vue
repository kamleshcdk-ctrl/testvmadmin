<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import Column from 'primevue/column';
import { ref } from 'vue';

const showTenantId = ref(false);

const { getAdminAllIntegrations } = useAdminAllIntegrationsQuery();
const { integrations } = getAdminAllIntegrations();
interface IntegrationConfig {
  [key: string]: {
    route: string;
  };
}
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
// Integration type configuration
const integrationConfig: IntegrationConfig = {
  progressbook: {
    route: '/attendance-audit/progressbook/'
  },
  facts: {
    route: '/attendance-audit/facts/'
  },
  // powerschool: {
  //   route: '/attendance-audit/powerschool'
  // },
  // skyward: {
  //   route: '/attendance-audit/skyward'
  // },
  // infinitecampus: {
  //   route: '/attendance-audit/infinitecampus'
  // },
  // aeries: {
  //   route: '/attendance-audit/aeries'
  // }
};

// Helper method
const getIntegrationRoute = (slug: string) => {
  return integrationConfig[slug]?.route || null;
};
</script>

<template>
  <LayoutNormalCenter page-name="Attendance Audit"
    page-description="View and manage integration statuses. Click on a row for details.">

    <DataTable v-model:filters="filters" :value="integrations" paginator :rows="10" data-key="id"
      :global-filter-fields="['location.name', 'slug', 'id']">
      <template #header>
        <div class="flex justify-center">
          <div class="relative">
            <i class="pi pi-search absolute top-1/2 -mt-2 text-surface-400 leading-none end-3 z-1" />
            <InputText v-model="filters['global'].value" class="min-w-96" placeholder="Search" />
          </div>
        </div>
        <div class="flex justify-center items-center pt-3 mt-3 gap-3">
          <span class="text-surface-800 dark:text-surface-200">Show Tenant Id Column:</span>
          <ToggleSwitch id="showTenantId" v-model="showTenantId" />
        </div>
      </template>
      <template #empty>
        <div class="p-4">No district tenants found.</div>
      </template>

      <Column field="id" header="" :show-filter-menu="false">
        <template #body="{ data }">
          <router-link v-if="getIntegrationRoute(data.slug)" :to="getIntegrationRoute(data.slug) + data.location.id">
            <Button icon="pi pi-graduation-cap" rounded outlined severity="secondary" icon-only class="shrink-0" />
          </router-link>
        </template>
      </Column>

      <Column field="location.name" header="Name" style="min-width: 12rem">
        <template #body="{ data }">
          <router-link v-if="getIntegrationRoute(data.slug)" :to="getIntegrationRoute(data.slug) + data.location.id">
            {{ data.location.name }}
          </router-link>
          <template v-else>
            {{ data.location.name }}
          </template>
        </template>
      </Column>

      <Column header="Type" filter-field="slug" style="min-width: 12rem">
        <template #body="{ data }">
          <router-link v-if="getIntegrationRoute(data.slug)" :to="getIntegrationRoute(data.slug) + data.id">
            {{ data.slug }}
          </router-link>
          <template v-else>
            {{ data.slug }}
          </template>
        </template>
      </Column>

      <Column v-if="showTenantId" field="id" header="Tenant Id" :show-filter-menu="false" style="min-width: 12rem">
        <template #body="{ data }">
          <Tag :value="data.id" severity="secondary" />
        </template>
      </Column>

    </DataTable>

  </LayoutNormalCenter>
</template>

<style scoped></style>
