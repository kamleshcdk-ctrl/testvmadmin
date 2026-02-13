<script setup lang="ts">
import toLocalDate from "@/filters/localdate";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();


const locationName = ref<string>('')
const originalLocationName = ref<string>('')

const pmkSchoolId = ref<string>('')
const locationTimezone = ref<string>('')
const expiresAt = ref();
const locationAddress = ref<string>('')
const ncesId = ref<string>('')
const ncesDistrictId = ref<string>('')
const childLocationLimit = ref<string>('')

const notes = ref<string>('')

const { getLocationById } = useLocationByIdQuery()
const { result: location, refetch: refetchLocation, onResult } = getLocationById(route.params.id)

watch(route, ({ params }) => {
  refetchLocation({
    id: params.id,
  });
});

onResult((result) => {
  if (!result.loading && result.data?.adminLocation) {
    locationName.value = result.data?.adminLocation?.name
    originalLocationName.value = result.data?.adminLocation?.name

    pmkSchoolId.value = result.data?.adminLocation?.pmkSchoolId
    locationTimezone.value = result.data?.adminLocation?.timezone
    expiresAt.value = result.data?.adminLocation?.expiresAt
    locationAddress.value = result.data?.adminLocation?.address
    ncesId.value = result.data?.adminLocation?.ncesId
    ncesDistrictId.value = result.data?.adminLocation?.ncesDistrictId
    childLocationLimit.value = result.data?.adminLocation?.childLimit
    notes.value = result.data?.adminLocation?.notes
  }
});

// Closing the 'rename location' dialog sets the temporary name value back
// to what the name was when the page was loaded.
const renameDialogVisible = ref<boolean>(false)
const cancelRename = () => {
  locationName.value = originalLocationName.value
  renameDialogVisible.value = false
}

const { client } = useApolloClient();


async function clearLocationExpirationDate() {
  confirm.require({
    message: 'Are you sure you want to clear the expiration date for the location?',
    header: 'Confirmation',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Confirm'
    },
    accept: async () => {
      try {
        await client.mutate({
          mutation: gql`
            mutation AdminClearLocationExpirationDate(
              $locId: String!
              $input: AdminLocationInput!
            ) {
              adminUpdateLocation(id: $locId, input: $input) {
                id
              }
            }
          `,
          variables: {
            locId: route.params.id,
            input: {
              expiresAt: null,
            },
          },
        });
        refetchLocation()

        toast.add({
          severity: 'info', summary: 'Confirmed',
          detail: 'You have successfully cleared the location expiration date', life: 3000
        });

        router.push({
          path: `/locations/${route.params.id}`,
        })

      } catch {
        toast.add({
          severity: 'error', summary: 'Update Failed',
          detail: 'Your changes were not saved', life: 3000
        });
      }
    },
    reject: () => {
      toast.add({
        severity: 'error', summary: 'Canceled',
        detail: 'You have canceled clearing the location expiration date', life: 3000
      });
    }
  });
}

async function updateLocation() {
  confirm.require({
          message: 'Are you sure you want to save these changes?',
          header: 'Confirmation',
          rejectProps: {
              label: 'Cancel',
              severity: 'secondary',
              outlined: true
          },
          acceptProps: {
              label: 'Confirm'
          },
          accept: async() => {
              try {
                await client.mutate({
                  mutation: gql`
                    mutation adminIntrudeOnLocation(
                      $locId: String!
                      $input: AdminLocationInput!
                    ) {
                      adminUpdateLocation(id: $locId, input: $input) {
                        id
                      }
                    }
                  `,
                  variables: {
                    locId: route.params.id,
                    input: {
                      name: locationName.value,
                      timezone: locationTimezone.value,
                      address: locationAddress.value,
                      pmkSchoolId: pmkSchoolId.value,
                      ncesId: ncesId.value,
                      ncesDistrictId: ncesDistrictId.value,
                      childLimit: parseInt(childLocationLimit.value),
                      notes: notes.value,
                    },
                  },
                });
                refetchLocation()

                toast.add({ severity: 'info', summary: 'Confirmed',
                  detail: 'You have successfully updated the school location', life: 3000 });

                router.push({
                  path: `/locations/${route.params.id}`,
                })

              } catch {
                toast.add({ severity: 'error', summary: 'Update Failed',
                  detail: 'Your changes were not saved', life: 3000 });
              }
          },
          reject: () => {
              toast.add({ severity: 'error', summary: 'Canceled',
                detail: 'You have canceled the school location updates', life: 3000 });
          }
      });
}

function handleTimezoneChange(newTimezone: string){
  locationTimezone.value = newTimezone
}

</script>

