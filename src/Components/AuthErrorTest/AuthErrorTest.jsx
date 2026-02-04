/**
 * Authentication Error Test Component
 * This component can be used to test the authentication error handling system
 */

import React from 'react';
import { Button } from '@material-tailwind/react';
import { FaExclamationTriangle, FaSignOutAlt, FaBug } from 'react-icons/fa';
import useStore from '../../Store/store';
import authErrorHandler from '../../services/__authErrorHandler';
import { showToast } from '../Toaster/Toaster';

const AuthErrorTest = () => {
    const { triggerAuthError, logout, checkAuthentication } = useStore();

    const handleTestAuthError = () => {
        console.log('Testing authentication error...');
        triggerAuthError();
    };

    const handleManualLogout = () => {
        console.log('Manual logout triggered...');
        logout();
    };

    const handleClearAuthData = () => {
        console.log('Clearing authentication data...');
        authErrorHandler.clearAuthData();
        showToast('Authentication data cleared', 'success');
    };

    const handleResetRedirectFlag = () => {
        console.log('Resetting redirect flag...');
        authErrorHandler.resetRedirectingFlag();
        showToast('Redirect flag reset', 'success');
    };

    const handleDebugToken = () => {
        console.log('Debugging token status...');
        const tokenInfo = authErrorHandler.debugTokenStatus();
        if (tokenInfo) {
            showToast(`Token expires in ${tokenInfo.timeUntilExpiry} minutes`, 'info');
        }
    };

    const isAuthenticated = checkAuthentication();

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <FaBug className="text-blue-500 text-xl" />
                <h2 className="text-xl font-semibold text-gray-800">
                    Authentication Error Test Panel
                </h2>
            </div>

            <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Current Status:</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Authentication Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isAuthenticated 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Test Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
                    onClick={handleTestAuthError}
                >
                    <FaExclamationTriangle />
                    Test Auth Error
                </Button>

                <Button
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
                    onClick={handleManualLogout}
                >
                    <FaSignOutAlt />
                    Manual Logout
                </Button>

                <Button
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600"
                    onClick={handleClearAuthData}
                >
                    Clear Auth Data
                </Button>

                <Button
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                    onClick={handleResetRedirectFlag}
                >
                    Reset Redirect Flag
                </Button>

                <Button
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                    onClick={handleDebugToken}
                >
                    Debug Token Status
                </Button>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Test Instructions:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Test Auth Error:</strong> Simulates a 401 authentication error</li>
                    <li>• <strong>Manual Logout:</strong> Clears auth data and redirects to login</li>
                    <li>• <strong>Clear Auth Data:</strong> Removes all authentication data from localStorage</li>
                    <li>• <strong>Reset Redirect Flag:</strong> Resets the redirect prevention flag</li>
                    <li>• <strong>Debug Token Status:</strong> Shows token expiration info in console</li>
                </ul>
            </div>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                    <FaExclamationTriangle className="text-yellow-600" />
                    <span className="font-medium">Warning:</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                    This component is for testing purposes only. Remove or protect this component in production environments.
                </p>
            </div>
        </div>
    );
};

export default AuthErrorTest;
