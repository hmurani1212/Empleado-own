import { showToast } from '../../Components/Toaster/Toaster';
import departmentsApi from '../../Model/Data/Departments/Departments';
import employeesApi from '../../Model/Data/Departments/Departments';
import noticesApi from '../../Model/Data/Notices/Notices';

const noticeViewModel = (set, get) => ({
    noticesDepartment: [],
    noticesBranches : [],
    filterDepartmentsNotices: [],
    allNoticesList: [],
    noticeMount: false,
    viewNoticeData : [],
    departmentsLoading: false,
    departmentsLoaded: false,
    noticesPagination: {
        currentPage: 1,
        totalPages: 1,
        hasMore: false
    },
    // copyAllNoticesList : [],

    getAllDepartmentsNotices: async () => {
        // Check if departments are already loaded and cached
        const currentState = get();
        if (currentState.departmentsLoaded && currentState.noticesDepartment.length > 0) {
            return;
        }

        // Set loading state
        set({ departmentsLoading: true });

        try {
            const response = await departmentsApi.gettingAllDepartments();
            const employees = await employeesApi.getAllEmployees();
            const data = response.data

            if(response.status === 200 && data.STATUS === "SUCCESSFUL"){
                const branches = data.DB_DATA.branches
                const ownObjectBranches = {id: '0', branch_name: 'All Branches'}

                // Fetch departments for all branches in parallel for better performance
                const departmentPromises = branches.map(async (branch) => {
                    try {
                        const deptResponse = await departmentsApi.manageDepartments(branch.id);
                        if(deptResponse.status === 200 && deptResponse.data.STATUS === "SUCCESSFUL") {
                            const branchDepartments = deptResponse.data.DB_DATA.departments || [];
                            // Add branch_id to each department for filtering
                            return branchDepartments.map(dept => ({
                                ...dept,
                                branch_id: branch.id,
                                branch_name: branch.branch_name
                            }));
                        }
                        return [];
                    } catch (branchError) {
                        return [];
                    }
                });

                // Wait for all API calls to complete in parallel
                const departmentResults = await Promise.all(departmentPromises);

                // Flatten the results into a single array
                let allDepartments = [{id: '0', name: 'All Departments'}];
                allDepartments = [...allDepartments, ...departmentResults.flat()];

                const updatedBranches = [ownObjectBranches, ...branches];

                set({
                    noticesDepartment: allDepartments,
                    noticesBranches: updatedBranches,
                    departmentsLoading: false,
                    departmentsLoaded: true
                })
            } else {
                set({ departmentsLoading: false });
            }
        } catch (err) {
            set({ departmentsLoading: false });
        }

    },

    noticesFilterBranches:(id)=>{
        // Always include "All Departments" option
        const allDepartmentsOption = {id: '0', name: 'All Departments'};
        
        // If "All Branches" is selected (id === '0'), show all departments
        // Otherwise, filter departments by the selected branch but always include "All Departments"
        const filteredDepartments = id === '0' || id === 0 || !id
            ? get().noticesDepartment
            : get().noticesDepartment.filter(data => data.branch_id === id || data.id === '0')
        set({filterDepartmentsNotices: filteredDepartments})
    },

    deleteNotice: (id) => {
        set({
            allNoticesList: get().allNoticesList.filter(branch => branch.id !== id),
            // // copyAllNoticesList: get().copyAllNoticesList.filter(branch => branch.id !== id),
        });
    },

    getAllNoticesList: async (params = {}, forceReload = false, loadMore = false) => {
        try{
            const currentState = get();
            
            // Build API parameters with defaults
            const finalParams = {
                page: params.page !== undefined ? params.page : 1,
                limit: params.limit !== undefined ? params.limit : 10,
                ...params
            };
            
            const response = await noticesApi.listNotice(finalParams);
            const data = response.data

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                const notices = data.DB_DATA?.notices || [];
                const pagination = data.DB_DATA?.pagination || {};
                
                // Calculate hasMore based on pagination
                const hasMore = pagination.current_page < pagination.total_pages;
                
                // If loading more, append to existing list, otherwise replace
                if (loadMore && currentState.allNoticesList && currentState.allNoticesList.length > 0) {
                    set({
                        allNoticesList: [...currentState.allNoticesList, ...notices],
                        noticesPagination: {
                            currentPage: pagination.current_page || 1,
                            totalPages: pagination.total_pages || 1,
                            hasMore: hasMore
                        }
                    });
                } else {
                    set({
                        allNoticesList: notices,
                        noticesPagination: {
                            currentPage: pagination.current_page || 1,
                            totalPages: pagination.total_pages || 1,
                            hasMore: hasMore
                        }
                    });
                }
            } else {
                // On error, preserve existing data if loading more
                if (!loadMore) {
                    set({
                        allNoticesList: [],
                        noticesPagination: {
                            currentPage: 1,
                            totalPages: 1,
                            hasMore: false
                        }
                    });
                }
            }
        } catch (err) {
            console.log(err);
            // On error, preserve existing data if loading more
            if (!loadMore) {
                set({
                    allNoticesList: [],
                    noticesPagination: {
                        currentPage: 1,
                        totalPages: 1,
                        hasMore: false
                    }
                });
            }
        }
    },

    handleNoticeMount:()=>{
        set({noticeMount:true})
    },

    getViewNotice: async(id) => {
        try{
            const response = await noticesApi.viewNotice({id:id});
            const viewData = response.data

            if(response.status === 200 && viewData.STATUS === 'SUCCESSFUL') {
                set ({viewNoticeData: viewData.DB_DATA})
               
            }
        } catch (err) {
            console.log(err)
        }
    },
    addNewNoticeState:(data)=>{
        set({
            allNoticesList: [...new Set([data, ...get().allNoticesList])],
            
        })

    },
   



    getFilterNotice: async(branch_id, deptt_id, year, page = 1, limit = 10, loadMore = false)=>{
        const currentState = get();
        const apiData = {
            page: page,
            limit: limit
        }
        
        // Only add parameters if they have values
        if(branch_id && branch_id !== '' && branch_id !== '0') {
            apiData.branch_id = branch_id
        }
        if(deptt_id && deptt_id !== '' && deptt_id !== '0') {
            apiData.deptt_id = deptt_id
        }
        if(year && year !== '') {
            apiData.year = year
        }
        
        try {
            const response = await noticesApi.listNotice(apiData)
            const data = response.data
            console.log("response of the filter", response)

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                // Check if the response has notices array
                const notices = data.DB_DATA?.notices || data.DB_DATA || []
                const pagination = data.DB_DATA?.pagination || {};
                
                // Calculate hasMore based on pagination
                const hasMore = pagination.current_page < pagination.total_pages;
                
                // If loading more, append to existing list, otherwise replace
                if (loadMore && currentState.allNoticesList && currentState.allNoticesList.length > 0) {
                    set({
                        allNoticesList: [...currentState.allNoticesList, ...notices],
                        noticesPagination: {
                            currentPage: pagination.current_page || 1,
                            totalPages: pagination.total_pages || 1,
                            hasMore: hasMore
                        }
                    });
                } else {
                    set({
                        allNoticesList: notices,
                        noticesPagination: {
                            currentPage: pagination.current_page || 1,
                            totalPages: pagination.total_pages || 1,
                            hasMore: hasMore
                        }
                    });
                }
            }else{
                const error = data.ERROR_DESCRIPTION || 'No notices found for selected filters'
                showToast(error, 'error')
                // On error, preserve existing data if loading more
                if (!loadMore) {
                    set({
                        allNoticesList: [],
                        noticesPagination: {
                            currentPage: 1,
                            totalPages: 1,
                            hasMore: false
                        }
                    });
                }
            }
            
        } catch (error) {
            // console.error('Filter Error:', error)
            // showToast('Error filtering notices', 'error')
            // On error, preserve existing data if loading more
            if (!loadMore) {
                set({
                    allNoticesList: [],
                    noticesPagination: {
                        currentPage: 1,
                        totalPages: 1,
                        hasMore: false
                    }
                });
            }
        }
    }

})
 
export default noticeViewModel