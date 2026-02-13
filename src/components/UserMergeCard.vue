
<script setup lang="ts">
import type { VisituUser } from "~/types";
import { extractEmailsFromJsonString, extractPhoneNumbersFromJsonString, firstAndLastName } from "~/helpers";
import toLocalDate from "@/filters/localdate";

const emit = defineEmits(['changeMergeUser', 'changeSearchText', 'mergeIntegrationUser', 'unmergeIntegrationUser', 'mergeUserPhoto'])

interface UserMergeCardProps {
  currentUser: VisituUser,
  mergeTargetUser?: VisituUser,
  details?: boolean,
}
const {
  currentUser,
  mergeTargetUser = undefined,
  details = false
} = defineProps<UserMergeCardProps>()

const { getGuardianRelationsById } = useGuardianRelationsByIdQuery()

const guardianRelations = ref()
const mergeTargetUserGuardianRelations = ref()
function getGuardianRelations(userId: string) {
  const { onResult: onGuardianRelations } = getGuardianRelationsById(userId)
  onGuardianRelations((result) => {
    if (!result.loading && result.data.adminUser) {
      guardianRelations.value = result.data.adminUser
    }
  })

  // Get the guardian relations for the merge target user too
  if (mergeTargetUser) {
    const { onResult: onMergeTargetUserGuardianRelations } = getGuardianRelationsById(mergeTargetUser.id)

    onMergeTargetUserGuardianRelations((result) => {
      if (!result.loading && result.data.adminUser) {
        mergeTargetUserGuardianRelations.value = result.data.adminUser
      }
    })
  }
}

function getGuardianLinkCount(currentUser: VisituUser) {
  if (currentUser?.parentContacts && currentUser?.parentContacts?.length > 0) {
    return currentUser?.parentContacts?.length
  }
  if (currentUser?.childContacts && currentUser?.childContacts?.length > 0) {
    return currentUser.childContacts.length
  }
  return 0
}

function getLocationRoleCount(currentUser: VisituUser) {
  if (currentUser?.roles?.length > 0) {
    return currentUser.roles.length
  }
  return 0
}

const openInNewTab = async (userId: string) => {
  await navigateTo({
    path: `/users/${userId}`,
  }, {
    open: {
      target: '_blank',
    }
  })
}

function extractEmails(jsonString: string): string[] {
  return extractEmailsFromJsonString(jsonString);
}

function extractPhoneNumbers(jsonString: string): string[] {
  return extractPhoneNumbersFromJsonString(jsonString);
}

function matchingContactInfo(currentUserJsonString: string, targetUserJsonString: string): boolean {
  const currentUserPhoneNumbers = extractPhoneNumbers(currentUserJsonString);
  const targetUserPhoneNumbers = extractPhoneNumbers(targetUserJsonString);

  const currentUserEmails = extractEmails(currentUserJsonString);
  const targetUserEmails = extractEmails(targetUserJsonString);


  let contactInfoFound = false;

  for (const currentUserEmail of currentUserEmails) {
    for (const targetUserEmail of targetUserEmails) {
      if (currentUserEmail?.toLowerCase() === targetUserEmail?.toLowerCase()) {
        contactInfoFound = true;
        break;
      }
    }
    if (contactInfoFound) break;
  }

  for (const currentUserPhone of currentUserPhoneNumbers) {
    for (const targetUserPhone of targetUserPhoneNumbers) {
      // compare just the digits in the phone numbers
      if (currentUserPhone.replace(/\D/g, '') === targetUserPhone.replace(/\D/g, '')) {
        contactInfoFound = true;
        break;
      }
    }
    if (contactInfoFound) break;
  }
  return contactInfoFound
}

const matchingNames = computed<boolean>(() => {
  if (!currentUser || !mergeTargetUser || !currentUser.name || !mergeTargetUser.name) {
    return false;
  }

  const currentUserFirstAndLastName = firstAndLastName(currentUser.name)
  const mergeTargetFirstAndLastName = firstAndLastName(mergeTargetUser.name)

  return currentUserFirstAndLastName === mergeTargetFirstAndLastName;
});

const matchingChildId = computed<boolean>(() => {
  if (!currentUser || !mergeTargetUser ||
    !currentUser?.childContacts || !mergeTargetUser?.childContacts) {
    return false;
  }

  const matchingChildIds: string[] = []
  if (guardianRelations?.value && guardianRelations.value?.childContacts &&
    mergeTargetUserGuardianRelations?.value && mergeTargetUserGuardianRelations.value?.childContacts) {

    for (const childContact of guardianRelations.value.childContacts) {
      for (const mergeTargetChildContact of mergeTargetUserGuardianRelations.value.childContacts) {
        if (childContact.child.id === mergeTargetChildContact.child.id) {
          matchingChildIds.push(childContact.child.name);
        }
      }
    }
    return matchingChildIds.length > 0;
  }
  return false;
});

