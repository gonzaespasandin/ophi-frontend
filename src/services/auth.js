import axiosInstance from "../config/axios.js";
import {deleteProfile, getAuthUserProfiles, getSubscription, storeProfile, updateProfile} from "./profiles.js";


/** USER VARIABLES */
const observers = []
const emptyUser = {
    id: null,
    name: null,
    email: null,
    email_verified_at: null,
    role: null,
    updated_at: null,
    created_at: null,

    profiles: null,
    subscription: null
}
let user = {...emptyUser}

if (sessionStorage.getItem('ophi-user')) {
    try {
        setUser(JSON.parse(sessionStorage.getItem('ophi-user')))
    } catch (error) {
        sessionStorage.removeItem('ophi-user')
    }
}

export function setUser(data) {
    user = normalizeUserForSession({
        ...user,
        ...data
    })

    if (user.id === null) {
        sessionStorage.removeItem('ophi-user')
    } else {
        persistUser(user)
    }

    notifyAllSuscribers()
}

function normalizeUserForSession(data) {
    return {
        id: data.id ?? null,
        name: data.name ?? null,
        email: data.email ?? null,
        email_verified_at: data.email_verified_at ?? null,
        role: data.role ?? null,
        updated_at: data.updated_at ?? null,
        created_at: data.created_at ?? null,
        profiles: Array.isArray(data.profiles) ? data.profiles.map(normalizeProfileForSession) : null,
        subscription: data.subscription ?? null
    }
}

function normalizeProfileForSession(profile) {
    return {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar ?? null,
        avatar_color: profile.avatar_color ?? null,
        user_id: profile.user_id,
        is_main: Boolean(profile.is_main),
        created_at: profile.created_at ?? null,
        updated_at: profile.updated_at ?? null,
        ingredient_ids: (profile.ingredient_ids ?? profile.ingredients?.map(ingredient => ingredient.id) ?? [])
            .map(id => Number(id))
            .filter(id => Number.isFinite(id)),
        ingredients: (profile.ingredients ?? []).map(normalizeIngredientForSession)
    }
}

function normalizeIngredientForSession(ingredient) {
    return {
        id: ingredient.id,
        name: ingredient.name,
        icon: ingredient.icon ?? null,
        is_group: Boolean(ingredient.is_group),
        aliases: ingredient.aliases ?? null
    }
}

function persistUser(value) {
    const serialized = JSON.stringify(value)

    try {
        sessionStorage.setItem('ophi-user', serialized)
    } catch (error) {
        clearHeavyStorageKeys()
        sessionStorage.setItem('ophi-user', serialized)
    }
}

function clearHeavyStorageKeys() {
    sessionStorage.removeItem('brands')
    localStorage.removeItem('products')
    localStorage.removeItem('latestSearches')
}



/** OBSERVER METHODS */
/*
Honestly i'm not pretty sure if we actually need an observer 🤷‍♂️
* */
export function suscribeToAuthObserver(callback) {
    observers.push(callback);

    notifySuscriber(callback)

    return () => {
        observers.filter((observer) => observer !== callback);
    }
}

function notifySuscriber(callback) {
    callback({...user})
}

function notifyAllSuscribers() {
    observers.forEach(notifySuscriber)
}



/** AUTHENTICATION */
export async function login(credentials) {
    try {
        // Pedir cookie CSRF
        await axiosInstance.get('/sanctum/csrf-cookie')

        // Hacer login
        const response = await axiosInstance.post('/api/login', credentials)

          
        const userData = response.data.user || response.data
     
        userData.profiles = await getAuthUserProfiles()
        userData.subscription = await getSubscription()

        setUser(userData)
    } catch (error) {
        console.error('[auth.js] -> [login], Error: ', error);
        throw error;
    }
}

export function logout() {
    axiosInstance.post('/api/logout');
    setUser({...emptyUser});
}

export async function register(data) {
    try {
        // Register the user. The API also creates the main profile from the
        // ingredients this payload carries, so there is nothing left to store.
        const result = await axiosInstance.post('/api/register', data)
        const user = result.data.user || result.data

        // Login
        await login({email: user.email, password: data.password})

        user.profiles = await getAuthUserProfiles()

        setUser(user)
    } catch (error) {
        console.error('[auth.js] -> [register], Error: ', error);
        throw error;
    }
}

export async function sendEmailToResetPassword(data) {
    try {
        const response = await axiosInstance.post('/api/forgot-password', data)

        return response.data
    } catch (error) {
        console.error('[auth.js] -> [sendEmailToResetPassword], Error: ', error);
        throw error;
    }
}

export async function resetPassword(data) {
    try {
        const response = await axiosInstance.post('/api/reset-password', data)

        return response.data
    } catch (error) {
        console.error('[auth.js] -> [resetPassword], Error: ', error);
        throw error;
    }
}

export async function addNewProfileToAuthUser(data) {
    try {
        const result = await storeProfile(data)
        user.profiles = await getAuthUserProfiles()
        
        setUser(user)
        
        return result;
    } catch (error) {
        console.error('[auth.js] -> [addNewProfileToAuthUser], Error: ', error);
        throw error;
    }
}

export async function updateProfileFromAuthUser(profile) {
    try {
        const result = await updateProfile(profile)
        user.profiles = await getAuthUserProfiles()

        setUser(user)

        return result.message;
    } catch (error) {
        console.error('[auth.js] -> [updateProfileFromAuthUser], Error: ', error);
        throw error;
    }
}

export async function deleteProfileFromAuthUser(id) {
    try {
        const result = await deleteProfile(id)
        user.profiles = await getAuthUserProfiles()

        setUser(user)

        return result.message;
    } catch (error) {
        console.error('[auth.js] -> [deleteProfileFromAuthUser], Error: ', error);
        throw error;
    }
}
