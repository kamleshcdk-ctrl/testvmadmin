
<script setup lang="ts">
import { useVisituUsersStore } from '@/store/visituUsers'
import FileUpload from 'primevue/fileupload'
import type { UserWithMergedUser, MergeableUserPair, VisituUser } from "~/types";
import { useToast } from 'primevue/usetoast';

const emit = defineEmits(['refetchTenantLocationsUserCount', 'showPairSelected'])
const toast = useToast();

const route = useRoute();

const userStore = useVisituUsersStore()

const listboxRef = ref(null);


// @ts-expect-error type for data
const saveFile = (data, filename = 'merged_users.json') => {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const userData = ref()

const exportMergedUsers = () => {
  userData.value = userStore.getUsersWithMergedUsers?.sort(
    (a: UserWithMergedUser, b: UserWithMergedUser) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    }
  )
  saveFile(userData.value)
}

const createMergedUserMutation = useMutation(
  gql`
    mutation CreateMergedUser($user: UpdateMergedUserInput!) {
      adminCreateMergedUser(user: $user) {
        id
      }
    }
  `,
);

const mergeIntegrationUser = async (targetUser: VisituUser, mergeUser: VisituUser) => {

  if (!(mergeUser.id.length > 4) || !(targetUser.id.length > 4) || !(mergeUser.syncId.length > 4)) {
    // eslint-disable-next-line
    console.log("Missing required fields")
    return
  }
  const mergeUserRoles = mergeUser?.roles?.map((role) => {
    return {
      name: role.name,
      location: {
        id: role.location.id,
        name: role.location.name
      },
      integrationRoleIds: role.integrationRoleIds

    }
  })
  const mergedData = {
    id: mergeUser?.id,
    name: mergeUser?.name,
    roles: mergeUserRoles,
    syncId: mergeUser?.syncId,
    address: mergeUser?.address,
    birthday: mergeUser?.birthday,
    dateOfBirth: mergeUser?.dateOfBirth,
    syncNotes: mergeUser?.syncNotes,
    syncProvider: mergeUser?.syncProvider,
    childContacts: mergeUser?.childContacts,
    parentContacts: mergeUser?.parentContacts,
  }

  try {

    await createMergedUserMutation.mutate({
      user: {
        userId: targetUser.id,
        syncId: mergeUser.syncId,
        name: mergeUser.name,
        email: mergeUser?.email || undefined,
        phone: mergeUser?.phone || undefined,
        mergedData: mergedData,
        rawSyncData: mergeUser?.rawSyncData || undefined,

        tenantId: route.params.id // TODO: better way to get tenantId
      },
    });
    toast.add({
      severity: 'info', summary: 'Confirmed',
      detail: `You have successfully merged ${targetUser.name} with ${mergeUser.name} `, life: 3000
    });

    //refetchUser({ id: currentUserId, fetchPolicy: "no-cache" })

    if (mergeUser?.id) {
      userStore.removeDeletedUser(mergeUser?.id)
    }

    setTimeout(() => {
      emit('refetchTenantLocationsUserCount', targetUser.id)
    }, 3000);

  } catch (error) {
    // eslint-disable-next-line
    console.log(error);
    toast.add({
      severity: 'error', summary: 'Update Failed',
      detail: 'Your changes were not saved', life: 3000
    });
  }

}

const fileUpload = ref(null);

