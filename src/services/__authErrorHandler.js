/**
 * Centralized Authentication Error Handler
 * Handles token expiration and authentication errors across all API instances
 */

import { showToast } from '../Components/Toaster/Toaster';
import { jwtDecode } from 'jwt-decode';

class AuthErrorHandler {
    constructor() {
        this.isRedirecting = false;
        this.pendingRequests = [];
        this.authErrorCodes = [
            'VTWE-401002', // Invalid or expired token
            'ONEID-148736154', // OneID authentication error
            'USER_NOT_AUTHENTICATED',
            'TOKEN_EXPIRED',
            'INVALID_TOKEN',
            'UNAUTHORIZED'
        ];
    }

    /**
     * Check if the current token is valid and not expired
     * @returns {boolean} - True if token is valid
     */
    isTokenValid() {
        try {
            const token = localStorage.getItem('jwt');
            if (!token) {
                return false;
            }

            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            
            // Check if token is expired
            if (decoded.exp && decoded.exp < currentTime) {
                // console.log('Token is expired:', new Date(decoded.exp * 1000));
                return false;
            }

            // console.log('Token is valid, expires at:', new Date(decoded.exp * 1000));
            return true;
        } catch (error) {
            console.error('Error validating token:', error);
            return false;
        }
    }

    /**
     * Check if the error is an authentication error
     * @param {Object} error - The error object from axios response
     * @returns {boolean} - True if it's an auth error
     */
    isAuthenticationError(error) {
        if (!error || !error.response) {
            return false;
        }

        const { status, data } = error.response;
        
        // First check for specific error codes in response data
        if (data && typeof data === 'object') {
            const errorCode = data.ERROR_CODE || data.error_code || data.code;
            const errorFilter = data.ERROR_FILTER || data.error_filter || data.filter;
            const errorDescription = data.ERROR_DESCRIPTION || data.error_description || data.message;
            const statusValue = data.STATUS || data.status;

            // Priority 1: Check if STATUS is "ERROR" and ERROR_FILTER is USER_NOT_AUTHENTICATED
            if (statusValue === 'ERROR' || statusValue === 'error') {
                // If ERROR_FILTER is USER_NOT_AUTHENTICATED, it's definitely an auth error
                if (errorFilter === 'USER_NOT_AUTHENTICATED') {
                    console.log('🔴 Authentication error detected by ERROR_FILTER:', errorFilter);
                    console.log('📋 Error details:', { errorCode, errorFilter, errorDescription, status });
                    return true;
                }
                
                // Check if any of our known auth error codes match
                if (errorCode && this.authErrorCodes.includes(errorCode)) {
                    console.log('🔴 Authentication error detected by error code:', errorCode);
                    console.log('📋 Error details:', { errorCode, errorFilter, errorDescription, status });
                    return true;
                }

                // Check error filter against auth codes
                if (errorFilter && this.authErrorCodes.includes(errorFilter)) {
                    console.log('🔴 Authentication error detected by error filter:', errorFilter);
                    console.log('📋 Error details:', { errorCode, errorFilter, errorDescription, status });
                    return true;
                }
            }

            // Priority 2: Check if any of our known auth error codes match (regardless of STATUS)
            if (errorCode && this.authErrorCodes.includes(errorCode)) {
                console.log('🔴 Authentication error detected by error code:', errorCode);
                console.log('📋 Error details:', { errorCode, errorFilter, errorDescription, status });
                return true;
            }

            // Priority 3: Check error filter
            if (errorFilter && this.authErrorCodes.includes(errorFilter)) {
                console.log('🔴 Authentication error detected by error filter:', errorFilter);
                console.log('📋 Error details:', { errorCode, errorFilter, errorDescription, status });
                return true;
            }

            // Priority 4: Check error description for common auth error patterns
            if (errorDescription && typeof errorDescription === 'string') {
                const lowerDesc = errorDescription.toLowerCase();
                if (lowerDesc.includes('token') && 
                    (lowerDesc.includes('expired') || lowerDesc.includes('invalid'))) {
                    console.log('🔴 Authentication error detected by description:', errorDescription);
                    console.log('📋 Error details:', { errorCode, errorFilter, errorDescription, status });
                    return true;
                }
                if (lowerDesc.includes('unauthorized') || 
                    lowerDesc.includes('not authenticated') ||
                    lowerDesc.includes('authentication failed') ||
                    lowerDesc.includes('please login again')) {
                    console.log('🔴 Authentication error detected by description:', errorDescription);
                    console.log('📋 Error details:', { errorCode, errorFilter, errorDescription, status });
                    return true;
                }
            }
        }

        // Priority 5: Check HTTP status codes - if 401/403 with ERROR status, treat as auth error
        if (status === 401 || status === 403) {
            // If response has ERROR status and authentication-related data, it's an auth error
            if (data && typeof data === 'object') {
                const statusValue = data.STATUS || data.status;
                const errorFilter = data.ERROR_FILTER || data.error_filter;
                const errorCode = data.ERROR_CODE || data.error_code;
                
                // If STATUS is ERROR and has auth-related indicators, it's an auth error
                if ((statusValue === 'ERROR' || statusValue === 'error') && 
                    (errorFilter === 'USER_NOT_AUTHENTICATED' || 
                     this.authErrorCodes.includes(errorCode) ||
                     this.authErrorCodes.includes(errorFilter))) {
                    console.log('🔴 Authentication error detected by 401/403 status with ERROR status:', status);
                    console.log('📋 Error details:', { errorCode, errorFilter, statusValue, status });
                    return true;
                }
            }
            
            // Additional check: if there's no specific error data, check if token is expired
            if (!data || (!data.ERROR_CODE && !data.error_code && !data.ERROR_FILTER && !data.error_filter)) {
                // Check if our token is actually expired before treating this as auth error
                if (!this.isTokenValid()) {
                    console.log('🔴 Generic authentication error detected by status:', status, '- Token is expired');
                    return true;
                } else {
                    console.log('ℹ️ Ignoring 401/403 error - Token is still valid, likely business logic error');
                    return false;
                }
            }
        }

        return false;
    }