const matchingChildNames = computed<boolean>(() => {

  if (!currentUser || !mergeTargetUser ||
    !currentUser?.childContacts || !mergeTargetUser?.childContacts) {
    return false;
  }

  const matchingNames: string[] = []
  if (guardianRelations?.value && guardianRelations.value?.childContacts &&
    mergeTargetUserGuardianRelations?.value && mergeTargetUserGuardianRelations.value?.childContacts) {

    for (const childContact of guardianRelations.value.childContacts) {
      for (const mergeTargetChildContact of mergeTargetUserGuardianRelations.value.childContacts) {
        if (childContact.child.name === mergeTargetChildContact.child.name) {
          matchingNames.push(childContact.child.name);
        }
      }
    }
    return matchingNames.length > 0;
  }
  return false;
});


const matchingChildParentNames = computed(() => {
  if (!currentUser || !mergeTargetUser ||
    !currentUser?.childContacts || !mergeTargetUser?.childContacts) {
    return false;
  }

  const childParentContactNames: string[] = []
  if (guardianRelations?.value && guardianRelations.value.childContacts) {
    for (const childContact of guardianRelations.value.childContacts) {
      if (childContact.child.parentContacts.length > 0) {
        for (const childParentContact of childContact.child.parentContacts) {
          childParentContactNames.push(childParentContact.parent.name)
        }
      }
    }
  }

  const targetUserChildParentContactNames: string[] = []
  if (mergeTargetUserGuardianRelations?.value && mergeTargetUserGuardianRelations.value.childContacts) {
    for (const childContact of mergeTargetUserGuardianRelations.value.childContacts) {
      if (childContact.child.parentContacts.length > 0) {
        for (const childParentContact of childContact.child.parentContacts) {
          targetUserChildParentContactNames.push(childParentContact.parent.name)
        }
      }
    }
  }

  let matchingParentNames = 0
  for (const parentName of childParentContactNames) {
    if (targetUserChildParentContactNames.includes(parentName)) {
      matchingParentNames++
    }
  }
  return matchingParentNames > (guardianRelations.value?.childContacts?.length || 0);
});


