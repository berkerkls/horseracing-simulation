<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import type { RoundSchedule } from '@/types'
import { RaceStatus } from '@/types'
import type { RootState } from '@/store'

const store = useStore<RootState>()

const rounds = computed<RoundSchedule[]>(() => store.getters['schedule/allRounds'])
const isGenerated = computed<boolean>(() => store.getters['schedule/isGenerated'])
const currentRound = computed<number>(() => store.getters['race/currentRound'])
const raceStatus = computed<RaceStatus>(() => store.getters['race/status'])

const activeTab = ref(0)

watch(currentRound, (round) => {
  if (round > 0) {
    activeTab.value = round - 1
  }
})

function isCurrentRound(index: number): boolean {
  return (
    currentRound.value === index + 1 &&
    (raceStatus.value === RaceStatus.RACING || raceStatus.value === RaceStatus.PAUSED)
  )
}

const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th']
</script>

<template>
  <v-card flat>
    <v-card-title class="text-subtitle-1 font-weight-bold">Race Schedule</v-card-title>
    <v-divider />

    <template v-if="isGenerated">
      <v-tabs v-model="activeTab" density="compact" grow>
        <v-tab
          v-for="(round, index) in rounds"
          :key="round.round"
          :value="index"
          :class="{ 'current-round-tab': isCurrentRound(index) }"
        >
          {{ ordinals[index] }} Lap - {{ round.distance }}m
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item v-for="(round, index) in rounds" :key="round.round" :value="index">
          <v-table density="compact">
            <thead>
              <tr>
                <th>Position</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(horse, hIndex) in round.horses" :key="horse.id">
                <td>{{ hIndex + 1 }}</td>
                <td>
                  <span
                    class="color-dot mr-2"
                    :style="{ backgroundColor: horse.color }"
                  />
                  {{ horse.name }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-window-item>
      </v-window>
    </template>

    <v-card-text v-else class="text-center text-grey">
      Generate a program to see the schedule.
    </v-card-text>
  </v-card>
</template>

<style scoped>
.color-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  vertical-align: middle;
}

.current-round-tab {
  background-color: rgba(76, 175, 80, 0.15) !important;
  color: #2e7d32 !important;
  font-weight: bold;
}
</style>
