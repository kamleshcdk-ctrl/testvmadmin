import { useQuery } from '@vue/apollo-composable'
import { computed } from 'vue'
import type { VisituUser } from "~/types";

const tenantsQuery = gql`
  query AdminAllTenants {
    adminTenants {
      id
      name
      expired
      sandbox
      selfBilling
      createdAt
      expiresAt
      stripeCustomerId
      stripeSubscriptionId
      domain
      studentCount
    }
  }
`
export function useTenantsQuery() {
  function getTenants() {
    const { result, loading, refetch, onResult, error } = useQuery(tenantsQuery)

    const empty = computed<boolean>(() => result?.value?.adminTenants?.length === 0)
    const tenants = computed<object[]>(() => result?.value?.adminTenants || [])
    return { tenants, loading, empty, refetch, onResult, error }
  }
  return { getTenants }
}

export interface ApolloAdminUser {
  id: string;
  user: VisituUser;
}

export interface ApolloTenant {
  id: string;
  name: string;
  // expired
  // selfBilling
  // stripeCustomerId
  // stripeSubscriptionId
  staffCount: string;
  studentCount: string;
  sandbox: boolean;
  domain: string;
  notes: string;
  // createdAt
  expiresAt: string;
  admins: ApolloAdminUser[];
  locations: ApolloLocation[];
}

const tenantByIdQuery = gql`
  query AdminTenant($id: String!) {
    adminTenant(id: $id) {
      id
      name
      expired
      selfBilling
      stripeCustomerId
      stripeSubscriptionId
      staffCount
      studentCount
      sandbox
      domain
      notes
      createdAt
      domain
      expiresAt
      admins {
        id
        user {
          id
          name
          email
        }
      }
      locations(expired: true) {
        id
        name
        pmkSchoolId
        timezone
      }
    }
  }
`
export function useTenantByIdQuery() {
  function getTenantById(tenantId: string | string[]) {
    const { result: tenant, loading, refetch, onResult, error } = useQuery(tenantByIdQuery,
      {
        id: tenantId,
      })
    const result = computed<ApolloTenant>(() => tenant?.value?.adminTenant || {})
    return { result, loading, refetch, onResult, error };
  }
  return { getTenantById }
}
