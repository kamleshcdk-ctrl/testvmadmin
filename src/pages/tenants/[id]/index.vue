

<script setup lang="ts">
import TenantDetails from "@/components/tenant/TenantDetails.vue";
const route = useRoute();
const tenantId = route.params.id as string;

</script>

<template>
  <TenantDetails :tenant-id="tenantId"/>
</template>
