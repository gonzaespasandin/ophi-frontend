import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import ProfileView from './ProfileView.vue'
import {
  deleteProfileFromAuthUser,
  logout,
  suscribeToAuthObserver,
  updateProfileFromAuthUser,
} from '../services/auth.js'
import { deleteProfile } from '../services/profiles.js'
import { getAccount, requestEmailChange, setNewsletter } from '../services/account.js'
import AccountCardSkeleton from '../components/profile/AccountCardSkeleton.vue'
import ProfileCardSkeleton from '../components/profile/ProfileCardSkeleton.vue'
import AccountErrorState from '../components/profile/AccountErrorState.vue'
import RateLimitNotice from '../components/profile/RateLimitNotice.vue'

const USER = {
  id: 1,
  name: 'Lucía',
  email: 'sesion@ophi.app',
  profiles: [
    {
      id: 10,
      name: 'Lucía',
      is_main: true,
      avatar_color: '#6D28D9',
      ingredients: [
        { id: 1, name: 'Gluten' },
        { id: 2, name: 'Lactosa' },
      ],
    },
    { id: 11, name: 'Martina', is_main: false, avatar_color: '#9A3412', ingredients: [] },
  ],
  subscription: { plan_id: 2, plan: { plan: 'premium' } },
}

const observed = vi.hoisted(() => ({ user: null }))

vi.mock('../services/auth.js', () => ({
  suscribeToAuthObserver: vi.fn((callback) => {
    callback(observed.user)
    return () => {}
  }),
  updateProfileFromAuthUser: vi.fn(() => Promise.resolve('Perfil actualizado')),
  deleteProfileFromAuthUser: vi.fn(() => Promise.resolve('Perfil eliminado')),
  logout: vi.fn(),
}))

vi.mock('../services/profiles.js', () => ({
  deleteProfile: vi.fn(() => Promise.resolve('Perfil eliminado')),
}))

const MAIN_PROFILE = USER.profiles[0]

function familyProfile(index) {
  return {
    id: 100 + index,
    name: `Familiar ${index}`,
    is_main: false,
    avatar_color: '#9A3412',
    ingredients: [],
  }
}

function userWith({ family = 0, premium = true } = {}) {
  return {
    ...USER,
    profiles: [MAIN_PROFILE, ...Array.from({ length: family }, (_, i) => familyProfile(i + 1))],
    subscription: premium ? { plan: { plan: 'premium' } } : { plan: { plan: 'free' } },
  }
}

async function mountFamiliarTab(user) {
  observed.user = user
  const wrapper = await mountView()
  await wrapper.get('#profile-tab-familiar').trigger('click')
  await flushPromises()

  return wrapper
}

