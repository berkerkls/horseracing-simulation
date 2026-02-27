<script setup lang="ts">
import type { Horse } from '@/types'
import HorseIcon from './HorseIcon.vue'

const props = defineProps<{
  horse: Horse
  position: number
  laneNumber: number
}>()
</script>

<template>
  <div class="horse-lane" :class="{ 'lane-even': props.laneNumber % 2 === 0 }">
    <div class="lane-label">{{ props.laneNumber }}</div>
    <div class="lane-track">
      <div
        class="horse-runner"
        :style="{ left: `calc(${props.position / 100} * (100% - 40px))` }"
      >
        <HorseIcon :color="props.horse.color" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.horse-lane {
  display: flex;
  align-items: center;
  height: 40px;
  background-color: #f5f0e6;
  border-bottom: 1px solid #e0d9cc;
}

.lane-even {
  background-color: #ece7d9;
}

.lane-label {
  width: 28px;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

.lane-track {
  flex: 1;
  position: relative;
  height: 100%;
  overflow: hidden;
}

.horse-runner {
  position: absolute;
  top: 50%;
  left: 0;
  translate: 0 -50%;
  transition: left 0.1s linear;
  will-change: left;
}
</style>
