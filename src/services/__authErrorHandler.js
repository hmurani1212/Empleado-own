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
        
        // Extract error details (case-insensitive)
        let errorCode, errorFilter, errorDescription, statusValue;
        
        if (data && typeof data === 'object') {
            errorCode = data.ERROR_CODE || data.error_code || data.code || data.ErrorCode;
            errorFilter = data.ERROR_FILTER || data.error_filter || data.filter || data.ErrorFilter;
            errorDescription = data.ERROR_DESCRIPTION || data.error_description || data.message || data.ErrorDescription;
            statusValue = data.STATUS || data.status || data.Status;
        }

        // PRIORITY 1: HTTP 401/403 status codes - treat as auth error if they have ERROR status or auth indicators
        if (status === 401 || status === 403) {
            // If we have error data with ERROR status and auth indicators, it's definitely an auth error
            if (data && typeof data === 'object') {
                // Check if STATUS is ERROR and has auth-related indicators
                if ((statusValue === 'ERROR' || statusValue === 'error') && 
                    (errorFilter === 'USER_NOT_AUTHENTICATED' || 
                     errorCode === 'ONEID-148736154' ||
                     errorCode === 'VTWE-401002' ||
                     (errorCode && this.authErrorCodes.includes(errorCode)) ||
                     (errorFilter && this.authErrorCodes.includes(errorFilter)))) {
                    console.log('🔴 Authentication error detected by HTTP 401/403 with ERROR status');
                    console.log('📋 Error details:', { status, errorCode, errorFilter, statusValue, errorDescription });
                    return true;
                }
                
                // Even without ERROR status, if we have USER_NOT_AUTHENTICATED or known auth codes, it's an auth error
                if (errorFilter === 'USER_NOT_AUTHENTICATED' || 
                    errorCode === 'ONEID-148736154' ||
                    errorCode === 'VTWE-401002' ||
                    (errorCode && this.authErrorCodes.includes(errorCode)) ||
                    (errorFilter && this.authErrorCodes.includes(errorFilter))) {
                    console.log('🔴 Authentication error detected by HTTP 401/403 with auth indicators');
                    console.log('📋 Error details:', { status, errorCode, errorFilter, errorDescription });
                    return true;
                }
            }
            
            // If 401/403 but no specific error data, check if token is expired
            if (!data || (!errorCode && !errorFilter)) {
                if (!this.isTokenValid()) {
                    console.log('🔴 Authentication error detected by HTTP 401/403 - Token is expired');
                    return true;
                }
            }
        }

        // PRIORITY 2: Check if STATUS is "ERROR" and ERROR_FILTER is USER_NOT_AUTHENTICATED (regardless of HTTP status)
        if (data && typeof data === 'object' && (statusValue === 'ERROR' || statusValue === 'error')) {
            // If ERROR_FILTER is USER_NOT_AUTHENTICATED, it's definitely an auth error
            if (errorFilter === 'USER_NOT_AUTHENTICATED') {
                console.log('🔴 Authentication error detected by ERROR_FILTER: USER_NOT_AUTHENTICATED');
                console.log('📋 Error details:', { status, errorCode, errorFilter, errorDescription });
                return true;
            }
            
            // Check if any of our known auth error codes match
            if (errorCode && (errorCode === 'ONEID-148736154' || errorCode === 'VTWE-401002' || this.authErrorCodes.includes(errorCode))) {
                console.log('🔴 Authentication error detected by ERROR_CODE:', errorCode);
                console.log('📋 Error details:', { status, errorCode, errorFilter, errorDescription });
                return true;
            }

            // Check error filter against auth codes
            if (errorFilter && this.authErrorCodes.includes(errorFilter)) {
                console.log('🔴 Authentication error detected by ERROR_FILTER:', errorFilter);
                console.log('📋 Error details:', { status, errorCode, errorFilter, errorDescription });
                return true;
            }
        }

        // PRIORITY 3: Check if any of our known auth error codes match (regardless of STATUS or HTTP status)
        if (errorCode && (errorCode === 'ONEID-148736154' || errorCode === 'VTWE-401002' || this.authErrorCodes.includes(errorCode))) {
            console.log('🔴 Authentication error detected by ERROR_CODE:', errorCode);
            console.log('📋 Error details:', { status, errorCode, errorFilter, errorDescription });
            return true;
        }

        // PRIORITY 4: Check error filter
        if (errorFilter && (errorFilter === 'USER_NOT_AUTHENTICATED' || this.authErrorCodes.includes(errorFilter))) {
            console.log('🔴 Authentication error detected by ERROR_FILTER:', errorFilter);
            console.log('📋 Error details:', { status, errorCode, errorFilter, errorDescription });
            return true;
        }

        // PRIORITY 5: Check error description for common auth error patterns
        if (errorDescription && typeof errorDescription === 'string') {
            const lowerDesc = errorDescription.toLowerCase();
            if (lowerDesc.includes('token') && 
                (lowerDesc.includes('expired') || lowerDesc.includes('invalid'))) {
                console.log('🔴 Authentication error detected by description (token expired/invalid):', errorDescription);
                console.log('📋 Error details:', { status, errorCode, errorFilter, errorDescription });
                return true;
            }
            if (lowerDesc.includes('unauthorized') || 
                lowerDesc.includes('not authenticated') ||
                lowerDesc.includes('authentication failed') ||
                lowerDesc.includes('please login again')) {
                console.log('🔴 Authentication error detected by description (auth failed):', errorDescription);
                console.log('📋 Error details:', { status, errorCode, errorFilter, errorDescription });
                return true;
            }
        }

        return false;
    }

    /**
     * Clear all authentication data from localStorage
     */
    clearAuthData() {
        try {
            // List of known JWT token keys that might be stored
            const knownAuthKeys = [
                'jwt',
                'org_oneid',
                'oneid',
                'org_name',
                'org_id',
                'user_email',
                'user_full_name',
                'full_username',
                'full_dp',
                'role_id',
                'role_db_id',
                'scope',
                'other_permissions',
                'oneid_role_permissions',
                'org_oneid',
                'oneid_role_permissions'
            ];

            // Remove known auth keys
            knownAuthKeys.forEach(key => {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    // Ignore errors for individual key removal
                }
            });
            
            // Clear any other auth-related data by checking all localStorage keys
            const keysToRemove = [];
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                        const lowerKey = key.toLowerCase();
                        // Check if key contains auth-related terms
                        if (lowerKey.includes('auth') || 
                            lowerKey.includes('token') || 
                            lowerKey.includes('user') ||
                            lowerKey.includes('org') ||
                            lowerKey.includes('role') ||
                            lowerKey.includes('permission') ||
                            lowerKey.includes('oneid') ||
                            lowerKey.includes('scope')) {
                            keysToRemove.push(key);
                        }
                    }
                }
            } catch (e) {
                console.warn('Error iterating localStorage:', e);
            }
            
            // Remove all identified keys
            keysToRemove.forEach(key => {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    // Ignore errors for individual key removal
                }
            });
            
            console.log('✅ Authentication data cleared from localStorage');
        } catch (error) {
            console.error('❌ Error clearing authentication data:', error);
            // Even if clearing fails, try to clear at least the JWT token
            try {
                localStorage.removeItem('jwt');
            } catch (e) {
                console.error('❌ Failed to clear JWT token:', e);
            }
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

            // Clear auth data FIRST (synchronous)
            console.log('🧹 Clearing authentication data...');
            this.clearAuthData();

            // Update Zustand store state (non-blocking, don't wait for it)
            // Use dynamic import to avoid circular dependencies
            import('../Store/store').then(storeModule => {
                const useStore = storeModule.default;
                if (useStore && useStore.getState) {
                    try {
                        const setAuthenticationState = useStore.getState().setAuthenticationState;
                        if (setAuthenticationState) {
                            setAuthenticationState(false, false);
                            console.log('✅ Store state updated');
                        }
                    } catch (e) {
                        console.warn('⚠️ Error updating store state:', e);
                    }
                }
            }).catch(err => {
                // Store update is optional, continue with redirect
                console.warn('⚠️ Could not update store state (non-critical):', err);
            });

            // CRITICAL: Force immediate redirect - MUST happen synchronously
            // Don't wait for anything, redirect immediately
            console.log('🚀 Redirecting to login page NOW...');
            console.log('📍 Current URL:', window.location.href);
            console.log('📍 Target URL: /login');
            
            // Get the base path for the application
            const basePath = window.location.origin;
            const loginPath = `${basePath}/login`;
            
            // Use window.location.replace for immediate redirect (doesn't add to history)
            // This is synchronous and will immediately navigate
            try {
                console.log('🔄 Using window.location.replace...');
                window.location.replace(loginPath);
                
                // If we're still here after 100ms, try href as fallback
                setTimeout(() => {
                    if (window.location.pathname !== '/login') {
                        console.warn('⚠️ Replace may have failed, trying href redirect...');
                        try {
                            window.location.href = loginPath;
                        } catch (e) {
                            console.error('❌ Both redirect methods failed:', e);
                            // Last resort: try relative path
                            try {
                                window.location.href = '/login';
                            } catch (e2) {
                                console.error('❌ All redirect methods failed:', e2);
                            }
                        }
                    }
                }, 100);
            } catch (e) {
                console.error('❌ Error with replace, trying href:', e);
                try {
                    window.location.href = loginPath;
                } catch (e2) {
                    // Last resort: try relative path
                    try {
                        window.location.href = '/login';
                    } catch (e3) {
                        console.error('❌ All redirect methods failed:', e3);
                    }
                }
            }

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

// Expose authErrorCodes for external access (e.g., interceptors)
authErrorHandler.authErrorCodes = authErrorHandler.authErrorCodes;

export default authErrorHandler;

