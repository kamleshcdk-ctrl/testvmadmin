<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import Column from 'primevue/column';
import { ref } from 'vue';

const showTenantId = ref(false);

const { getTenants } = useTenantsQuery();
const { tenants } = getTenants();

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

</script>

<template>
    <LayoutNormalCenter
      page-name="District Tenants"
      page-description=
      "Search for school district tenants by name, dashboard subdomain or tenant id. Click on a row for details about the district tenant.">

        <DataTable v-model:filters="filters" :value="tenants" paginator :rows="10" data-key="id" :global-filter-fields="['name', 'domain', 'id']">
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

                <Column field="id" header="" :show-filter-menu="false" >
                    <template #body="{ data }">
                    <router-link :to="'/tenants/'+data.id">
                        <Button icon="pi pi-graduation-cap" rounded outlined severity="secondary" icon-only class="shrink-0" />
                      </router-link>
                    </template>
                </Column>

                <Column field="name" header="Name" style="min-width: 12rem">
                    <template #body="{ data }">
                    <router-link :to="'/tenants/'+data.id">
                        {{ data.name }}
                    </router-link>
                    </template>
                </Column>

                <Column header="Domain" filter-field="domain" style="min-width: 12rem">
                    <template #body="{ data }">
                        <router-link :to="'/tenants/'+data.id">
                            {{ data.domain }}
                        </router-link>

                    </template>
                </Column>

                <Column v-if="showTenantId" field="id" header="Tenant Id" :show-filter-menu="false" style="min-width: 12rem">
                    <template #body="{ data }">
                        <Tag :value="data.id" severity="secondary"/>
                    </template>
                </Column>

                <Column field="sandbox" header="Sandbox" :show-filter-menu="true" >
                    <template #body="{ data }">
                      <i v-if="data.sandbox" class="pi pi-check-circle text-gray-500"></i>
                    </template>
                </Column>

                <Column field="expired" header="Unexpired" data-type="boolean" style="min-width: 6rem">
                    <template #body="{ data }">
                        <i class="pi" :class="{ 'pi-check-circle text-pmkblue': !data.expired, 'pi-times-circle text-red-400': data.expired }"></i>
                    </template>
                </Column>
            </DataTable>

            <div class="flex justify-center items-center pt-3 mt-3 gap-3">
              <router-link to="/locations/details">
                <span class="text-surface-800 dark:text-surface-200">Detailed Tenant List</span>
              </router-link>
            </div>
      </LayoutNormalCenter>
</template>

<style scoped></style>
