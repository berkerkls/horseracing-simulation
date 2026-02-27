<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { Horse } from '@/types'
import type { RootState } from '@/store'

const store = useStore<RootState>()

const horses = computed<Horse[]>(() => store.getters['horses/allHorses'])
</script>

<template>
  <v-card flat>
    <v-card-title class="text-subtitle-1 font-weight-bold">Horse List</v-card-title>
    <v-divider />
    <div class="horse-list-table">
      <v-table density="compact" fixed-header>
        <thead>
          <tr>
            <th>Name</th>
            <th>Condition</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="horse in horses" :key="horse.id">
            <td>{{ horse.name }}</td>
            <td>{{ horse.condition }}</td>
            <td>
              <span
                class="color-dot"
                :style="{ backgroundColor: horse.color }"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </v-card>
</template>

<style scoped>
.horse-list-table {
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

.color-dot {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  vertical-align: middle;
}
</style>
