import axiosInstance from "../config/axios.js";
import {getAuthUserProfiles, storeProfile} from "./profiles.js";


/** USER VARIABLES */
const observers = []
// TODO: Fix this instance of an object or reference thing
const emptyUser = {
    id: null,
    name: null,
    email: null,
    email_verified_at: null,
    role: null,
    updated_at: null,
    created_at: null,

    profiles: null
}
let user = {...emptyUser}

if (sessionStorage.getItem('ophi-user')) {
    setUser(JSON.parse(sessionStorage.getItem('ophi-user')))
}

function setUser(data) {
    user = {
        ...user,
        ...data
    }

    if (user.id === null) {
        sessionStorage.removeItem('ophi-user')
    } else {
        sessionStorage.setItem('ophi-user', JSON.stringify(user))
    }

    notifyAllSuscribers()
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
    const response = await axiosInstance.post('/api/login', credentials)

    const data = response.data
    data.profiles = await getAuthUserProfiles()

    setUser(data)
}

export async function logout() {
    const response = await axiosInstance.post('/api/logout');

    console.log('Logout response: ', response)

    if(response.status === 204) {
        setUser({...emptyUser});
    }
}

export async function register(data) {
    // Register the user
    const result = await axiosInstance.post('/api/register', data)
    const user = result.data

    // Login
    await login({email: user.email, password: data.password})

    // Register the user profile
    await storeProfile(data)
    user.profiles = await getAuthUserProfiles()

    setUser(user)
}

export async function addNewProfileToAuthUser(data) {
    await storeProfile(data)
    user.profiles = await getAuthUserProfiles()

    setUser(user)
}