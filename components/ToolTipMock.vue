<script setup lang="ts">
import { TooltipArrow, TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from 'reka-ui'

const contentClasses = `
text-black
data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade
data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade
data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade
data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade
select-none
bg-white
px-[15px]
py-[10px]
text-sm
leading-none
shadow-sm
border
will-change-[transform,opacity]

flex
items-center
gap-1
bg-default
shadow-sm
rounded-sm
ring
ring-default
h-6
px-2.5
py-1
text-xs
select-none
data-[state=delayed-open]:animate-[scale-in_100ms_ease-out]
data-[state=closed]:animate-[scale-out_100ms_ease-in]
origin-(--reka-tooltip-content-transform-origin)
pointer-events-auto
`;
</script>

<template>
<TooltipProvider>
    <TooltipRoot>
        <TooltipTrigger>
            <slot />
        </TooltipTrigger>
        <TooltipPortal>
            <TooltipContent
            :class="contentClasses"
            :side-offset="8"
            side="bottom"
            :collision-padding="8"
            >
            <slot name="content"></slot>
            </TooltipContent>
        </TooltipPortal>
    </TooltipRoot>
</TooltipProvider>

</template>
