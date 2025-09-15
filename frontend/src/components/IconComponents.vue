<template>
  <svg 
    :width="sizeMap[size]" 
    :height="sizeMap[size]" 
    :class="['icon', `icon-${name}`]"
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <!-- Plus Icon -->
    <path v-if="name === 'plus'" d="M12 5v14m-7-7h14" />
    
    <!-- Search Icon -->
    <circle v-else-if="name === 'search'" cx="11" cy="11" r="8" />
    <path v-else-if="name === 'search'" d="m21 21-4.35-4.35" />
    
    <!-- Close Icon -->
    <path v-else-if="name === 'close'" d="M18 6L6 18M6 6l12 12" />
    
    <!-- Dataset Icon -->
    <rect v-else-if="name === 'dataset'" x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line v-else-if="name === 'dataset'" x1="16" y1="2" x2="16" y2="6" />
    <line v-else-if="name === 'dataset'" x1="8" y1="2" x2="8" y2="6" />
    <line v-else-if="name === 'dataset'" x1="3" y1="10" x2="21" y2="10" />
    
    <!-- Loading Icon -->
    <path v-else-if="name === 'loading'" d="M21 12a9 9 0 11-6.219-8.56" />
    
    <!-- WiFi Icon -->
    <path v-else-if="name === 'wifi'" d="M5 12.55a11 11 0 0114.08 0" />
    <path v-else-if="name === 'wifi'" d="M1.42 9a16 16 0 0121.16 0" />
    <path v-else-if="name === 'wifi'" d="M8.53 16.11a6 6 0 016.95 0" />
    <line v-else-if="name === 'wifi'" x1="12" y1="20" x2="12.01" y2="20" />
    
    <!-- Edit Icon -->
    <path v-else-if="name === 'edit'" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path v-else-if="name === 'edit'" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    
    <!-- Delete Icon -->
    <polyline v-else-if="name === 'delete'" points="3,6 5,6 21,6" />
    <path v-else-if="name === 'delete'" d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    
    <!-- Default fallback -->
    <circle v-else cx="12" cy="12" r="10" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
}
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.icon-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>