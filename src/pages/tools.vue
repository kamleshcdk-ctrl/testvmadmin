
<script setup lang="ts">
import { useConfirm } from "primevue/useconfirm";
import { useToast } from 'primevue/usetoast';
import AllIntegrations from '@/components/tools/AllIntegrations.vue';
import BackgroundJobQueues from '@/components/tools/BackgroundJobQueues.vue';
import IntegrationError from "~/components/tools/IntegrationError.vue";

const confirm = useConfirm();
const toast = useToast();

const { client } = useApolloClient();

const { formSecondaryButtonStyles }
  = useFormkitStyles()

async function clearCache() {

  confirm.require({
    message: 'Are you sure you want to clear the cache?',
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
                      mutation ClearCache {
                        adminClearCache
                      }
                    `,
        });

        toast.add({
          severity: 'info', summary: 'Confirmed',
          detail: 'You have successfully cleared the cache', life: 3000
        });

      } catch {
        toast.add({
          severity: 'error', summary: 'Clear Cache Failed',
          detail: 'The cache could not be cleared', life: 3000
        });
      }
    },
    reject: () => {
      toast.add({
        severity: 'error', summary: 'Canceled',
        detail: 'You have canceled the cache clearing action', life: 3000
      });
    }
  });
}

async function clearIntegrationCache(integrationId: string) {

  confirm.require({
    message: 'Are you sure you want to clear the integration role cache?',
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
            mutation ClearIntegrationCache($integrationId: String!) {
              resetIntegrationCache(integrationId: $integrationId)
            }
          `,
          variables: {
            integrationId: integrationId,
          },
        });

        toast.add({
          severity: 'info', summary: 'Confirmed',
          detail: 'You have successfully cleared the integration role cache', life: 3000
        });

      } catch {
        toast.add({
          severity: 'error', summary: 'Clear Cache Failed',
          detail: 'The integration role cache could not be cleared', life: 3000
        });
      }
    },
    reject: () => {
      toast.add({
        severity: 'error', summary: 'Canceled',
        detail: 'You have canceled the cache clearing action', life: 3000
      });
    }
  });
}

async function resetQueue() {

  confirm.require({
    message: 'Are you sure you want to reset the queue?',
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
                      mutation ResetCache {
                        adminRebuildQueue
                      }
                    `,
        });

        toast.add({
          severity: 'info', summary: 'Confirmed',
          detail: 'You have successfully reset the queue', life: 3000
        });

      } catch {
        toast.add({
          severity: 'error', summary: 'Clear Cache Failed',
          detail: 'The queue could not be reset', life: 3000
        });
      }
    },
    reject: () => {
      toast.add({
        severity: 'error', summary: 'Canceled',
        detail: 'You have canceled the queue reset', life: 3000
      });
    }
  });
}

async function obliterateQueue() {

  confirm.require({
    message: 'Are you sure you want to hard reset the queue?',
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
                      mutation ObliterateQueue {
                        adminObliterateQueue
                      }
                    `,
        });

        toast.add({
          severity: 'info', summary: 'Confirmed',
          detail: 'You have successfully hard reset the queue', life: 3000
        });

      } catch {
        toast.add({
          severity: 'error', summary: 'Clear Cache Failed',
          detail: 'The queue could not be hard reset', life: 3000
        });
      }
    },
    reject: () => {
      toast.add({
        severity: 'error', summary: 'Canceled',
        detail: 'You have canceled the hard queue reset', life: 3000
      });
    }
  });
}

</script>
<template>
<LayoutNormalCenter page-name="System Tools" page-description="Monitor queues of running tasks, reset the cache, etc.">
  <div class="flex flex-1 items-center justify-between p-4">
    <div class="flex flex-col gap-2">
      <FormKit type="button" :classes="formSecondaryButtonStyles" label="Clear Cache" @click="clearCache" />
    </div>
    <div class="flex flex-col gap-2">
      <FormKit type="button" :classes="formSecondaryButtonStyles" label="Reset Queue" @click="resetQueue" />
    </div>
    <div class="flex flex-col gap-2">
      <FormKit type="button" :classes="formSecondaryButtonStyles" label="Obliterate Queue" @click="obliterateQueue" />
    </div>
  </div>

  <HideableSection title="Background Job Queues" :hidden="false">
    <BackgroundJobQueues />
  </HideableSection>
<HideableSection title="All Integration Errors" :hidden="true">
   <IntegrationError :location-id="''" />
  </HideableSection>
  <HideableSection title="All Integrations" :hidden="true">
    <AllIntegrations @clear-integration-cache="clearIntegrationCache" />
  </HideableSection>
</LayoutNormalCenter>
</template>