// @ts-expect-error type for event
async function onFileSelect(event) {
  const file = event.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    // @ts-expect-error fileUpload.value
    fileUpload.value = e.target?.result;

    // @ts-expect-error fileUpload.value
    const usersWithMergedUser = JSON.parse(fileUpload.value)
    userStore.mergeableUserPairs = [];

    let foundUserIndex = 0
    let notFoundUserIndex = 0
    for (const currentTargetUser of usersWithMergedUser) {
      for (const mergedUserSyncId of currentTargetUser.mergedUserSyncIds) {
        const targetUser = await userStore.getUserWithMatchingSyncId(currentTargetUser.syncId)
        // eslint-disable-next-line
        console.log('targetUser:', targetUser)
        const mergedUser = await userStore.getUserWithMatchingSyncId(mergedUserSyncId)
        // eslint-disable-next-line
        console.log('mergedUser:', mergedUser)

        if (targetUser && mergedUser) {

          userStore.mergeableUserPairs.push({
            targetUser: { id: targetUser.id, name: targetUser.name, syncId: targetUser.syncId },
            mergedUser: { id: mergedUser.id, name: mergedUser.name, syncId: mergedUser.syncId },
            index: foundUserIndex
          })
          foundUserIndex++
        } else {
          userStore.notFoundMergeableUserPairs.push({
            targetUser: {
              name: currentTargetUser?.name,
              found_name: targetUser?.name,
              id: `${targetUser?.id}`,
              syncId: currentTargetUser.syncId,
            },
            mergedUser: {
              found_name: mergedUser?.name,
              id: `${mergedUser?.id}`,
              syncId: mergedUserSyncId
            },
            index: notFoundUserIndex
          })
          notFoundUserIndex++
        }
      }

    };
  }

  reader.readAsText(file);

}

const currentMergeableUsers = computed(() => {
  return userStore.mergeableUserPairs.find((userPair) => userPair.index === userStore.currentMergeableUserPairsIndex)
});


watch(currentMergeableUsers, (newValue) => {
  selectedMergeablePair.value = newValue;
});

function handleSelectionChange() {
  userStore.currentMergeableUserPairsIndex = selectedMergeablePair.value?.index
}
const selectedMergeablePair = ref()

async function mergePairSelected(currentMergeableUsers: MergeableUserPair) {
  currentMergeableUsers.merged = true;
  //emit('mergePairSelected', currentMergeableUsers.targetUser, currentMergeableUsers.mergedUser)

  const targetUser = await userStore.getUserWithMatchingSyncId(currentMergeableUsers.targetUser.syncId)
  // eslint-disable-next-line
  console.log('targetUser:', targetUser)
  const mergedUser = await userStore.getUserWithMatchingSyncId(currentMergeableUsers.mergedUser.syncId)
  // eslint-disable-next-line
  console.log('mergedUser:', mergedUser)

  if (targetUser && mergedUser) {
    mergeIntegrationUser(targetUser, mergedUser)
  } else {
    toast.add({
      severity: 'error', summary: 'Update Failed',
      detail: `Didn't find both users, target: '${targetUser?.name}'', merged: '${mergedUser?.name}'`, life: 3000
    });
  }
}

onMounted(() => {
  if (currentMergeableUsers.value?.targetUser?.name) {
    selectedMergeablePair.value = currentMergeableUsers.value
  }
})

