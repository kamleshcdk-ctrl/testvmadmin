import { useQuery } from '@vue/apollo-composable'

const allFeatureFlagsQuery = gql`
  query FeatureFlags {
    featureFlags {
      id
      name
      description
      beta
    }
  }
`
export function useAllFeatureFlagsQuery() {
  function getAllFeatureFlags() {
    const { result: flagsResult, loading, onResult, error } = useQuery(allFeatureFlagsQuery)
    const result = computed<object[]>(() => flagsResult?.value?.featureFlags || [])
    return { result, loading, onResult, error }
  }
  return { getAllFeatureFlags }
}

const childLocationsQuery = gql`
  query AdminChildLocations($id: String!) {
      location(id: $id) {
          id
          children {
              id
              name
              createdAt
          }
      }
  }
`
export function useChildLocationsQuery() {
  function getChildLocations(locationId: string | string[]) {
    const { result: childLocationsResult, loading, onResult } = useQuery(childLocationsQuery, {
      id: locationId,
    })
    const result = computed<ApolloLocation[]>(() => childLocationsResult?.value?.location?.children || [])
    return { result, loading, onResult }
  }
  return { getChildLocations }
}

export function useEmergencyUpdatesForLocationQuery() {
  function getEmergencyUpdatesForLocation(locationId: string | string[]) {
    const { result: updatesResult, loading, onResult } = useQuery(gql`
      query AdminEmergencyUpdates($id: String!) {
          location(id: $id) {
              id
              emergencyUpdates {
                  id
                  status
                  message
                  completedAt
                  targetCount
                  sentCount
                  createdAt
              }
          }
      }
    `, {
      id: locationId,
    })
    const result = computed<object[]>(() => updatesResult?.value?.location?.emergencyUpdates || [])
    return { result, loading, onResult }
  }
  return { getEmergencyUpdatesForLocation }
}

const rolesForLocationQuery = gql`
  query AdminRoles($id: String!) {
      location(id: $id) {
          id
          roles {
              id
              name
              userCount
              integrationRoleIds
              syncAutoRemove
          }
      }
  }
`
export function useRolesForLocationQuery() {
  function getRolesForLocation(locationId: string | string[]) {
    const { result: rolesResult, loading, onResult } = useQuery(rolesForLocationQuery, {
      id: locationId,
    })
    const result = computed<object[]>(() => rolesResult?.value?.location?.roles)
    return { result, loading, onResult }
  }
  return { getRolesForLocation }
}


const adminUsersForLocationQuery = gql`
  query AdminIntegrations($id: String!) {
    adminImportantUsers(id: $id) {
      id
      name
      createdAt
    }
  }
`
export function useAdminUsersForLocationQuery() {
  function getAdminUsersForLocation(locationId: string | string[]) {
    const { result: usersResult, loading, onResult } = useQuery(adminUsersForLocationQuery, {
      id: locationId,
    });
    const result = computed<object[]>(() => usersResult?.value?.adminImportantUsers)
    return { result, loading, onResult }
  }
  return { getAdminUsersForLocation }
}
