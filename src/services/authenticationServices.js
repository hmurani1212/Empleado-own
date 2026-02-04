import { getUserData } from '../Authentication/jwt_decode';
import { getLocalStorage } from '../Authentication/localStorageServices';

const authenticationServices = (set, get) => ({
    authRole: 'Admin', // Default fallback
    userData: null,
    
    // Function to set auth role based on JWT token
    setAuthRoleFromToken: () => {
        const userData = getUserData();
        const role = userData?.roleId || 'Employee';
        set({ authRole: role });
        return role;
    },
    
    // Function to get current auth role
    getAuthRole: () => {
        const userData = getUserData();
        return userData?.roleId || 'Employee';
    },

    // Function to check authentication
    checkAuthentication: () => {
        try {
            const token = getLocalStorage();
            if (!token) {
                set({ isAuthenticated: false });
                return false;
            }
            
            // Check if token is valid (not expired)
            const userData = getUserData();
            if (!userData) {
                set({ isAuthenticated: false });
                return false;
            }
            
            set({ isAuthenticated: true });
            return true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            set({ isAuthenticated: false });
            return false;
        }
    },

    // Function to get user data from token
    getUserDataFromToken: () => {
        try {
            const userData = getUserData();
            if (userData) {
                set({ 
                    userData: userData,
                    authRole: userData.roleId || 'Employee'
                });
                return userData;
            }
            return null;
        } catch (error) {
            console.error('Error getting user data from token:', error);
            return null;
        }
    },

    // Logout function
    logout: () => {
        localStorage.removeItem('jwt');
        // Clear all localStorage items related to user session
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key !== 'jwt') {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        set({ 
            isAuthenticated: false, 
            authRole: 'Employee',
            userData: null 
        });
        window.location.href = '/login';
    }
})


export default authenticationServices