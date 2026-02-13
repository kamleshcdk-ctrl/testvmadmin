import { useQuery } from '@vue/apollo-composable';
import type { ApolloQueryResult } from '@apollo/client/core'
import { computed } from 'vue';
import type { LocationUserCount, VisituUser } from "~/types";

const searchUsersQuery = gql`
  query AdminUsers($q: String!) {
    adminUsers(q: $q) {
      id
      name
      email
      syncProvider
      roles {
        id
        name
      }
      tenant {
        id
        name
      }
    }
  }
`
export function useSearchUsersQuery() {
  function searchUsers(searchQuery: string = "") {
    const { result, loading, refetch, error } = useQuery(searchUsersQuery, {
      q: searchQuery,
    })
    const users = computed(() => result?.value?.adminUsers || [])
    const empty = computed(() => users.value.length === 0)
    return { users, loading, empty, refetch, error }
  }
  return { searchUsers }
}

const usersInTenantCountQuery = gql`
  query AdminTenantUserCount($tenantId: String!, $q: String!) {
    adminTenantUserCount(tenantId: $tenantId, q: $q)
  }
`
const usersInTenantLocationsCountQuery = gql`
  query AdminTenantLocationsUserCount($tenantId: String!) {
    adminTenantLocationsUserCount(tenantId: $tenantId)
  }
`
export function useUsersInTenantCountQuery() {
  function getUsersInTenantCount(tenantId: string | string[], userSearchQuery: string = "") {
    const { result: userCountResult, loading, refetch, onResult, error } = useQuery(usersInTenantCountQuery,
      {
        tenantId: tenantId,
        q: userSearchQuery
      },
      {
        fetchPolicy: "no-cache",
      }
    )
    const result = computed<number>(() => userCountResult?.value?.adminTenantUserCount?.count || 0)
    return { result, loading, refetch, onResult, error }
  }
  function getUsersInTenantLocationsCount(tenantId: string | string[]) {

    const { result: userCountResult, loading, refetch, onResult, error } = useQuery(usersInTenantLocationsCountQuery,
      {
        tenantId: tenantId
      },
      {
        fetchPolicy: "no-cache",
      }
    )
    const result = computed<number>(() => userCountResult?.value?.adminTenantLocationsUserCount)
    const count = computed<number>(() => {
      return (userCountResult?.value?.adminTenantLocationsUserCount.count ?
        Number(userCountResult?.value?.adminTenantLocationsUserCount.count) : 0)
    })

    const userCountForEachLocation = computed(() => {
      const locationsWithCounts = new Map<string, LocationUserCount>()

      userCountResult?.value?.adminTenantLocationsUserCount.locations?.forEach((location: LocationUserCount) => {
        locationsWithCounts.set(location.id, {
          ...location,
          count: (location.count ? Number(location.count) : 0)
        })
      })
      return locationsWithCounts;
    })

    return { result, count, userCountForEachLocation, loading, refetch, onResult, error }

  }

  return { getUsersInTenantCount, getUsersInTenantLocationsCount }
}

const userByIdQuery = gql`
  query AdminUser($id: String!) {
    adminUser(id: $id) {
      id
      name
      email
      phone
      address
      dateOfBirth
      birthday
      hasMobileApp
      syncId
      additionalSyncIds
      syncedAt
      createdAt
      syncHash
      rawSyncData
      mobileDeviceInfo
      admin
      parentContacts {
        id
        parent {
          id
          phone
          email
          rawSyncData
          name
        }
      }
      childContacts {
        id
        child {
          id
          name
        }
      }
      tenant {
        id
        name
      }
      mergedUsers {
        id
        syncId
        name
        email
        phone
        mergedData
        rawSyncData
      }
      roles {
        id
        name
        integrationRoleIds
        syncAutoRemove
        location {
          id
          name
        }
      }
    }
  }
`
export function useUserByIdQuery() {
  function getUserById(userId: string | string[]) {
    // allow passing in '---' as the user id without generating an error
    if (!userId || userId.length < 5) {
      const result = {}, loading = false, refetch = () => { }, onResult = () => { }, error = {}
      return { result, loading, refetch, onResult, error };
    }

    const { result: user, loading, refetch, onResult, error } = useQuery(userByIdQuery,
      {
        id: userId,
        fetchPolicy: "no-cache"
      }
    )
    const result = computed<ApolloQueryResult<VisituUser>>(() => user?.value?.adminUser)
    return { result, loading, refetch, onResult, error }
  }
  return { getUserById }
}