vi.mock('../services/account.js', () => ({
  getAccount: vi.fn(() =>
    Promise.resolve({
      email: 'cuenta@ophi.app',
      pending_email: null,
      newsletter_subscribed: false,
    })
  ),
  requestEmailChange: vi.fn(() => Promise.resolve({ message: 'ok' })),
  setNewsletter: vi.fn(() => Promise.resolve({ message: 'ok' })),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const AuthLayoutStub = { template: '<div><slot /></div>' }

async function mountView() {
  document.body.innerHTML = '<div id="modal-root"></div>'

  const wrapper = mount(ProfileView, {
    attachTo: document.body,
    global: {
      stubs: {
        AuthLayout: AuthLayoutStub,
        RouterLink: RouterLinkStub,
      },
    },
  })

  await flushPromises()

  return wrapper
}

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  vi.clearAllMocks()
  observed.user = USER

  HTMLDialogElement.prototype.showModal = vi.fn(function showModal() {
    this.open = true
  })
  HTMLDialogElement.prototype.close = vi.fn(function close() {
    this.open = false
  })
})

describe('ProfileView', () => {
  it('subscribes to the auth observer with a single callback argument', async () => {
    await mountView()

    expect(suscribeToAuthObserver.mock.calls[0]).toHaveLength(1)
  })

  it('renders only the active tab panel', async () => {
    const wrapper = await mountView()

    expect(wrapper.find('#profile-panel-perfil').exists()).toBe(true)
    expect(wrapper.find('#profile-panel-familiar').exists()).toBe(false)
  })

  it('saves the profile through the auth-user wrapper so edits survive a reload', async () => {
    const wrapper = await mountView()

    await wrapper.get('#profile-name').setValue('Lucía Méndez')
    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()

    expect(updateProfileFromAuthUser).toHaveBeenCalledWith({
      id: 10,
      name: 'Lucía Méndez',
      avatar_color: '#6D28D9',
    })
  })

  it('rejects a whitespace-only name inline without hitting the network', async () => {
    const wrapper = await mountView()

    await wrapper.get('#profile-name').setValue('   ')
    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('#profile-name-error').text()).toBe('El nombre es obligatorio')
    expect(updateProfileFromAuthUser).not.toHaveBeenCalled()
  })

  it('asks for confirmation before ending the session', async () => {
    const wrapper = await mountView()

    await wrapper.get('#logout-trigger').trigger('click')

    expect(document.getElementById('confirm-logout')).not.toBeNull()
    expect(logout).not.toHaveBeenCalled()
  })

  it('keeps the session alive when the user cancels the confirmation', async () => {
    const wrapper = await mountView()

    await wrapper.get('#logout-trigger').trigger('click')
    document.getElementById('cancel-logout').click()
    await flushPromises()

    expect(logout).not.toHaveBeenCalled()
  })

  it('ends the session when the user confirms', async () => {
    const wrapper = await mountView()

    await wrapper.get('#logout-trigger').trigger('click')
    document.getElementById('confirm-logout').click()
    await flushPromises()

    expect(logout).toHaveBeenCalledTimes(1)
  })
})

function mountViewSync() {
  document.body.innerHTML = '<div id="modal-root"></div>'

  return mount(ProfileView, {
    attachTo: document.body,
    global: {
      stubs: {
        AuthLayout: AuthLayoutStub,
        RouterLink: RouterLinkStub,
      },
    },
  })
}

function successRegion() {
  return document.getElementById('toast-region-success')
}

function errorRegion() {
  return document.getElementById('toast-region-error')
}

describe('ProfileView toasts', () => {
  it('keeps both announcement regions mounted before any toast exists', async () => {
    await mountView()

    expect(successRegion().getAttribute('role')).toBe('status')
    expect(successRegion().getAttribute('aria-live')).toBe('polite')
    expect(errorRegion().getAttribute('role')).toBe('alert')
    expect(errorRegion().getAttribute('aria-live')).toBe('assertive')
    expect(successRegion().textContent.trim()).toBe('')
    expect(errorRegion().textContent.trim()).toBe('')
  })

  it('announces a saved profile through the polite region only', async () => {
    const wrapper = await mountView()

    await wrapper.get('#profile-name').setValue('Lucía Méndez')
    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()

    expect(successRegion().textContent).toContain('Perfil guardado')
    expect(errorRegion().textContent.trim()).toBe('')
  })

  it('announces a failed save through the assertive region only', async () => {
    updateProfileFromAuthUser.mockRejectedValueOnce(new Error('boom'))
    const wrapper = await mountView()

    await wrapper.get('#profile-name').setValue('Lucía Méndez')
    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()

    expect(errorRegion().textContent).toContain('No pudimos guardar los cambios')
    expect(successRegion().textContent.trim()).toBe('')
  })

  it('keeps the region roles static across a success then error sequence', async () => {
    const wrapper = await mountView()

    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()

    expect(successRegion().textContent).toContain('Perfil guardado')

    updateProfileFromAuthUser.mockRejectedValueOnce(new Error('boom'))
    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()

    expect(errorRegion().textContent).toContain('No pudimos guardar los cambios')
    expect(successRegion().getAttribute('role')).toBe('status')
    expect(errorRegion().getAttribute('role')).toBe('alert')
  })

  it('lets the user dismiss a toast before it auto expires', async () => {
    const wrapper = await mountView()

    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()

    expect(successRegion().textContent).toContain('Perfil guardado')

    successRegion().querySelector('[aria-label="Cerrar aviso"]').click()
    await flushPromises()

    expect(successRegion().textContent.trim()).toBe('')
  })

  it('keeps both regions mounted after a toast has come and gone', async () => {
    const wrapper = await mountView()

    await wrapper.get('#profile-form').trigger('submit')
    await flushPromises()

    successRegion().querySelector('[aria-label="Cerrar aviso"]').click()
    await flushPromises()

    expect(successRegion()).not.toBeNull()
    expect(errorRegion()).not.toBeNull()
    expect(successRegion().getAttribute('aria-live')).toBe('polite')
    expect(errorRegion().getAttribute('aria-live')).toBe('assertive')
  })

  it('consumes a handed off session message and clears the key before the next tick', async () => {
    sessionStorage.setItem('alert', JSON.stringify({ message: 'Perfil creado', type: 'success' }))

    mountViewSync()

    expect(sessionStorage.getItem('alert')).toBeNull()

    await flushPromises()

    expect(successRegion().textContent).toContain('Perfil creado')
  })

  it('does not repeat a handed off message when the view mounts again', async () => {
    sessionStorage.setItem('alert', JSON.stringify({ message: 'Perfil creado', type: 'success' }))

    await mountView()

    expect(successRegion().textContent).toContain('Perfil creado')

    await mountView()

    expect(successRegion().textContent.trim()).toBe('')
    expect(errorRegion().textContent.trim()).toBe('')
  })

  it('routes a handed off error message to the assertive region', async () => {
    sessionStorage.setItem('alert', JSON.stringify({ message: 'Algo salió mal', type: 'error' }))

    await mountView()

    expect(errorRegion().textContent).toContain('Algo salió mal')
    expect(successRegion().textContent.trim()).toBe('')
  })
})

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

