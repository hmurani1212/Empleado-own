import useStore from "../../../Store/store"

const useEmpTimeAdjustmentServices = ()=>{

    const getTimeAjustmentData = useStore((state)=> state.getTimeAjustmentData)
    const timeAjustmentData = useStore((state)=> state.timeAjustmentData)

    return {
        getTimeAjustmentData,
        timeAjustmentData
    }

}



export default useEmpTimeAdjustmentServices