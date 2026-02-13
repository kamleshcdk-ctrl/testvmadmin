
<script setup lang="ts">
import JsonDisplay from "@/components/JsonDisplay.vue";
import toLocalDateTime from "@/filters/localdatetime";
import toLocalDate from "@/filters/localdate";
import { useToast } from 'primevue/usetoast';


const toast = useToast();
const route = useRoute();

const {
  formTextStyles,
  formCheckboxStyles,
  formPrimarySubmitAttrs,
  formActionsAreaStyles,
  formSecondaryButtonStyles } = useFormkitStyles()

const { getUserById } = useUserByIdQuery()
const { result: user, refetch, loading } = getUserById(route.params.id)
const { getUserNotificationsById } = useUserNotificationsByIdQuery()
const { result: userNotifications, loading: loadingNotifications } = getUserNotificationsById(route.params.id)


const { client } = useApolloClient();
const router = useRouter();

function goToUser(id?: string) {
  if (id) {
    router.push(`/users/${id}`);
  }
}
async function sendWelcomeEmail(tenantId: string) {
  try {
    await callAdminCreateCSAdminIfNeeded(tenantId);
    await client.mutate({
      mutation: gql`
          mutation SendWelcomeEmail($id: String!) {
            sendWelcomeEmail(userId: $id)
          }
        `,
      variables: {
        id: route.params.id,
      },
    })

    toast.add({
      severity: 'success',
      summary: `The welcome email was sent.`,
      life: 4000
    });
  } catch {
    toast.add({
      severity: 'error', summary: 'Send Welcome Email Failed',
      detail: 'The welcome email was not sent', life: 3000
    });
  }
}

async function callAdminCreateCSAdminIfNeeded(tenantId: string) {
  try {
    const result = await client.mutate({
      mutation: gql`
        mutation AdminCreateCSAdminIfNeeded($tenantId: String!) {
          adminCreateCSAdminIfNeeded(tenantId: $tenantId)
        }
      `,
      variables: {
        tenantId: tenantId,
      },
    });
    toast.add({
      severity: 'success',
      summary: `CS Admin was created (if needed).`,
      life: 4000,
    });

    return result.data?.adminCreateCSAdminIfNeeded;
  } catch {
    toast.add({
      severity: 'error',
      summary: 'CS Admin Creation Failed',
      detail: 'The operation was not successful.',
      life: 3000,
    });

    return null;
  }
}

