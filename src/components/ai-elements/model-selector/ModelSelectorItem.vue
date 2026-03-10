<script setup lang="ts">
import { CommandItem } from '@/components/ui/command'

interface Props {
  value: string | number
}

defineProps<Props>()
</script>

<template>
  <CommandItem :value="value" v-bind="$attrs">
    <slot />
  </CommandItem>
</template>
