import useStore from '../Store/store'

/**
 * Utility function to check if authentication is ready
 * This can be used in API services to ensure token is available
 */
export const isAuthReady = () => {
  const state = useStore.getState()
  return state.isAuthenticated && !state.isAuthLoading
}

/**
 * Utility function to get the JWT token safely
 * Returns null if authentication is not ready
 */
export const getAuthToken = () => {
  if (!isAuthReady()) {
    return null
  }
  return localStorage.getItem('jwt')
}

/**
 * Utility function to wait for authentication to be ready
 * Returns a promise that resolves when authentication is ready
 */
export const waitForAuth = () => {
  return new Promise((resolve) => {
    if (isAuthReady()) {
      resolve()
      return
    }

    const unsubscribe = useStore.subscribe((state) => {
      if (state.isAuthenticated && !state.isAuthLoading) {
        unsubscribe()
        resolve()
      }
    })
  })
}
