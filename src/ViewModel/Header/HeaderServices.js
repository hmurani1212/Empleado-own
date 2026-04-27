import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router';
import SwitchAccessApi from '../../Model/Data/SwitchAccess/SwitchAccess';
import useStore from '../../Store/store';
import { clearReactQueryCache } from '../../queryClient';

const useHeader = () => {

    const [switchAccessMenu, setSwitchAccessMenu] = useState([])
    const [openMenuHeader, setOpenMenuHeader] = useState(false)
    const [loading, setLoading] = useState(false)
    const hasFetchedRef = useRef(false);
    
    // Get header data from Zustand store (already fetched by Header.jsx)
    const getHeaderData = useStore((state) => state.getHeaderData);

    const toggleMenuHeader = (isOpenHeader) => {
        setOpenMenuHeader(isOpenHeader);
    };

    const navigate = useNavigate()
      
    const handleInbox = ()=>{
        navigate('/inbox')
    }

    // Handle Switch Access click → Core module will redirect to OneID OAuth
    const handleSwitchAccessClick = (item) => {
        try {
            // Clear all localStorage before switching roles (new token will come from backend)
            clearReactQueryCache();
            localStorage.clear();
            
            const roleId = item?.role_id;
            const accessCredentials = item?.token; // use token as access_credentials
            const customRedirectUrl = window.location.origin; // return back to this app

            const url = SwitchAccessApi.buildSwitchAccessUrl({
                roleId,
                accessCredentials,
                customRedirectUrl
            });

            // Redirect to switch access endpoint (backend will redirect back with new token)
            window.location.href = url;
        } catch (error) {
            console.error('Error handling switch access:', error);
        }
    }

    // Function to transform header data instances to menu format
    const transformInstances = (headerData) => {
        if (!headerData || !headerData.instance) return [];
        
        return headerData.instance.map((instance, index) => ({
            id: instance.id || index,
            title: instance.role || 'Unknown',
            name: instance.name || '',
            org_type: instance.org_type || '',
            token: instance.token || '',
            oneid: instance.oneid || '',
            access_credentials: instance.access_credentials || '',
            app_name: instance.app_name || '',
            app_alpha_id: instance.app_alpha_id || '',
            app_id: instance.app_id || '',
            role_id: instance.role_id || '',
            login_callback_url: instance.login_callback_url || ''
        }));
    };

    // Fetch switch access instances from store data (no API call - data already fetched by Header.jsx)
    const fetchSwitchAccessInstances = () => {
        // Prevent duplicate processing
        if (hasFetchedRef.current && switchAccessMenu.length > 0) return;
        
        setLoading(true);
        
        try {
            if (getHeaderData && getHeaderData.instance) {
                const instances = transformInstances(getHeaderData);
                setSwitchAccessMenu(instances);
                hasFetchedRef.current = true;
            } else {
                setSwitchAccessMenu([]);
            }
        } catch (error) {
            setSwitchAccessMenu([]);
        } finally {
            setLoading(false);
        }
    };

    // Watch for header data changes and update switch access menu
    useEffect(() => {
        if (getHeaderData && getHeaderData.instance) {
            const instances = transformInstances(getHeaderData);
            setSwitchAccessMenu(instances);
            hasFetchedRef.current = true;
        }
    }, [getHeaderData]);

  return {
    openMenuHeader, 
    toggleMenuHeader,
    switchAccessMenu,
    handleInbox,
    handleSwitchAccessClick,
    loading,
    fetchSwitchAccessInstances
  }
}

export default useHeader