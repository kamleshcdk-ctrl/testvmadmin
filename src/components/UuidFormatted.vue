
<script setup lang="ts">
import { useToast } from 'primevue/usetoast';

defineProps({
  uuid: {
    type: String,
    default: ''
  },
  isCurrentUser: {
    type: Boolean,
    default: false
  }
});

const toast = useToast();

const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  toast.add({
    severity: 'info', summary: 'Copied Uuid',
    detail: `${text}`, life: 3000
  });
}
</script>
<template>
<div class="font-mono text-xs hover-container pb-4" @click="copyToClipboard(uuid)">
  <div class="hover-text">
    {{ uuid.substring(0, 19) }} {{ uuid.substring(19, 34) }}<span class="font-bold text-sm">{{
      uuid.substring(34) }}
    </span>
  </div>
  <div class="default-text">
    {{ isCurrentUser ? 'current user' : uuid.substring(0, 3) }}...<span class="font-bold text-sm">{{
      uuid.substring(34) }}
    </span>
  </div>
</div>
</template>

<style>
.hover-container {
  position: relative;
}

.default-text,
.hover-text {
  transition: opacity 0.3s ease;
}

.hover-text {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}

.hover-container:hover .hover-text {
  opacity: 1;
}

.hover-container:hover .default-text {
  opacity: 0;
	}
</style>
