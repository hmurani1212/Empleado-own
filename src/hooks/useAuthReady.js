import { useEffect } from 'react'
import useStore from '../Store/store'

/**
 * Custom hook that ensures components wait for authentication to be ready
 * before making API calls. This prevents race conditions where API calls
 * are made before the JWT token is properly saved to localStorage.
 */
const useAuthReady = (callback, dependencies = []) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const isAuthLoading = useStore((state) => state.isAuthLoading)

  useEffect(() => {
    // Only execute callback when authentication is ready and not loading
    if (isAuthenticated && !isAuthLoading) {
      callback()
    }
  }, [isAuthenticated, isAuthLoading, ...dependencies])

  return { isAuthenticated, isAuthLoading }
}

export default useAuthReady
