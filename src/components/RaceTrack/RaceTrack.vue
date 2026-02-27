<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Horse, RoundSchedule } from '@/types'
import type { RootState } from '@/store'
import HorseLane from './HorseLane.vue'

const store = useStore<RootState>()

const currentRound = computed<number>(() => store.getters['race/currentRound'])
const horsePositions = computed<Record<number, number>>(() => store.getters['race/horsePositions'])
const rounds = computed<RoundSchedule[]>(() => store.getters['schedule/allRounds'])
const isGenerated = computed<boolean>(() => store.getters['schedule/isGenerated'])

const currentSchedule = computed<RoundSchedule | null>(() => {
  if (!isGenerated.value || currentRound.value === 0) return null
  return rounds.value[currentRound.value - 1] ?? null
})

const currentHorses = computed<Horse[]>(() => {
  return currentSchedule.value?.horses ?? []
})

const roundLabel = computed(() => {
  if (!currentSchedule.value) return ''
  const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th']
  const idx = currentSchedule.value.round - 1
  return `${ordinals[idx]} Lap - ${currentSchedule.value.distance}m`
})

function getPosition(horseId: number): number {
  return horsePositions.value[horseId] ?? 0
}
</script>

<template>
  <v-card flat class="race-track-card">
    <v-card-title class="text-subtitle-1 font-weight-bold">Race Track</v-card-title>
    <v-divider />

    <div v-if="currentHorses.length > 0" class="race-track-container">
      <div class="track-area">
        <div class="lanes">
          <HorseLane v-for="(horse, index) in currentHorses" :key="horse.id" :horse="horse"
            :position="getPosition(horse.id)" :lane-number="index + 1" />
        </div>
        <div class="finish-line">
          <span class="finish-text">F<br />I<br />N<br />I<br />S<br />H</span>
        </div>
      </div>
      <div class="round-label">{{ roundLabel }}</div>
    </div>

    <v-card-text v-else class="text-center text-grey">
      Waiting for the race to start...
    </v-card-text>
  </v-card>
</template>

<style scoped>
.race-track-container {
  padding: 8px;
}

.track-area {
  position: relative;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.lanes {
  position: relative;
  z-index: 1;
}

.finish-line {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  background: repeating-linear-gradient(0deg,
      #e53935 0px,
      #e53935 4px,
      #fff 4px,
      #fff 8px);
  border-left: 2px solid #e53935;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.finish-text {
  font-size: 8px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  line-height: 1.2;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.7);
}

.round-label {
  text-align: center;
  padding: 6px 0 2px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
}
</style>
