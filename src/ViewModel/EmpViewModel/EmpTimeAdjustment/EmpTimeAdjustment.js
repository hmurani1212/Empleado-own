import empTimeAdjustmentApi from "../../../Model/Data/EmpData/EmpTimeAdjustment/EmpTimeAdjunstment"

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const empTimeAdjustmentViewModel = (set, get) => ({

    timeAjustmentData: [],
    timeAdjustmentLoading: true,
    /** Pagination: { currentPage, totalPages, hasMore, total } - matches employee list pattern */
    timeAdjustmentPagination: {
        currentPage: 1,
        totalPages: 1,
        hasMore: false,
        total: 0,
    },

    /**
     * Fetch time adjustment requests (paginated).
     * @param {number} [page=1] - Page number (1-based)
     * @param {number} [limit=20] - Items per page
     */
    getTimeAjustmentData: async (page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) => {
        set({ timeAdjustmentLoading: true });
        try {
            const response = await empTimeAdjustmentApi.getAllRequest({ page, limit });
            const responseData = response.data;
            if (responseData.STATUS === "SUCCESSFUL") {
                const dbData = responseData.DB_DATA ?? [];
                const pagination = responseData.pagination ?? {};
                const totalPages = Math.max(1, Number(pagination.pages) || 1);
                const currentPage = Math.max(1, Math.min(Number(pagination.page) || 1, totalPages));

                set({
                    timeAjustmentData: dbData,
                    timeAdjustmentPagination: {
                        currentPage,
                        totalPages,
                        hasMore: currentPage < totalPages,
                        total: Number(pagination.total) || 0,
                    },
                });
            }
        } catch (err) {
            set({
                timeAjustmentData: [],
                timeAdjustmentPagination: {
                    currentPage: 1,
                    totalPages: 1,
                    hasMore: false,
                    total: 0,
                },
            });
        } finally {
            set({ timeAdjustmentLoading: false });
        }
    },

    /** Go to next page of time adjustment list */
    getTimeAjustmentDataNextPage: () => {
        const { timeAdjustmentPagination } = get();
        if (timeAdjustmentPagination.currentPage < timeAdjustmentPagination.totalPages) {
            get().getTimeAjustmentData(timeAdjustmentPagination.currentPage + 1);
        }
    },

    /** Go to previous page of time adjustment list */
    getTimeAjustmentDataPrevPage: () => {
        const { timeAdjustmentPagination } = get();
        if (timeAdjustmentPagination.currentPage > 1) {
            get().getTimeAjustmentData(timeAdjustmentPagination.currentPage - 1);
        }
    },

    /** Go to specific page (1-based) */
    getTimeAjustmentDataGoToPage: (pageNumber) => {
        const targetPage = parseInt(pageNumber, 10);
        const { timeAdjustmentPagination } = get();
        if (targetPage >= 1 && targetPage <= timeAdjustmentPagination.totalPages) {
            get().getTimeAjustmentData(targetPage);
        }
    },

    addnewTimeAdjustment: (data) => {
        if (!data || typeof data !== "object") return;
        const prev = get().timeAjustmentData || [];
        const id = data._id;
        const withoutDup = id != null
            ? prev.filter((row) => row && row._id !== id)
            : prev.filter(Boolean);
        set({ timeAjustmentData: [data, ...withoutDup] });
    },
});


export default empTimeAdjustmentViewModel