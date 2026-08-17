import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeOnboardingCard from './HomeOnboardingCard.vue'

function mountCard(props = {}) {
  return mount(HomeOnboardingCard, {
    props,
    global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  })
}

describe('HomeOnboardingCard', () => {
  describe('without restrictions loaded', () => {
    it('asks for the list instead of inviting to scan', () => {
      const wrapper = mountCard({ variant: 'no-restrictions' })

      expect(wrapper.text()).toContain('Contanos qué evitás')
      expect(wrapper.text()).not.toContain('Escaneá tu primer producto')
    })

    it('sends the user to edit the profile restrictions', () => {
      const wrapper = mountCard({ variant: 'no-restrictions', editRoute: '/profile/7/edit' })

      expect(wrapper.get('a').attributes('href')).toBe('/profile/7/edit')
    })

    it('explains that the scanner is not useful yet', () => {
      const wrapper = mountCard({ variant: 'no-restrictions' })

      expect(wrapper.text()).toContain('El escáner se habilita apenas cargues tu lista.')
    })
  })

  describe('with restrictions loaded', () => {
    it('invites to scan the first product', () => {
      const wrapper = mountCard({ variant: 'ready-to-scan', restrictionsCount: 5 })

      expect(wrapper.text()).toContain('Escaneá tu primer producto')
      expect(wrapper.get('a').attributes('href')).toBe('/scanner')
    })

    it('reassures the user that the list is already saved', () => {
      const wrapper = mountCard({ variant: 'ready-to-scan', restrictionsCount: 5 })

      expect(wrapper.text()).toContain('Tus 5 restricciones ya están cargadas')
    })

    it('singularises a lone restriction', () => {
      const wrapper = mountCard({ variant: 'ready-to-scan', restrictionsCount: 1 })

      expect(wrapper.text()).toContain('Tu restricción ya está cargada')
    })
  })
})
