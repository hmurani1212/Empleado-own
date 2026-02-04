// Centralized API Manager to prevent duplicate API calls
class ApiManager {
    constructor() {
        this.apiCalls = new Map();
        this.cachedData = new Map();
    }

    // Check if an API call is already in progress
    isCallInProgress(apiKey) {
        return this.apiCalls.has(apiKey);
    }

    // Check if data is already cached
    isDataCached(apiKey) {
        return this.cachedData.has(apiKey);
    }

    // Get cached data
    getCachedData(apiKey) {
        return this.cachedData.get(apiKey);
    }

    // Set cached data
    setCachedData(apiKey, data) {
        this.cachedData.set(apiKey, data);
    }

    // Mark API call as in progress
    markCallInProgress(apiKey) {
        this.apiCalls.set(apiKey, true);
    }

    // Mark API call as completed
    markCallCompleted(apiKey) {
        this.apiCalls.delete(apiKey);
    }

    // Clear all cached data (useful for logout or page refresh)
    clearCache() {
        this.cachedData.clear();
        this.apiCalls.clear();
    }

    // Clear specific cached data
    clearCachedData(apiKey) {
        this.cachedData.delete(apiKey);
        this.apiCalls.delete(apiKey);
    }
}

// Create a singleton instance
const apiManager = new ApiManager();

// Helper function to create unique API keys
export const createApiKey = (endpoint, params = {}) => {
    const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
    return `${endpoint}${sortedParams ? `?${sortedParams}` : ''}`;
};

// Wrapper function for API calls to prevent duplicates
export const executeApiCall = async (apiKey, apiFunction, forceRefresh = false) => {
    // If data is cached and we're not forcing refresh, return cached data
    if (!forceRefresh && apiManager.isDataCached(apiKey)) {
        return apiManager.getCachedData(apiKey);
    }

    // If API call is already in progress, wait for it to complete
    if (apiManager.isCallInProgress(apiKey)) {
        // Wait for the existing call to complete
        while (apiManager.isCallInProgress(apiKey)) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return apiManager.getCachedData(apiKey);
    }

    // Mark call as in progress
    apiManager.markCallInProgress(apiKey);

    try {
        // Execute the API call
        const result = await apiFunction();
        
        // Cache the result
        apiManager.setCachedData(apiKey, result);
        
        return result;
    } catch (error) {
        // Remove from in-progress calls on error
        apiManager.markCallCompleted(apiKey);
        throw error;
    } finally {
        // Mark call as completed
        apiManager.markCallCompleted(apiKey);
    }
};

export default apiManager;
