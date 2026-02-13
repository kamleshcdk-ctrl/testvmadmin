
<script setup lang="ts">
import { Searcher } from "fast-fuzzy";
import type { FullOptions } from 'fast-fuzzy';
import { useVisituUsersStore } from '@/store/visituUsers'
import { useConfirm } from "primevue/useconfirm";
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import type { VisituUser } from "~/types";
import Select from '@/volt/Select.vue';

import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const userStore = useVisituUsersStore()
const toast = useToast();
const confirm = useConfirm();

const currentUserId = route.params.userId === '---' && userStore.getActiveMergeUserUuid ? userStore.getActiveMergeUserUuid : route.params.userId

const { getUserById } = useUserByIdQuery()
const { result: user, onResult: onUserLoaded, refetch: refetchUser } = getUserById(currentUserId)

const { getUsersInTenantLocationsCount } = useUsersInTenantCountQuery()
const {
  count: tenantUserCount,
  userCountForEachLocation,
  refetch: refetchTenantLocationsUserCount } = getUsersInTenantLocationsCount(route.params.id)

const { getTenantById } = useTenantByIdQuery()
const { onResult: onTenantResult } = getTenantById(route.params.id)

const selectedLocation = ref(userStore.activeTenantsSelectedLocation);
const tenantLocations = ref([]);

onTenantResult(async (loadedResult) => {
  if (!loadedResult.loading) {
    const domain = loadedResult?.data?.adminTenant?.domain
    userStore.setupByDomain(domain)
    tenantLocations.value = loadedResult?.data?.adminTenant?.locations || [];
  }
})

// When importing merged users from a file, we want to skip the count update for speed.
// So we keep track of the number of deleted users on the front end.
const deletedUsersSinceCount = ref<number>(0);
const updateTenantLocationsUserCount = () => {
  deletedUsersSinceCount.value++
}

async function loadTenantOrLocationUsers() {
  // delete all stored info for the tenant
  userStore.deleteAllActiveTenantUsers()
  deletedUsersSinceCount.value = 0;

  if (selectedLocation.value) {
    userStore.loadLocationUsers(selectedLocation.value.id)
  } else {
    userStore.loadTenantUsers(`${route.params.id}`)
  }
  // @ts-expect-error selectedLocation type
  userStore.setActiveTenantsSelectedLocation(selectedLocation.value);

}


const userCount = computed(() => {
  if (userStore.activeTenantsSelectedLocation) {
    if (deletedUsersSinceCount.value > 0) {
      return ((userCountForEachLocation.value.get(userStore.activeTenantsSelectedLocation?.id))?.count || 0) - deletedUsersSinceCount.value
    }
    return (userCountForEachLocation.value.get(userStore.activeTenantsSelectedLocation?.id))?.count
  }

  if (deletedUsersSinceCount.value > 0) {
    return (tenantUserCount.value || 0) - deletedUsersSinceCount.value
  }
  return (tenantUserCount.value || 0)

});

watch(
  () => route.params.userId,
  async () => {
    refetchUser({ id: route.params.userId, fetchPolicy: "no-cache" })
  }
)

const similarUsers = ref<VisituUser[]>([])

const searchableUsers = ref<VisituUser[]>([]);

const similarUserSearcher = ref<Searcher<VisituUser, FullOptions<VisituUser>>>();

function refreshSearchableUsers() {
  // For the users that we are searching through, only include the attributes we will display
  const loadedUsers = userStore.getActiveTenantUsers.map((user) => {
    return ({ ...user })
  })
  searchableUsers.value = loadedUsers;

  similarUserSearcher.value = new Searcher(
    loadedUsers,
    { keySelector: (obj) => `${obj.name} ${obj.id}` },
  );
  similarUsers.value = similarUserSearcher.value.search(similarUserSearchTerm.value || '');
}

function refreshSearchTerm() {
  if (!similarUserSearcher.value) {
    refreshSearchableUsers()
  }
  // @ts-expect-error similarUsers.value
  similarUsers.value = similarUserSearcher.value?.search(similarUserSearchTerm.value || '');
}

// @ts-expect-error need types
const similarUserSearchTerm = ref(user.value?.name)

watchDebounced(
  similarUserSearchTerm,
  () => {
    refreshSearchTerm();
  },
  {
    debounce: 500,
  }
);

const allUsersInTenantLoaded = computed(() => {
  if ((userStore?.activeTenantUsers?.size || 0) == userCount.value) {
    return true
  }
  return false
})

watch(allUsersInTenantLoaded, (newValue) => {
  if (newValue) {
    // all users in tenant loaded, load them into the seach
    refreshSearchableUsers();
  }
})

