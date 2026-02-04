/**
 * Axios Interceptor Setup Utility
 * Sets up authentication error handling for all axios instances
 */

import axios from 'axios';
import authErrorHandler from './__authErrorHandler';

/**
 * Setup response interceptor for authentication error handling
 * @param {Object} axiosInstance - The axios instance to setup interceptors for
 * @param {string} instanceName - Name of the instance for logging (optional)
 */
export const setupAuthInterceptor = (axiosInstance, instanceName = 'Unknown') => {
    if (!axiosInstance || !axiosInstance.interceptors) {
        console.warn(`Invalid axios instance provided for ${instanceName}`);
        return;
    }

    // Request interceptor to add fresh token and track requests
    axiosInstance.interceptors.request.use(
        (config) => {
            // Get fresh token from localStorage
            const token = localStorage.getItem('jwt');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Track this request
            const requestTracker = {
                url: config.url,
                method: config.method,
                timestamp: Date.now(),
                cancel: null
            };

            // Add cancel token if not already present
            if (!config.cancelToken) {
                const source = axios.CancelToken.source();
                config.cancelToken = source.token;
                requestTracker.cancel = source.cancel;
            }

            // Store request tracker
            authErrorHandler.addPendingRequest(requestTracker);
            config._requestTracker = requestTracker;

            return config;
        },
        (error) => {
            console.error(`Request error in ${instanceName}:`, error);
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle authentication errors
    axiosInstance.interceptors.response.use(
        (response) => {
            // Remove request from tracking on success
            if (response.config && response.config._requestTracker) {
                authErrorHandler.removePendingRequest(response.config._requestTracker);
            }
            return response;
        },
        (error) => {
            // Remove request from tracking on error
            if (error.config && error.config._requestTracker) {
                authErrorHandler.removePendingRequest(error.config._requestTracker);
            }

            // Check if this is an authentication error
            if (authErrorHandler.isAuthenticationError(error)) {
                return authErrorHandler.handleAuthError(error, error.config);
            }

            // For non-auth errors, just reject the promise
            console.error(`Response error in ${instanceName}:`, {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                message: error.message
            });

            return Promise.reject(error);
        }
    );

    console.log(`Authentication interceptor setup completed for ${instanceName}`);
};

/**
 * Setup authentication interceptors for all axios instances
 * This function should be called once during app initialization
 */
export const setupAllAuthInterceptors = async () => {
    console.log('Setting up authentication interceptors for all axios instances...');

    // Import all axios instances dynamically to avoid circular dependencies
    let instances = [];
    
    try {
        // Try to get instances from the base module using dynamic import
        const baseModule = await import('../../Model/base.js');
        instances = [
            { instance: baseModule.axiosInstance, name: 'Main API' },
            { instance: baseModule.performanceAxiosInstance, name: 'Performance API' },
            { instance: baseModule.axiosInstanceFile, name: 'File Upload API' },
            { instance: baseModule.axiosInstanceHire, name: 'Hire API' },
            { instance: baseModule.axiosInstancecoremodule, name: 'Core Module API' },
            { instance: baseModule.traininginstancemodeule, name: 'Training API' },
            { instance: baseModule.Inboxinstancemodeule, name: 'Inbox API' },
            { instance: baseModule.OneIDinstancemodeule, name: 'OneID API' },
            { instance: baseModule.approvel_flow, name: 'Approval Flow API' },
            { instance: baseModule.NotesPoolinstancemodeule, name: 'Notes Pool API' },
            { instance: baseModule.NotesPoolFileInstance, name: 'Notes Pool File API' },
            { instance: baseModule.Noticesinstancemodule, name: 'Notices API' },
            { instance: baseModule.ShiftPlannerinstancemodule, name: 'Shift Planner API' },
            { instance: baseModule.LeavePlannerinstancemodule, name: 'Leave Planner API' },
            { instance: baseModule.payRollinstancemodule, name: 'Payroll API' },
            { instance: baseModule.attencedenceInstence, name: 'Attendance API' },
            { instance: baseModule.expenseAxiosInstance, name: 'Expense API' },
            { instance: baseModule.MobileAttendanceinstancemodule, name: 'Mobile Attendance API' }
        ];
    } catch (error) {
        console.error('Error importing axios instances:', error);
        return;
    }

    instances.forEach(({ instance, name }) => {
        if (instance) {
            setupAuthInterceptor(instance, name);
        } else {
            console.warn(`Axios instance not found: ${name}`);
        }
    });

    console.log('All authentication interceptors setup completed');
};

/**
 * Manual authentication error trigger for testing
 * @param {string} instanceName - Name of the instance to test
 */
export const triggerAuthError = (instanceName = 'Test') => {
    const mockError = {
        response: {
            status: 401,
            data: {
                STATUS: "ERROR",
                ERROR_FILTER: "USER_NOT_AUTHENTICATED",
                ERROR_CODE: "VTWE-401002",
                ERROR_DESCRIPTION: "Invalid or expired token"
            }
        },
        config: {
            url: '/test/auth-error',
            method: 'GET'
        }
    };

    console.log(`Triggering authentication error test for ${instanceName}`);
    return authErrorHandler.handleAuthError(mockError, mockError.config);
};

export default {
    setupAuthInterceptor,
    setupAllAuthInterceptors,
    triggerAuthError
};
