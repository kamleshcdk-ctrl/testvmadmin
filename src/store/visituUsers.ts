import { defineStore } from "pinia";
import { promiseTimeout, useStorage } from '@vueuse/core'
import {
  extractEmailsFromJsonString,
  extractPhoneNumbersFromJsonString,
  firstAndLastName,
  firstMiddleAndLastNames
} from "~/helpers";

import type {
  VisituUser,
  TenantLocation,
  UserWithMergedUser,
  MergeableUserPair
} from "~/types";

import { usePagesOfLocationUsersQuery } from "~/composables/useUserQueries";

interface VisituUsers {
  domain: string;
  users: Map<string, VisituUser>;
}


export const useVisituUsersStore = defineStore('visituUsers', () => {

  // State:
  const loadingActions = ref<string[]>([]) // used for 'loading' true/false getter

  const activeTenantDomain = ref("")

  const mergeUserUuids = ref<Map<string, string>>(new Map<string, string>())

  const savedGridState = ref(null);
  const savedColumnState = ref(null);

  const autoSaveGridOptions = useStorage('autoSaveGridOptions', true)
  const duplicatesIgnoreMiddleName = useStorage('duplicatesIgnoreMiddleName', false)
  const onlyShowDuplicatesForSameChild = useStorage('onlyShowDuplicatesForSameChild', true)

  const savedDuplicateGridState = ref(null);
  const savedDuplicateColumnState = ref(null);

  const tenantsSelectedLocation = ref<Map<string, TenantLocation | undefined>>(new Map<string, TenantLocation | undefined>())
  const activeTenantsSelectedLocation = computed(() => {
    return tenantsSelectedLocation.value.get(activeTenantDomain.value)
  })

  const tenantUsers =
    ref<Map<string, VisituUsers>>(new Map<string, VisituUsers>())
  const activeTenantUsers = computed(() =>
    tenantUsers.value.get(activeTenantDomain.value)?.users)

  const mergeableUserPairs = ref<MergeableUserPair[]>([]) // merge pairs loaded from file
  const currentMergeableUserPairsIndex = ref<number>(0)

  const notFoundMergeableUserPairs = ref<MergeableUserPair[]>([])

  const importExportMergedUsersOpen = useStorage('importExportMergedUsersOpen', false)
  const showNotFoundMergeableUsers = ref(false)

  // getters
  const loading = computed(() => loadingActions.value.length > 0)

  const getActiveTenantUserById = computed(() => (id: string) => {
    return activeTenantUsers.value?.get(id)
  });

  const getUsersWithDuplicatedNames = computed(() => {
    const users = activeTenantUsers?.value
    const foundNames = new Set()
    const duplicateNames = new Set()
    const duplicatedNameUsers: VisituUser[] = []

    // first we build a list of duplicate names within the parents of the same child
    if (onlyShowDuplicatesForSameChild.value) {
      users?.forEach((currentUser) => {
        if (currentUser.parentContacts?.length > 0) {

          const foundNamesInChildsParents = new Set()
          for (const parentContact of currentUser.parentContacts) {
            const currentParentFormattedName = duplicatesIgnoreMiddleName.value ?
              // @ts-expect-error parent type
              firstAndLastName(parentContact.parent.name) : firstMiddleAndLastNames(parentContact.parent.name)

            if (foundNamesInChildsParents.has(currentParentFormattedName)) {
              duplicateNames.add(currentParentFormattedName)
            }
            foundNamesInChildsParents.add(currentParentFormattedName)
          }

        }
      })

      // Since we have a list of duplicate names,
      // we can now build a list of just the users with those names
      users?.forEach((currentUser: VisituUser) => {
        const currentUserFormattedName = duplicatesIgnoreMiddleName.value ?
          firstAndLastName(currentUser.name) : firstMiddleAndLastNames(currentUser.name)

        if (duplicateNames.has(currentUserFormattedName)) {
          duplicatedNameUsers.push(currentUser)
        }
      })

    } else {

      // first we build a list of duplicate names within the loaded users of the tenant
      users?.forEach((currentUser) => {
        const currentUserFormattedName = duplicatesIgnoreMiddleName.value ?
          firstAndLastName(currentUser.name) : firstMiddleAndLastNames(currentUser.name)


        if (foundNames.has(currentUserFormattedName)) {
          duplicateNames.add(currentUserFormattedName)
        }
        foundNames.add(currentUserFormattedName)
      })

      // Since we have a list of duplicate names,
      // we can now build a list of just the users with those names
      users?.forEach((currentUser: VisituUser) => {
        const currentUserFormattedName = duplicatesIgnoreMiddleName.value ?
          firstAndLastName(currentUser.name) : firstMiddleAndLastNames(currentUser.name)

        if (duplicateNames.has(currentUserFormattedName)) {
          duplicatedNameUsers.push(currentUser)
        }
      })
    }

    // Once we have a list of the duplicate users that we will show,
    // we can now add additional information to each user for display in ag-grid,
    // which is all really just a different format of the information we already have.
    const formattedDuplicateUsers: VisituUser[] =
      duplicatedNameUsers.map(((currentUser: VisituUser): VisituUser => {
        const roleNames = currentUser.roles?.map((role) => role.name)
        const roleLocationNames = currentUser.roles?.map((role) => role?.location?.name)
        const uniqueLocationNames = [...new Set(roleLocationNames)]

        const hasParent = currentUser?.parentContacts?.length > 0
        const hasChild = currentUser?.childContacts?.length > 0

        let guardianLinkCount = 0;
        if (hasChild) {
          guardianLinkCount = currentUser?.childContacts?.length
        }
        if (hasParent) {
          guardianLinkCount = currentUser?.parentContacts?.length
        }

        const mergedUserCount = currentUser?.mergedUsers?.length || 0;
        const hasMergedUsers = mergedUserCount > 0;

        const hasPhone: boolean = currentUser.phone ? true : false
        const hasEmail: boolean = currentUser.email ? true : false

        const dob: boolean = currentUser.dateOfBirth ? true : false
        const birthday: boolean = currentUser.birthday ? true : false
        const hasBirthDate = dob || birthday

        return {
          ...currentUser,
          name: currentUser.name,
          firstAndLastName: firstAndLastName(currentUser.name),
          roleNames: roleNames.join(", "),
          roleLocationNames: uniqueLocationNames?.join(", "),

          hasPhone: hasPhone,
          hasEmail: hasEmail,
          phoneOrEmail: hasPhone || hasEmail,
          hasBirthDate: hasBirthDate,
          missingAll: !hasBirthDate && !hasPhone && !hasEmail,

          rawSyncEmails: extractEmailsFromJsonString(JSON.stringify(currentUser?.rawSyncData)),
          rawSyncPhoneNumbers: extractPhoneNumbersFromJsonString(JSON.stringify(currentUser?.rawSyncData)),

          hasParent: hasParent,
          hasChild: hasChild,
          hasParentOrChild: hasParent || hasChild,
          hasMergedUsers: hasMergedUsers,

          guardianLinkCount: guardianLinkCount,
          mergedUserCount: mergedUserCount,
        }
      }))


    return formattedDuplicateUsers
  })

  const getUsersWithMergedUsers = computed<UserWithMergedUser[]>(() => {
    const users = activeTenantUsers?.value

    const usersWithMergedUsers: UserWithMergedUser[] = []
    users?.forEach((currentUser: VisituUser) => {

      const mergedUserCount = currentUser?.mergedUsers?.length || 0;
      if (mergedUserCount > 0) {
        const mergedUserSyncIds = currentUser?.mergedUsers?.map((mergedUser) => mergedUser.syncId) || [];

        usersWithMergedUsers.push({
          name: currentUser.name,
          syncId: currentUser.syncId,
          mergedUserSyncIds: mergedUserSyncIds
        })
      }
    })

    return usersWithMergedUsers
  })


  const getActiveTenantUsers = computed(() => {

    const users = activeTenantUsers?.value || [];
    const tenantUsers: VisituUser[] = []
    users?.forEach((currentUser: VisituUser) => {
      tenantUsers.push(currentUser)
    })

    // We now add additional information to each user for display in ag-grid,
    // which is all really just a different format of the information we already have.
    const formattedUsers: VisituUser[] =
      tenantUsers.map((currentUser: VisituUser): VisituUser => {

        const roleNames = currentUser.roles?.map((role) => role.name)
        const roleLocationNames = currentUser.roles?.map((role) => role?.location?.name)
        const uniqueLocationNames = [...new Set(roleLocationNames)]

        const hasParent = currentUser?.parentContacts?.length > 0
        const hasChild = currentUser?.childContacts?.length > 0

        let guardianLinkCount = 0;
        if (hasChild) {
          guardianLinkCount = currentUser?.childContacts?.length
        }
        if (hasParent) {
          guardianLinkCount = currentUser?.parentContacts?.length
        }

        const hasPhone: boolean = currentUser.phone ? true : false
        const hasEmail: boolean = currentUser.email ? true : false

        const mergedUserCount = currentUser?.mergedUsers?.length || 0;
        const hasMergedUsers = mergedUserCount > 0;

        const dob: boolean = currentUser.dateOfBirth ? true : false
        const birthday: boolean = currentUser.birthday ? true : false
        const hasBirthDate = dob || birthday

        return {
          ...currentUser,
          firstAndLastName: firstAndLastName(currentUser.name),
          roleNames: roleNames.join(", "),
          roleLocationNames: uniqueLocationNames?.join(", "),

          hasPhone: hasPhone,
          hasEmail: hasEmail,
          phoneOrEmail: hasPhone || hasEmail,
          hasBirthDate: hasBirthDate,
          missingAll: !hasBirthDate && !hasPhone && !hasEmail,

          rawSyncEmails: extractEmailsFromJsonString(JSON.stringify(currentUser?.rawSyncData)),
          rawSyncPhoneNumbers: extractPhoneNumbersFromJsonString(JSON.stringify(currentUser?.rawSyncData)),

          hasParent: hasParent,
          hasChild: hasChild,

          hasParentOrChild: hasParent || hasChild,
          guardianLinkCount: guardianLinkCount,

          hasMergedUsers: hasMergedUsers,
          mergedUserCount: mergedUserCount
        }
      })
    return formattedUsers || []
  })

  const getActiveMergeUserUuid = computed(() => {
    return mergeUserUuids.value.get(activeTenantDomain.value)
  })

  // Actions:
  function setActiveMergeUserUuid(uuid: string) {
    mergeUserUuids.value.set(activeTenantDomain.value, uuid)
  }

  function setActiveTenantsSelectedLocation(location: TenantLocation) {
    tenantsSelectedLocation.value.set(activeTenantDomain.value, location)
  }

  function removeDeletedUser(uuid: string) {
    if (tenantUsers.value?.get(activeTenantDomain?.value)?.users) {
      const newActiveTenantUsers = new Map<string, VisituUser>()
      activeTenantUsers.value?.forEach((currentUser) => {
        if (currentUser.id !== uuid) {
          newActiveTenantUsers.set(currentUser.id, currentUser)
        }
      })
      // @ts-expect-error tenantUsers might be undefined
      tenantUsers.value.get(activeTenantDomain.value).users = newActiveTenantUsers
    }
  }

  function replaceUserInActiveTenant(updatedUser: VisituUser) {
    activeTenantUsers.value?.set(`${updatedUser.id}`, updatedUser)
  }

  async function setupByDomain(tenantDomain: string) {
    activeTenantDomain.value = tenantDomain


    if (!tenantUsers.value.has(tenantDomain)) {
      // create tenant domain in list of users
      tenantUsers.value.set(tenantDomain, {
        domain: tenantDomain,
        users: new Map<string, VisituUser>()
      });
    }

    if (!mergeUserUuids.value.has(tenantDomain)) {
      mergeUserUuids.value.set(tenantDomain, "")
    }

    if (!tenantsSelectedLocation.value.has(tenantDomain)) {
      tenantsSelectedLocation.value.set(tenantDomain, undefined)
    }
  }

  async function deleteAllActiveTenantUsers() {
    const tenantDomain = activeTenantDomain.value

    // create tenant domain in list of users
    tenantUsers.value.set(tenantDomain, {
      domain: tenantDomain,
      users: new Map<string, VisituUser>()
    });

    // remove the selected merge target user
    if (!mergeUserUuids.value.has(tenantDomain)) {
      mergeUserUuids.value.set(tenantDomain, "")
    }
  }


  async function getUserWithMatchingSyncId(syncId: string) {

    if (tenantUsers.value?.get(activeTenantDomain?.value)?.users) {
      // @ts-expect-error activeTenantUsers.value
      for (const current of activeTenantUsers.value) {
        const currentUserSyncId = current[1].syncId;
        if (syncId && currentUserSyncId) {
          const syncIdWithoutLocation = [
            syncId.split(":")[0], '_',
            ...(syncId.split(":").slice(2))
          ].join(':');


          const currentUserSyncIdWithoutLocation = [
            currentUserSyncId.split(":")[0], '_',
            ...(currentUserSyncId.split(":").slice(2))
          ].join(':');
          if (syncIdWithoutLocation === currentUserSyncIdWithoutLocation) {
            return current[1]
          }
        }
      }
    }
    return undefined;
  }

  // Used internally for 'loading' true/false getter
  function loadingFor(actionName: string, loadingNow: boolean = true) {
    if (loadingNow) {
      loadingActions.value.push(actionName)
    } else {
      loadingActions.value.splice(
        loadingActions.value.indexOf(actionName), 1)
    }
  }


  async function loadTenantUsers(tenantId: string) {
    loadingFor('loadTenantUsers')

    const {
      getPageOfUsers,
    } = usePagesOfUsersQuery()

    let hasMorePages = true;
    while (hasMorePages) {
      const { newUsers, hasMore } = await getPageOfUsers(tenantId);
      hasMorePages = hasMore

      newUsers?.forEach((user: VisituUser) => {
        activeTenantUsers.value?.set(`${user.id}`, user)
      });
      await promiseTimeout(1000)
    }

    loadingFor('loadTenantUsers', false)
  }

  async function loadLocationUsers(locationId: string) {
    loadingFor('loadLocationUsers')

    const {
      getPageOfUsers,
    } = usePagesOfLocationUsersQuery()

    let hasMorePages = true;
    while (hasMorePages) {
      const { newUsers, hasMore } = await getPageOfUsers(locationId);
      hasMorePages = hasMore

      newUsers?.forEach((user: VisituUser) => {
        activeTenantUsers.value?.set(`${user.id}`, user)
      });
      await promiseTimeout(1000)
    }

    loadingFor('loadTenantUsers', false)
  }


  return {
    // state
    activeTenantDomain,


    tenantUsers,
    activeTenantUsers,

    savedGridState,
    savedColumnState,
    savedDuplicateGridState,
    savedDuplicateColumnState,
    autoSaveGridOptions,
    duplicatesIgnoreMiddleName,
    onlyShowDuplicatesForSameChild,

    mergeableUserPairs,
    currentMergeableUserPairsIndex,
    importExportMergedUsersOpen,
    notFoundMergeableUserPairs,
    showNotFoundMergeableUsers,

    // getters
    loading,
    getActiveTenantUserById,
    getUsersWithDuplicatedNames,
    getActiveTenantUsers,
    getActiveMergeUserUuid,
    activeTenantsSelectedLocation,
    getUsersWithMergedUsers,

    // actions
    setActiveMergeUserUuid,
    setActiveTenantsSelectedLocation,

    setupByDomain,
    getUserWithMatchingSyncId,
    loadTenantUsers,
    loadLocationUsers,
    removeDeletedUser,
    replaceUserInActiveTenant,
    deleteAllActiveTenantUsers
  }
})
