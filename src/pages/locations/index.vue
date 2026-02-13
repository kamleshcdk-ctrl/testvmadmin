<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import Column from 'primevue/column';
import { ref } from 'vue';

const showAddress = ref(false);
const showParentSchoolName = ref(false);
const showLocationId = ref(false);
const showNcesIds = ref(false);
const locationsLoaded = ref(false);

const { getLocations } = useLocationsQuery();
const { locations: locationsFromApi, onResult } = getLocations();

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Show a cached version of the location list from local storage immediately
onResult((result) => {
  if (result.data) {
    locationsLoaded.value = true;
    // @ts-expect-error location type
    const storedLocations = result.data?.adminLocations?.map((location) => {
      return {
        id: location.id,
        name: location.name,
        tenant: location.tenant,
        pmkSchoolId: location.pmkSchoolId,
        expired: location.expired,
      };
    })
    localStorage.setItem('vmadmin_locations', JSON.stringify(storedLocations));
  }
});

const locations = computed<object[]>(() => {
  if (locationsLoaded.value) {
    return locationsFromApi.value;
  }
  const localStorageLocations = localStorage.getItem('vmadmin_locations');
  return localStorageLocations ? JSON.parse(localStorageLocations) : [];
})

</script>

<template>
<div>
    <LayoutNormalCenter
      page-name="School Locations"
      page-description=
      "Search for school locations within a district by name, tenant name, parent name, nces id, address or location id. Click on a row for details about the school location.">

        <DataTable v-model:filters="filters" :value="locations" paginator :rows="10" data-key="id"
          :global-filter-fields="[
            'name', 'tenant.name', 'parent.name', 'address', 'id', 'pmkSchoolId', 'ncesDistrictId', 'ncesId'
          ]">
                <template #header>
                    <div class="flex justify-center">
                        <div class="relative">
                            <i class="pi pi-search absolute top-1/2 -mt-2 text-surface-400 leading-none end-3 z-1" />
                            <InputText v-model="filters['global'].value" class="min-w-96" placeholder="Search" />
                        </div>
                    </div>
                    <div class="flex justify-center items-center pt-3 mt-3 gap-3">
                        <span class="text-surface-800 dark:text-surface-200">Show Address Column:</span>
                        <ToggleSwitch id="showAddress" v-model="showAddress" />
                        <span class="text-surface-800 dark:text-surface-200">Show Parent School Name Column:</span>
                        <ToggleSwitch id="showParentSchoolName" v-model="showParentSchoolName" />
                        <span class="text-surface-800 dark:text-surface-200">Show Nces Id Columns:</span>
                        <ToggleSwitch id="showNcesIds" v-model="showNcesIds" />
                    </div>
                </template>
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

                <Column field="name" header="School Location Name" style="min-width: 5rem">
                    <template #body="{ data }">
                    <router-link :to="'/locations/'+data.id">
                        {{ data.name }}
                    </router-link>
                    </template>
                </Column>

                <Column field="tenant.name" header="District Tenant" style="min-width: 5rem">
                    <template #body="{ data }">
                      {{ data.tenant.name }}
                    </template>
                </Column>

                <Column v-if="showParentSchoolName" field="parent.name" header="Parent Location" style="min-width: 5rem">
                    <template #body="{ data }">
                      {{ data.parent.name }}
                    </template>
                </Column>

                <Column field="pmkSchoolId" header="Pmk School Id">
                    <template #body="{ data }">
                      {{ data.pmkSchoolId }}
                    </template>
                </Column>

                <Column v-if="showNcesIds" field="ncesDistrictId" header="Nces District Id">
                    <template #body="{ data }">
                      {{ data.ncesDistrictId }}
                    </template>
                </Column>

                <Column v-if="showNcesIds" field="ncesId" header="Nces Id">
                    <template #body="{ data }">
                      {{ data.ncesId }}
                    </template>
                </Column>

                <Column v-if="showAddress" header="Address" field="address" filter-field="address" style="min-width: 5rem">
                    <template #body="{ data }">
                        <router-link :to="'/locations/'+data.id">
                            {{ data.address }}
                        </router-link>

                    </template>
                </Column>

                <Column v-if="showLocationId" field="id" header="Location Id" style="min-width: 5rem">
                    <template #body="{ data }">
                        <Tag :value="data.id" severity="secondary"/>
                    </template>
                </Column>

                <Column field="sandbox" header="Sandbox" >
                    <template #body="{ data }">
                      <i v-if="data.tenant.sandbox" class="pi pi-check-circle text-gray-500"></i>
                    </template>
                </Column>

                <Column field="expired" header="Unexpired" data-type="boolean">
                    <template #body="{ data }">
                        <i class="pi" :class="{ 'pi-check-circle text-pmkblue': !data.tenant.expired, 'pi-times-circle text-red-400': data.tenant.expired }"></i>
                    </template>
                </Column>
            </DataTable>

            <div class="flex justify-center items-center pt-3 mt-3 gap-3">
              <router-link to="/locations/details">
                <span class="text-surface-800 dark:text-surface-200">Detailed Location List</span>
              </router-link>
            </div>
      </LayoutNormalCenter>
</div>
</template>

<style scoped></style>
