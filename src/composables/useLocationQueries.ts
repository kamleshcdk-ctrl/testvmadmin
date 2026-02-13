
const locationsQuery = gql`
  query AdminAllLocations {
    adminLocations {
      id
      name
      address
      geoAddress
      ncesId
      ncesDistrictId
      pmkSchoolId
      expired
      activeAt
      createdAt
      featureFlags
      parent {
        id
        name
        activeAt
      }
      tenant {
        id
        name
        expired
        sandbox
      }
    }
  }
`
export function useLocationsQuery() {
  function getLocations() {
    const { result, loading, refetch, onResult, error } = useQuery(locationsQuery)
    const empty = computed<boolean>(() => { return result?.value?.adminLocations?.length === 0 });
    const locations = computed<object[]>(() => result?.value?.adminLocations || [])
    return { locations, loading, empty, refetch, onResult, error }
  }
  return { getLocations }
}

export interface ApolloLocation {
  id: string;
  name: string;
  // expired
  expiresAt: string;
  ncesId: string;
  ncesDistrictId: string;
  pmkSchoolId: string;
  // featureFlags
  childLimit: string;
  timezone: string;
  notes: string;
  address: string;
  tenant: ApolloTenant;
  parent: ApolloLocation;
  // createdAt
  // expiresAt
}

const locationByIdQuery = gql`
  query AdminLocation($id: String!) {
    adminLocation(id: $id) {
      id
      name
      expired
      expiresAt
      ncesId
      ncesDistrictId
      pmkSchoolId
      featureFlags
      childLimit
      timezone
      notes
      address
      tenant {
        id
        name
        domain
      }
      parent {
        id
        name
      }
      createdAt
      expiresAt
    }
  }
`
export function useLocationByIdQuery() {
  function getLocationById(locationId: string | string[]) {
    const { result: location, loading, refetch, onResult, error } = useQuery(
      locationByIdQuery,
      {
        id: locationId,
      }
    )
    const result = computed<ApolloLocation>(() => location?.value?.adminLocation || {})
    return { result, loading, refetch, onResult, error }
  }
  return { getLocationById }
}

export function useLocationAuditLogs() {
  function getLocationAuditLogs(locationId: string | string[]) {
    const { result: locationResult, loading, onResult } = useQuery(gql`
      query AdminIntegrations($id: String!) {
          location(id: $id) {
              id
              auditLogs {
                  id
                  target
                  key
                  newValue
                  oldValue
                  createdAt
                  changedBy {
                      id
                      name
                  }
              }
          }
      }
  `, {
      id: locationId,
    })
    const result = computed<object[]>(() => locationResult?.value?.location?.auditLogs || [])
    return { result, loading, onResult }
  }
  return { getLocationAuditLogs }
}
export function useLocationDevices() {
  function getLocationDevices(locationId: string | string[]) {
    const { result: locationResult, loading, onResult } = useQuery(gql`
      query AdminLocation($id: String!) {
          location(id: $id) {
            devices(all: true) {
                  id
                  name
                  mode
                  model
                  externalIp
                  internalIp
                  osVersion
                  appVersion
                  printerStatus
                  battery
                  seenAt
                  createdAt
                  deletedAt
                  updatedAt
                  tenantId
                  hasPrinter
                  complianceFailures
              }
          }
      }
  `, {
      id: locationId,
    })
    const result = computed<object[]>(() => locationResult?.value?.location?.devices || [])
    return { result, loading, onResult }
  }
  return { getLocationDevices }
}

export function userRecentActivities() {
  function getRecentActivities(locationId: string | string[]) {
    const { result: activity, loading, onResult } = useQuery(gql`
      query AdminLocation($id: String!) {
          location(id: $id) {
          recentActivity {
            id
            message
            createdAt
            user {
              id
              name
            }
          }
       }
    }
  `, {
      id: locationId,
    })
    const result = computed<object[]>(() => activity?.value?.location?.recentActivity || [])
    return { result, loading, onResult }
  }
  return { getRecentActivities }
}

const getUserWithSyncIdQuery = gql`
  query GetUserWithSyncId($locationId: String!, $sisUserId: String!, $slug: String!) {
    adminGetUsersWithSyncId(locationId: $locationId, sisUserId: $sisUserId, slug: $slug) {
      id
      name
      email
      syncId
      attendance {
        id
        type
        notes
        time
        confirmed
        excused
        integrationPayload
        createdAt
        updatedAt
        confirmedAt
        reason {
          id
          name
        }
        device {
          id
          name
        }
        confirmedBy {
          id
          name
        }
        createdBy {
          id
          name
        }
      }
    }
  }
`
export function useUserWithSyncIdQuery() {
  function getUserWithSyncId(params: {
    locationId: string
    sisUserId: string
    slug: string
  }) {
    const { result: user, loading, refetch, onResult, error } = useQuery(
      getUserWithSyncIdQuery,
      {
        locationId: params.locationId,
        sisUserId: params.sisUserId,
        slug: params.slug,
      }
    )
    const result = computed(() => user?.value?.adminGetUsersWithSyncId || {})
    return { result, loading, refetch, onResult, error }
  }
  return { getUserWithSyncId }
}
