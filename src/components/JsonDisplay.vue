<script setup>
import { JsonViewer } from "vue3-json-viewer";
import "vue3-json-viewer/dist/vue3-json-viewer.css";

import { computed } from "vue";
import { useDark } from "@vueuse/core"; 

defineProps({
  value: {
    type: [Object],
    default: () => { },
  },
  expanded: {
    type: Boolean,
    default: true
  }
});

const isDark = useDark(); 
const viewerTheme = computed(() => (isDark.value ? "dark" : "light"));
</script>

<template>
<div class="json-viewer-wrapper">
  <JsonViewer class="json-viewer" :value="value" copyable boxed sort :expanded="expanded" :expand-depth="2" :theme="viewerTheme" />
</div>
</template>

<style scoped>
.json-viewer-wrapper {
  /* Prevent style leakage */
  all: unset;
}
</style>

