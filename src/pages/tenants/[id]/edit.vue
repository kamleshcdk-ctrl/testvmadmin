<script setup lang="ts">
import toLocalDate from "@/filters/localdate";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

const { getTenantById } = useTenantByIdQuery()
const { result: tenant, onResult, refetch: refetchTenant } = getTenantById(route.params.id)


// We keep a temporary verion of anything that is changed before it is saved
const tenantName = ref<string>('')
const expiresAt = ref();
const sandbox = ref<boolean>(false)
const studentCount = ref<string>("0")
const staffCount = ref<string>("0")
const notes = ref<string>('')

const originalTenantName = ref<string>('')
const originalExpiresAt = ref();

// We have to set our temporary values to the existing values
// when the getTenantById result finishes loading
onResult((result) => {
  if (!result.loading && result.data?.adminTenant) {
    tenantName.value = result.data?.adminTenant?.name
    originalTenantName.value = result.data?.adminTenant?.name

    expiresAt.value = result.data?.adminTenant?.expiresAt
    originalExpiresAt.value = result.data?.adminTenant?.expiresAt

    studentCount.value = result.data?.adminTenant?.studentCount
    staffCount.value = result.data?.adminTenant?.staffCount
    notes.value = result.data?.adminTenant?.notes
    sandbox.value = result.data?.adminTenant?.sandbox
  }
})

// Closing the 'rename tenant' dialog or the 'expire tenant' dialog
// sets the temporary values back to what they were when the page was loaded.
const renameDialogVisible = ref<boolean>(false)
const cancelRename = () => {
  tenantName.value = originalTenantName.value
  renameDialogVisible.value = false
}

const expirationDialogVisible = ref<boolean>(false)
const cancelExpiration = () => {
  expiresAt.value = originalExpiresAt.value
  expirationDialogVisible.value = false
}

// Call the updateTenant mutation when the 'save' button is clicked and confirmed.
const updateTenantMutation = useMutation(
  gql`
    mutation UpdateTenant($id: String!, $input: UpdateTenantInput!) {
      updateTenant(id: $id, input: $input) {
        id
      }
    }
  `,
  {
    refetchQueries: ["AdminTenants", "AdminTenant"],
  }
);

async function updateTenant() {
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
                await updateTenantMutation.mutate({
                  id: route.params.id,
                  input: {
                    name: tenantName.value,
                    notes: notes.value,
                    sandbox: sandbox.value,
                    expiresAt: expiresAt.value,
                    staffCount: parseInt(staffCount.value),
                    studentCount: parseInt(studentCount.value),
                  },
                });
                refetchTenant()

                toast.add({ severity: 'info', summary: 'Confirmed',
                  detail: 'You have successfully updated the district tenant', life: 3000 });

                router.push({
                  path: `/tenants/${route.params.id}`,
                })

              } catch {
                toast.add({ severity: 'error', summary: 'Update Failed',
                  detail: 'Your changes were not saved', life: 3000 });
              }
          },
          reject: () => {
              toast.add({ severity: 'error', summary: 'Canceled',
                detail: 'You have canceled the district tenant updates', life: 3000 });
          }
      });
}
</script>

<template>
<div>
  <div class="flex flex-1 items-center justify-between p-2">


    <!-- Subdomain, sandbox and expiresAt -->
    <div class="flex flex-col gap-2">
      <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
        Subdomain:
      </div>
      <div class="text-base text-surface-900 dark:text-surface-0">
        <!-- The api may not currently allow the domain to be changed -->
        <Tag :value="tenant?.domain" severity="primary"/>
      </div>
    </div>
    <div class="flex flex-col gap-2">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Sandbox:
        </div>
        <div class="text-base text-surface-900 dark:text-surface-0">
          <ToggleSwitch id="sandbox" v-model="sandbox"/>
        </div>
    </div>
    <div class="flex flex-col gap-2">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">Expires At:</div>
        <div class="text-base text-surface-900 dark:text-surface-0">
          {{expiresAt ? toLocalDate(expiresAt) : 'Never' }}
        </div>
    </div>
    <div class="flex gap-4 items-center">
        <Button class="bg-surface-400 border-surface-200" @click="expirationDialogVisible = true">
          Set Expiration
        </Button>
    </div>
    </div>


    <!-- Numbers of users -->
    <div class="flex flex-1 items-center justify-between p-1">
    <div class="flex flex-col gap-2">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Estimated Students:
          <InputText id="studentCount" v-model='studentCount' type="text" class="w-full max-w-24" />
        </div>
    </div>
    <div class="flex flex-col gap-2">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Estimated Staff:
          <InputText id="staffCount" v-model='staffCount' type="text" class="w-full max-w-24" />
        </div>
    </div>
    <div class="flex gap-4 items-center">
        <Button class="bg-surface-400 border-surface-200" @click="renameDialogVisible = true">
          Rename Tenant
        </Button>
    </div>
  </div>


  <!-- Notes and edit tenant button -->
  <div class="flex flex-1 items-center justify-between p-1">
  <div class="flex flex-col gap-2 w-full">
    <div class="text-lg font-medium text-surface-900 dark:text-surface-0 leading-tight">
      Note:
       <Textarea id="notes" v-model='notes' type="text" rows="2" class="w-full" />
    </div>
  </div>

  <div class="flex flex-col gap-2 items-center pl-5 ml-5">

    <Button class="min-w-48 " @click="updateTenant">
      Save Changes
    </Button>
    <router-link :to="'/tenants/' + route.params.id"
      class="text-surface-700 dark:text-surface-100">
      Cancel
    </router-link>
  </div>
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
                    Rename District Tenant
                  </h1>
                  <span class="text-surface-500 dark:text-surface-400 text-base leading-normal">Enter a new name for the district tenant</span>
              </div>
              <Button icon="pi pi-times" text rounded severity="secondary" class="w-10 h-10 !p-2" @click="cancelRename()" />
          </div>

          <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                  <label for="tenantName" class="text-color text-base">
                    Name
                  </label>
                  <InputText id="tenantName" v-model="tenantName" name="tenantName" type="text" class="w-full" />
              </div>
          </div>

          <div class="flex justify-end gap-4">
              <Button label="Cancel" outlined @click="cancelRename()" />
              <Button label="Update" @click="renameDialogVisible = false" />
          </div>
      </div>
    </div>
  </Dialog>

  <Dialog
      v-model:visible="expirationDialogVisible"
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
                    Set Expiration date
                  </h1>
                  <span class="text-surface-500 dark:text-surface-400 text-base leading-normal">Enter an expiration date</span>
              </div>
              <Button icon="pi pi-times" text rounded severity="secondary" class="w-10 h-10 !p-2" @click="cancelExpiration()" />
          </div>
          <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <DatePicker v-model="expiresAt" class="bg-red"/>
              </div>
          </div>


          <div class="flex justify-end gap-4">
              <Button label="Cancel" outlined @click="cancelExpiration()" />
              <Button label="Update" @click="expirationDialogVisible = false" />
          </div>
      </div>
    </div>
  </Dialog>
</div>
</template>
