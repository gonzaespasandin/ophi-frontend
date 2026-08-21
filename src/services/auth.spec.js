import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../config/axios.js', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('./profiles.js', () => ({
  getAuthUserProfiles: vi.fn(),
  getSubscription: vi.fn(),
  storeProfile: vi.fn(),
  updateProfile: vi.fn(),
  deleteProfile: vi.fn(),
}))

import axiosInstance from '../config/axios.js'
import { getAuthUserProfiles, getSubscription, storeProfile } from './profiles.js'
import { register } from './auth.js'

const REGISTERED_USER = {
  id: 7,
  name: 'Lucía Méndez',
  email: 'lucia.mendez@ophi.app',
  role: 'user',
}

const MAIN_PROFILE = {
  id: 12,
  name: 'Lucía Méndez',
  user_id: 7,
  is_main: true,
  ingredient_ids: [3, 9],
  ingredients: [],
}

// What the 6-step wizard hands to register(): the ingredient ids picked on the
// intolerances/allergies/diets steps travel in the very same object.
const wizardData = () => ({
  terms_and_conditions: true,
  ingredients: [3, 9],
  name: 'Lucía Méndez',
  email: 'lucia.mendez@ophi.app',
  password: 'SecretaSegura1',
  confirm_password: 'SecretaSegura1',
  avatar: '',
})

const postedTo = url => axiosInstance.post.mock.calls.filter(([called]) => called === url)

function rejectWith(status, data = {}) {
  return Promise.reject({ status, response: { data } })
}

// The free tier lets a user own exactly one profile, and /api/register already
// created it. Any other POST is unexpected, so it answers the way the API does.
function apiPost(url, data) {
  if (url === '/api/register') return Promise.resolve({ data: { user: { ...REGISTERED_USER } } })
  if (url === '/api/login') return Promise.resolve({ data: { user: { ...REGISTERED_USER } } })
  if (url === '/api/profiles') return rejectWith(403, { message: 'Usuario no premium' })

  return Promise.resolve({ data: {} })
}

describe('register', () => {
  beforeEach(() => {
    // restoreMocks does not clear the call history of a vi.fn() from a factory.
    vi.clearAllMocks()
    sessionStorage.clear()

    axiosInstance.get.mockResolvedValue({ data: {} })
    axiosInstance.post.mockImplementation(apiPost)
    getAuthUserProfiles.mockResolvedValue([MAIN_PROFILE])
    getSubscription.mockResolvedValue(null)
    storeProfile.mockImplementation(() => rejectWith(403, { message: 'Usuario no premium' }))
  })

  it('creates the account with the ingredients picked in the wizard', async () => {
    await register(wizardData())

    expect(postedTo('/api/register')).toHaveLength(1)
    expect(postedTo('/api/register')[0][1]).toMatchObject({
      email: 'lucia.mendez@ophi.app',
      ingredients: [3, 9],
    })
  })

  // The regression guard. /api/register already creates the main profile, and a
  // second one hits the free-tier guard with a 403 on every non-premium signup.
  it('does not create a second profile for the account it just registered', async () => {
    await register(wizardData())

    expect(postedTo('/api/profiles')).toHaveLength(0)
    expect(storeProfile).not.toHaveBeenCalled()
  })

  it('registers without throwing', async () => {
    await expect(register(wizardData())).resolves.toBeUndefined()
  })

  it('logs the new account in with the credentials it was created with', async () => {
    await register(wizardData())

    expect(postedTo('/api/login')[0][1]).toEqual({
      email: 'lucia.mendez@ophi.app',
      password: 'SecretaSegura1',
    })
  })

  it('leaves the session holding the user and the profile the API created', async () => {
    await register(wizardData())

    const stored = JSON.parse(sessionStorage.getItem('ophi-user'))

    expect(stored).toMatchObject({ id: 7, email: 'lucia.mendez@ophi.app' })
    expect(stored.profiles).toHaveLength(1)
    expect(stored.profiles[0]).toMatchObject({ id: 12, is_main: true })
  })

  it('propagates the failure when the account could not be created', async () => {
    axiosInstance.post.mockImplementation(url =>
      url === '/api/register'
        ? rejectWith(422, { errors: { email: ['Este email ya está registrado'] } })
        : apiPost(url)
    )

    await expect(register(wizardData())).rejects.toMatchObject({ status: 422 })
    expect(sessionStorage.getItem('ophi-user')).toBeNull()
  })
})
