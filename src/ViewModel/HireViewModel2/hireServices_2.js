import useStore from "../../Store/store"
import hireApi from "../../Model/Data/Hire/Hire_2"
import { showToast } from "../../Components/Toaster/Toaster"
import { useState } from "react"
import { axiosInstanceHire } from "../../Model/base"

const useHire_2 = () => {
    const get_vaccancy = useStore((state) => state.gettingAllVacanciesList);
    const allVacanciesList_data = useStore((state) => state.allVacanciesList_data);
    const get_allApplicants = useStore((state) => state.gettingAllApplicants);
    const get_applicants_data = useStore((state) => state.allApplicants_data);
    const get_vacanc_filter = useStore((state) => state.gettingVacancyFilters);
    const get_vacanc_filter_data = useStore((state) => state.vacancyFilters);
    const get_city = useStore((state) => state.get_city_all);
    const get_city_data = useStore((state) => state.get_city_all_data);
    const create_vacancy = useStore((state) => state.create_vacancy);
    const deleteVacancy = useStore((state) => state.deleteVacancy);
    const get_mark_def_data = useStore((state) => state.get_mark_def_data);
    const get_mark_def = useStore((state) => state.get_mark_def);
    const removeApplicantFromList = useStore((state) => state.removeApplicantFromList);

    // Local state management
    const [loading, setLoading] = useState(true);
    const [vacanciesList, setVacanciesList] = useState([]);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deactiveValues, setDeactiveValues] = useState({});
    const [countData, setcountData] = useState({});
    const [actionType, setActionType] = useState(''); // 'activate' or 'deactivate'

    // Pagination state (similar to employees)
    const [paginationData, setPaginationData] = useState({
        currentPage: 1,
        totalPages: 1,
        hasMore: false
    });

    // Store current filters to preserve them during pagination
    const [currentFilters, setCurrentFilters] = useState({});

    const getVacanciesWithFilters = async (filters = {}, pageNumber = null) => {
        try {
            setLoading(true);
            // Use pageNumber if provided, otherwise use page from filters or default to 1
            const targetPage = pageNumber !== null ? pageNumber : (filters.page || 1);
            
            // Merge with stored filters to preserve them during pagination
            const mergedFilters = {
                ...currentFilters,
                ...filters,
                page: targetPage
            };

            // Remove empty filters (but keep page)
            Object.keys(mergedFilters).forEach(key => {
                if (key !== 'page' && !mergedFilters[key]) {
                    delete mergedFilters[key];
                }
            });

            // Store filters for pagination navigation (without page number)
            const filtersToStore = { ...mergedFilters };
            delete filtersToStore.page;
            setCurrentFilters(filtersToStore);

            const response = await hireApi.getAllVacancies2(mergedFilters);
            
            if (response?.data?.STATUS === "SUCCESSFUL") {
                const newData = response.data.DB_DATA || {};
                setcountData(newData?.response || {});
                
                // Extract pagination info from response
                const pagination = newData.pagination || {};
                
                // Update pagination state
                setPaginationData({
                    currentPage: pagination.page || targetPage,
                    totalPages: pagination.pages || 1,
                    hasMore: pagination.page < pagination.pages
                });

                // Always replace data (no more "load more" - use Next/Previous instead)
                setVacanciesList(newData);
            } else {
                // If error or no data, set vacancies to empty structure
                setVacanciesList({
                    vacancies: [],
                    pagination: {
                        page: 1,
                        pages: 1
                    }
                });
                setPaginationData({
                    currentPage: 1,
                    totalPages: 1,
                    hasMore: false
                });
            }
        } catch (error) {
            console.error("Error fetching vacancies:", error);
            setVacanciesList({
                vacancies: [],
                pagination: {
                    page: 1,
                    pages: 1
                }
            });
            setPaginationData({
                currentPage: 1,
                totalPages: 1,
                hasMore: false
            });
        } finally {
            setLoading(false);
        }
    };

    // Function to go to next page (preserves current filters)
    const goToNextPage = () => {
        if (paginationData.currentPage < paginationData.totalPages) {
            getVacanciesWithFilters({}, paginationData.currentPage + 1);
        }
    };

    // Function to go to previous page (preserves current filters)
    const goToPreviousPage = () => {
        if (paginationData.currentPage > 1) {
            getVacanciesWithFilters({}, paginationData.currentPage - 1);
        }
    };

    // Function to go to a specific page (preserves current filters)
    const goToPage = (pageNumber) => {
        const targetPage = parseInt(pageNumber);
        if (targetPage >= 1 && targetPage <= paginationData.totalPages) {
            getVacanciesWithFilters({}, targetPage);
        }
    };
    // console.log('what is the data here', countData)
    const handleDeactivate = (ele, action = 'deactivate') => {
        setDeleteDialog(!deleteDialog);
        setDeactiveValues(ele);
        setActionType(action);
    };

    const handleDeactivateVac = async () => {
        try {
            setLoading(true);
            const response = await hireApi.deactiveVacancies(deactiveValues.id);
            if (response?.data?.STATUS === "SUCCESSFUL") {
                const successMessage = actionType === 'activate' ? "Vacancy activated successfully" : "Vacancy deactivated successfully";
                showToast(successMessage, "success");
                
                // Refresh the list with current status filter to stay in same list
                // If activating (DRAFT -> ACTIVE), stay in DRAFT list (status=0)
                // If deactivating (ACTIVE -> DRAFT), stay in ACTIVE list (status=1)
                const statusFilter = actionType === 'activate' ? "0" : "1";
                getVacanciesWithFilters({ status: statusFilter }, 1); // Reset to page 1 after status change
                
                setDeleteDialog(false);
            } else {
                const errorMessage = actionType === 'activate' ? "Failed to activate vacancy" : "Failed to deactivate vacancy";
                showToast(response?.data?.ERROR_DESCRIPTION || errorMessage, "error");
            }
        } catch (error) {
            console.error("Error updating vacancy status:", error);
            const errorMessage = actionType === 'activate' ? "Failed to activate vacancy" : "Failed to deactivate vacancy";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteVacancy = async (vacancy_id) => {
        try {
            setLoading(true);
            const response = await hireApi.deleteVacancy({ id: vacancy_id });
            const data = response.data;
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                // Remove the vacancy from local state
                setVacanciesList(prevData => {
                    if (prevData && prevData.vacancies) {
                        return {
                            ...prevData,
                            vacancies: prevData.vacancies.filter(vacancy => vacancy.id !== vacancy_id)
                        };
                    }
                    return prevData;
                });
                showToast('Vacancy deleted successfully', 'success');
                return true;
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to delete vacancy', 'error');
                return false;
            }
        } catch (error) {
            console.log(error);
            showToast(error.response?.data?.ERROR_DESCRIPTION || 'Error deleting vacancy');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        get_vaccancy,
        allVacanciesList_data: vacanciesList, // Use local state instead of store
        getVacanciesWithFilters,
        handleDeactivate,
        handleDeactivateVac,
        deleteDialog,
        deactiveValues,
        actionType,
        get_allApplicants,
        get_applicants_data,
        get_vacanc_filter,
        get_vacanc_filter_data,
        get_city,
        get_city_data,
        create_vacancy,
        deleteVacancy: handleDeleteVacancy, // Use local function instead of store function
        get_mark_def_data,
        get_mark_def,
        removeApplicantFromList,
        countData,
        loading, // Export loading state
        // Pagination functions and state
        paginationData,
        goToNextPage,
        goToPreviousPage,
        goToPage
    }
}

// API function
const getTalentPool = async (filters = {}) => {
    return axiosInstanceHire.request({
        method: 'GET',
        url: '/api/v1/applications/candidate/get_talent_pool',
        params: {
            page: filters.page || 1,
            gender: filters.gender || '',
            age_from: filters.age_from || '',
            age_to: filters.age_to || '',
            label_id: filters.label_id || '',
        }
    });
};

export const useTalentPoolServices = () => {
    const store = useStore();

    const getTalentPoolData = async (filters = {}) => {
        try {
            store.setTalentPoolLoading(true);
            store.setTalentPoolError(null);

            const response = await getTalentPool(filters);

            if (response.data.STATUS === 'SUCCESSFUL' && Array.isArray(response.data.DB_DATA)) {
                const data = response.data.DB_DATA;
                if (filters.page === 1) {
                    store.setTalentPool(data || []);
                } else {
                    store.setTalentPool([...store.allTalentPool, ...(data || [])]);
                }
                return { success: true, data };
            } else {
                store.setTalentPool([]);
                store.setTalentPoolError('No candidates found matching the criteria');
                return { success: false, error: 'No candidates found matching the criteria' };
            }
        } catch (error) {
            store.setTalentPool([]);
            store.setTalentPoolError('No candidates found matching the criteria');
            return { success: false, error: 'No candidates found matching the criteria' };
        } finally {
            store.setTalentPoolLoading(false);
        }
    };

    // const give_data = () => {
    //     return {
    //         get_rejected_app,
    //         get_rejected_app_data
    //     }
    // }

    return {
        getTalentPoolData,
        resetTalentPool: store.resetTalentPool,
        // countData
        // give_data
    };
};

export default useHire_2