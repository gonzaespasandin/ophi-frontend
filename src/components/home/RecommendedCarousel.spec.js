import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RecommendedCarousel from './RecommendedCarousel.vue'

const slidePrev = vi.fn()
const slideNext = vi.fn()

vi.mock('swiper/css', () => ({}))

vi.mock('swiper/modules', () => ({ A11y: {} }))

vi.mock('swiper/vue', () => ({
  Swiper: {
    name: 'Swiper',
    emits: ['swiper'],
    template: '<div class="swiper"><slot /></div>',
    mounted() {
      this.$emit('swiper', { slidePrev, slideNext })
    },
  },
  SwiperSlide: {
    name: 'SwiperSlide',
    template: '<div class="swiper-slide"><slot :isActive="true" /></div>',
  },
}))

const products = [
  { id: 1, name: 'Arroz integral orgánico', brand: { name: 'Gallo' } },
  { id: 2, name: 'Fideos de lentejas secos', brand: { name: 'Lucchetti' } },
]

const profiles = [{ id: 1, name: 'Lucía', avatar_color: '#005B8E' }]

function mountCarousel(props) {
  return mount(RecommendedCarousel, {
    props,
    global: { stubs: { RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } } },
  })
}

describe('RecommendedCarousel', () => {
  it('always names the section', () => {
    const wrapper = mountCarousel({ state: 'loading' })

    expect(wrapper.get('h2').text()).toBe('Recomendados para vos')
  })

  it('hides the arrows while there is nothing to move through', () => {
    expect(mountCarousel({ state: 'loading' }).findAll('button')).toHaveLength(0)
    expect(mountCarousel({ state: 'empty' }).findAll('button')).toHaveLength(0)
  })

  it('invites the user to scan when there are no suggestions yet', () => {
    const wrapper = mountCarousel({ state: 'empty' })

    expect(wrapper.text()).toContain('Todavía no tenemos sugerencias')
  })

  it('renders one card per product once they are ready', () => {
    const wrapper = mountCarousel({ state: 'ready', products, profiles })

    expect(wrapper.findAll('.swiper-slide')).toHaveLength(2)
    expect(wrapper.text()).toContain('Arroz integral orgánico')
  })

  it('drives the swiper with the design arrows', async () => {
    const wrapper = mountCarousel({ state: 'ready', products, profiles })

    await wrapper.get('[aria-label="Anterior"]').trigger('click')
    await wrapper.get('[aria-label="Siguiente"]').trigger('click')

    expect(slidePrev).toHaveBeenCalledOnce()
    expect(slideNext).toHaveBeenCalledOnce()
  })
})
