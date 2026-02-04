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

            // Check if any of our known auth error codes match
            if (errorCode && this.authErrorCodes.includes(errorCode)) {
                // console.log('Authentication error detected by error code:', errorCode);
                return true;
            }

            // Check error filter
            if (errorFilter && this.authErrorCodes.includes(errorFilter)) {
                // console.log('Authentication error detected by error filter:', errorFilter);
                return true;
            }

            // Check error description for common auth error patterns
            if (errorDescription && typeof errorDescription === 'string') {
                const lowerDesc = errorDescription.toLowerCase();
                if (lowerDesc.includes('token') && 
                    (lowerDesc.includes('expired') || lowerDesc.includes('invalid'))) {
                    // console.log('Authentication error detected by description:', errorDescription);
                    return true;
                }
                if (lowerDesc.includes('unauthorized') || lowerDesc.includes('not authenticated')) {
                    // console.log('Authentication error detected by description:', errorDescription);
                    return true;
                }
            }
        }

        // Only check HTTP status codes if we haven't found specific error indicators
        // This prevents false positives from business logic 401/403 errors
        if (status === 401 || status === 403) {
            // Additional check: if there's no specific error data, it might be a generic auth error
            // But first verify if our token is actually expired
            if (!data || (!data.ERROR_CODE && !data.error_code && !data.ERROR_FILTER && !data.error_filter)) {
                // Check if our token is actually expired before treating this as auth error
                if (!this.isTokenValid()) {
                    console.log('Generic authentication error detected by status:', status, '- Token is expired');
                    return true;
                } else {
                    console.log('Ignoring 401/403 error - Token is still valid, likely business logic error');
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
        if (!error || !error.response || !error.response.data) {
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
            return; // Prevent multiple redirects
        }

        this.isRedirecting = true;
        
        try {
            // Clear any pending API calls
            this.pendingRequests.forEach(request => {
                if (request && request.cancel) {
                    request.cancel('Authentication error - redirecting to login');
                }
            });
            this.pendingRequests = [];

            // Show redirect message
            showToast(`${reason}. Redirecting to login...`, 'warning');

            // Clear auth data
            this.clearAuthData();

            // Redirect to login after a short delay
            setTimeout(() => {
                // Use window.location for a hard redirect to ensure clean state
                window.location.href = '/login';
            }, 1500);

        } catch (error) {
            console.error('Error during redirect to login:', error);
            // Fallback: immediate redirect
            window.location.href = '/login';
        }
    }

    /**
     * Handle authentication error
     * @param {Object} error - The error object from axios
     * @param {Object} config - The axios config object
     * @returns {Promise} - Rejected promise
     */
    handleAuthError(error, config = {}) {
        console.warn('Authentication error detected:', {
            url: config.url || 'Unknown',
            method: config.method || 'Unknown',
            status: error.response?.status,
            errorCode: error.response?.data?.ERROR_CODE,
            errorFilter: error.response?.data?.ERROR_FILTER,
            errorDescription: error.response?.data?.ERROR_DESCRIPTION
        });

        // Show error message to user
        this.showAuthErrorMessage(error);

        // Redirect to login
        this.redirectToLogin();

        // Return rejected promise
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
