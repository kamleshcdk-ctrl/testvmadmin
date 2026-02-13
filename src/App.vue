
<script setup>
import 'primeicons/primeicons.css'

useHead({
    title: "Visitu Admin",
});

</script>

<template>
<div class="font-sans">
    <div>
        <NuxtLayout name='default'>
            <NuxtPage />
        </NuxtLayout>

    </div>
</div>
</template>

<style lang="css">
.overlaycontainer {
    position: relative;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.dark .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.2);
    z-index: 1000;
	}
</style>
