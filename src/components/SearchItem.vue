<script setup>
const props = defineProps({
  result: {
    type: Object,
    default: () => { },
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['remove-super-admin'])

function removeSuperAdmin(event, user) {
  // We don't want the click on 'remove' to open the full user information page
  event.preventDefault()
  emit('remove-super-admin', user)
}

const to = computed(() => {
  let path;

  const typename = unref(props.result).__typename;
  if (typename === "Location") {
    path = `/locations/${props.result.id}`;
  } else if (typename === "Tenant") {
    path = `/tenants/${props.result.id}`;
  } else if (typename === "User") {
    path = `/users/${props.result.id}`;
  }

  return { path };
});
</script>

<template>
  <router-link :to="to" class="p-2 flex gap-4 transition-opacity" :class="(props.loading) ? 'opacity-50' : ''">
    <div class="flex gap-4 items-center">
      <div>
        <template v-if="result.__typename === 'Location'">
          <div class="bg-orange-500 pb-2 pl-2 pr-2 pt-0 rounded-full text-3xl">
            <i
              class="pi pi-building-columns text-surface-500 dark:text-surface-400" />

          </div>
        </template>
        <template v-else-if="result.__typename === 'Tenant'">
          <div class="bg-pmkblue pb-2 pl-2 pr-2 pt-0 rounded-full text-3xl">
            <i
              class="pi pi-graduation-cap text-surface-500 dark:text-surface-400" />

          </div>
        </template>
        <template v-else-if="result.__typename === 'User'">
          <div class="bg-gray-500 pb-2 pl-2 pr-2 pt-0 rounded-full text-3xl">
            <i
              class="pi pi-users text-surface-900 dark:text-surface-100" />
          </div>
        </template>
      </div>
      <div>
        <template v-if="result.__typename === 'Location'">
          <div class="flex gap-4 items-center">
            <div>{{ result.name }}</div>
            <template v-if="result.parent">
              <div>{{ result.parent.name }}</div>
            </template>
          </div>
        </template>
        <template v-else-if="result.__typename === 'User'">
          <div class="flex flex-col">
            <div>
              {{ result.name }}
              <span class="text-gray-500">{{ result.email }}</span>
            </div>
            <div class="text-sm py-2 flex flex-col gap-2">
              <div>Tenant - {{ result.tenant.name }}</div>
              <div v-if="result.syncProvider">
                Synced From - {{ result.syncProvider }}
              </div>
              <div>
                Roles <template v-for="role in result.roles" :key="role.name">
                  - <template v-if="role.name === 'Super Admin' && result?.email &&
                    (result.email?.toLowerCase().endsWith('visitu.com') ||
                      result.email?.toLowerCase().endsWith('pikmykid.com'))">

                    Super Admin (<span class="underline text-blue-500"
                      @click.self="removeSuperAdmin($event, result)">remove</span>)
                  </template>
                  <template v-else>{{ role.name }}</template>
                </template>
              </div>
            </div>
            <div></div>
          </div>
        </template>
        <template v-else>
          <div>{{ result.name }}</div>
        </template>
        <div class="text-gray-500">
          {{ result.__typename }} - {{ result.id }}
        </div>
      </div>
    </div>
  </router-link>
</template>

<style scoped></style>
