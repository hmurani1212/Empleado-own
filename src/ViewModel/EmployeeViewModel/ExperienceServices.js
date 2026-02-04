import { useState } from "react"
import { showToast } from "../../Components/Toaster/Toaster"
import useStore from "../../Store/store"
import employeesApi from "../../Model/Data/Employees/Employees"

const useExperienceService = ()=>{


    const addNewExperience = useStore((state)=> state.addNewExperience)
    const updateSingleExperience = useStore((state)=> state.updateSingleExperience)
    const deleteSingleExperience = useStore((state)=> state.deleteSingleExperience)


    const [experienceValue, setExperienceValue] = useState({
        show:false,
        addState:true,
        emp_id:'',
        leaving_reason:'',
        salary:'',
        date_upto:'',
        date_from:'',
        designation:'',
        org_name:'',
        loading:false,
        experience_id:''
    })

    const handleExperienceAdd = (empID)=>{
        setExperienceValue((prevState)=>({
            ...prevState,
            emp_id:empID,
            show:true,
            addState:true,
            leaving_reason:'',
            salary:'',
            date_upto:'',
            date_from:'',
            designation:'',
            org_name:'',

            
        }))

    }


    const handleExperienceAddClose = ()=>{
        setExperienceValue((prevState)=>({
            ...prevState, 
            show:false
        }))
    }

     const getSingleExpirence = async(id, empId)=>{


        const apiData = {
            id:id, 
            emp_id:empId

        }
        try {
            const response = await employeesApi.getSingleExperience(apiData)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                const DB_DATA =responseData.DB_DATA
                setExperienceValue((prevState)=>({
                    ...prevState,
                    addState:false,
                    leaving_reason:DB_DATA.leave_reason,
                    salary:DB_DATA.salary,
                    date_upto:DB_DATA.to_date,
                    date_from:DB_DATA.from_date,
                    designation:DB_DATA.designation,
                    org_name:DB_DATA.org_name,
                    emp_id:empId,
                    experience_id:id,
                    show:true,

                }))

            }
            // console.log('response', response)

        } catch (error) {
            
        }
    }


    const experienceValidation = ()=>{
        const {org_name, designation, date_from, date_upto,
            salary, leaving_reason
        } = experienceValue
        
        if(org_name === ''){
            showToast('Org/Institute Name is Required', 'error')
            return
        }
        else if(designation === ''){
            showToast('Designation Name is Required', 'error')
            return
        }
        else if(date_from === ''){
            showToast('From Date is Required', 'error')
            return
        }
        else if(date_upto === ''){
            showToast('From Upto is Required', 'error')
            return
        }
        else if(salary === ''){
            showToast('Salary Required', 'error')
            return
        }
        else if(leaving_reason === ''){
            showToast('Leaving Reason is Required', 'error')
            return
        }
        return true

    }

    const handleSubmitExperience = async()=>{
        const validation = experienceValidation()

        const setapiData = {
            emp_id:experienceValue.emp_id,
            leaving_reason:experienceValue.leaving_reason,
            salary:experienceValue.salary,
            date_upto:experienceValue.date_upto,
            date_from:experienceValue.date_from,
            designation:experienceValue.designation,
            org_name:experienceValue.org_name
        }
        const updateapiData = {
            emp_id:experienceValue.emp_id,
            leaving_reason:experienceValue.leaving_reason,
            salary:experienceValue.salary,
            date_upto:experienceValue.date_upto,
            date_from:experienceValue.date_from,
            designation:experienceValue.designation,
            org_name:experienceValue.org_name,
            id:experienceValue.experience_id
        }
        if(validation){

        
            setExperienceValue((prevState)=>({
                ...prevState,
                loading:true
            }))
            try{
                const response = await employeesApi.addExperience(experienceValue.addState ? setapiData : updateapiData )
                console.log('response', response)
                const responseData = await response.data 
                if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                    const newData = responseData.INSERTED_DATA
                    if(experienceValue.addState){

                        addNewExperience(newData)
                        showToast('Experience Added Successfully', 'success')
                        setExperienceValue((prevState)=>({
                            ...prevState,
                            show:false,
                            addState:true,
                            leaving_reason:'',
                            salary:'',
                            date_upto:'',
                            date_from:'',
                            designation:'',
                            org_name:'',
                            experience_id:null
                            
                        }))
                    }else{
                        updateSingleExperience(newData)
                        showToast('Experience Updated Successfully', 'success')
                        setExperienceValue((prevState)=>({
                            ...prevState,
                            show:false,
                            addState:true,
                            leaving_reason:'',
                            salary:'',
                            date_upto:'',
                            date_from:'',
                            designation:'',
                            org_name:'',
                            experience_id:null
                        }))
                    }
                }else{
                    const error = responseData.ERROR_DESCRIPTION
                    showToast(error, 'error')
                }
            }catch(err){
                console.log(err)    
            }finally{
                setExperienceValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
            }
        }

    }


    const handleExpeirenceInputChange = (e)=>{
        const {name, value} = e.target
        setExperienceValue((prevState)=>({
            ...prevState,
            [name]:value
        }))
    }





    const [deleteExperienceValue, setDeleteExperienceValue] = useState({
        id:'',
        show:false,
        empId:'',
        loading:false
    })

    const deleteExperience = (id, empId)=>{
        setDeleteExperienceValue((prevState)=>({
            ...prevState,
            id:id,
            empId:empId,
            show:true
        }))
    }

    const toggleDeleteExpirence = ()=>{
        setDeleteExperienceValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const confirmDeleteExperience = async()=>{
        const apiData = {
            emp_data:[
                'experience',
                deleteExperienceValue.id,
                deleteExperienceValue.empId

            ]
        }
        setDeleteExperienceValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response = await employeesApi.deleteFromOfficialInfo(apiData)
            console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                deleteSingleExperience(deleteExperienceValue.id)
                setDeleteExperienceValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
                showToast('Experience Removed Successfully', 'success')
            }
        }catch(err){

        }finally{

            setDeleteExperienceValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }



    return { experienceValue, handleExperienceAdd, handleExperienceAddClose, getSingleExpirence, 
        handleExpeirenceInputChange,handleSubmitExperience,
        confirmDeleteExperience, deleteExperience, deleteExperienceValue,toggleDeleteExpirence
    }
}

export default useExperienceService