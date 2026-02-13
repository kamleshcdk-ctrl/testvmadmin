
<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";

const { client } = useApolloClient();
const toast = useToast();
const route = useRoute();
const confirm = useConfirm();

async function updateSmsOverride() {
  try {


    confirm.require({
      message: 'Are you sure you want to update the notification preferences?',
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
        await client.mutate({
          mutation: gql`
            mutation AdminUpdateLocationSmsOverriden(
              $locationId: String!
            ) {
              adminUpdateLocationSmsOverride(locationId: $locationId)
            }
          `,
          variables: {
            locationId: route.params.id,
          },
        });
        toast.add({
          severity: 'info', summary: 'Confirmed',
          detail: 'You have successfully updated the sms preferences for users with the app and a phone number', life: 3000
        });
      },
      reject: () => {
        toast.add({
          severity: 'error', summary: 'Canceled',
          detail: 'You have canceled the notification preferences update', life: 3000
        });
      }
    });
  } catch (error) {
    toast.add({
      severity: 'error', summary: 'Canceled',
      detail: `-- ${error}`, life: 3000
    });
  }
}
</script>
<template>
<div>
  Update all user sms preferences to send sms when app is installed:
  <Button label="Update" @click="updateSmsOverride" />
</div>
</template>
