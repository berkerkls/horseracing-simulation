<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import type { RoundResult } from '@/types'
import type { RootState } from '@/store'
import { TOTAL_ROUNDS, ROUND_DISTANCES } from '@/constants/raceConfig'

const store = useStore<RootState>()

const allResults = computed<RoundResult[]>(() => store.getters['results/allResults'])

const activeTab = ref(0)

watch(
  () => allResults.value.length,
  (len) => {
    if (len > 0) {
      activeTab.value = len - 1
    }
  },
)

function getResultForRound(round: number): RoundResult | undefined {
  return allResults.value.find((r) => r.round === round)
}

const hasAnyResults = computed(() => allResults.value.length > 0)

const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th']
const rounds = Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1)
</script>

<template>
  <v-card flat>
    <v-card-title class="text-subtitle-1 font-weight-bold">Race Results</v-card-title>
    <v-divider />

    <template v-if="hasAnyResults">
      <v-tabs v-model="activeTab" density="compact" grow>
        <v-tab
          v-for="round in rounds"
          :key="round"
          :value="round - 1"
          :disabled="!getResultForRound(round)"
        >
          {{ ordinals[round - 1] }} Lap - {{ ROUND_DISTANCES[round - 1] }}m
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item v-for="round in rounds" :key="round" :value="round - 1">
          <template v-if="getResultForRound(round)">
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in getResultForRound(round)!.results" :key="result.horse.id">
                  <td>{{ result.position }}</td>
                  <td>
                    <span
                      class="color-dot mr-2"
                      :style="{ backgroundColor: result.horse.color }"
                    />
                    {{ result.horse.name }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </template>
          <v-card-text v-else class="text-center text-grey">
            Waiting for round to complete...
          </v-card-text>
        </v-window-item>
      </v-window>
    </template>

    <v-card-text v-else class="text-center text-grey">
      No results yet.
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
</style>
