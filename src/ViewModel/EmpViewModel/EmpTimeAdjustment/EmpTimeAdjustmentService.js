import useStore from "../../../Store/store"

const useEmpTimeAdjustmentServices = ()=>{

    const getTimeAjustmentData = useStore((state)=> state.getTimeAjustmentData)
    const timeAjustmentData = useStore((state)=> state.timeAjustmentData)
    const timeAdjustmentLoading = useStore((state)=> state.timeAdjustmentLoading)

    return {
        getTimeAjustmentData,
        timeAjustmentData,
        timeAdjustmentLoading
    }

}



export default useEmpTimeAdjustmentServices