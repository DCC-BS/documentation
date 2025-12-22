<script setup lang="ts">
import ToolTipMock from './ToolTipMock.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <div class="flex">
        <ToolTipMock>
            <button type="button" data-state="closed" data-grace-area-trigger="" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors text-sm gap-1.5 text-muted hover:text-default active:text-default disabled:text-muted aria-disabled:text-muted focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-inverted p-1.5"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" data-slot="leadingIcon" class="iconify iconify--lucide shrink-0 size-5"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9a9 9 0 0 0-6 2.3L3 13"></path></g></svg><!--v-if--><!--v-if--></button>
            <template #content>
            {{ t('common-ui.undo_tooltip') }}
            </template>
        </ToolTipMock>

        <ToolTipMock>
            <button type="button" data-state="closed" data-grace-area-trigger="" data-slot="base" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors text-sm gap-1.5 text-muted hover:text-default active:text-default disabled:text-muted aria-disabled:text-muted focus:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-inverted p-1.5"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" data-slot="leadingIcon" class="iconify iconify--lucide shrink-0 size-5"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9a9 9 0 0 1 6 2.3l3 2.7"></path></g></svg><!--v-if--><!--v-if--></button>
            <template #content>
                {{ t('common-ui.redo_tooltip') }}
            </template>
        </ToolTipMock>
    </div>
</template>
