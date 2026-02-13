import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { provideApolloClient } from "@vue/apollo-composable";
import { describe, expect, it } from 'vitest';
import TenantDetails from '@/components/tenant/TenantDetails.vue';

describe("Example test here", () => {

  it('runs a test with a cache setup to have a value for the query', async () => {
    // Storing data directly into the apollo cache:
    // https://levelup.gitconnected.com/storing-local-data-with-apollo-client-dffc304efdfc
    const cache = new InMemoryCache({});
    const apolloClient = new ApolloClient({ cache: cache, });

    apolloClient.writeQuery({
      query: gql`
        query getDarkMode {
          isDarkMode @client
        }
      `,
      data: {
        isDarkMode: true,
      }
    });

    provideApolloClient(apolloClient)

    const query = useQuery(gql`
      query getDarkMode {
        isDarkMode
      }
    `)
    const darkMode = computed<boolean>(() => query.result?.value?.isDarkMode)
    expect(darkMode.value).toBe(true);
  })

  it('runs a test with a cache setup with an *id variable* and value for the query', async () => {
    const cache = new InMemoryCache({});
    const apolloClient = new ApolloClient({ cache: cache, });

    apolloClient.writeQuery({
      query: gql`
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
            admins {
            id
              user {
                id
                name
                email
              }
            }
            domain
            expiresAt
            locations(expired: true) {
              id
              name
              timezone
            }
          }
        }
      `,
      data: { // Contains the data to write, along with the __typename
        adminTenant: {
          // __typename: 'Tenant',
          id: '123abc',
          name: "tenant_name_here",
          expired: false,
          selfBilling: false,
          stripeCustomerId: "cus_9Eq",
          stripeSubscriptionId: null,
          staffCount: null,
          studentCount: null,
          sandbox: true,
          domain: "tenant_subdomain",
          notes: "this_is_a_note",
          createdAt: "2022-11-01T18:48:03.843Z",
          admins: [],
          expiresAt: null,
          locations: []
        }
      }, // contains the id value that is passed into the query
      variables: {
        id: '123abc'
      }
    });
    // console.log("cache", cache.data.data);

    provideApolloClient(apolloClient)

    const query = useQuery(gql`
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
            admins {
            id
              user {
                id
                name
                email
              }
            }
            domain
            expiresAt
            locations(expired: true) {
              id
              name
              timezone
            }
          }
        }
      `,
      {
        id: "123abc"
      }
    )


    const wrapper = await mountSuspended(TenantDetails, {
      props: {
        tenantId: '123abc'
      }
    });

    const tenant = computed(() => query?.result?.value?.adminTenant);
    // console.log("tenant:", tenant.value);
    expect(tenant.value.name).toContain("tenant_name_here");
    expect(tenant.value.domain).toContain("tenant_subdomain");
    expect(tenant.value.notes).toContain("this_is_a_note");

    // console.log("full html with cached query values:", wrapper.html());
    expect(wrapper.text()).toContain("this_is_a_note");
    expect(wrapper.html()).toContain("tenant_subdomain");
  })
})
