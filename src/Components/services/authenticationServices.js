import { getUserData, isTokenValid, getDecodedToken } from '../Authentication/jwt_decode';
import authErrorHandler from './__authErrorHandler'; // Import the centralized handler

const authenticationServices = (set, get) => ({
    authRole: 'Employee', // Default fallback role
    isAuthenticated: false, // New state to track authentication status
    userData: null, // New state to store decoded user data

    // Function to set auth role and authentication status based on JWT token
    setAuthRoleFromToken: () => {
        const userData = getUserData();
        const role = userData?.roleId || 'Employee';
        set({ authRole: role, userData: userData, isAuthenticated: !!userData });
        return role;
    },

    // Function to get current auth role
    getAuthRole: () => {
        const userData = getUserData();
        return userData?.roleId || 'Employee';
    },

    // Function to get user data from token
    getUserDataFromToken: () => {
        const userData = getUserData();
        set({ userData: userData, isAuthenticated: !!userData });
        return userData;
    },

    // Centralized function to check authentication status and handle expired tokens
    checkAuthentication: () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            set({ isAuthenticated: false, userData: null, authRole: 'Employee' });
            // If no token, ensure redirect to login if not already there
            if (window.location.pathname !== '/login') {
                authErrorHandler.handleAuthError({ response: { status: 401, data: { ERROR_FILTER: "USER_NOT_AUTHENTICATED", ERROR_CODE: "VTWE-401002", ERROR_DESCRIPTION: "No token found" } } }, {});
            }
            return false;
        }

        if (!isTokenValid()) {
            console.warn('JWT token is expired or invalid. Redirecting to login.');
            set({ isAuthenticated: false, userData: null, authRole: 'Employee' });
            // Trigger the centralized error handler for expired token
            authErrorHandler.handleAuthError({ response: { status: 401, data: { ERROR_FILTER: "USER_NOT_AUTHENTICATED", ERROR_CODE: "VTWE-401002", ERROR_DESCRIPTION: "Invalid or expired token" } } }, {});
            return false;
        }

        // If token is valid, ensure state is updated
        const userData = getUserData();
        set({ isAuthenticated: true, userData: userData, authRole: userData?.roleId || 'Employee' });
        return true;
    },

    // Function to handle user logout
    logout: () => {
        localStorage.clear();
        set({ isAuthenticated: false, userData: null, authRole: 'Employee' });
        authErrorHandler.resetRedirectingFlag(); // Reset the redirect flag
        window.location.href = '/login'; // Force full page reload
    },

    // Function to trigger authentication error for testing
    triggerAuthError: () => {
        return authErrorHandler.handleAuthError({ 
            response: { 
                status: 401, 
                data: { 
                    ERROR_FILTER: "USER_NOT_AUTHENTICATED", 
                    ERROR_CODE: "VTWE-401002", 
                    ERROR_DESCRIPTION: "Test authentication error" 
                } 
            } 
        }, {});
    },

    // Function to clear authentication data
    clearAuthData: () => {
        authErrorHandler.clearAuthData();
        set({ isAuthenticated: false, userData: null, authRole: 'Employee' });
    },

    // Function to reset redirecting flag
    resetRedirectingFlag: () => {
        authErrorHandler.resetRedirectingFlag();
    },

    // Function to debug token status
    debugTokenStatus: () => {
        return authErrorHandler.debugTokenStatus();
    }
});

export default authenticationServices;