<template>
  <div>
    <hr>
    <div class="flex flex-1 items-center justify-between p-1">
      <div class="flex flex-col gap-2">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Pikmykid School Id:
        </div>
        <div class="text-base text-surface-900 dark:text-surface-0">
          <InputText id="pmkSchoolId" v-model='pmkSchoolId' type="text" class="w-full min-w-70" />

        </div>
      </div>
      <div class="flex flex-col gap-2">
          <div class="text-base text-surface-900 dark:text-surface-0">
           <TimezoneInput :value="locationTimezone" @input="handleTimezoneChange"/>
          </div>
      </div>
      <div class="flex flex-col gap-2">       
      <div class="text-lg font-medium text-surface-900 dark:text-surface-0">Expires (Use Tenant):</div>
        <div class="text-base text-surface-900 dark:text-surface-0">
          {{ location?.expiresAt ? toLocalDate(location?.expiresAt) : 'Never' }}
          <Button v-if="location?.expiresAt" class="bg-surface-400 border-surface-200"
            @click="clearLocationExpirationDate()">
            Clear Expiration
          </Button>
        </div>
      </div>
    </div>

    <div class="flex flex-1 items-center justify-between p-1">

      <div class="flex flex-col gap-2">
          <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
            Address:
          </div>
          <div class="text-base text-surface-900 dark:text-surface-0">
            <InputText id="locationAddress" v-model='locationAddress' type="text" class="w-full min-w-96" />

          </div>
      </div>

      <div class="flex gap-4 items-center">
          <Button class="bg-surface-400 border-surface-200" @click="renameDialogVisible = true">
            Rename Location
          </Button>
      </div>

    </div>


    <!-- NCES Id etc -->
    <div class="flex flex-1 items-center justify-between p-1">
    <div class="flex flex-col gap-2">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Nces Id:
          <InputText id="ncesId" v-model='ncesId' type="text" class="w-full max-w-24" />
        </div>
    </div>
    <div class="flex flex-col gap-2">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Nces District Id:
          <InputText id="ncesDistricId" v-model='ncesDistrictId' type="text" class="w-full max-w-24" />
        </div>
    </div>
    <div class="flex flex-col gap-2">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Child Location Limit:
          <InputText id="childLocationLimit" v-model='childLocationLimit' type="text" class="w-full max-w-24" />
        </div>
    </div>

  </div>


    <!-- Notes and edit button -->
    <div class="flex flex-1 items-center justify-between p-2">
    <div class="flex flex-col gap-2 w-full">
      <div class="text-lg font-medium text-surface-900 dark:text-surface-0 leading-tight">
        Note:
         <Textarea id="notes" v-model='notes' type="text" rows="2" class="w-full" />
      </div>
    </div>

    <div class="flex flex-col gap-2 items-center pl-5 ml-5">

      <Button class="min-w-48 " @click="updateLocation">
        Save Changes
      </Button>
      <router-link :to="'/locations/' + route.params.id"
        class="text-surface-700 dark:text-surface-100">
        Cancel
      </router-link>
    </div>
  </div>

  <div class="flex flex-1 items-center justify-between p-2">
    <div class="flex flex-col gap-2 w-full">


      <router-link :to="'/locations/' + route.params.id + '/tools'"
        active-class="bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50"
        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 active:bg-pmkblue dark:active:bg-pmkblue">

        <span
          class="inline-flex items-center justify-center p-1 bg-amber-100 dark:bg-amber-500/20 rounded-md border border-amber-200 dark:border-amber-500/30">
          <i class="pi pi-wrench !text-xs !leading-none text-amber-600 dark:text-amber-300" />
        </span>
        <span class="font-medium text-base leading-tight">
          Additional Location Tools
        </span>
      </router-link>


    </div>
    <div class="flex flex-col gap-2 w-full"> </div>
    <div class="flex flex-col gap-2 w-full"> </div>
    <div class="flex flex-col gap-2 w-full"> </div>
  </div>



    <Dialog
        v-model:visible="renameDialogVisible"
        append-to="body"
        modal
        :breakpoints="{ '960px': '75vw', '640px': '80vw' }"
        :style="{ width: '40rem' }"
        :draggable="false"
        :resizable="false"
        :show-header="false"
        class="shadow-sm rounded-2xl"
        :pt="{ content: '!p-6', footer: '!pb-6 !px-6' }"
    >
      <div class="bg-gray-200 dark:bg-gray-700 rounded-2xl">
        <div class="flex flex-col gap-6 p-6 m-6">
            <div class="flex items-start gap-4">
                <div class="flex-1 flex flex-col gap-2">
                    <h1 class="m-0 text-surface-900 dark:text-surface-0 font-semibold text-xl leading-normal">
                      Rename School Location
                    </h1>
                    <span class="text-surface-500 dark:text-surface-400 text-base leading-normal">Enter a new name for the school location</span>
                </div>
                <Button icon="pi pi-times" text rounded severity="secondary" class="w-10 h-10 !p-2" @click="cancelRename()" />
            </div>

            <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-2">
                    <label for="locationName" class="text-color text-base">
                      Name
                    </label>
                    <InputText id="locationName" v-model="locationName" name="locationName" type="text" class="w-full" />
                </div>
            </div>

            <div class="flex justify-end gap-4">
                <Button label="Cancel" outlined @click="cancelRename()" />
                <Button label="Update" @click="renameDialogVisible = false" />
            </div>
        </div>
      </div>
    </Dialog>


  </div>
</template>
