import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import { createStore } from 'vuex'
import RaceControls from '@/components/RaceControls/RaceControls.vue'
import { RaceStatus } from '@/types'

function createTestStore(options: { status?: RaceStatus; isGenerated?: boolean } = {}) {
  const { status = RaceStatus.IDLE, isGenerated = false } = options

  const dispatchSpy = vi.fn()

  const store = createStore({
    modules: {
      horses: {
        namespaced: true,
        state: () => ({ list: [] }),
        getters: { allHorses: () => [] },
      },
      schedule: {
        namespaced: true,
        state: () => ({ rounds: [], isGenerated }),
        getters: { isGenerated: () => isGenerated },
        actions: { generateSchedule: dispatchSpy },
      },
      race: {
        namespaced: true,
        state: () => ({ status, currentRound: 0, horsePositions: {} }),
        mutations: {
          SET_STATUS(state: { status: RaceStatus }, payload: RaceStatus) {
            state.status = payload
          },
        },
        getters: { status: () => status },
      },
      results: {
        namespaced: true,
        state: () => ({ roundResults: [] }),
        getters: { allResults: () => [] },
      },
    },
  })

  return { store, dispatchSpy }
}

describe('RaceControls', () => {
  const vuetify = createVuetify({ components })

  it('generate button dispatches generateSchedule', async () => {
    const { store, dispatchSpy } = createTestStore()

    const wrapper = mount(RaceControls, {
      global: { plugins: [store, vuetify] },
    })

    const buttons = wrapper.findAll('.v-btn')
    await buttons[0].trigger('click')

    expect(dispatchSpy).toHaveBeenCalled()
  })

  it('start button is disabled before schedule is generated', () => {
    const { store } = createTestStore({ isGenerated: false })

    const wrapper = mount(RaceControls, {
      global: { plugins: [store, vuetify] },
    })

    const buttons = wrapper.findAll('.v-btn')
    const startBtn = buttons[1]
    expect(startBtn.classes()).toContain('v-btn--disabled')
  })

  it('start button is enabled after schedule is generated', () => {
    const { store } = createTestStore({ isGenerated: true })

    const wrapper = mount(RaceControls, {
      global: { plugins: [store, vuetify] },
    })

    const buttons = wrapper.findAll('.v-btn')
    const startBtn = buttons[1]
    expect(startBtn.classes()).not.toContain('v-btn--disabled')
  })

  it('button label shows START when idle', () => {
    const { store } = createTestStore({ status: RaceStatus.IDLE, isGenerated: true })

    const wrapper = mount(RaceControls, {
      global: { plugins: [store, vuetify] },
    })

    const buttons = wrapper.findAll('.v-btn')
    expect(buttons[1].text()).toBe('START')
  })

  it('button label shows PAUSE when racing', () => {
    const { store } = createTestStore({ status: RaceStatus.RACING, isGenerated: true })

    const wrapper = mount(RaceControls, {
      global: { plugins: [store, vuetify] },
    })

    const buttons = wrapper.findAll('.v-btn')
    expect(buttons[1].text()).toBe('PAUSE')
  })

  it('button label shows RESUME when paused', () => {
    const { store } = createTestStore({ status: RaceStatus.PAUSED, isGenerated: true })

    const wrapper = mount(RaceControls, {
      global: { plugins: [store, vuetify] },
    })

    const buttons = wrapper.findAll('.v-btn')
    expect(buttons[1].text()).toBe('RESUME')
  })
})
