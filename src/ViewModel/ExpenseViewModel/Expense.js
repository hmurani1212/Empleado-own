import { showToast } from "../../Components/Toaster/Toaster";
import expenseApi from "../../Model/Data/Expense/ExpenseApi";
import employeesApi from "../../Model/Data/Employees/Employees";

const expenseViewModel = (set, get) => ({
    expenseData: {
        cardData: {
            pending_approvals: 0,
            total_budget: 0,
            total_expenses: 0,
            expense_amount: 0
        },
        graphData: {
            year: new Date().getFullYear(),
            data: [],
            summary: {
                total_year_expenses: 0,
                total_year_approved: 0,
                total_pending_count: 0
            }
        },
        recentActivities: {
            period: "this week",
            activities: [],
            total_count: 0
        },
        tableData: {
            data: [],
            pagination: {
                current_page: 1,
                total_pages: 1,
                total_count: 0,
                per_page: 20,
                has_next_page: false,
                has_prev_page: false,
                next_page: null,
                prev_page: null
            }
        }
    },
    // dashboard list/graph fetch — start true so first paint shows skeletons (not empty states)
    loading: true,
    loadMoreLoading: false,
    addExpenseLoading: false,
    error: null,
    pendingApprovals: [],
    pendingApprovalsLoading: false,

    // Employee data for Settlement form
    allEmployees: [],
    employeesLoading: false,

    // Expense detail modal state
    selectedExpenseDetail: null,
    isLoadingExpenseDetail: false,

    // Get expense dashboard data
    getExpenseDashboardData: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await expenseApi.getExpenseListDAT(params);
            const respData = response.data;

            if (respData.STATUS === 'SUCCESSFUL') {
                // Transform the API response to match our expected structure
                const transformedData = {
                    cardData: respData.DB_DATA.CARD_DATA,
                    graphData: respData.DB_DATA.GRAPH_DATA,
                    recentActivities: respData.DB_DATA.RECENT_ACTIVITIES,
                    tableData: respData.DB_DATA.TABLE_DATA
                };

                set({
                    expenseData: transformedData,
                    loading: false
                });
                return { success: true, data: transformedData };
            } else {
                set({
                    error: respData.ERROR_DESCRIPTION || 'Failed to fetch expense data',
                    loading: false
                });
                showToast(respData.ERROR_DESCRIPTION || 'Failed to fetch expense data', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error fetching expense data:', error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'An error occurred while fetching expense data';
            set({
                error: errorMessage,
                loading: false
            });
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    },

    // Clear expense data
    clearExpenseData: () => {
        set({
            expenseData: {
                cardData: {
                    pending_approvals: 0,
                    total_budget: 0,
                    total_expenses: 0,
                    expense_amount: 0
                },
                graphData: {
                    year: new Date().getFullYear(),
                    data: [],
                    summary: {
                        total_year_expenses: 0,
                        total_year_approved: 0,
                        total_pending_count: 0
                    }
                },
                recentActivities: {
                    period: "this week",
                    activities: [],
                    total_count: 0
                },
                tableData: {
                    data: [],
                    pagination: {
                        current_page: 1,
                        total_pages: 1,
                        total_count: 0,
                        per_page: 20,
                        has_next_page: false,
                        has_prev_page: false,
                        next_page: null,
                        prev_page: null
                    }
                }
            },
            loading: false,
            loadMoreLoading: false,
            addExpenseLoading: false,
            error: null
        });
    },

    // Set loading state
    setLoading: (loading) => {
        set({ loading });
    },

    // Set error state
    setError: (error) => {
        set({ error });
    },

    // Load more expense data for pagination (does not toggle main dashboard loading)
    loadMoreExpenseData: async (params = {}) => {
        set({ loadMoreLoading: true, error: null });
        try {
            const response = await expenseApi.getExpenseListDAT(params);
            const respData = response.data;

            if (respData.STATUS === 'SUCCESSFUL') {
                // Append new data to existing data
                set((state) => ({
                    expenseData: {
                        ...state.expenseData,
                        tableData: {
                            data: [...state.expenseData.tableData.data, ...respData.DB_DATA.TABLE_DATA.data],
                            pagination: respData.DB_DATA.TABLE_DATA.pagination
                        }
                    },
                    loadMoreLoading: false
                }));
                return { success: true, data: respData.DB_DATA.TABLE_DATA };
            } else {
                set({
                    error: respData.ERROR_DESCRIPTION || 'Failed to load more expense data',
                    loadMoreLoading: false
                });
                showToast(respData.ERROR_DESCRIPTION || 'Failed to load more expense data', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error loading more expense data:', error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'An error occurred while loading more expense data';
            set({
                error: errorMessage,
                loadMoreLoading: false
            });
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    },

    // Get pending approvals data
    getPendingApprovals: async (params = {}) => {
        set({ pendingApprovalsLoading: true, error: null });
        try {
            const response = await expenseApi.getPendingApprovals(params);
            const respData = response.data;

            if (response.status === 200 && respData.STATUS === 'SUCCESSFUL') {
                set({
                    pendingApprovals: respData.DB_DATA,
                    pendingApprovalsLoading: false
                });
                
                // Update dashboard data in real-time after successful fetch
                await get().getExpenseDashboardData();
                
                return { success: true, data: respData.DB_DATA };
            } else {
                set({
                    error: respData.ERROR_DESCRIPTION || 'Failed to fetch pending approvals',
                    pendingApprovalsLoading: false
                });
                showToast(respData.ERROR_DESCRIPTION || 'Failed to fetch pending approvals', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'An error occurred while fetching pending approvals';
            set({
                error: errorMessage,
                pendingApprovalsLoading: false
            });
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    },

    // Clear pending approvals data
    clearPendingApprovals: () => {
        set({
            pendingApprovals: [],
            pendingApprovalsLoading: false
        });
    },

    // Get all employees for Settlement form
    getAllEmployees: async () => {
        set({ employeesLoading: true, error: null });
        try {
            const response = await employeesApi.get_all_employeee();
            const respData = response.data;

            if (response.status === 200 && respData.STATUS === 'SUCCESSFUL') {
                set({
                    allEmployees: respData.DB_DATA || [],
                    employeesLoading: false
                });
                return { success: true, data: respData.DB_DATA };
            } else {
                set({
                    error: respData.ERROR_DESCRIPTION || 'Failed to fetch employees',
                    employeesLoading: false
                });
                showToast(respData.ERROR_DESCRIPTION || 'Failed to fetch employees', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
            set({
                error: 'Error fetching employees',
                employeesLoading: false
            });
            showToast('Error fetching employees', 'error');
            return { success: false, error: 'Error fetching employees' };
        }
    },

    // Add new expense
    addExpense: async (expenseData) => {
        set({ addExpenseLoading: true, error: null });
        try {
            const response = await expenseApi.addExpense(expenseData);
            const respData = response.data;

            if ((response.status === 200 || response.status === 201) && respData.STATUS === 'SUCCESSFUL') {
                set({ addExpenseLoading: false });
                showToast('Expense added successfully', 'success');
                
                // Update dashboard data in real-time after successful expense addition
                await get().getExpenseDashboardData();
                
                return { success: true, data: respData };
            } else {
                set({
                    error: respData.ERROR_DESCRIPTION || 'Failed to add expense',
                    addExpenseLoading: false
                });
                showToast(respData.ERROR_DESCRIPTION || 'Failed to add expense', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (err) {
            console.error('Error adding expense:', err);
            set({
                error: 'Error adding expense',
                addExpenseLoading: false
            });
            showToast('Error adding expense', 'error');
            return { success: false, error: 'Error adding expense' };
        }
    },

    // Approve or reject expense
    approveRejectExpense: async (expenseId, status) => {
        set({ pendingApprovalsLoading: true, error: null });
        try {
            const response = await expenseApi.approveRejectExpense(expenseId, status);
            const respData = response.data;

            if ((response.status === 200 || response.status === 201) && respData.STATUS === 'SUCCESSFUL') {
                // Remove the approved/rejected item from pending approvals
                set((state) => ({
                    pendingApprovals: state.pendingApprovals.filter(approval => approval._id !== expenseId),
                    pendingApprovalsLoading: false
                }));

                // Refresh dashboard data to update pending count and amount
                await get().getExpenseDashboardData();

                const action = status === 'approved' ? 'Application Approved successfully' : 'Expense Refused successfully';
                showToast(action, 'success');
                return { success: true, data: respData };
            } else {
                set({
                    error: respData.ERROR_DESCRIPTION || `Failed to ${status} expense`,
                    pendingApprovalsLoading: false
                });
                showToast(respData.ERROR_DESCRIPTION || `Failed to ${status} expense`, 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error(`Error ${status} expense:`, error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || `An error occurred while ${status} expense`;
            set({
                error: errorMessage,
                pendingApprovalsLoading: false
            });
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    },

    // Get expense detail by ID
    getExpenseById: async (expenseId) => {
        set({ isLoadingExpenseDetail: true, error: null });
        try {
            const response = await expenseApi.getExpenseById(expenseId);
            const respData = response.data;

            if ((response.status === 200 || response.status === 201) && respData.STATUS === 'SUCCESSFUL') {
                set({
                    selectedExpenseDetail: respData.DB_DATA,
                    isLoadingExpenseDetail: false
                });
                return { success: true, data: respData.DB_DATA };
            } else {
                set({
                    error: respData.ERROR_DESCRIPTION || 'Failed to fetch expense details',
                    isLoadingExpenseDetail: false
                });
                showToast(respData.ERROR_DESCRIPTION || 'Failed to fetch expense details', 'error');
                return { success: false, error: respData.ERROR_DESCRIPTION };
            }
        } catch (error) {
            console.error('Error fetching expense details:', error);
            const errorMessage = error.response?.data?.ERROR_DESCRIPTION || 'An error occurred while fetching expense details';
            set({
                error: errorMessage,
                isLoadingExpenseDetail: false
            });
            showToast(errorMessage, 'error');
            return { success: false, error: errorMessage };
        }
    },

    // Clear expense detail
    clearExpenseDetail: () => {
        set({
            selectedExpenseDetail: null,
            isLoadingExpenseDetail: false
        });
    }
});

export default expenseViewModel;