    /**
     * Clear all authentication data from localStorage
     */
    clearAuthData() {
        try {
            // Clear JWT token and related auth data
            localStorage.removeItem('jwt');
            localStorage.removeItem('org_oneid');
            localStorage.removeItem('oneid');
            localStorage.removeItem('org_name');
            localStorage.removeItem('user_email');
            localStorage.removeItem('full_username');
            localStorage.removeItem('full_dp');
            localStorage.removeItem('role_id');
            localStorage.removeItem('role_db_id');
            localStorage.removeItem('other_permissions');
            localStorage.removeItem('oneid_role_permissions');
            
            // Clear any other auth-related data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key.includes('auth') || 
                    key.includes('token') || 
                    key.includes('user') ||
                    key.includes('org')
                )) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // console.log('Authentication data cleared from localStorage');
        } catch (error) {
            console.error('Error clearing authentication data:', error);
        }
    }

    /**
     * Show authentication error message to user
     * @param {Object} error - The error object
     */
    showAuthErrorMessage(error) {
        const errorMessage = this.getAuthErrorMessage(error);
        showToast(errorMessage, 'error');
    }

    /**
     * Get appropriate error message for authentication error
     * @param {Object} error - The error object
     * @returns {string} - Error message
     */
    getAuthErrorMessage(error) {
        if (!error || !error.response || !
            error.response.data) {
            return 'Your session has expired. Please login again.';
        }

        const { data } = error.response;
        const errorDescription = data.ERROR_DESCRIPTION || data.error_description || data.message;
        
        if (errorDescription && typeof errorDescription === 'string') {
            return errorDescription;
        }

        return 'Your session has expired. Please login again.';
    }

    /**
     * Redirect to login page
     * @param {string} reason - Reason for redirect (optional)
     */
    redirectToLogin(reason = 'Session expired') {
        if (this.isRedirecting) {
            console.log('⚠️ Redirect already in progress, skipping duplicate redirect');
            return; // Prevent multiple redirects
        }

        console.log('🔄 Starting redirect to login page...');
        this.isRedirecting = true;
        
        try {
            // Clear any pending API calls
            console.log('🛑 Cancelling pending API requests...');
            this.pendingRequests.forEach(request => {
                if (request && request.cancel) {
                    try {
                        request.cancel('Authentication error - redirecting to login');
                    } catch (e) {
                        // Ignore cancel errors
                    }
                }
            });
            this.pendingRequests = [];

            // Clear auth data
            console.log('🧹 Clearing authentication data...');
            this.clearAuthData();

            // Update Zustand store state asynchronously (non-blocking)
            // Use dynamic import to avoid circular dependencies
            import('../Store/store').then(storeModule => {
                const useStore = storeModule.default;
                if (useStore && useStore.getState) {
                    const setAuthenticationState = useStore.getState().setAuthenticationState;
                    if (setAuthenticationState) {
                        setAuthenticationState(false, false);
                        console.log('✅ Store state updated');
                    }
                }
            }).catch(err => {
                // Store update is optional, continue with redirect
                console.warn('⚠️ Could not update store state (non-critical):', err);
            });

            // Force immediate redirect - use replace to prevent back button issues
            console.log('🚀 Redirecting to login page now...');
            console.log('📍 Current URL:', window.location.href);
            console.log('📍 Target URL: /login');
            
            // Use window.location.replace for immediate redirect (doesn't add to history)
            window.location.replace('/login');
            
            // Fallback: if replace doesn't work, use href
            setTimeout(() => {
                if (window.location.pathname !== '/login') {
                    console.warn('⚠️ Replace failed, trying href redirect...');
                    window.location.href = '/login';
                }
            }, 100);

        } catch (error) {
            console.error('❌ Error during redirect to login:', error);
            // Fallback: immediate redirect
            try {
                window.location.replace('/login');
            } catch (e) {
                window.location.href = '/login';
            }
        }
    }

    /**
     * Handle authentication error
     * @param {Object} error - The error object from axios
     * @param {Object} config - The axios config object
     * @returns {Promise} - Rejected promise
     */
    handleAuthError(error, config = {}) {
        const errorDetails = {
            url: config.url || error.config?.url || 'Unknown',
            method: config.method || error.config?.method || 'Unknown',
            status: error.response?.status,
            errorCode: error.response?.data?.ERROR_CODE,
            errorFilter: error.response?.data?.ERROR_FILTER,
            errorDescription: error.response?.data?.ERROR_DESCRIPTION
        };

        console.warn('🔴 ========== AUTHENTICATION ERROR DETECTED ==========');
        console.warn('🔴 Error Details:', errorDetails);
        console.warn('🔴 ================================================');

        // Show error message to user
        try {
            this.showAuthErrorMessage(error);
        } catch (e) {
            console.error('Error showing toast message:', e);
        }

        // Redirect to login immediately (synchronous operation)
        // This must happen synchronously, not in a promise chain
        this.redirectToLogin();

        // Return rejected promise (but redirect already happened)
        return Promise.reject(error);
    }

    /**
     * Add a pending request to track
     * @param {Object} request - The request object
     */
    addPendingRequest(request) {
        this.pendingRequests.push(request);
    }

    /**
     * Remove a completed request from tracking
     * @param {Object} request - The request object
     */
    removePendingRequest(request) {
        this.pendingRequests = this.pendingRequests.filter(req => req !== request);
    }

    /**
     * Reset the redirecting flag (useful for testing or manual reset)
     */
    resetRedirectingFlag() {
        this.isRedirecting = false;
    }

    /**
     * Debug method to check token status
     */
    debugTokenStatus() {
        const token = localStorage.getItem('jwt');
        if (!token) {
            console.log('No token found in localStorage');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            const isExpired = decoded.exp && decoded.exp < currentTime;
            
            console.log('=== Token Debug Info ===');
            console.log('Token exists:', !!token);
            console.log('Token length:', token.length);
            console.log('Issued at:', new Date(decoded.iat * 1000));
            console.log('Expires at:', new Date(decoded.exp * 1000));
            console.log('Current time:', new Date(currentTime * 1000));
            console.log('Is expired:', isExpired);
            console.log('Time until expiry:', Math.floor((decoded.exp - currentTime) / 60), 'minutes');
            console.log('========================');
            
            return {
                exists: !!token,
                expired: isExpired,
                expiresAt: new Date(decoded.exp * 1000),
                timeUntilExpiry: Math.floor((decoded.exp - currentTime) / 60)
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return { exists: true, expired: true, error: error.message };
        }
    }
}

// Create singleton instance
const authErrorHandler = new AuthErrorHandler();

export default authErrorHandler;

