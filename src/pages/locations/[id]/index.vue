<script setup lang="ts">
import toLocalDate from "@/filters/localdate";

const route = useRoute();
const { getLocationById } = useLocationByIdQuery()
const { result: location, refetch } = getLocationById(route.params.id)

watch(route, ({ params }) => {
  refetch({
    id: params.id,
  });
});

const { client } = useApolloClient();

async function intrude() {
  const resp = await client.mutate({
    mutation: gql`
      mutation adminIntrudeOnLocation($locId: String!) {
        adminIntrudeOnLocation(locationId: $locId)
      }
    `,
    variables: {
      locId: route.params.id,
    },
  });

  const url = resp.data.adminIntrudeOnLocation;
  window.open(url);
}
</script>

<template>
  <div>
    <hr />
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-6">
      <div class="flex flex-col gap-2 w-full sm:w-auto">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">Pikmykid School Id:</div>
        <div class="text-base text-surface-900 dark:text-surface-0">
          <Tag :value="location?.pmkSchoolId ? location?.pmkSchoolId : '-'" severity="primary" />
        </div>
      </div>

      <div class="flex flex-col gap-2 w-full sm:w-auto">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">Timezone:</div>
        <div class="text-base text-surface-900 dark:text-surface-0">{{ location?.timezone }}</div>
      </div>

      <div class="flex flex-col gap-2 w-full sm:w-auto">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">Expires At:</div>
        <div class="text-base text-surface-900 dark:text-surface-0">
          {{ location?.expiresAt ? toLocalDate(location?.expiresAt) : 'Never' }}
        </div>
      </div>

      <div class="flex w-full sm:w-auto justify-start sm:justify-end">
        <Button class="min-w-[12rem]" @click="intrude">Login as Super Admin</Button>
      </div>
    </div>

    <!-- Address row -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-6">
      <div class="flex flex-col gap-2 w-full sm:w-auto">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">Address:</div>
        <div class="text-base text-surface-900 dark:text-surface-0">{{ location?.address }}</div>
      </div>
    </div>


   <!-- NCES Id etc -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-6">
      <div class="flex flex-col gap-2 w-full sm:w-auto">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Nces Id:
          <Tag :value="location?.ncesId ? location?.ncesId : 'Unknown'" severity="secondary" />
        </div>
      </div>

      <div class="flex flex-col gap-2 w-full sm:w-auto">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Nces District Id:
          <Tag :value="location?.ncesDistrictId ? location?.ncesDistrictId : 'Unknown'" severity="secondary" />
        </div>
      </div>

      <div class="flex flex-col gap-2 w-full sm:w-auto">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Child Location Limit:
          <Tag :value="location?.childLimit ? location?.childLimit : 'None'" severity="secondary" />
        </div>
      </div>
    </div>

    <!-- Notes and edit button -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-6">
      <div class="flex flex-col gap-2 w-full sm:w-auto">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0 leading-tight">
          Note:
          <span v-if="location?.notes" class="text-lg text-surface-700 dark:text-surface-300 leading-normal">
            {{ location?.notes }}
          </span>
          <span v-else class="pt-2 text-lg text-surface-700 dark:text-surface-300 leading-normal">empty</span>
        </div>
      </div>

      <div class="flex w-full sm:w-auto justify-start sm:justify-end">
        <router-link :to="`/locations/${route.params.id}/edit`">
          <Button class="bg-surface-400 border-surface-200 min-w-[12rem]">Edit Location</Button>
        </router-link>
      </div>
    </div>
  </div>
</template>
