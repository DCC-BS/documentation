<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import DiagramZoom from "./DiagramZoom.vue";

const { Layout } = DefaultTheme;
</script>

<template>
    <div class="isolate">
        <UApp>
            <Layout />
        </UApp>
    </div>
    <ClientOnly>
        <DiagramZoom />
    </ClientOnly>
</template>
