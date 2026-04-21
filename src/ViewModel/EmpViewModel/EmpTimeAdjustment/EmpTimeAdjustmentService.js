import useStore from "../../../Store/store"

const useEmpTimeAdjustmentServices = () => {
    const getTimeAjustmentData = useStore((state) => state.getTimeAjustmentData)
    const timeAjustmentData = useStore((state) => state.timeAjustmentData)
    const timeAdjustmentLoading = useStore((state) => state.timeAdjustmentLoading)
    const timeAdjustmentPagination = useStore((state) => state.timeAdjustmentPagination)
    const timeAdjustmentStats = useStore((state) => state.timeAdjustmentStats)
    const getTimeAjustmentDataNextPage = useStore((state) => state.getTimeAjustmentDataNextPage)
    const getTimeAjustmentDataPrevPage = useStore((state) => state.getTimeAjustmentDataPrevPage)
    const getTimeAjustmentDataGoToPage = useStore((state) => state.getTimeAjustmentDataGoToPage)

    return {
        getTimeAjustmentData,
        timeAjustmentData,
        timeAdjustmentLoading,
        paginationData: timeAdjustmentPagination,
        timeAdjustmentStats,
        onNextPage: getTimeAjustmentDataNextPage,
        onPreviousPage: getTimeAjustmentDataPrevPage,
        onGoToPage: getTimeAjustmentDataGoToPage,
    }
}



export default useEmpTimeAdjustmentServices