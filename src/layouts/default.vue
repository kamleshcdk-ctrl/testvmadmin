
<script setup>

</script>

<template>
<div class="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 overlaycontainer">
  <MenuLayoutTop />
  <ConfirmDialog />
  <Toast />
  <div class="flex relative flex-1">
    <MenuLayoutSide />

    <div class="flex flex-col flex-auto p-4 md:p-8">
      <div class="bg-surface-0 dark:bg-surface-900 p-7 shadow rounded-2xl h-full">

        <!-- content goes here -->
        <slot />

      </div>
    </div>
  </div>

  <!-- The 'overlaycontainer' css class must be defined and on the parent div -->
  <SessionTimeoutCheckDialog />

</div>
</template>
