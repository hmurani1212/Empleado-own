import { useEffect, useRef, useState } from "react";
import useStore from "../../Store/store"
import PolicyUsers from "../../View/HRPolicies/PolicyUsers";
import ViewPolicy from "../../View/HRPolicies/ViewPolicy";
import hrPoliciesApi from "../../Model/Data/HRPolicies/HRPolicies";
import { showToast } from "../../Components/Toaster/Toaster";
import { FaPencilAlt, FaTrash, FaEye, FaUser, FaCopy } from "react-icons/fa";
import { FaClock, FaMapMarkerAlt, FaBan, FaFile, FaFingerprint, FaExchangeAlt } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa6";
import EditPolicy from "../../View/HRPolicies/EditPolicy";
import useCreatePolicies from "./createHrPoliciesServices";
import { useNavigate } from "react-router";
import { useDebounce } from "../../services/__debounceServices";

const useHRPolicies = () => {
    const getAllBranchesHrPolicy = useStore((state) => state.getAllBranchesHrPolicy)
    const policyBranches = useStore((state) => state.policyBranches)
    const policyDepartments = useStore((state) => state.policyDepartments)
    const getAllHrPolicies = useStore((state) => state.getAllHrPolicies)
    const allPolicies = useStore((state) => state.allPolicies)
    const allPolicyUsers = useStore((state) => state.allPolicyUsers)
    const mountPolicies = useStore((state) => state.mountPolicies)
    const closeDrawer = useStore((state) => state.closeDrawer)
    const openDrawer = useStore((state) => state.openDrawer)
    const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
    const settingComponent = useStore((state) => state.settingComponent)
    const settingDrawerSize = useStore((state) => state.settingDrawerSize)
    const getPoliciesUsedBy = useStore((state) => state.getPoliciesUsedBy)
    const hrPoliciesSearch = useStore((state) => state.hrPoliciesSearch)
    const filterHrPolicyList = useStore((state) => state.filterHrPolicyList)
    const gettingPolicyView = useStore((state) => state.gettingPolicyView)
    const viewPolicy = useStore((state) => state.viewPolicy)
    const statusChangePolicy = useStore((state) => state.statusChangePolicy)
    const settingHrPoliciesByBranch = useStore((state) => state.settingHrPoliciesByBranch)
    const handleUpdatePolicy = useStore((state) => state.handleUpdatePolicy)
    const getNextPolicies = useStore((state) => state.getNextPolicies)
    const gettingPolicyForSwap = useStore((state) => state.gettingPolicyForSwap)
    const allPoliciesForSwap = useStore((state) => state.allPoliciesForSwap)
    const [listViewHr, setListViewHr] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const hrPolicyExtraObject = useStore((state) => state.hrPolicyExtraObject)

    // Get pagination data from store
    const getPaginationData = () => {
        const storeState = useStore.getState();
        return {
            currentPage: storeState.hrPolicyExtraObject?.currentPage || 1,
            totalPages: storeState.hrPolicyExtraObject?.totalPages || 1,
            hasMore: storeState.hrPolicyExtraObject?.pageCount || false
        };
    };

    // Get current branch and status from state
    const getCurrentFilters = () => {
        return {
            branchId: filterValuesHr?.branchId || null,
            status: settingStatus
        };
    };

    // Function to go to next page
    const goToNextPage = async () => {
        const paginationData = getPaginationData();
        const filters = getCurrentFilters();
        if (paginationData.currentPage < paginationData.totalPages) {
            setIsLoadingMore(true);
            try {
                await getAllHrPolicies(filters.branchId, filters.status, paginationData.currentPage + 1);
            } catch (error) {
                console.error('Error loading next page:', error);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    // Function to go to previous page
    const goToPreviousPage = async () => {
        const paginationData = getPaginationData();
        const filters = getCurrentFilters();
        if (paginationData.currentPage > 1) {
            setIsLoadingMore(true);
            try {
                await getAllHrPolicies(filters.branchId, filters.status, paginationData.currentPage - 1);
            } catch (error) {
                console.error('Error loading previous page:', error);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    // Function to go to a specific page
    const goToPage = async (pageNumber) => {
        const targetPage = parseInt(pageNumber);
        const paginationData = getPaginationData();
        const filters = getCurrentFilters();
        if (targetPage >= 1 && targetPage <= paginationData.totalPages) {
            setIsLoadingMore(true);
            try {
                await getAllHrPolicies(filters.branchId, filters.status, targetPage);
            } catch (error) {
                console.error('Error loading page:', error);
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    // Load more function for pagination (deprecated - kept for backward compatibility)
    const handleLoadMore = async () => {
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            console.log('Loading more policies, page:', nextPage);

            // Call the store function to get next page
            await getNextPolicies();
            setCurrentPage(nextPage);

            // Check if there are more pages based on the store state
            const storeState = useStore.getState();
            const hasMorePages = storeState.hrPolicyExtraObject.pageCount;
            setHasMore(hasMorePages);

        } catch (error) {
            console.error('Error loading more policies:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Update pagination state when policies change
    const updatePaginationState = () => {
        const storeState = useStore.getState();
        const hasMorePages = storeState.hrPolicyExtraObject.pageCount;
        setHasMore(hasMorePages);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const { settingFormData, setnewHrPolicesValues } = useCreatePolicies()

    const triggerRefs = useRef([]);
    const hrPoliciesScrollRef = useRef(null)

    const hrPoliciesMenu = [
        { id: 1, title: 'Manage Policies', link: '/hrpolicies/manage_policies' },
        { id: 2, title: 'Create New', link: '/hrpolicies/create_new' },
        { id: 3, title: 'Swap Policies', link: '/hrpolicies/swap_policies' }
    ]

    const hrPoliciesItems = [
        { id: 1, title: 'Edit', icon: <FaPencilAlt className="text-green-500" /> },
        { id: 2, title: 'View', icon: <FaEye className="text-yellow-500" /> },
        { id: 3, title: 'Deactivate', icon: <FaTrash className="text-red-500" /> },
        { id: 4, title: 'Activate', icon: <FaTrash className="text-green-600" /> },
        { id: 5, title: 'Policy Used By', icon: <FaUser className="text-[#2ABFCC]" /> },
        { id: 6, title: 'Copy', icon: <FaCopy className="text-[#2ABFCC]" /> }
    ]

    const viewPolicyData = [
        { id: 1, title: 'Force Time out', icon: <FaBan />, data: `${parseInt(viewPolicy.force_timeout || 0)} minutes after closing time` },
        { id: 2, title: 'Leniency Time', icon: <FaClock />, data: `${viewPolicy.leniency_time} min` },
        { id: 3, title: 'Early Arrival Policy', icon: <FaMapMarkerAlt />, data: viewPolicy.early_arrival === '1' ? 'Shifting Time' : 'Count Actual Time' },
        { id: 4, title: 'Max Early Arrival Time', icon: <FaClock />, data: `${viewPolicy.early_arrival_max_time} min` },
        { id: 5, title: 'Working Days', icon: <FaBriefcase />, data: viewPolicy.working_days ? viewPolicy.working_days.split(',').map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ') : '' },
        { id: 6, title: 'Timeout Policy', icon: <FaBan />, data: viewPolicy.timeout_policy === '0' ? 'Mark as absent' : viewPolicy.timeout_policy === '1' ? 'Present' : viewPolicy.timeout_policy === '2' ? 'Count Half Day' : 'Count one hour' },
        { id: 7, title: 'Late Min Monthly Bucket', icon: <FaClock />, data: `${viewPolicy.late_time_in_minutes} min` },
        { id: 8, title: 'Late Comers Penalty', icon: <FaClock />, data: `Late minutes x ${viewPolicy.late_comers_penalty}` },
        { id: 9, title: 'Allowed Leaves', icon: <FaClock />, data: `${viewPolicy.allowed_offs} day(s)` },
        { id: 10, title: 'Leave Assigned Group', icon: <FaFile />, data: viewPolicy?.leave_group?.group_title || 'Not Assigned' },
        {
            id: 11, title: 'Duty Duration', icon: <FaClock />, data: (() => {
                if (!viewPolicy.starting_time || !viewPolicy.closing_time) return '0 hrs';
                const start = viewPolicy.starting_time.split(':').map(Number);
                const end = viewPolicy.closing_time.split(':').map(Number);
                const startMinutes = start[0] * 60 + start[1];
                const endMinutes = end[0] * 60 + end[1];
                const diffMinutes = endMinutes - startMinutes;
                const hours = Math.floor(diffMinutes / 60);
                const minutes = diffMinutes % 60;
                return minutes > 0 ? `${hours}.${Math.round(minutes / 6)} hrs` : `${hours} hrs`;
            })()
        },
        { id: 12, title: 'Biometric Machine', icon: <FaFingerprint />, data: viewPolicy.use_multi_devices === '1' ? 'Multiple Machines' : 'Single Machine' },
        { id: 13, title: 'Minimum Overtime required', icon: <FaClock />, data: `${viewPolicy.overtime_min_minutes} minutes(s)` },
        {
            id: 14, title: 'Daily Overtime', icon: <FaClock />, data: (() => {
                const otPay = viewPolicy.overtime_pay?.toLowerCase() || '';
                return (otPay === 'unpaid' || otPay === '0' || otPay === '' || viewPolicy.overtime_pay === 0) ? 'Unpaid' : 'Paid';
            })()
        },
        {
            id: 15, title: 'Daily Overtime Rate', icon: <FaClock />, data: (() => {
                const rate = viewPolicy.overtime_rules?.daily_ot_rate;
                // 0 = Fixed Rate, 1 = Equal Salary/Hour, 2 = Salary/Hour * X, 3 = unpaid, 4 = Salary/Day
                if (rate === 0 || rate === '0') return 'Fixed Rate';
                if (rate === 1 || rate === '1') return 'Equal Salary/Hour';
                if (rate === 2 || rate === '2') return 'Salary/Hour * X';
                if (rate === 3 || rate === '3') return 'Unpaid';
                if (rate === 4 || rate === '4') return 'Salary/Day';
                return rate !== undefined && rate !== null ? rate : 'Not Set';
            })()
        },
        { id: 16, title: 'Policy Swap', icon: <FaExchangeAlt />, data: viewPolicy.swap_policy === '[]' ? viewPolicy.swap_policy : 'null' },
        {
            id: 17, title: 'Holiday Overtime', icon: <FaClock />, data: (() => {
                const rate = viewPolicy.overtime_rules?.holiday_ot_rate;
                // 0 = Unpaid, anything else = Paid
                if (rate === 0 || rate === '0' || rate === null || rate === undefined || rate === '') return 'Unpaid';
                return 'Paid';
            })()
        },
        {
            id: 18, title: 'Holiday Overtime Rate', icon: <FaClock />, data: (() => {
                const rate = viewPolicy.overtime_rules?.holiday_ot_rate;
                // 0 = Unpaid, 1 = Equal Salary/Hour, 2 = Fixed Rate/Hour, 3 = Fixed Rate/Day, 4 = Salary/Hour * X, 5 = Equal Salary/Day
                if (rate === 0 || rate === '0') return 'Unpaid';
                if (rate === 1 || rate === '1') return 'Equal Salary/Hour';
                if (rate === 2 || rate === '2') return 'Fixed Rate/Hour';
                if (rate === 3 || rate === '3') return 'Fixed Rate/Day';
                if (rate === 4 || rate === '4') return 'Salary/Hour * X';
                if (rate === 5 || rate === '5') return 'Equal Salary/Day';
                return 'Not Set';
            })()
        },
        { id: 19, title: 'Pay Schedule', icon: <FaFile />, data: viewPolicy.pay_schedule?.pay_month || viewPolicy.pay_month || '-' },
        { id: 20, title: 'Overtime Due Minutes', icon: <FaFile />, data: `${viewPolicy.overtime_due_minutes} min` },
    ]

    const handleListToggleHr = () => {
        setListViewHr(true)
    }

    const handleGridToggle = () => {
        setListViewHr(false)
    }

    const [openMenu, setOpenMenu] = useState({})
    const toggleMenuHrPolicies = (index, isOpen) => {
        setOpenMenu((prevOpenMenu) => ({
            ...prevOpenMenu,
            [index]: isOpen
        }))
    }

    const handlePolicyUsers = async () => {
        openDrawer()
        settingDrawerSize(620)
        settingDrawerTitle('Policy Users')
        settingComponent(<PolicyUsers
        />)

    }

    const handlePolicyView = async () => {
        openDrawer()
        settingDrawerSize(620)
        settingDrawerTitle('View Policy')
        settingComponent(<ViewPolicy
        />)
    }

    const [openDialog, setOpenDialog] = useState(false)
    const handleStatusHrPolicy = () => {
        setOpenDialog(!openDialog)

    }


    const handlePolicyEdit = async (policy) => {
        console.log('data', policy.id)
        const data = { id: policy.id }
        try {
            const response = await hrPoliciesApi.getSinglePolicyForEdit(data);
            // console.log('response', response)
            const respData = response.data
            if (response.status === 200 && response.data.STATUS === 'SUCCESSFUL') {
                openDrawer()
                settingDrawerSize(620)
                settingDrawerTitle('Edit Policy')
                settingComponent(<EditPolicy
                    data={policy}
                    enableLeaveGroup={respData.enableLeaveGroup}
                    leave_groups={respData.leave_groups}

                />)
            }
            // console.log('response', response)
        } catch (err) {

        }


    }



    const [hrPoliciesId, setHrPoliciesId] = useState('')
    const handleMenuItemsHrPolicies = async (id, ele, policyStatus) => {
        // console.log('pStatus', policyStatus)
        // console.log('Policies', ele)
        switch (id) {
            case 1:
                handlePolicyEdit(ele)
                setHrPoliciesId(ele.id)
                break;

            case 2:
                console.log('View')
                handlePolicyView(ele)
                gettingPolicyView(ele.id)
                break;

            case 3:
                console.log('Delete')
                handleStatusHrPolicy(ele)
                setHrPolicyStatusValue((prevState) => ({
                    ...prevState,
                    id: ele,
                    pstatus: policyStatus,
                }))
                break;

            case 5:
                console.log('Policy users')
                // Check if policy is deactivated (status = 0)
                if (policyStatus === 0) {
                    showToast('This policy is deactivated and not in use', 'error')
                    return
                }

                // Check API response before opening drawer
                const policyUsersResult = await getPoliciesUsedBy(ele.id)
                if (policyUsersResult.success) {
                    handlePolicyUsers(ele)
                } else {
                    showToast(policyUsersResult.error || 'Policy is not in use', 'error')
                }

                break;

            case 6:
                gettingSinglePolicy(ele)
                break;

            default:
                console.log("Default case")
        }
    }



    const navigate = useNavigate()

    const [copyData, setCopyData] = useState({
        state: false,
        data: {}
    })

    const gettingSinglePolicy = (data) => {
        // console.log(data)
        // Use the existing policy data directly instead of making API call
        try {
            // Navigate directly with the policy data
            navigate('/hrpolicies/create_new', { state: { formData: data } });
        } catch (err) {
            console.log(err)
        }
    }

    const [hrPolicySearch, setHrPolicySearch] = useState({ search: '' })

    const handlePoliciesChange = (e) => {
        const { name, value } = e.target
        setHrPolicySearch((prevState) => ({
            ...prevState,
            [name]: value
        }))

        // Debounced search with 3 seconds delay
        debouncedSearch(value, branchId, settingStatus)
    }

    // Debounced search function with 500ms delay using useDebounce hook
    const debouncedSearch = useDebounce(async (searchTerm, branchId, status) => {
        console.log('Search triggered with:', { searchTerm, branchId, status })

        if (searchTerm.trim() === '') {
            // If search is empty, get all policies without search
            console.log('Search empty, getting all policies')
            getAllHrPolicies(branchId, status)
            updatePaginationState()
        } else {
            try {
                console.log('Searching policies with term:', searchTerm)
                const response = await hrPoliciesApi.gettingAllPolicies(branchId, status, 0, searchTerm)
                const data = response.data

                console.log('Search response:', response)

                if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                    settingHrPoliciesByBranch(data.DB_DATA)
                    // For search results, we don't know pagination info, so disable load more
                    setHasMore(false)
                } else {
                    settingHrPoliciesByBranch([])
                    setHasMore(false)
                }
            } catch (error) {
                console.error('Error searching policies:', error)
                settingHrPoliciesByBranch([])
                setHasMore(false)
            }
        }
    }, 500) // 500ms debounce (less than 1 second)

    const [filterValuesHr, setFilterValuesHr] = useState({
        branchId: '',
        branchName: ''
    })

    const handleFilterChangePolicy = (name, selectedValue) => {
        console.log('handleFilterChangePolicy called with:', { name, selectedValue });

        // Handle "All Branches" case (empty value or empty string)
        if (!selectedValue || selectedValue === "" || (typeof selectedValue === 'string' && selectedValue === "")) {
            console.log('Clearing branch filter');
            setFilterValuesHr((prevState) => ({
                ...prevState,
                branchName: "",
                branchId: "",
            }));
            // Get all policies with current status filter but no branch filter
            getAllHrPolicies(null, settingStatus, 1);
        } else {
            console.log('Setting branch filter for:', selectedValue);
            setFilterValuesHr((prevState) => ({
                ...prevState,
                branchName: selectedValue.branch_name,
                branchId: selectedValue.id,
            }));
            // Get policies with both status and branch filters
            getAllHrPolicies(selectedValue.id, settingStatus, 1);
        }
    }

    const [hrPolicyStatusValue, setHrPolicyStatusValue] = useState({
        id: '',
        pstatus: ''
    }
    )

    const refreshPoliciesAfterStatusChange = async () => {
        const currentBranchId = branchId || null
        const searchValue = typeof hrPolicySearch?.search === 'string'
            ? hrPolicySearch.search.trim()
            : ''

        try {
            if (searchValue) {
                const response = await hrPoliciesApi.gettingAllPolicies(currentBranchId, settingStatus, 1, searchValue)
                const data = response.data

                if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                    settingHrPoliciesByBranch(data.DB_DATA)
                } else {
                    settingHrPoliciesByBranch([])
                }

                setHasMore(false)
                setCurrentPage(1)
            } else {
                await getAllHrPolicies(currentBranchId, settingStatus)
                updatePaginationState()
            }
        } catch (error) {
            console.error('Error refreshing policies after status change:', error)
        }
    }

    const handleHrPolicyStatus = async () => {
        const statusDataPolicy = {
            id: hrPolicyStatusValue.id,
            pstatus: hrPolicyStatusValue.pstatus
        }

        try {
            const response = await hrPoliciesApi.statusChangeHrPolicy(statusDataPolicy)
            const data = response.data
            ////console.log('status change data', data)

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                statusChangePolicy(statusDataPolicy)
                const actionMessage = statusDataPolicy.pstatus === 0 ? 'Policy deactivated successfully' : 'Policy activated successfully'
                showToast(actionMessage, 'success')
                await refreshPoliciesAfterStatusChange()
                setOpenDialog(false)
            } else {
                showToast(`${data.ERROR_DESCRIPTION}`, 'error')
                setOpenDialog(false)
            }
        } catch (error) {
            showToast(`${error?.response?.data?.ERROR_DESCRIPTION}`, 'error')
            console.log(error)
        }
    }

    const [settingStatus, setSettingStatus] = useState(1) // Default to active policies (status = 1)
    const statusPolicies = (val) => {
        setIsChecked(val)
        const status = val ? 0 : 1; // 0 for inactive, 1 for active
        setSettingStatus(status)

        // Clear search when status changes
        setHrPolicySearch({ search: '' })

        // Get policies with current branch filter and new status
        const currentBranchId = branchId || null
        getAllHrPolicies(currentBranchId, status, 1);
        updatePaginationState()

        console.log('Status filter - Active:', !val, 'Inactive:', val, 'Branch:', currentBranchId);
    }

    const [isChecked, setIsChecked] = useState(false)

    const handleCheckbox = () => {
        setIsChecked(!isChecked)
    }

    const [branchId, setBranchId] = useState(null)

    const selectBranchHandler = async (branch_id) => {
        if (!branch_id || branch_id === 'all') {
            // No branch selected or "All Branches" selected, get all policies with only status
            setBranchId(null)
            console.log('All branches selected, getting all policies with status:', settingStatus)

            // Clear search when branch changes
            setHrPolicySearch({ search: '' })

            try {
                const response = await hrPoliciesApi.gettingAllPolicies(null, settingStatus)
                const resData = response.data

                console.log("No branch filter response:", response)

                if (response.status === 200 && resData.STATUS === "SUCCESSFUL") {
                    settingHrPoliciesByBranch(resData.DB_DATA)
                    updatePaginationState()
                } else {
                    settingHrPoliciesByBranch([])
                    setHasMore(false)
                }
            } catch (err) {
                console.error('Error getting policies without branch filter:', err)
                settingHrPoliciesByBranch([])
                setHasMore(false)
            }
            return
        }

        const selectedBranchId = branch_id.id || parseInt(branch_id)
        setBranchId(selectedBranchId)

        console.log('Selected branch ID:', selectedBranchId)
        console.log('Current status:', settingStatus)

        // Clear search when branch changes
        setHrPolicySearch({ search: '' })

        try {
            const response = await hrPoliciesApi.gettingAllPolicies(selectedBranchId, settingStatus)
            const resData = response.data

            console.log("Branch filter response:", response)

            if (response.status === 200 && resData.STATUS === "SUCCESSFUL") {
                settingHrPoliciesByBranch(resData.DB_DATA)
                updatePaginationState()
            } else {
                settingHrPoliciesByBranch([])
                setHasMore(false)
            }

        } catch (err) {
            console.error('Error filtering by branch:', err)
            settingHrPoliciesByBranch([])
        }

    }




    const [scrollPosition, setScrollPosition] = useState(0);

    const handleScroll = () => {
        if (hrPoliciesScrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = hrPoliciesScrollRef.current;
            const buffer = 5; // Define your buffer size in pixels
            const isScrollAtBottom = scrollTop + clientHeight >= scrollHeight - buffer;

            setScrollPosition(scrollTop);
            if (isScrollAtBottom) {
                getNextPolicies();
            }
        }
    };

    const debouncedHandleScroll = useDebounce(handleScroll, 200); // Adjust debounce wait time as needed

    useEffect(() => {
        const scrollElement = hrPoliciesScrollRef.current;

        if (scrollElement) {
            scrollElement.addEventListener('scroll', debouncedHandleScroll, { passive: true });
        }

        return () => {
            if (scrollElement) {
                scrollElement.removeEventListener('scroll', debouncedHandleScroll);
            }
        };
    }, [debouncedHandleScroll]);

    // Initialize pagination state when component mounts
    useEffect(() => {
        updatePaginationState();
    }, []);

    // Subscribe to store changes to update hasMore when policies are loaded
    useEffect(() => {
        if (hrPolicyExtraObject?.pageCount !== undefined) {
            setHasMore(hrPolicyExtraObject.pageCount);
        }
    }, [hrPolicyExtraObject?.pageCount]);





    // Function to clear all filters and reset to default state
    const clearAllFilters = () => {
        setBranchId(null)
        setSettingStatus(1)
        setIsChecked(false)
        setHrPolicySearch({ search: '' })
        getAllHrPolicies(null, 1, 1) // Get all active policies
        updatePaginationState()
        console.log('All filters cleared, reset to default state')
    }

    return {
        hrPoliciesMenu, listViewHr, handleListToggleHr, handleGridToggle, allPolicies, toggleMenuHrPolicies, handleMenuItemsHrPolicies, openMenu, hrPoliciesItems, hrPoliciesId, mountPolicies, getAllHrPolicies, allPolicyUsers,
        hrPolicySearch, handlePoliciesChange, getAllBranchesHrPolicy, policyBranches, policyDepartments, filterValuesHr, handleFilterChangePolicy, viewPolicy, handleHrPolicyStatus, handleStatusHrPolicy, openDialog, statusPolicies, handleCheckbox,
        isChecked, hrPolicyStatusValue, viewPolicyData, triggerRefs, selectBranchHandler, closeDrawer, handleUpdatePolicy,
        hrPoliciesScrollRef, gettingPolicyForSwap, allPoliciesForSwap, copyData, clearAllFilters, handleLoadMore, hasMore, isLoadingMore, currentPage, goToNextPage, goToPreviousPage, goToPage, getPaginationData
    }

}

export default useHRPolicies;
