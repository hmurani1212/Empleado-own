import { jwtDecode } from 'jwt-decode';
import { getRoleForUiShell } from './roleHelpers';
// import React, {useEffect} from 'react';
// Function to get token from localStorage
const getToken = () => {
    const localStorageItem = localStorage.getItem('jwt')

    return localStorageItem
};

// Function to decode token
const decodeToken = () => {
    try {
        const token = getToken();
        // console.log("Token is  coming")
        if (!token) {
            return null;
        }
        return jwtDecode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Utility functions to get specific token data
export const getUserData = () => {
    const decoded = decodeToken();

    if (!decoded) return null;

    if(decoded.scope === "admin" || decoded.role_id === "admin") {
        decoded.scope = "Admin"
    }

    const roleId = decoded.role_id || decoded.scope;

    return {
        org_id :Number(decoded?.org_id) || 0,
        org_name : decoded.role_id || decoded.scope || "Admin",
        email:decoded.user_email || "",
        org_oneid: decoded.org_oneid,
        oneid: decoded.oneid,
        fullUsername: decoded.user_full_name,
        userEmail: decoded.user_email,
        fullDp: decoded.full_dp,
        roleId,
        uiShellRoleId: getRoleForUiShell(roleId),
        roleDbId: decoded.role_db_id,
        otherPermissions: decoded.other_permissions,
        oneIdRolePermissions: decoded.oneid_role_permissions,
        ///org_id :decoded?.org_data?._id || 1234,
        // org_name : decoded?.org_name || "Admin",
        // email:decoded?.user_email || "",
        ///org_oneid: decoded?.org_oneid,
        ///oneid: decoded?.oneid,
        // fullUsername: decoded?.full_username,
        // userEmail: decoded?.user_email,
        // fullDp: decoded?.full_dp,
        // roleId: decoded?.role_id,
        // roleDbId: decoded?.role_db_id,
        // otherPermissions: decoded?.other_permissions,
        // oneIdRolePermissions: decoded?.oneid_role_permissions
    };
};

export const getOrganizationData = () => {
    const decoded = decodeToken();
    if (!decoded) return null;

    return {
        orgOneid: decoded.org_oneid,
        orgName: decoded.org_name,
        ...decoded.org_data
    };
};

export const getTokenExpiration = () => {
    const decoded = decodeToken();
    if (!decoded) return null;

    return {
        issuedAt: new Date(decoded.iat * 1000),
        expiresAt: new Date(decoded.exp * 1000)
    };
};

export const isTokenValid = () => {
    const decoded = decodeToken();
    if (!decoded) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
};

// Export the base decode function as well
export const getDecodedToken = decodeToken;