
<script setup lang="ts">
const route = useRoute();

const { getTenantById } = useTenantByIdQuery()
const { result: tenant } = getTenantById(route.params.id)

</script>

<template>
<LayoutNormalCenter :page-name="tenant?.name + ' (District Tenant)'"
  page-description="User audit for the selected school district tenant.">
  <UserAuditTabs v-if="tenant.id && route.path" :tenant-id="tenant?.id" :path="route.path">
    <NuxtPage />
  </UserAuditTabs>
</LayoutNormalCenter>
</template>
