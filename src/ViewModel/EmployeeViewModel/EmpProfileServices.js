import { useState } from "react"
import employeesApi from "../../Model/Data/Employees/Employees"
import { showToast } from "../../Components/Toaster/Toaster"
import useStore from "../../Store/store"

const useEmpProfileService = ()=>{

    const updateEmpProfileAttendanceSetting = useStore((state)=> state.updateEmpProfileAttendanceSetting)


    const [editAttedanceValue, setEditAttendanceValue] = useState({
        show:false,
        data:{},
        hrPolicy:null,
        bioId:'',
        loading: false,
        updateLoading:false,
    })


    const handleAttendanceSettingToggle = ()=>{
        setEditAttendanceValue((prevState)=>({
            ...prevState,
            show:false,
            data:{},
            hrPolicy:null,
            bioId:'',
        }))
    }

    const handleEditAttendenceSetting =async(id)=>{


        const apiData = {emp_id: id}
        setEditAttendanceValue((prevState)=>({
            ...prevState,
            loading:true
        }))

        try{
            const response = await employeesApi.getEditAttendance(apiData)
            // console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                setEditAttendanceValue((prevState)=>({
                    ...prevState,
                    bioId:responseData.DB_DATA.data.bio_id,
                    data:responseData.DB_DATA,
                    hrPolicy:{value:responseData.DB_DATA.data.policy_id, label:responseData.DB_DATA.data.hr_policy},
                    show:true,
                    
                }))
            }
        }catch(err){
            console.log(err)
        }finally{
            setEditAttendanceValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }

    }

    const handleSelectAttendanceSettingChange = (selected, field)=>{
        setEditAttendanceValue((prevState)=>({
            ...prevState,
            [field]: selected

        }))
    }


    const updateAttendanceSettingHrPolicy = async(id)=>{
        console.log('id', id, editAttedanceValue.hrPolicy)
     
        const apiData = {
            emp_id: id, 
            hr_policy:editAttedanceValue.hrPolicy.value 
        }
        const prevHRID = editAttedanceValue.data.data.policy_id
        if(prevHRID == editAttedanceValue.hrPolicy.value){
            showToast('Change HR Policy','error')
            return
        }
        setEditAttendanceValue((prevState)=>({
            ...prevState,
            updateLoading:true
        }))

        try{
            const response = await employeesApi.updateAttendanceSettingPolicy(apiData)
            console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                
                updateEmpProfileAttendanceSetting(editAttedanceValue.hrPolicy)
                showToast('HR Policy Updated Successfully', 'success')
                setEditAttendanceValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
            }else{
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }
        }catch(err){
            console.log('err', err)
        }finally{
            setEditAttendanceValue((prevState)=>({
                ...prevState,
                updateLoading:false
            }))
        }

    }

    return { handleEditAttendenceSetting,editAttedanceValue, handleAttendanceSettingToggle,updateAttendanceSettingHrPolicy, handleSelectAttendanceSettingChange }
}


export default useEmpProfileService