onUserLoaded((userResult) => {
  if (!userResult?.loading) {
    similarUserSearchTerm.value = userResult.data.adminUser.name

    refreshSearchTerm();

    userStore.setActiveMergeUserUuid(userResult.data.adminUser.id);

    // When there are merged users on the loaded user, we update the stored user. This is
    // so that the merged users are updated and shown in the merge tool search results.
    if (userResult?.data?.adminUser?.mergedUsers &&
      (userResult?.data?.adminUser?.mergedUsers?.length || 0) > 0) {
      userStore.replaceUserInActiveTenant(userResult?.data?.adminUser)
    }
  }
})

function changeMergeUser(newUserId: string) {
  if (newUserId && newUserId.length > 0) {
    userStore.setActiveMergeUserUuid(newUserId);
    router.push({
      path: `/user-audit/${route.params.id}/merge/${newUserId}`
    })
  }
}
function changeSearch(value: string) {
  similarUserSearchTerm.value = value

  refreshSearchTerm();
}

function changeMergeUserWithTopResult() {
  // Sometimes the top result is the current user, and we have hidden the current
  // user in the search results. In that case, we want the second user in the results.
  // @ts-expect-error user?.value
  if (similarUsers.value?.[0]?.id && similarUsers.value?.[0]?.id !== user?.value?.id) {
    changeMergeUser(similarUsers.value[0].id);
    // @ts-expect-error user?.value
  } else if (similarUsers.value?.[1]?.id && similarUsers.value?.[1]?.id !== user?.value?.id) {
    changeMergeUser(similarUsers.value[1].id);
  }
}

const anyGraphqlQueryLoading = useGlobalQueryLoading()

const createMergedUserMutation = useMutation(
  gql`
    mutation CreateMergedUser($user: UpdateMergedUserInput!) {
      adminCreateMergedUser(user: $user) {
        id
      }
    }
  `,
);

const unmergeUserMutation = useMutation(
  gql`
    mutation UnmergeMergeUser($id: String!) {
      adminUnmergeUser(id: $id)
    }
  `,
);

const copyPhotoBetweenUsersMutation = useMutation(
  gql`
    mutation AdminCopyPhotoBetweenUsers($targetUserId: String!, $sourceUserId: String!) {
      adminCopyPhotoBetweenUsers(targetUserId: $targetUserId, sourceUserId: $sourceUserId)
    }
  `,
);

const mergeUserPhoto = async (mergeUser: VisituUser) => {
  // @ts-expect-error type for user.value.id
  if (!(mergeUser.id.length > 4) || !(user.value.id.length > 4)) {
    // eslint-disable-next-line
    console.log("Missing required fields")
    return
  }

  confirm.require({
    message: `Are you sure you want to copy the user's photo?`,
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
        await copyPhotoBetweenUsersMutation.mutate({
          // @ts-expect-error type for user.value.id
          targetUserId: user.value.id,
          sourceUserId: mergeUser.id
        });
        toast.add({
          severity: 'info', summary: 'Confirmed',
          detail: 'You have successfully copied the user photo', life: 3000
        });

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
        detail: 'You have canceled the user photo copy', life: 3000
      });
    }
  })
}


const unmergeIntegrationUser = async (mergeUser: VisituUser) => {
  await unmergeUserMutation.mutate({ id: mergeUser.id })
  refetchUser({ id: route.params.userId, fetchPolicy: "no-cache" })
}

const mergeIntegrationUser = async (mergeUser: VisituUser) => {
  // @ts-expect-error type for user.value.id
  if (!(mergeUser.id.length > 4) || !(user.value.id.length > 4) || !(mergeUser.syncId.length > 4)) {
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
        // @ts-expect-error type for user.value.id
        userId: user.value.id,
        syncId: mergeUser.syncId,
        name: mergeUser.name,
        email: mergeUser?.email || undefined,
        phone: mergeUser?.phone || undefined,
        mergedData: mergedData,
        rawSyncData: mergeUser?.rawSyncData || undefined,
        // @ts-expect-error type for user.value
        tenantId: user.value.tenant.id
      },
    });
    toast.add({
      severity: 'info', summary: 'Confirmed',
      detail: 'You have successfully merged the users', life: 3000
    });

    refetchUser({ id: currentUserId, fetchPolicy: "no-cache" })

    if (mergeUser?.id) {
      userStore.removeDeletedUser(mergeUser?.id)
    }

    refreshSearchableUsers()
    refreshSearchTerm()

    refetchTenantLocationsUserCount()
    deletedUsersSinceCount.value = 0; // Reset the count of deleted users since last refresh

  } catch {
    toast.add({
      severity: 'error', summary: 'Update Failed',
      detail: 'Your changes were not saved', life: 3000
    });
  }

}

