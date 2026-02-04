import { useState } from "react"
import useStore from "../../Store/store"
import { showToast } from "../../Components/Toaster/Toaster"
import employeesApi from "../../Model/Data/Employees/Employees"


const useDependentsServices = ()=>{
    const addNewDependent = useStore((state)=> state.addNewDependent)
    const updateSingleDependent = useStore((state)=> state.updateSingleDependent)
    const deleteSingleDependent = useStore((state)=> state.deleteSingleDependent)
    const [dependentsValue, setDepedentsValue] = useState({
        emp_id:'',
        show:false,
        addState:true,
        loading:false,
        gender:'',
        contact:'',
        relationship:'',
        dob:'',
        name:'',
        dependent_id:''
    })

    const handleDependentAdd = (empID)=>{
        setDepedentsValue((prevState)=>({
            ...prevState,
            emp_id:empID,
            show:true,
            addState:true,
            gender:'',
            contact:'',
            relationship:'',
            dob:'',
            name:''

            
        }))

    }

    const handleDepedentsAddClose = ()=>{
        setDepedentsValue((prevState)=>({
            ...prevState, 
            show:false
        }))
    }

    const getSingleDependents = async(id, empId)=>{

        setDepedentsValue((prevState)=>({
            ...prevState, 
            addState:false,
            show:true
        }))
        const apiData = {
            id:id, 
            emp_id:empId

        }
        try {
            const response = await employeesApi.getSingleDependent(apiData)
            console.log('respponse', response)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                const DB_DATA =responseData.DB_DATA
                setDepedentsValue((prevState)=>({
                    ...prevState,
                    addState:false,
                    name:DB_DATA.name,
                    dob:DB_DATA.dob,
                    gender:DB_DATA.gender,
                    relationship:DB_DATA.relationship,
                    contact:DB_DATA.contact,
                    emp_id:empId,
                    dependent_id:id,
                    show:true,

                }))

            }

        } catch (error) {
            
        }
    }

    const handleDependentsInputChange = (e)=>{
        const {name, value} = e.target
        setDepedentsValue((prevState)=>({
            ...prevState,
            [name]:value
        }))
    }


    const dependentsValidation = ()=>{
        const {name, dob, relationship, contact,
            gender
        } = dependentsValue
        
        if(name === ''){
            showToast('Depedent Name is Required', 'error')
            return
        }
        else if(dob === ''){
            showToast('Date of birth is Required', 'error')
            return
        }
        else if(relationship === ''){
            showToast('Relationship is Required', 'error')
            return
        }
        else if(contact === ''){
            showToast('Contact is Required', 'error')
            return
        }
        else if(gender === ''){
            showToast('Gender is Required', 'error')
            return
        }
        return true

    }



    const handleSubmitDependents = async()=>{
        const validation = dependentsValidation()

        const setapiData = {
            emp_id:dependentsValue.emp_id,
            name:dependentsValue.name,
            dob:dependentsValue.dob,
            relationship:dependentsValue.relationship,
            contact:dependentsValue.contact,
            gender:dependentsValue.gender,
        }
        const updateapiData = {
            emp_id:dependentsValue.emp_id,
            name:dependentsValue.name,
            dob:dependentsValue.dob,
            relationship:dependentsValue.relationship,
            contact:dependentsValue.contact,
            gender:dependentsValue.gender,
            id:dependentsValue.dependent_id
        }
        if(validation){

        
            setDepedentsValue((prevState)=>({
                ...prevState,
                loading:true
            }))
            try{
                const response = await employeesApi.addDependent(dependentsValue.addState ? setapiData : updateapiData )
                console.log('response', response)
                const responseData = await response.data 
                if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                    const newData = responseData.INSERTED_DATA
                    if(dependentsValue.addState){

                        addNewDependent(newData)
                        showToast('Depedent Added Successfully', 'success')
                        setDepedentsValue((prevState)=>({
                            ...prevState,
                            show:false,
                            addState:true,
                            name:'',
                            dob:'',
                            relationship:'',
                            gender:'',
                            contact:'',
                            org_name:'',
                            dependent_id:null
                            
                        }))
                    }else{
                        updateSingleDependent(newData)
                        showToast('Dependent Updated Successfully', 'success')
                        setDepedentsValue((prevState)=>({
                            ...prevState,
                            show:false,
                            addState:true,
                            name:'',
                            dob:'',
                            relationship:'',
                            gender:'',
                            contact:'',
                            org_name:'',
                            dependent_id:null
                        }))
                    }
                }else{
                    const error = responseData.ERROR_DESCRIPTION
                    showToast(error, 'error')
                }
            }catch(err){
                console.log(err)    
            }finally{
                setDepedentsValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
            }
        }

    }




    const [deleteDependentValue, setDeleteDependentValue] = useState({
        id:'',
        show:false,
        empId:'',
        loading:false
    })

    const deleteDependent = (id, empId)=>{
        setDeleteDependentValue((prevState)=>({
            ...prevState,
            id:id,
            empId:empId,
            show:true
        }))
    }

    const toggleDeleteDependent = ()=>{
        setDeleteDependentValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const confirmDeleteDependent = async()=>{
        const apiData = {
            emp_data:[
                'dependent',
                deleteDependentValue.id,
                deleteDependentValue.empId

            ]
        }
        setDeleteDependentValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response = await employeesApi.deleteFromOfficialInfo(apiData)
            console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                deleteSingleDependent(deleteDependentValue.id)
                setDeleteDependentValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
                showToast('Dependent Removed Successfully', 'success')
            }
        }catch(err){

        }finally{

            setDeleteDependentValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }



    return {dependentsValue, handleDependentAdd, handleDepedentsAddClose, 
        getSingleDependents,handleSubmitDependents,handleDependentsInputChange,
        deleteDependent,deleteDependentValue, confirmDeleteDependent, toggleDeleteDependent
    }
}

export default useDependentsServices