</script>
<template>
<HideableSectionNarrow title="Merged User Import/Export" :hidden="userStore.importExportMergedUsersOpen"
  @title-clicked="userStore.importExportMergedUsersOpen = !userStore.importExportMergedUsersOpen">
  <div class="flex flex-1 items-center justify-around p-2">
    <div class="flex flex-col gap-2  p-2 m-2">
      <Button class="mb-5" :class="(userStore.activeTenantUsers?.size || 0) > 0 && userStore.mergeableUserPairs.length === 0
        ? 'bg-primary-400 border-primary-200' : 'bg-surface-300 border-surface-200'" @click="exportMergedUsers()">
        Export Merged Users
      </Button>
      Upload Merged Users File for Import:
      <FileUpload mode="basic" custom-upload auto severity="secondary" class="p-button-outlined mb-5"
        @select="onFileSelect" />

      Show Not Found Loaded Mergable Users :
      <ToggleSwitch id="showNotFound" v-model="userStore.showNotFoundMergeableUsers" />

    </div>

    <div class="flex flex-col gap-2  p-2 m-2">
      Imported mergable users ({{ userStore.mergeableUserPairs.length }}):

      <Listbox ref="listboxRef" v-model="selectedMergeablePair" :options="userStore.mergeableUserPairs"
        class="w-full text-primary-500 min-h-72" @change="handleSelectionChange">
        <template #header>
          <div class="flex justify-between p-4 font-bold border-b border-surface-300 dark:border-surface-600">
            {{ currentMergeableUsers?.targetUser?.name }} - {{ currentMergeableUsers?.mergedUser?.name
            }}
            <i v-if="currentMergeableUsers?.merged"
              class="pi pi-check-circle text-primary-700 dark:text-primary-300 pr-5" />

          </div>
          <div class="flex justify-between p-4 border-b border-surface-300 dark:border-surface-600">
            Other Found Mergable Users:
          </div>

        </template>
        <template #option="slotProps">
          <span :class="{ 'font-bold text-black dark:text-white': slotProps.selected }">
            {{ slotProps.option?.targetUser?.name }} - {{ slotProps.option?.mergedUser?.name }}
            <i v-if="slotProps.option?.merged" class="pi pi-check-circle text-primary-700 dark:text-primary-300 pr-5" />
          </span>

        </template>
      </Listbox>
    </div>

    <div class="flex flex-col gap-2  p-2 m-2">
      <Button class="bg-surface-300 border-surface-200"
        @click="emit('showPairSelected', currentMergeableUsers?.targetUser, currentMergeableUsers?.mergedUser)">
        Show
      </Button>

      <!-- @vue-expect-error currentMergeableUsers type -->
      <Button
        :disabled="userStore.currentMergeableUserPairsIndex >= userStore.mergeableUserPairs.length || !currentMergeableUsers?.targetUser?.name"
        @click="mergePairSelected(currentMergeableUsers)">
        Merge
      </Button>

      <Button class="bg-surface-300 border-surface-200"
        :disabled="userStore.currentMergeableUserPairsIndex + 1 >= userStore.mergeableUserPairs.length"
        @click="userStore.currentMergeableUserPairsIndex++">
        Next
      </Button>
      <Button class="bg-surface-300 border-surface-200" :disabled="userStore.currentMergeableUserPairsIndex <= 0"
        @click="userStore.currentMergeableUserPairsIndex--">
        Back
      </Button>
    </div>

  </div>

  <div class="flex flex-1 items-center justify-left p-2">
    <div class="flex flex-col gap-2  p-2 m-2">
      {{ currentMergeableUsers?.targetUser?.name }}
      <UuidFormatted v-if="currentMergeableUsers?.targetUser?.id" :uuid="currentMergeableUsers?.targetUser?.id" />
      {{ currentMergeableUsers?.targetUser?.syncId }}
    </div>
    <div class="flex flex-col gap-2  p-2 m-2">
      {{ currentMergeableUsers?.mergedUser?.name }}
      <UuidFormatted v-if="currentMergeableUsers?.mergedUser?.id" :uuid="currentMergeableUsers?.mergedUser?.id" />
      {{ currentMergeableUsers?.mergedUser?.syncId }}
    </div>
  </div>

  <div v-if="userStore.showNotFoundMergeableUsers" class="flex flex-1 items-center justify-left p-2">
    <div class="flex flex-col gap-2  p-2 m-2">

      <Listbox ref="listboxRef" :options="userStore.notFoundMergeableUserPairs" class="w-full text-primary-500 min-h-72"
        @change="handleSelectionChange">
        <template #header>
          <div class="flex justify-between p-4 border-b border-surface-300 dark:border-surface-600">
            Mergable users loaded from file and not found
            ({{ userStore.notFoundMergeableUserPairs.length }}):
          </div>

        </template>
        <template #option="slotProps">
          <span :class="{ 'font-bold text-black dark:text-white': slotProps.selected }">
            <p>
              {{ slotProps.option?.targetUser?.name }}

              <span v-if="!slotProps.option?.targetUser?.found_name">(Not found)</span>
              <span v-else class="underline hover:cursor-pointer hover:text-primary"
                @click="emit('showPairSelected', slotProps.option?.targetUser, slotProps.option?.mergedUser)">

                ({{ slotProps.option?.targetUser?.found_name }})
              </span>
            </p>
            <p>
              {{ slotProps.option?.targetUser?.syncId }}
            </p>
            <p>
              {{ slotProps.option?.mergedUser?.syncId }}
            </p>
          </span>

        </template>
      </Listbox>

    </div>
  </div>
</HideableSectionNarrow>
</template>
