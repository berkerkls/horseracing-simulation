<script setup lang="ts">
import { onMounted } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '@/store'
import HorseList from '@/components/HorseList/HorseList.vue'
import RaceControls from '@/components/RaceControls/RaceControls.vue'
import RaceSchedule from '@/components/RaceSchedule/RaceSchedule.vue'
import RaceResults from '@/components/RaceResults/RaceResults.vue'
import RaceTrack from '@/components/RaceTrack/RaceTrack.vue'

const store = useStore<RootState>()

onMounted(() => {
  store.dispatch('horses/loadHorses')
})
</script>

<template>
  <v-app>
    <v-app-bar color="primary" density="comfortable">
      <v-app-bar-title>Horse Racing</v-app-bar-title>
      <template #append>
        <RaceControls />
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="3">
            <HorseList />
          </v-col>

          <v-col cols="5">
            <RaceTrack />
          </v-col>

          <v-col cols="4">
            <RaceSchedule class="mb-4" />
            <RaceResults />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
