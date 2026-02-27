<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { RaceStatus } from '@/types'
import type { RootState } from '@/store'

const store = useStore<RootState>()

const raceStatus = computed<RaceStatus>(() => store.getters['race/status'])
const isGenerated = computed<boolean>(() => store.getters['schedule/isGenerated'])

const isGenerateDisabled = computed(
  () => raceStatus.value === RaceStatus.RACING || raceStatus.value === RaceStatus.PAUSED,
)

const isStartDisabled = computed(
  () =>
    !isGenerated.value ||
    raceStatus.value === RaceStatus.FINISHED ||
    raceStatus.value === RaceStatus.ROUND_COMPLETE,
)

const startButtonLabel = computed(() => {
  switch (raceStatus.value) {
    case RaceStatus.RACING:
      return 'PAUSE'
    case RaceStatus.PAUSED:
      return 'RESUME'
    case RaceStatus.FINISHED:
      return 'FINISHED'
    default:
      return 'START'
  }
})

function handleGenerate() {
  store.commit('race/RESET_RACE')
  store.commit('results/CLEAR_RESULTS')
  store.commit('schedule/RESET_SCHEDULE')
  store.dispatch('schedule/generateSchedule')
  store.commit('race/SET_STATUS', RaceStatus.READY)
}

function handleStartPause() {
  switch (raceStatus.value) {
    case RaceStatus.RACING:
      store.dispatch('race/pauseRace')
      break
    case RaceStatus.PAUSED:
      store.dispatch('race/resumeRace')
      break
    default:
      store.dispatch('race/startRace')
      break
  }
}
</script>

<template>
  <v-btn
    color="green"
    variant="flat"
    class="mr-2"
    :disabled="isGenerateDisabled"
    @click="handleGenerate"
  >
    GENERATE PROGRAM
  </v-btn>
  <v-btn
    color="red"
    variant="flat"
    :disabled="isStartDisabled"
    @click="handleStartPause"
  >
    {{ startButtonLabel }}
  </v-btn>
</template>
