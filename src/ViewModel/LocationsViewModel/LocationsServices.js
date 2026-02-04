import { create } from 'zustand';
import locationsApi from '../../Model/Data/Locations/Locations';

export const useLocations = create((set) => ({
    countries: [],
    loading: false,
    error: null,

    getAllCountries: async () => {
        try {
            set({ loading: true, error: null });
            const response = await locationsApi.getAllCountries();
            
            if (response.status === 200 && response.data.STATUS === 'SUCCESSFUL') {
                const countriesList = response.data.DB_DATA?.COUNTRIES_LIST || [];
                set({ countries: countriesList, loading: false });
                return countriesList;
            } else {
                set({ 
                    error: response.data?.ERROR_DESCRIPTION || 'Failed to fetch countries',
                    loading: false 
                });
                return [];
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
            set({ 
                error: error.message || 'Failed to fetch countries',
                loading: false 
            });
            return [];
        }
    },
}));

export default useLocations;

