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

            // CRITICAL: Check for ERROR status in successful responses (HTTP 200 with ERROR in body)
            // Some APIs return 200 status with ERROR status in response body
            if (response.data && typeof response.data === 'object') {
                const statusValue = response.data.STATUS || response.data.status;
                const errorFilter = response.data.ERROR_FILTER || response.data.error_filter;
                const errorCode = response.data.ERROR_CODE || response.data.error_code;

                // If STATUS is "ERROR" and it's an authentication error, handle it
                if (statusValue === 'ERROR' || statusValue === 'error') {
                    // Check if it's an authentication error
                    // Priority 1: Check ERROR_FILTER
                    if (errorFilter === 'USER_NOT_AUTHENTICATED') {
                        console.log(`🔴 Auth error detected in successful response (${instanceName}) by ERROR_FILTER:`, errorFilter);
                        console.log('📋 Error details:', { 
                            status: response.status, 
                            errorCode, 
                            errorFilter, 
                            errorDescription: response.data.ERROR_DESCRIPTION 
                        });

                        // Create error-like object to pass to handler
                        const authError = {
                            response: {
                                status: response.status,
                                data: response.data
                            },
                            config: response.config || {}
                        };

                        // Handle auth error - this will redirect immediately
                        authErrorHandler.handleAuthError(authError, response.config || {});
                        
                        // Return rejected promise to prevent further processing
                        return Promise.reject(authError);
                    }

                    // Priority 2: Check ERROR_CODE against known auth error codes
                    const knownAuthCodes = ['VTWE-401002', 'ONEID-148736154', 'USER_NOT_AUTHENTICATED', 'TOKEN_EXPIRED', 'INVALID_TOKEN', 'UNAUTHORIZED'];
                    if (errorCode && knownAuthCodes.includes(errorCode)) {
                        console.log(`🔴 Auth error detected in successful response (${instanceName}) by ERROR_CODE:`, errorCode);
                        console.log('📋 Error details:', { 
                            status: response.status, 
                            errorCode, 
                            errorFilter, 
                            errorDescription: response.data.ERROR_DESCRIPTION 
                        });

                        // Create error-like object to pass to handler
                        const authError = {
                            response: {
                                status: response.status,
                                data: response.data
                            },
                            config: response.config || {}
                        };

                        // Handle auth error - this will redirect immediately
                        authErrorHandler.handleAuthError(authError, response.config || {});
                        
                        // Return rejected promise to prevent further processing
                        return Promise.reject(authError);
                    }

                    // Priority 3: Check ERROR_FILTER against known auth codes
                    if (errorFilter && knownAuthCodes.includes(errorFilter)) {
                        console.log(`🔴 Auth error detected in successful response (${instanceName}) by ERROR_FILTER:`, errorFilter);
                        console.log('📋 Error details:', { 
                            status: response.status, 
                            errorCode, 
                            errorFilter, 
                            errorDescription: response.data.ERROR_DESCRIPTION 
                        });

                        // Create error-like object to pass to handler
                        const authError = {
                            response: {
                                status: response.status,
                                data: response.data
                            },
                            config: response.config || {}
                        };

                        // Handle auth error - this will redirect immediately
                        authErrorHandler.handleAuthError(authError, response.config || {});
                        
                        // Return rejected promise to prevent further processing
                        return Promise.reject(authError);
                    }
                }
            }

            return response;
        },
        (error) => {
            // Remove request from tracking on error
            if (error.config && error.config._requestTracker) {
                authErrorHandler.removePendingRequest(error.config._requestTracker);
            }

            // Log all errors for debugging (especially 401/403)
            if (error.response) {
                const { status, data } = error.response;
                console.log(`📡 Error intercepted in ${instanceName}:`, {
                    url: error.config?.url,
                    method: error.config?.method,
                    httpStatus: status,
                    responseStatus: data?.STATUS,
                    errorFilter: data?.ERROR_FILTER,
                    errorCode: data?.ERROR_CODE,
                    errorDescription: data?.ERROR_DESCRIPTION
                });
            }

            // Check if this is an authentication error
            const isAuthError = authErrorHandler.isAuthenticationError(error);
            if (isAuthError) {
                console.log(`🔴 Auth error confirmed in ${instanceName}, handling logout and redirect...`);
                // Handle auth error - this will redirect immediately
                authErrorHandler.handleAuthError(error, error.config || {});
                // Return rejected promise (redirect already happened)
                return Promise.reject(error);
            }

            // For non-auth errors, just reject the promise
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                console.error(`Response error in ${instanceName}:`, {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    message: error.message
                });
            }

            return Promise.reject(error);
        }
    );
};

/**
 * Setup authentication interceptors for all axios instances
 * This function should be called once during app initialization
 */
export const setupAllAuthInterceptors = async () => {
    // Import all axios instances dynamically to avoid circular dependencies
    let instances = [];
    
    try {
        // Try to get instances from the base module using dynamic import
        const baseModule = await import('../Model/base.js');
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

    return authErrorHandler.handleAuthError(mockError, mockError.config);
};

export default {
    setupAuthInterceptor,
    setupAllAuthInterceptors,
    triggerAuthError
};

