
<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const route = useRoute();
const active = ref(0);
const tabRefs = ref([]);
const scrollContainer = ref(null);
const resizeObserver = ref(null);
const indicatorStyle = ref({
  width: '0px',
  transform: 'translateX(0px)'
});

const props = defineProps({
  tenantId: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  }
})

const tabs = ref([
  { label: 'All District Tenant Users', linkPath: '' },
  { label: 'Duplicates', linkPath: 'duplicates' },
  {
    label: `Merge Details`,
    linkPath: 'merge/---'
  }
]);

const updateIndicator = async () => {
  await nextTick();
  if (tabRefs.value[active.value]) {
    const activeTab = tabRefs.value[active.value].querySelector('a');
    indicatorStyle.value = {
      width: `${activeTab.offsetWidth}px`,
      transform: `translateX(${activeTab.offsetLeft}px)`
    };
  }
};

const handleResize = () => {
  updateIndicator();
};

const setActiveTab = (index) => {
  active.value = index;

  nextTick(() => {
    if (tabRefs.value[index]) {
      const tab = tabRefs.value[index].querySelector('a');
      const container = scrollContainer.value;

      if (tab.offsetLeft < container.scrollLeft) {
        container.scrollTo({ left: tab.offsetLeft, behavior: 'smooth' });
      } else if (tab.offsetLeft + tab.offsetWidth > container.scrollLeft + container.offsetWidth) {
        container.scrollTo({ left: tab.offsetLeft - container.offsetWidth + tab.offsetWidth, behavior: 'smooth' });
      }
    }
  });
};

watch(active, updateIndicator);

onMounted(() => {
  updateIndicator();
  window.addEventListener('resize', handleResize);

  resizeObserver.value = new ResizeObserver(() => {
    updateIndicator();
  });

  if (scrollContainer.value) {
    resizeObserver.value.observe(scrollContainer.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);

  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
  }
});

// set the active tab based on the url
tabs.value.forEach((tab, index) => {
  if (`/user-audit/${props.tenantId}/${tab.linkPath}` === props.path) {
    setActiveTab(index)
  }

  if (props.path.startsWith(`/user-audit/${props.tenantId}/merge/`)) {
    setActiveTab(2)
  }

});

// when the url changes to the user merge, set the merge tab active
watch(
  () => route.path,
  async (newPath) => {
    if (newPath.startsWith(`/user-audit/${props.tenantId}/merge/`)) {
      setActiveTab(2)
    } else if (newPath.startsWith(`/user-audit/${props.tenantId}/duplicates`)) {
      setActiveTab(1)
    } else if (newPath.startsWith(`/user-audit/${props.tenantId}/`)) {
      setActiveTab(0)
    }
  }
)

</script>

<template>
<div class="bg-surface-0 dark:bg-surface-950">
  <div class="bg-surface-0 dark:bg-surface-950 relative overflow-hidden mb-7">
    <div ref="scrollContainer" class="overflow-x-auto">
      <ul class="p-0 m-0 list-none flex select-none relative">
        <template v-for="(item, index) of tabs" :key="index">
          <li ref="tabRefs" class="flex-1">
            <router-link :to="`/user-audit/${props.tenantId}/${item.linkPath}`"
              class="cursor-pointer py-3 px-2 flex items-center justify-center transition-colors duration-150 hover:text-primary"
              :class="{
                'text-primary dark:text-primary-400 font-medium': active === index,
                'text-surface-500 dark:text-surface-400': active !== index
              }" @click="setActiveTab(index)">
              {{ item.label }}
            </router-link>
          </li>
        </template>
        <div class="absolute bottom-0 h-0.5 bg-primary transition-transform duration-300 ease-in-out z-20"
          :style="indicatorStyle" />
      </ul>
    </div>
    <div class="absolute bottom-0 left-0 w-full h-0.5 bg-surface-200 dark:bg-surface-700" />
  </div>
  <div>
    <NuxtPage />
  </div>
</div>
</template>