const ACCOUNT = {
  email: 'cuenta@ophi.app',
  pending_email: null,
  newsletter_subscribed: false,
}

describe('ProfileView account states', () => {
  it('shows the account skeleton while the fetch is in flight and swaps it for the real card', async () => {
    const pending = deferred()
    getAccount.mockReturnValueOnce(pending.promise)

    const wrapper = mountViewSync()
    await flushPromises()

    expect(wrapper.findComponent(AccountCardSkeleton).exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Cambiar email')

    pending.resolve(ACCOUNT)
    await flushPromises()

    expect(wrapper.findComponent(AccountCardSkeleton).exists()).toBe(false)
    expect(wrapper.text()).toContain('Cambiar email')
  })

  it('marks the account card busy and announces the load exactly once while it waits', async () => {
    const pending = deferred()
    getAccount.mockReturnValueOnce(pending.promise)

    const wrapper = mountViewSync()
    await flushPromises()

    expect(wrapper.get('#account-card').attributes('aria-busy')).toBe('true')
    expect(wrapper.get('#account-status-region').text()).toBe('Cargando tu cuenta')

    pending.resolve(ACCOUNT)
    await flushPromises()

    expect(wrapper.get('#account-card').attributes('aria-busy')).toBeUndefined()
    expect(wrapper.get('#account-status-region').text()).toBe('')
  })

  it('offers a retry that issues a second account request after a failed load', async () => {
    getAccount.mockRejectedValueOnce(new Error('network down'))

    const wrapper = await mountView()

    expect(wrapper.findComponent(AccountErrorState).exists()).toBe(true)
    expect(getAccount).toHaveBeenCalledTimes(1)

    await wrapper.findComponent(AccountErrorState).get('button').trigger('click')
    await flushPromises()

    expect(getAccount).toHaveBeenCalledTimes(2)
    expect(wrapper.findComponent(AccountErrorState).exists()).toBe(false)
    expect(wrapper.text()).toContain('Cambiar email')
  })

  it('treats a successful response with no email as loaded, not as a failure', async () => {
    getAccount.mockResolvedValueOnce({ ...ACCOUNT, email: null })

    const wrapper = await mountView()

    expect(wrapper.findComponent(AccountErrorState).exists()).toBe(false)
    expect(wrapper.text()).toContain('Cambiar email')
  })

  it('keeps the account card intact when an email change fails', async () => {
    requestEmailChange.mockRejectedValueOnce({
      response: {
        status: 422,
        data: { errors: { current_password: ['La contraseña no coincide con tu cuenta'] } },
      },
    })

    const wrapper = await mountView()

    await wrapper.get('#account-card input[type="email"]').setValue('nueva@ophi.app')
    await wrapper.get('#account-card input[type="password"]').setValue('incorrecta')
    await wrapper.get('#account-card form').trigger('submit')
    await flushPromises()

    expect(wrapper.findComponent(AccountCardSkeleton).exists()).toBe(false)
    expect(wrapper.findComponent(AccountErrorState).exists()).toBe(false)
    expect(wrapper.get('#account-card').attributes('aria-busy')).toBeUndefined()
    expect(wrapper.get('#email-change-password-error').text()).toBe(
      'La contraseña no coincide con tu cuenta'
    )
  })

  it('keeps the account card intact when the newsletter preference fails', async () => {
    setNewsletter.mockRejectedValueOnce(new Error('boom'))

    const wrapper = await mountView()

    await wrapper.get('#account-card input[type="checkbox"]').setValue(true)
    await flushPromises()

    expect(wrapper.findComponent(AccountCardSkeleton).exists()).toBe(false)
    expect(wrapper.findComponent(AccountErrorState).exists()).toBe(false)
    expect(errorRegion().textContent).toContain('No pudimos actualizar tu preferencia de novedades')
  })
})

describe('ProfileView email change errors', () => {
  async function submitEmailChange(wrapper) {
    await wrapper.get('#account-card input[type="email"]').setValue('nueva@ophi.app')
    await wrapper.get('#account-card input[type="password"]').setValue('secreta')
    await wrapper.get('#account-card form').trigger('submit')
    await flushPromises()
  }

  it('shows the rate limit notice when the server answers 429', async () => {
    requestEmailChange.mockRejectedValueOnce({ response: { status: 429, data: {} } })

    const wrapper = await mountView()
    await submitEmailChange(wrapper)

    expect(wrapper.findComponent(RateLimitNotice).exists()).toBe(true)
    expect(wrapper.text()).toContain('6 intentos por minuto')
    expect(wrapper.find('#email-change-error').exists()).toBe(false)
  })

  it('shows an ordinary field error rather than the rate limit notice on 422', async () => {
    requestEmailChange.mockRejectedValueOnce({
      response: { status: 422, data: { errors: { new_email: ['Ese email ya tiene una cuenta en Ophi'] } } },
    })

    const wrapper = await mountView()
    await submitEmailChange(wrapper)

    expect(wrapper.findComponent(RateLimitNotice).exists()).toBe(false)
    expect(wrapper.get('#email-change-email-error').text()).toBe(
      'Ese email ya tiene una cuenta en Ophi'
    )
  })
})

describe('ProfileView profile card states', () => {
  it('shows the profile skeleton while the user profiles are not hydrated yet', async () => {
    observed.user = { ...USER, profiles: null }

    const wrapper = await mountView()

    expect(wrapper.findComponent(ProfileCardSkeleton).exists()).toBe(true)
    expect(wrapper.find('#profile-form').exists()).toBe(false)
  })

  it('treats an empty profile list as loaded, not as loading', async () => {
    observed.user = { ...USER, profiles: [] }

    const wrapper = await mountView()

    expect(wrapper.findComponent(ProfileCardSkeleton).exists()).toBe(false)
    expect(wrapper.find('#profile-form').exists()).toBe(false)
  })

  it('shows the real profile form once a main profile exists', async () => {
    const wrapper = await mountView()

    expect(wrapper.findComponent(ProfileCardSkeleton).exists()).toBe(false)
    expect(wrapper.get('#profile-name').element.value).toBe('Lucía')
  })

  it('never skeletonises the identity band, the tabs or the account actions', async () => {
    observed.user = { ...USER, profiles: null }
    const pending = deferred()
    getAccount.mockReturnValueOnce(pending.promise)

    const wrapper = mountViewSync()
    await flushPromises()

    expect(wrapper.findComponent(ProfileCardSkeleton).exists()).toBe(true)
    expect(wrapper.findComponent(AccountCardSkeleton).exists()).toBe(true)
    expect(wrapper.text()).toContain('Lucía')
    expect(wrapper.find('#profile-tab-familiar').exists()).toBe(true)
    expect(wrapper.find('#logout-trigger').exists()).toBe(true)
  })
})

describe('ProfileView familiar panel', () => {
  it('counts zero family profiles against the nine family slots', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 0 }))

    expect(wrapper.get('#family-counter').text()).toBe('0 / 9')
  })

  it('counts a single family profile against the nine family slots', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 1 }))

    expect(wrapper.get('#family-counter').text()).toBe('1 / 9')
  })

  it('reports one remaining slot when eight family profiles exist', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 8 }))

    expect(wrapper.get('#family-counter').text()).toBe('8 / 9')
    expect(wrapper.text()).toContain('Te queda 1 lugar')
  })

  it('shows the limit notice and no add link once nine family profiles exist', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 9 }))

    expect(wrapper.get('#family-counter').text()).toBe('9 / 9')
    expect(wrapper.text()).toContain('Llegaste al máximo de perfiles')
    expect(wrapper.text()).toContain('9 de 9 usados')
    expect(wrapper.text()).not.toContain('Agregar perfil')
  })

  it('renders one card per family profile', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 3 }))

    expect(wrapper.findAll('#profile-panel-familiar li')).toHaveLength(3)
    expect(wrapper.text()).toContain('Familiar 1')
    expect(wrapper.text()).toContain('Familiar 3')
  })

  it('offers the create-first-profile call to action to a premium user with no family', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 0, premium: true }))

    expect(wrapper.text()).toContain('Aún no tenés perfiles familiares')
    expect(wrapper.text()).toContain('Crear primer perfil')
    expect(wrapper.text()).not.toContain('Sumá a tu familia')
  })

  it('offers the upgrade call to action to a free user with no family', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 0, premium: false }))

    expect(wrapper.text()).toContain('Hacerme premium')
    expect(wrapper.text()).not.toContain('Crear primer perfil')
    expect(wrapper.text()).not.toContain('Sumá a tu familia')
  })

  it('shows the quota card to a premium user who already has family profiles', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 2, premium: true }))

    expect(wrapper.text()).toContain('Sumá a tu familia')
    expect(wrapper.text()).toContain('Te quedan 7 lugares')
    expect(wrapper.text()).not.toContain('Hacerme premium')
  })

  it('keeps a downgraded user\'s family cards deletable while upselling premium', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 2, premium: false }))

    const deleteButtons = wrapper.findAll('[aria-label^="Eliminar a"]')

    expect(deleteButtons).toHaveLength(2)
    expect(wrapper.text()).toContain('Hacerme premium')
    expect(wrapper.text()).not.toContain('Sumá a tu familia')
  })

  it('opens the delete confirmation for the profile whose card was activated', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 2 }))

    await wrapper.findAll('[aria-label^="Eliminar a"]')[1].trigger('click')

    expect(document.querySelector('#profile-dialog-title').textContent).toBe(
      '¿Eliminar a Familiar 2?'
    )
  })

  it('deletes through the auth-user wrapper so the observer state stays in sync', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 2 }))

    await wrapper.findAll('[aria-label^="Eliminar a"]')[0].trigger('click')
    document.querySelector('[data-testid="confirm-delete-profile"]').click()
    await flushPromises()

    expect(deleteProfileFromAuthUser).toHaveBeenCalledWith(101)
    expect(deleteProfile).not.toHaveBeenCalled()
  })

  it('deletes nothing when the confirmation is cancelled', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 2 }))

    await wrapper.findAll('[aria-label^="Eliminar a"]')[0].trigger('click')
    document.querySelector('[data-testid="cancel-delete-profile"]').click()
    await flushPromises()

    expect(deleteProfileFromAuthUser).not.toHaveBeenCalled()
    expect(deleteProfile).not.toHaveBeenCalled()
  })

  it('keeps the panel labelled by its tab', async () => {
    const wrapper = await mountFamiliarTab(userWith({ family: 1 }))

    const panel = wrapper.get('#profile-panel-familiar')

    expect(panel.attributes('role')).toBe('tabpanel')
    expect(panel.attributes('aria-labelledby')).toBe('profile-tab-familiar')
  })
})