</script>
<template>
<div class="bg-surface-50 dark:bg-surface-950 p-3">
  <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow rounded-2xl flex flex-col gap-4">
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-lg font-mono font-bold leading-tight text-surface-900 dark:text-surface-0">
          {{ currentUser?.name }}
          <i class="pi pi-users !text-base !leading-none text-surface-500 dark:text-surface-400 hover:text-primary-700 dark:hover:text-primary-300"
            @click="openInNewTab(currentUser?.id)" />
          <i v-if="details"
            class="pi pi-search text-surface-500 dark:text-surface-400 hover:text-primary-700 dark:hover:text-primary-300 pl-2"
            @click="emit('changeSearchText', `${currentUser?.name} `)" />

          <i v-if="!details && matchingNames" class="pi pi-check-circle text-primary-700 dark:text-primary-300 pl-5" />
        </h1>
        <div class="text-base leading-tight text-surface-500 dark:text-surface-300">
          <UuidFormatted :uuid="currentUser?.id" />
        </div>
      </div>
      <Button v-if="!details" icon="pi pi-arrow-right-arrow-left !text-sm !leading-normal" severity="secondary" outlined
        class="w-9 h-9 !p-0 shrink-0 rounded-md" @click="emit('changeMergeUser', currentUser?.id)" />
    </div>
    <div class="flex flex-1">
      <div class="flex-1 rounded-lg">
        <div v-if="currentUser?.roles">
          <span v-for="role in currentUser.roles" :key="role.id" class="pr-1">
            <Tag :value="role.name" severity="secondary" class="mb-1" />
          </span>
        </div>
        <div>
          Email: {{ currentUser.email }}
        </div>
        <div>
          Phone: {{ currentUser.phone }}
        </div>
        <div>
          Address: {{ currentUser.address }}
        </div>
        <div>
          Birthday:
          <!-- @ts-expect-error dateOfBirth-->
          {{ currentUser?.dateOfBirth ? toLocalDate(currentUser?.dateOfBirth) : '' }}
          <!-- @ts-expect-error birthday-->
          {{ currentUser?.birthday ? toLocalDate(currentUser?.birthday) : '' }}
        </div>
        <!-- @vue-expext-error currentUser -->
        <HideableSectionNarrow :title="getGuardianLinkCount(currentUser) + ' Guardian Relationships'" :hidden="true"
          @title-clicked="getGuardianRelations(currentUser.id)">

          <div v-if="guardianRelations?.childContacts && guardianRelations.childContacts.length > 0" class="p-3">
            <div v-for="child in guardianRelations.childContacts" :key="child.id">
              {{ child.child.name }} is Child
              <i v-if="details"
                class="pi pi-search text-surface-500 dark:text-surface-400 hover:text-primary-700 dark:hover:text-primary-300 pl-2"
                @click="emit('changeSearchText', `${child.child.name} ${child.child.id}`)" />

              <UuidFormatted :uuid="child.child.id" />
              <div v-for="parent in child.child.parentContacts" :key="parent.id" class="pl-5">
                with {{ parent.parent.name }} as Parent
                <i v-if="details && parent.parent.id !== currentUser.id"
                  class="pi pi-search text-surface-500 dark:text-surface-400 hover:text-primary-700 dark:hover:text-primary-300 pl-2"
                  @click="emit('changeSearchText', `${parent.parent.name} ${parent.parent.id}`)" />
                <UuidFormatted :uuid="parent.parent.id" :is-current-user="parent.parent.id === currentUser.id" />
              </div>
            </div>
          </div>
          <div v-if="guardianRelations?.parentContacts && guardianRelations.parentContacts.length > 0" class="pt-3">
            <div v-for="parent in guardianRelations?.parentContacts" :key="parent.id" class="pl-3">
              {{ parent.parent.name }} is Parent
              <i v-if="details"
                class="pi pi-search text-surface-500 dark:text-surface-400 hover:text-primary-700 dark:hover:text-primary-300 pl-2"
                @click="emit('changeSearchText', `${parent.parent.name} ${parent.parent.id}`)" />

              <UuidFormatted :uuid="parent.parent.id" />
              <div v-for="child in parent.parent.childContacts" :key="child.id" class="pl-5">
                with {{ child.child.name }} as Child
                <i v-if="details && child.child.id !== currentUser.id"
                  class="pi pi-search text-surface-500 dark:text-surface-400 hover:text-primary-700 dark:hover:text-primary-300 pl-2"
                  @click="emit('changeSearchText', `${child.child.name} ${child.child.id}`)" />

                <UuidFormatted :uuid="child.child.id" :is-current-user="child.child.id === currentUser.id" />
              </div>
            </div>
          </div>

          <div v-if="(!details) && mergeTargetUser && matchingChildId" class="pb-1 mb-1">
            <i class="pi pi-check-circle text-primary-700 dark:text-primary-300 pr-5" />
            Shared child id
          </div>

          <div v-if="(!details) && mergeTargetUser && matchingChildNames" class="pb-1 mb-1">
            <i class="pi pi-check-circle text-primary-700 dark:text-primary-300 pr-5" />
            Shared child name
          </div>

          <div v-if="(!details) && mergeTargetUser && matchingChildParentNames" class="pb-1 mb-1">
            <i class="pi pi-check-circle text-primary-700 dark:text-primary-300 pr-5" />
            More matching child parent names than children
          </div>

        </HideableSectionNarrow>

        <!-- @vue-expext-error currentUser -->
        <HideableSectionNarrow :title="getLocationRoleCount(currentUser) + ' Location Roles'" :hidden="true">

          <!-- @vue-expext-error roles -->
          <div v-if="currentUser?.roles && currentUser.roles.length > 0">
            <div v-for="role in currentUser.roles" :key="role.id" class="pt-2 pb-2">
              {{ role.name }} - {{ role.location.name }}
              <div v-for="syncRoleId in role.integrationRoleIds" :key="syncRoleId" class="pt-1">
                <Tag :value="syncRoleId.split(':').join(' ')" severity="secondary" />
              </div>
            </div>
          </div>
        </HideableSectionNarrow>

        <div>
          Integration Sync Id:
        </div>
        <!-- @vue-expext-error syncId -->
        <div v-if="currentUser?.syncId">
          <!-- @vue-expext-error syncId -->
          <Tag :value="currentUser.syncId?.split(':').join(': ')" severity="secondary" />
        </div>
        <div v-else>
          <Tag value="None" severity="secondary" />
        </div>

        <div v-if="!details" class="pt-3">
          <Button :disabled="!currentUser?.syncId || ((currentUser?.mergedUsers?.length || 0) > 0)"
            icon="pi pi-delete-left" label="Merge Integration User" class="bg-surface-400 border-surface-200"
            @click="emit('mergeIntegrationUser', currentUser)" />

          <Button icon="pi pi-delete-left" label="Copy Photo" class="bg-surface-400 border-surface-200 ml-3"
            @click="emit('mergeUserPhoto', currentUser)" />
        </div>




        <HideableSectionNarrow :title="(currentUser?.mergedUsers?.length || 0) + ' Merged Users'" :hidden="true">
          <div v-for="mergedUser in currentUser?.mergedUsers" :key="mergedUser.id">

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

            <Button icon="pi pi-delete-right" label="Undo Merge" class="bg-surface-400 border-surface-200"
              @click="emit('unmergeIntegrationUser', mergedUser)" />

            <JsonDisplay class="text-wrap pt-5 pr-1 max-w-lg" :expanded="true"
              :value="mergedUser.rawSyncData ? JSON.parse(mergedUser?.rawSyncData) : {}" />

          </div>
        </HideableSectionNarrow>

        <HideableSectionNarrow title="Raw Sync Data" :hidden="true">
          <template #title>
            Raw Sync Data
            <span v-if="mergeTargetUser && matchingContactInfo(currentUser?.rawSyncData, mergeTargetUser?.rawSyncData)">
              <i class="pi pi-check-circle text-primary-700 dark:text-primary-300 pl-5" />
            </span>

          </template>
          <template #default>
            <div>
              {{ extractEmails(currentUser?.rawSyncData)?.join(", ") }}
            </div>
            <div>
              {{ extractPhoneNumbers(currentUser?.rawSyncData)?.join(", ") }}
            </div>
            <div v-if="mergeTargetUser && matchingContactInfo(currentUser?.rawSyncData, mergeTargetUser?.rawSyncData)"
              class="pt-3">
              <i class="pi pi-check-circle text-primary-700 dark:text-primary-300 pr-5" />
              Shared raw sync data contact info
            </div>

            <!-- @vue-expext-error rawSyncData -->
            <JsonDisplay class="text-wrap pt-5 pr-1 max-w-lg" :expanded="true"
              :value="currentUser.rawSyncData ? JSON.parse(currentUser.rawSyncData) : {}" />
          </template>
        </HideableSectionNarrow>


        <div v-if="details" class="pt-3">
          <HideableSectionNarrow title="Details" :hidden="true">
            <div class="flex flex-1 items-center justify-between p-1">
              <div class="flex flex-col gap-2">
                Created:
                <!-- @vue-expext-error createdAt -->
                <Tag :value="currentUser?.createdAt ? toLocalDate(currentUser?.createdAt) : 'Never'"
                  severity="secondary" />
              </div>
              <div class="flex flex-col gap-2">
                Synced:
                <!-- @vue-expext-error syncedAt -->
                <Tag :value="currentUser?.syncedAt ? toLocalDate(currentUser?.syncedAt) : 'Never'"
                  severity="secondary" />
              </div>
            </div>

            <div class="p-1">
              Sync Hash:
            </div>
            <!-- @vue-expext-error syncHash -->
            <div v-if="currentUser?.syncHash" class="p-1">
              <!-- @vue-expext-error syncHash -->
              <Tag :value="currentUser.syncHash.substring(0, 10) +
                ' ' + currentUser.syncHash.substring(10, 20) +
                ' ' + currentUser.syncHash.substring(20, 30) +
                ' ' + currentUser.syncHash.substring(30)" severity="secondary" />
            </div>
            <div v-else>
              <Tag value="None" severity="secondary" />
            </div>


            <div class="p-1">
              Has Mobile App:
              <!-- @vue-expext-error hasMobileApp -->
              <Tag :value="currentUser?.hasMobileApp ? 'Yes' : 'No'" severity="secondary" />
            </div>
            <div class="p-1 mb-7">
              Admin Flag:
              <!-- @vue-expext-error admin -->
              <Tag :value="currentUser?.admin ? 'Yes' : 'No'" severity="secondary" />
            </div>
            Mobile Device Info:
            <JsonDisplay class="text-wrap pt-5 pr-1 max-w-lg" :expanded="true"
              :value="currentUser.mobileDeviceInfo || {}" />
          </HideableSectionNarrow>
        </div>


      </div>

    </div>
  </div>
</div>
</template>
