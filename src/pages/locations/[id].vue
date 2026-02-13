<script setup lang="ts">
import SuperAdmins from "@/components/location/SuperAdmins.vue"
import ConfiguredIntegrations from '@/components/location/ConfiguredIntegrations.vue'
import UserRoles from '@/components/location/UserRoles.vue'
import AuditLog from '@/components/location/AuditLog.vue'
import EmergencyUpdates from '@/components/location/EmergencyUpdates.vue'
import RecentActivity from '@/components/location/RecentActivity.vue'
import ActiveDevices from '@/components/location/ActiveDevices.vue'

const route = useRoute();
const locationId = route.params.id as string | undefined;
const { getLocationById } = useLocationByIdQuery()
const { result: location, refetch } = getLocationById(route.params.id)

watch(route, ({ params }) => {
  refetch({
    id: params.id,
  });
});

const { getChildLocations } = useChildLocationsQuery()
const { result: childLocations } = getChildLocations(route.params.id)

</script>

<template>
  <div>
    <LayoutNormalCenter
      :page-name="location?.name + ' (School Location)'"
      page-description=
      "View or edit details about the selected school location.">
      <NuxtPage/>
      <SectionDivider title="School district tenant for this location"/>
      <TenantLink :tenant-id="location?.tenant?.id" :tenant-name="location?.tenant?.name" />  

      <FeatureFlagsSelector :location-id="locationId || ''"/>

      <HideableSection title="Recent Activity">
        <RecentActivity :location-id="locationId || ''"/>
      </HideableSection>
      
      <HideableSection title="Parent/District School Location Hierarchy" :hidden="true">
        <div v-if="location?.parent" >
          Parent/District School Location
          <router-link :to="'/locations/' + location?.parent?.id"
              class="text-surface-800 dark:text-surface-50 pl-4">
              <Button icon="pi pi-building-columns" rounded outlined severity="secondary" icon-only
              class="shrink-0 pr-5 mr-5" />
              {{ location?.parent?.name}} (Parent School Location)
          </router-link>
        </div>
        <div v-else>
          no parent school
        </div>


        <div v-if="childLocations?.length > 0" class="mt-5">
          <div v-for="childLocation in childLocations" :key="childLocation.id">

            <router-link :to="'/locations/' + childLocation?.id"
                class="text-surface-800 dark:text-surface-50 pl-4">
                <Button icon="pi pi-building-columns" rounded outlined severity="secondary" icon-only
                class="shrink-0 pr-5 mr-5" />
                {{ childLocation?.name}} (Child School Location)
            </router-link>
          </div>

        </div>
        <div v-else class="mt-5">
          no child schools
        </div>


      </HideableSection>

      <HideableSection title="Super Admins" :hidden="true">
        <SuperAdmins :location-id="locationId ?? ''"/>
      </HideableSection>

      <HideableSection title="Roles" :hidden="true">
        <UserRoles :location-id="locationId ?? ''"/>
      </HideableSection>

      <HideableSection title="Configured Integrations" :hidden="true">
        <ConfiguredIntegrations :location-id="locationId ?? ''"/>
      </HideableSection>

      <HideableSection title="Audit Log" :hidden="true">
        <AuditLog :location-id="locationId || ''"/>
      </HideableSection>

      <HideableSection title="Emergency Updates" :hidden="true">
        <EmergencyUpdates :location-id="locationId || ''"/>
      </HideableSection>

      <HideableSection title="Active Devices" :hidden="true">
        <ActiveDevices :location-id="locationId ?? ''"/>
      </HideableSection>

      <!-- Full JSON -->
      <HideableSection title="Full Json for School Location" :hidden="true">
        <JsonDisplay :value="location" />
      </HideableSection>


    </LayoutNormalCenter>
  </div>
</template>