// @ts-expect-error Need formData type
async function updateUser(formData) {
  try {
    await client.mutate({
      mutation: gql`
        mutation adminUpdateUser($user: UpdateUserInput!) {
          updateUser(user: $user) {
            id
          }
        }
      `,
      variables: {
        user: {
          id: formData.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
      },
    });

    refetch({ id: route.params.id, fetchPolicy: 'cache-and-network' })
    toast.add({
      severity: 'success',
      summary: `Saved User Information.`,
      life: 4000
    });
  } catch {
    toast.add({
      severity: 'error', summary: 'Update Failed',
      detail: 'The user information was not saved', life: 3000
    });
  }
}
</script>
<template>
<LayoutNormalCenter page-name="User details" page-description="View and edit user specific details">

  <div v-if="!loading && !loadingNotifications" class="p-4 flex flex-col gap-4">
    <Panel header="User Info" class="w-full">
      <!-- @vue-expect-error because we need formkit types -->
      <FormKit type="form" :value="user" submit-label="Save Changes" :config="{
        classes: { // puts the submit button on the right side
          actions: formActionsAreaStyles, // 'flex flex-1 flex-row-reverse'
        }
      }" :submit-attrs="formPrimarySubmitAttrs" @submit="updateUser">
        <FormKit type="text" :classes="formTextStyles" name="name" label="Name" />
        <!-- <FormKitSchema :schema="schema" /> -->

        <div class="flex flex-col sm:flex-row gap-4 w-full">
          <div class="flex flex-col gap-2 w-full sm:min-w-96">
            <FormKit type="text" class="w-full" :classes="formTextStyles" name="email" label="Email" />
          </div>
          <div class="flex flex-col gap-2 w-full sm:w-auto">
            <!-- @vue-expect-error tenant.id -->
            <FormKit v-tooltip.bottom="'Sending a welcome email allows the user to set or reset their password'"
              type="button" :classes="formSecondaryButtonStyles" label="Send Welcome Email" class="w-full sm:w-auto"
              @click="sendWelcomeEmail(user?.tenant?.id)" />
          </div>
        </div>

        <FormKit type="text" class="w-full" :classes="formTextStyles" name="phone" label="Phone" />
        <FormKit type="text" class="w-full" :classes="formTextStyles" name="address" label="Address" />
      </FormKit>

      <div class="flex flex-col sm:flex-row gap-4 p-1 w-full">
        <div class="flex flex-col gap-2 w-full sm:w-1/3">
          <!-- @vue-expect-error hasMobileApp -->
          <FormKit label="Has Mobile App" type="checkbox" :value="user?.hasMobileApp" disabled name="hasMobileApp"
            :classes="formCheckboxStyles" />
          <!-- @vue-expect-error user.admin -->
          <FormKit label="Admin Flag" type="checkbox" :value="user?.admin" disabled name="hasAdminFlag"
            :classes="formCheckboxStyles" />
        </div>
        <div class="flex flex-col gap-2 w-full sm:w-1/3">
          <div class="text-lg font-medium text-surface-900 dark:text-surface-0">Synced At:</div>
          <div class="text-base text-surface-900 dark:text-surface-0">
            <!-- @vue-expect-error syncedAt -->
            {{ user?.syncedAt ? toLocalDate(user?.syncedAt) : 'Never' }}
          </div>
        </div>
        <div class="flex flex-col gap-2 w-full sm:w-1/3">
          <div class="text-lg font-medium text-surface-900 dark:text-surface-0">Created At:</div>
          <div class="text-base text-surface-900 dark:text-surface-0">
            <!-- @vue-expect-error createdAt -->
            {{ toLocalDate(user?.createdAt) }}
          </div>
        </div>
      </div>


      <FormKit type="text" disabled class="w-full" :classes="formTextStyles" name="syncId"
        label="SIS Integration Sync Id" />

    </Panel>

    <SectionDivider title="School district tenant for this user" />
    <!-- @vue-expect-error user.tenant -->
    <TenantLink :tenant-id="user?.tenant?.id" :tenant-name="user?.tenant?.name" />

    <HideableSection title="School Location Roles" :hidden="true">
      <!-- @vue-expect-error user.roles -->
      <div v-if="user?.roles && user.roles.length > 0">
        <!-- @vue-expect-error: Ignore type issues for InfoCard fields -->
        <InfoCard v-for="role in user.roles" :key="role.id" :fields="[
          { label: 'Role ID', value: role.id },
          { label: 'Name', value: role.name },
          { label: 'Location', value: role.location?.name ?? '—' },
          { label: 'Sync Auto Remove', value: role.syncAutoRemove ? 'Yes' : 'No' },
          { label: 'Integration Role IDs', value: role.integrationRoleIds?.length ? role.integrationRoleIds.join(', ') : '—' }
        ]" class="w-full" />
      </div>
      <div v-else>No roles found.</div>
    </HideableSection>

    <HideableSection title="Child Relationships" :hidden="true">
      <!-- @vue-expect-error childContacts -->
      <div v-if="user?.childContacts && user.childContacts.length > 0">
        <!-- @vue-expect-error: Ignore type issues for InfoCard fields -->
        <InfoCard v-for="child in user.childContacts" :key="child.id" :fields="[
          { label: 'Contact ID', value: child.id },
          { label: 'Child Name', value: child.child?.name ?? '—' }
        ]" class="w-full cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition"
          @click="goToUser(child.child?.id)" />
      </div>
      <div v-else>none found</div>
    </HideableSection>

    <HideableSection title="Parent/Guardian Relationships" :hidden="true">
      <!-- @vue-expect-error parentContacts -->
      <div v-if="user?.parentContacts?.length">
        <!-- @vue-expect-error: Ignore type issues for InfoCard fields -->
        <InfoCard v-for="parent in user.parentContacts" :key="parent.id" :fields="[
          { label: 'Contact ID', value: parent.id },
          { label: 'Parent Name', value: parent.parent?.name ?? '—' }
        ]" class="w-full cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition"
          @click="goToUser(parent.parent?.id)" />
      </div>
      <div v-else>none found</div>
    </HideableSection>

    <HideableSection title="Mobile device information" :hidden="true">
      <!-- @vue-expect-error mobileDeviceInfo -->
      <JsonDisplay :value="user.mobileDeviceInfo" />
    </HideableSection>

    <HideableSection title="User Notifications" :hidden="true">
      <!-- @vue-expect-error length -->
      <div v-if="userNotifications?.length">
        <!-- @vue-expect-error InfoCard typing -->
        <InfoCard v-for="notification in userNotifications" :key="notification.id" :fields="[
          { label: 'ID', value: notification.id },
          { label: 'Subject', value: notification.subject },
          { label: 'Methods', value: notification.methods?.join(', ') || '—' },
          { label: 'Message', value: notification.message },
          { label: 'Email URL', value: notification.emailUrl || '—' },
          { label: 'Created At', value: toLocalDateTime(notification.createdAt) },
          { label: 'Email Delivery Status', value: notification.emailDeliveryStatus || '—' },
          { label: 'SMS Delivery Status', value: notification.smsDeliveryStatus || '—' },
          { label: 'Voice Delivery Status', value: notification.voiceDeliveryStatus || '—' },
          { label: 'Sendgrid ID', value: notification.sendgridId || '—' },
          { label: 'Twilio SMS ID', value: notification.twilioSmsId || '—' },
          { label: 'Twilio Voice ID', value: notification.twilioVoiceId || '—' },
          { label: 'Send At', value: notification.sendAt || '—' },
          { label: 'Broadcast Title', value: notification.broadcast?.title || '—' },
          { label: 'Location Name', value: notification.location?.name || '—' }
        ]" class="w-full" />
      </div>
      <div v-else>No notifications found.</div>
    </HideableSection>
    <!-- @vue-expect-error mergedUsers -->
    <HideableSection :title="(user?.mergedUsers?.length || 0) + ' Merged Users'" :hidden="true">
      <!-- @vue-expect-error mergedUsers -->
      <div v-for="mergedUser in user?.mergedUsers" :key="mergedUser.id" class="pl-5 ml-5 w-full">
        <div>
          Integration Sync Id:
        </div>
        <!-- @vue-expext-error syncId -->
        <div v-if="mergedUser?.syncId">
          <!-- @vue-expext-error syncId -->
          <Tag :value="mergedUser.syncId?.split(':').join(': ')" severity="secondary" />
        </div>

        <div class="p-1">
          {{ mergedUser?.name }}
        </div>
        <div class="p-1">
          {{ mergedUser?.email }}
        </div>
        <div class="p-1">
          {{ mergedUser?.phone }}
        </div>

        <JsonDisplay class="text-wrap pt-5 pr-1 w-full max-w-full overflow-auto" :expanded="true"
          :value="mergedUser.rawSyncData ? JSON.parse(mergedUser?.rawSyncData) : {}" />

      </div>
    </HideableSection>

    <HideableSection title="Raw integration sync Json" :hidden="true">
      <!-- @vue-expect-error rawSyncData -->
      <JsonDisplay :value="JSON.parse(user.rawSyncData)" />
    </HideableSection>

    <HideableSection title="Full Json for User" :hidden="true">
      <JsonDisplay :value="user" />
    </HideableSection>


  </div>
</LayoutNormalCenter>
</template>
