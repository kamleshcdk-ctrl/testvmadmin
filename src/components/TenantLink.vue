<script setup lang="ts">
const props =defineProps({
  tenantId: {
    type: String,
    required: true
  },
  tenantName: {
    type: String,
    required: true
  }
})
</script>

<template>
  <router-link :to="'/tenants/'+ props.tenantId"
      class="text-surface-800 dark:text-surface-50 pl-4">
      <Button
        v-tooltip="props.tenantName" icon="pi pi-graduation-cap" rounded outlined severity="secondary" 
        class="min-w-[12rem]" label="View Tenant Detail"/>
  </router-link>
</template>