const guardianRelationsByIdQuery = gql`
  query AdminUser($id: String!) {
    adminUser(id: $id) {
      id
      name
      parentContacts {
        id
        parent {
          id
          phone
          email
          rawSyncData
          name
          childContacts {
            id
            child {
              id
              name

            }
          }
        }
      }
      childContacts {
        id
        child {
          id
          name
          parentContacts {
            id
            parent {
              id
              phone
              email
              rawSyncData
              name
            }
          }
        }
      }
    }
  }
`
export function useGuardianRelationsByIdQuery() {
  function getGuardianRelationsById(userId: string | string[]) {
    // allow passing in '---' as the user id without generating an error
    if (!userId || userId.length < 5) {
      const result = {}, loading = false, refetch = () => { }, onResult = () => { }, error = {}
      return { result, loading, refetch, onResult, error };
    }

    const { result: user, loading, refetch, onResult, error } = useQuery(guardianRelationsByIdQuery,
      {
        id: userId,
        fetchPolicy: "no-cache"
      }
    )
    const result = computed<VisituUser>(() => user?.value?.adminUser || {})
    return { result, loading, refetch, onResult, error }
  }
  return { getGuardianRelationsById }
}


const userNotificationsByIdQuery = gql`
  query AdminUser($id: String!) {
    adminUserNotifications(id: $id) {
      id
      subject
      methods
      message
      emailUrl
      createdAt
      emailDeliveryStatus
      smsDeliveryStatus
      voiceDeliveryStatus
      sendgridId
      twilioSmsId
      twilioVoiceId
      sendAt
      broadcast {
        id
        title
      }
      location {
        id
        name
      }
    }
  }
`
export function useUserNotificationsByIdQuery() {
  function getUserNotificationsById(userId: string | string[]) {
    const { result: user, loading, refetch, onResult, error } = useQuery(userNotificationsByIdQuery, {
      id: userId,
    })
    const result = computed<object>(() => user?.value?.adminUserNotifications || {})
    return { result, loading, refetch, onResult, error }
  }
  return { getUserNotificationsById }
}

const adminTenantUsersQuery = gql`
  query adminTenantUsers($tenantId: String!, $q: String!) {
    adminTenantUsers(tenantId: $tenantId, q: $q) {
      id
      name
      email
      phone
      address
      dateOfBirth
      birthday
      hasMobileApp
      syncId
      additionalSyncIds
      syncHash
      syncNotes
      syncProvider
      syncedAt
      createdAt
      parentContacts {
        id
      }
      childContacts {
        id
      }
      roles {
        id
        name
        integrationRoleIds
        syncAutoRemove
        location {
          id
          name
        }
      }
    }
  }
`
export function useAdminTenantUsersQuery() {
  function getAdminTenantUsers(tenantId: string, userSearchQuery: Ref<string>) {
    const { result: usersResult, refetch, error } = useQuery(adminTenantUsersQuery, {
      tenantId: tenantId,
      q: userSearchQuery.value
    })
    const result = computed(() => usersResult?.value?.adminTenantUsers || [])
    return { result, refetch, error }
  }
  return { getAdminTenantUsers }
}

