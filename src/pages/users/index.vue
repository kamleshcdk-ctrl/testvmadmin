<script setup>
import { Searcher } from "fast-fuzzy";


const { getTenants } = useTenantsQuery();
const { tenants } = getTenants();

const { getLocations } = useLocationsQuery();
const { locations } = getLocations();

const userSearchQuery = ref("");

const { searchUsers } = useSearchUsersQuery()
const { users, refetch } = searchUsers(userSearchQuery.value)

const anyGraphqlQueryLoading = useGlobalQueryLoading()

const { formTextStyles } = useFormkitStyles()

watchDebounced(
  userSearchQuery,
  (query) => {
    refetch({
      q: query,
    });
  },
  {
    debounce: 500,
  }
);

const removeSuperAdminRoleMutation = useMutation(
  gql`
    mutation RemoveSuperAdminRole($userId: String!) {
      adminRemoveSuperAdminRole(userId: $userId)
    }
  `
);

async function removeSuperAdmin(user) {
  // toast.add({ title: `Removing super admin role - ${user.name}` })
  await removeSuperAdminRoleMutation.mutate({
    userId: user.id
  });
  refetch({
    q: userSearchQuery.value,
  });

}

const results = computed(() => {
  const items = [...unref(tenants), ...unref(locations), ...unref(users)];

  const searcher = new Searcher(items, {
    keySelector: (obj) => obj.name,
  });

  return searcher.search(userSearchQuery.value);
});
</script>

<template>
<LayoutNormalCenter
  page-name="Search"
  page-description=
  "Search for users by name or email address">
    <p >
      <FormKit type="form" name="searchForm" :actions="false" use-local-storage>
        <FormKit v-model="userSearchQuery" type="text" class="w-full"
          :classes="formTextStyles" placeholder="Search" name="searchField"
          label="Search Tenants, Locations and Users:" />
      </FormKit>
    </p>
    <div class="flex flex-col gap-4">
      <div v-for="result in results" :key="result.id" >
        <SearchItem :result="result" :loading="anyGraphqlQueryLoading"
        class="rounded shadow-lg !bg-surface-300 dark:!bg-surface-700"
          @remove-super-admin='removeSuperAdmin' />
      </div>
    </div>
</LayoutNormalCenter>
</template>
