import empTimeAdjustmentApi from "../../../Model/Data/EmpData/EmpTimeAdjustment/EmpTimeAdjunstment"

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const getStatusCounts = (rows = []) => {
    return rows
        .filter((row) => row != null && typeof row === "object")
        .reduce(
            (acc, curr) => {
                const status = Number(curr?.status);
                if (status === 0) acc.pending += 1;
                else if (status === 1) acc.approved += 1;
                else if (status === 2) acc.rejected += 1;
                return acc;
            },
            { pending: 0, approved: 0, rejected: 0 }
        );
};

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
    /** Overall status counters across all pages */
    timeAdjustmentStats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    },

    /**
     * Fetch time adjustment requests (paginated).
     * @param {number} [page=1] - Page number (1-based)
     * @param {number} [limit=20] - Items per page
     * @param {boolean} [includeOverallStats=(page===1)] - Also fetch all pages and compute counters
     */
    getTimeAjustmentData: async (page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, includeOverallStats = page === DEFAULT_PAGE) => {
        set({ timeAdjustmentLoading: true });
        try {
            const response = await empTimeAdjustmentApi.getAllRequest({ page, limit });
            const responseData = response.data;
            if (responseData.STATUS === "SUCCESSFUL") {
                const dbData = responseData.DB_DATA ?? [];
                const pagination = responseData.pagination ?? {};
                const totalPages = Math.max(1, Number(pagination.pages) || 1);
                const currentPage = Math.max(1, Math.min(Number(pagination.page) || 1, totalPages));
                const paginationTotal = Number(pagination.total) || dbData.length;

                set({
                    timeAjustmentData: dbData,
                    timeAdjustmentPagination: {
                        currentPage,
                        totalPages,
                        hasMore: currentPage < totalPages,
                        total: paginationTotal,
                    },
                });

                if (includeOverallStats) {
                    let allRows = [...dbData];

                    if (totalPages > 1) {
                        const remainingPageRequests = [];
                        for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
                            remainingPageRequests.push(
                                empTimeAdjustmentApi.getAllRequest({ page: pageNumber, limit })
                            );
                        }

                        const remainingPageResponses = await Promise.allSettled(remainingPageRequests);
                        remainingPageResponses.forEach((result) => {
                            if (result.status !== "fulfilled") return;
                            const pageResData = result.value?.data;
                            if (pageResData?.STATUS !== "SUCCESSFUL") return;
                            const pageRows = Array.isArray(pageResData?.DB_DATA) ? pageResData.DB_DATA : [];
                            if (pageRows.length > 0) {
                                allRows = allRows.concat(pageRows);
                            }
                        });
                    }

                    const counts = getStatusCounts(allRows);
                    set({
                        timeAdjustmentStats: {
                            total: paginationTotal,
                            ...counts,
                        },
                    });
                }
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
                timeAdjustmentStats: {
                    total: 0,
                    pending: 0,
                    approved: 0,
                    rejected: 0,
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
            get().getTimeAjustmentData(timeAdjustmentPagination.currentPage + 1, DEFAULT_LIMIT, false);
        }
    },

    /** Go to previous page of time adjustment list */
    getTimeAjustmentDataPrevPage: () => {
        const { timeAdjustmentPagination } = get();
        if (timeAdjustmentPagination.currentPage > 1) {
            get().getTimeAjustmentData(timeAdjustmentPagination.currentPage - 1, DEFAULT_LIMIT, false);
        }
    },

    /** Go to specific page (1-based) */
    getTimeAjustmentDataGoToPage: (pageNumber) => {
        const targetPage = parseInt(pageNumber, 10);
        const { timeAdjustmentPagination } = get();
        if (targetPage >= 1 && targetPage <= timeAdjustmentPagination.totalPages) {
            get().getTimeAjustmentData(targetPage, DEFAULT_LIMIT, false);
        }
    },

    addnewTimeAdjustment: (data) => {
        if (!data || typeof data !== "object") return;
        const prev = get().timeAjustmentData || [];
        const id = data._id;
        const alreadyExists = id != null && prev.some((row) => row && row._id === id);
        const withoutDup = id != null
            ? prev.filter((row) => row && row._id !== id)
            : prev.filter(Boolean);
        const currentStats = get().timeAdjustmentStats || { total: 0, pending: 0, approved: 0, rejected: 0 };
        const status = Number(data?.status);
        set({
            timeAjustmentData: [data, ...withoutDup],
            timeAdjustmentStats: {
                total: (currentStats.total || 0) + (alreadyExists ? 0 : 1),
                pending: (currentStats.pending || 0) + (alreadyExists ? 0 : (status === 0 ? 1 : 0)),
                approved: (currentStats.approved || 0) + (alreadyExists ? 0 : (status === 1 ? 1 : 0)),
                rejected: (currentStats.rejected || 0) + (alreadyExists ? 0 : (status === 2 ? 1 : 0)),
            },
        });
    },
});


export default empTimeAdjustmentViewModel