<script setup lang="ts">
import toLocalDate from "@/filters/localdate";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from 'primevue/usetoast';

const confirm = useConfirm();
const toast = useToast();

const props =defineProps({
  tenantId: {
    type: String,
    required:true
  }
})

const { getTenantById } = useTenantByIdQuery()
const { result: tenant, loading, refetch: refetchTenant } = getTenantById(props.tenantId)

const { getUsersInTenantCount } = useUsersInTenantCountQuery()
const { result: userCount } = getUsersInTenantCount(props.tenantId)

const setExpireMutation = useMutation(
  gql`
    mutation UpdateTenant($tenantId: String!, $expiresAt: DateTime) {
      updateTenant(id: $tenantId, input: { expiresAt: $expiresAt }) {
        id
      }
    }
  `,
  {
    refetchQueries: ["AdminTenants", "AdminTenant"],
  }
);


const actions = computed(() => {
  if (unref(loading)) {
    return [];
  }

  return [
    {
      name: "Expire Account",
      if() {
        // @ts-expect-error because there is just an object without types
        return !unref(tenant).expired;
      },
      async click() {
        confirm.require({
                message: 'Are you sure you want to expire this account?',
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
                    await setExpireMutation.mutate({
                      tenantId: props.tenantId,
                      expiresAt: new Date(),
                    });
                    refetchTenant()

                    toast.add({ severity: 'info', summary: 'Confirmed',
                      detail: 'You have successfully expired the account', life: 3000 });
                },
                reject: () => {
                    toast.add({ severity: 'error', summary: 'Canceled',
                      detail: 'You have canceled the account expiration', life: 3000 });
                }
            });
      },
    },
    {
      name: "Restore Account",
      if() {
        // @ts-expect-error because there is just an object without types
        return unref(tenant).expired;
      },
      async click() {
        confirm.require({
                message: 'Are you sure you want to resore this account?',
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
                  await setExpireMutation.mutate({
                    tenantId: props.tenantId,
                    expiresAt: null,
                  });
                  refetchTenant()

                  toast.add({ severity: 'info', summary: 'Confirmed',
                    detail: 'You have successfully restored the account', life: 3000 });
                },
                reject: () => {
                  toast.add({ severity: 'error', summary: 'Canceled',
                    detail: 'You have canceled and the account is not restored', life: 3000 });
                }
            });
      },
    },
  ].filter((item) => {
    if (item.if) {
      return item.if();
    }
    return true;
  });
});

</script>

<template>
<div>
    <div class="flex flex-1 items-center justify-between p-4">
      <div class="flex flex-col gap-2">
        <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
          Subdomain:
        </div>
        <div class="text-base text-surface-900 dark:text-surface-0">
          <Tag :value="tenant?.domain" severity="primary"/>
        </div>
      </div>
      <div class="flex flex-col gap-2">
          <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
            Sandbox:
          </div>
          <div class="text-base text-surface-900 dark:text-surface-0">
            <Tag :value="tenant?.sandbox ? 'Yes': 'No'" severity="secondary"/>
          </div>
      </div>
      <div class="flex flex-col gap-2">
          <div class="text-lg font-medium text-surface-900 dark:text-surface-0">Expires At:</div>
          <div class="text-base text-surface-900 dark:text-surface-0">
            {{tenant?.expiresAt ? toLocalDate(tenant?.expiresAt) : 'Never' }}
          </div>
      </div>
      <div class="flex gap-4 items-center">
        <!-- expire or restore district tenant-->
        <div v-for="action in actions" :key="action.name">
          <Button class="bg-surface-400 border-surface-200" @click="action.click">
            {{action.name}}
          </Button>
        </div>
      </div>
      </div>


      <!-- Numbers of users -->
      <div class="flex flex-1 items-center justify-between p-4">
      <div class="flex flex-col gap-2">
          <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
            Estimated Students: <Tag :value="tenant?.studentCount" severity="secondary"/>
          </div>
      </div>
      <div class="flex flex-col gap-2">
          <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
            Estimated Staff: <Tag :value="tenant?.staffCount" severity="secondary"/>
          </div>
      </div>
      <div class="flex flex-col gap-2">
          <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
            Total User Count: <Tag :value="userCount" severity="secondary"/>
          </div>
      </div>

    </div>

    <!-- Notes and edit tenant button -->
    <div class="flex flex-1 items-center justify-between p-4">
    <div class="flex flex-col gap-2">
      <div class="text-lg font-medium text-surface-900 dark:text-surface-0 leading-tight">
        Note:
        <span v-if="tenant?.notes" class="text-lg text-surface-700 dark:text-surface-300 leading-normal">
            {{ tenant?.notes }}
        </span>
        <span v-else class="pt-2 text-lg text-surface-700 dark:text-surface-300 leading-normal">
          empty
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <router-link :to="'/tenants/' + props.tenantId + '/edit'">
        <Button class="bg-surface-400 border-surface-200 min-w-48">
          Edit Tenant
        </Button>
      </router-link>
    </div>
    </div>
  </div>
</template>
