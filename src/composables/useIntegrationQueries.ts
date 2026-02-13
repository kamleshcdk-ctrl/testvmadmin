import { useQuery } from '@vue/apollo-composable'

const allAdminIntegrationsQuery = gql`
  query AdminAllIntegrations {
    adminAllIntegrations {
            id
            enabled
            slug
            location {
              id
              name
            }
            error
            ranAt
            updatedAt
            createdAt
    }
  }
`
export function useAdminAllIntegrationsQuery() {
  function getAdminAllIntegrations() {
    const { result, loading, refetch, onResult, error } = useQuery(allAdminIntegrationsQuery)
    const empty = computed<boolean>(() => { return result?.value?.adminAllIntegrations?.length === 0 });
    const integrations = computed<object[]>(() => result?.value?.adminAllIntegrations || [])
    return { integrations, loading, empty, refetch, onResult, error }
  }
  return { getAdminAllIntegrations }
}


const integrationsForLocationQuery = gql`
  query AdminIntegrations($id: String!) {
    adminLocation(id: $id) {
      id
      integrations {
        id
        slug
        data
        createdAt
        locationId
      }
      tenant {
        id
        name
        domain
      }
    }
  }
`
export function useIntegrationsForLocationQuery() {
  function getIntegrationsForLocation(locationId: string | string[]) {
    const { result: integrationsResult, loading, onResult } = useQuery(integrationsForLocationQuery, {
      id: locationId,
    })
    const result = computed<object[]>(() => integrationsResult?.value?.adminLocation?.integrations)
    const tenant = computed<object[]>(() => integrationsResult?.value?.adminLocation?.tenant)
    return { result, tenant, loading, onResult }
  }
  return { getIntegrationsForLocation }
}
const allAdminIntegrationErrorsQuery = gql`
  query adminIntegrationLogs($perLocationLimit: Float = 5, $days: Float = 7) {
    adminIntegrationLogs(perLocationLimit: $perLocationLimit, days: $days) {
      id
      name
      slug         # integration slug per backend mapping
      logs {     # backend field is errors
        id
        message
        integrationSlug  # from integration.slug
        createdAt
        integration { id slug }
      }
    }
  }
`
export function useAdminAllIntegrationErrorsQuery() {
  function getAdminAllIntegrationErrors() {
    const { result, loading, refetch, onResult, error } = useQuery(allAdminIntegrationErrorsQuery)
    const empty = computed<boolean>(() => { return result?.value?.adminIntegrationLogs?.length === 0 });
    const locations = computed<object[]>(() => result?.value?.adminIntegrationLogs || [])
    return { locations, loading, empty, refetch, onResult, error }
  }
  return { getAdminAllIntegrationErrors }
}
