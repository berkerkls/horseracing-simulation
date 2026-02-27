import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import App from '../App.vue'
import horses from '@/store/modules/horses'
import schedule from '@/store/modules/schedule'
import race from '@/store/modules/race'
import results from '@/store/modules/results'

describe('App', () => {
  it('mounts and renders properly', () => {
    const store = createStore({
      modules: { horses, schedule, race, results },
    })
    const vuetify = createVuetify()

    const wrapper = mount(App, {
      global: {
        plugins: [store, vuetify],
      },
    })

    expect(wrapper.text()).toContain('Horse Racing')
  })
})