const adminPagesOfUsersQuery = gql`
  query AdminPagesOfUsers($tenantId: String!, $cursor: Float, $limit: Float) {
    adminTenantPaginatedUsers(tenantId: $tenantId, cursor: $cursor, limit: $limit) {
      cursor
      total
      hasMore
      users {
        id
        name
        email
        phone
        address
        dateOfBirth
        birthday
        hasMobileApp
        syncId
        additionalSyncIds
        syncHash
        syncNotes
        rawSyncData
        syncProvider
        syncedAt
        createdAt
        updatedAt
        parentContacts {
          id
          parent {
            id
            name
          }
        }
        childContacts {
          id
        }
        mergedUsers {
          id
          syncId
          name
          email
          phone
        }
        roles {
          id
          name
          integrationRoleIds
          syncAutoRemove
          location {
            id
            name
          }
        }
      }
    }
  }
`
export function usePagesOfUsersQuery() {
  const allUsers = ref(new Map<string, VisituUser>())
  const savedCursor = ref<number | undefined>(undefined)
  const tenantUserCount = ref<number | undefined>(undefined)

  async function getPageOfUsers(
    tenantId: string | string[],
    pageSize: number = 1000
  ) {

    const { data: usersResult } = await useAsyncQuery(adminPagesOfUsersQuery, {
      tenantId: tenantId, limit: pageSize, cursor: savedCursor.value
    })
    // @ts-expect-error type for usersResult.value
    const hasMore = usersResult.value?.adminTenantPaginatedUsers?.hasMore;
    // @ts-expect-error type for usersResult.value
    const newUsers = usersResult.value?.adminTenantPaginatedUsers?.users;
    // @ts-expect-error type for usersResult.value
    const newCursor = usersResult.value?.adminTenantPaginatedUsers?.cursor;
    savedCursor.value = newCursor;

    // @ts-expect-error type for  total
    tenantUserCount.value = usersResult.value?.adminTenantPaginatedUsers?.total;

    newUsers?.forEach((currentUser: VisituUser) => {
      allUsers.value.set(currentUser.id, currentUser)
    })

    return { usersResult, newUsers, newCursor, hasMore }
  }

  return {
    getPageOfUsers,
    allUsers,
    tenantUserCount,
  }
}


const adminPagesOfLocationUsersQuery = gql`
  query AdminPagesOfLocationUsers($locationId: String!, $cursor: Float, $limit: Float) {
    adminLocationPaginatedUsers(locationId: $locationId, cursor: $cursor, limit: $limit) {
      cursor
      total
      hasMore
      users {
        id
        name
        email
        phone
        address
        dateOfBirth
        birthday
        hasMobileApp
        syncId
        additionalSyncIds
        syncHash
        syncNotes
        rawSyncData
        syncProvider
        syncedAt
        createdAt
        updatedAt
        parentContacts {
          id
          parent {
            id
            name
          }
        }
        childContacts {
          id
        }
        mergedUsers {
          id
          syncId
          name
          email
          phone
        }
        roles {
          id
          name
          integrationRoleIds
          syncAutoRemove
          location {
            id
            name
          }
        }
      }
    }
  }
`
export function usePagesOfLocationUsersQuery() {
  const allUsers = ref(new Map<string, VisituUser>())
  const savedCursor = ref<number | undefined>(undefined)
  const locationUserCount = ref<number | undefined>(undefined)

  async function getPageOfUsers(
    locationId: string | string[],
    pageSize: number = 1000
  ) {

    const { data: usersResult } = await useAsyncQuery(adminPagesOfLocationUsersQuery, {
      locationId: locationId, limit: pageSize, cursor: savedCursor.value
    })
    // @ts-expect-error type for usersResult.value
    const hasMore = usersResult.value?.adminLocationPaginatedUsers?.hasMore;
    // @ts-expect-error type for usersResult.value
    const newUsers = usersResult.value?.adminLocationPaginatedUsers?.users;
    // @ts-expect-error type for usersResult.value
    const newCursor = usersResult.value?.adminLocationPaginatedUsers?.cursor;
    savedCursor.value = newCursor;

    newUsers?.forEach((currentUser: VisituUser) => {
      allUsers.value.set(currentUser.id, currentUser)
    })

    return { usersResult, newUsers, newCursor, hasMore }
  }

  return {
    getPageOfUsers,
    allUsers,
    locationUserCount
  }
}