function showPairSelected(targetUser: VisituUser, mergeUser: VisituUser) {
  // @ts-expect-error user.value
  if (user.value?.id === targetUser?.id) {
    changeSearch(`${mergeUser.name} ${mergeUser.id}`)
  } else {
    changeMergeUser(targetUser.id)
  }

}

</script>

<template>
<div>
  <div class="pl-3 pr-3 pt-0 pb-0 flex gap-8 bg-surface-0 dark:bg-surface-950">

    <div class="min-h-screen overflow-auto flex-1 flex flex-col gap-8 transition-all">

      <div class="flex flex-col md:flex-row md:items-center md:justify-between py-1 gap-4">
        <!-- @vue-expect-error user.name -->
        <div v-if="!user?.name || (userStore.activeTenantUsers?.size || 0) < userCount"
          class="flex flex-1 items-center justify-left p-2">

          <div class="flex flex-col gap-2  p-2 m-2">
            <Select v-model="selectedLocation" :options="tenantLocations" option-label="name"
              placeholder="Select Location (all)" checkmark show-clear class="w-full md:w-56 max-w-[200px] truncate" />
          </div>

          <div class="flex flex-col gap-2  p-2 m-2">
            <Button :class="(userStore.activeTenantUsers?.size || 0) > 0
              ? 'bg-surface-300 border-surface-200' : 'bg-primary-400 border-primary-200'"
              @click="loadTenantOrLocationUsers()">
              Load Users
            </Button>
          </div>
          <div class="flex flex-col gap-2 p-2 m-2">
            <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
              Loaded {{ userStore.activeTenantUsers?.size || 0 }} of {{ userCount }}
              in
              {{ userStore.activeTenantsSelectedLocation ?
                userStore.activeTenantsSelectedLocation?.name : 'Tenant' }}
            </div>
          </div>

        </div>
        <div v-else>
          <h1 class="text-lg font-mono font-bold text-surface-900 dark:text-surface-0">
            <!-- @vue-expect-error user.name -->
            {{ user?.name }}
          </h1>
          <!-- @vue-expect-error user.id -->
          <UuidFormatted :uuid="user.id" />
        </div>
        <div class="flex items-center gap-2">
          {{ similarUsers.length > 1 ? similarUsers.length - 1 : 0 }} Similar
          <IconField>

            <InputText v-model="similarUserSearchTerm" :disabled="userStore?.activeTenantUsers?.size != userCount"
              placeholder="       Search" size="small"
              class="w-56 md:w-72 xl:w-96 h-9 font-bold text-surface-900 dark:text-surface-0" />
            <InputIcon class="pi pi-search" />
          </IconField>

          <Button icon="pi pi-arrow-right-arrow-left !text-sm !leading-normal"
            :disabled="userStore?.activeTenantUsers?.size != userCount" severity="secondary" outlined
            class="w-9 h-9 !p-0 shrink-0 rounded-md" @click="changeMergeUserWithTopResult()" />
        </div>
      </div>


      <MergedUserImport @refetch-tenant-locations-user-count="updateTenantLocationsUserCount"
        @show-pair-selected="showPairSelected" />

      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 flex-1 md:flex-row flex-col overlaycontainer">
        <!-- overlay blur when loading -->
        <div v-if="userStore.loading || anyGraphqlQueryLoading" class="rounded-2xl backdrop-blur-xs overlay" />


        <div
          class="flex-1 col-span-1 md:col-span-2 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl bg-surface-50 dark:bg-surface-800">

          <!-- @vue-expect-error user -->
          <UserMergeCard :current-user="user" :details="true" @change-merge-user="changeMergeUserWithTopResult"
            @change-search-text="changeSearch" @unmerge-integration-user="unmergeIntegrationUser" />

        </div>

        <div
          class="flex-1 col-span-1 md:col-span-2 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl bg-surface-50 dark:bg-surface-800">

          <div v-for="similarUser in similarUsers" :key="similarUser.id">
            <!-- @vue-expect-error user.id -->
            <div v-if="similarUser.id !== user.id">
              <!-- @vue-expect-error user.id -->
              <UserMergeCard :current-user="similarUser" :merge-target-user="user" @change-merge-user="changeMergeUser"
                @merge-integration-user="mergeIntegrationUser" @merge-user-photo="mergeUserPhoto" />
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <p>
    <!-- @vue-expect-error user.name -->
    {{ user.name }}
    <!-- @vue-expect-error user.id -->
    {{ user.id }}
  </p>

  <div class="text-lg font-medium text-surface-900 dark:text-surface-0">
    Loaded Users:{{ userStore.activeTenantUsers?.size || 0 }}, Searchable: {{ searchableUsers?.length || 0 }}
    all users loaded: {{ allUsersInTenantLoaded }}
  </div>

</div>
</template>

<style lang="css" scoped>
.overlaycontainer {
  position: relative;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.dark .overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  z-index: 1000;
	}
</style>
