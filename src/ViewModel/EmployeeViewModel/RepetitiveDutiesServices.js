import { useState } from "react"
import employeesApi from "../../Model/Data/Employees/Employees"
import useStore from "../../Store/store"
import { showToast } from "../../Components/Toaster/Toaster"

const useRepetitiveDutiesService = ()=>{

    const addNewDuty = useStore((state)=> state.addNewDuty)
    const deleteSingleDuty = useStore((state)=> state.deleteSingleDuty)
    const updateSingleDuty = useStore((state)=> state.updateSingleDuty)

    const [repetitiveValue, setRepetitiveValue] = useState({
        show:false, 
        addState:true, 
        loading: false,
        emp_id:'',
        enforce_till:'',
        effective_date:'',
        repetition_duration:'',
        repetition_unit:null,
        duty_title:'',
        permanent_duty:false,
        description:'',
        getLoading:[],
        duty_id:''

    })

    const handleRepetitiveAdd = async(empID)=>{
        setRepetitiveValue((prevState)=>({
            ...prevState,
            show:true,
            emp_id:empID,
            addState:true,

            
        }))
    }
    const handleAddRepetitiveClose = async()=>{
        setRepetitiveValue((prevState)=>({
            ...prevState,
            show:false, 
            addState:true,
            emp_id:'',
            enforce_till:'',
            effective_date:'',
            repetition_duration:'',
            repetition_unit:'',
            duty_title:'',
            description:'',
            permanent_duty:false,
            duty_id:'',
            getLoading:[]

            
        }))
    }


    const handleChangeRepetitive = (e)=>{
        const { name, type, checked, value } = e.target;

        // Determine the value based on the input type (checkbox or other)
        const inputValue = type === 'checkbox' ? checked : value;

        setRepetitiveValue((prevState) => ({
            ...prevState,
            [name]: inputValue,
        }));


    }


    const handleSelectRepetitive = (selected, field)=>{
        setRepetitiveValue((prevState) => ({
            ...prevState,
            [field]: selected,
        }));
    }


    const getSingleDuty = async(id, empID, index)=>{
        setRepetitiveValue((prevState)=>({
            ...prevState,
            getLoading: {
                ...prevState.getLoading,
                [index]: true, // Set loading to true for the specific index
            },
        }))
        const apiData = {
            id:id, 
            emp_id:empID

        }

        try{
            const response = await employeesApi.getSingleRepetitive(apiData)
            console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const DB_DATA = responseData.DB_DATA
                setRepetitiveValue((prevState)=>({
                    ...prevState,
                    addState:false,
                    duty_title: DB_DATA.title,
                    description:DB_DATA.detail,
                    repetition_duration:DB_DATA.repetition_duration,
                    repetition_unit: DB_DATA.repetition_unit,
                    permanent_duty: DB_DATA.enforced_till === true ? true : false,
                    enforce_till:DB_DATA.enforced_till === true ? '' : DB_DATA.enforced_till,
                    effective_date:DB_DATA.effective_from,
                    duty_id:id,
                    emp_id:empID,
                    show:true
                }))
            }else{
                const error = responseData.ERROR_DESCRIPTION 
                showToast(error, error)
            }
        }catch(err){
            console.log(err)
        }finally{
            setRepetitiveValue((prevState)=>({
                ...prevState,
                getLoading: {
                    ...prevState.getLoading,
                    [index]: false, // Set loading to false for the specific index
                },
            }))
        }
    }




    const getValue = (val) => (typeof val === 'object' && val !== null ? val.value : val);


    const handleSubmitRepetitive = async()=>{
        const apiData = {
            emp_id:repetitiveValue.emp_id,
            description:repetitiveValue.description,
            effective_date:repetitiveValue.effective_date,
            enforce_till:repetitiveValue.permanent_duty ? '' : repetitiveValue.enforce_till,
            permanent_duty:repetitiveValue.permanent_duty ? 'on' : 'off',
            repetition_duration:repetitiveValue.repetition_duration,
            repetition_unit:getValue(repetitiveValue.repetition_unit),
            duty_title:repetitiveValue.duty_title,

        }

        const updateData = {
            id:repetitiveValue.duty_id,
            emp_id:repetitiveValue.emp_id,
            description:repetitiveValue.description,
            enforce_till:repetitiveValue.permanent_duty ? '' : repetitiveValue.enforce_till,
            permanent_duty:repetitiveValue.permanent_duty ? 'on' : 'off',
            repetition_duration:repetitiveValue.repetition_duration,
            repetition_unit:getValue(repetitiveValue.repetition_unit),
            duty_title:repetitiveValue.duty_title,

        }

        // console.log('apiData',apiData)
        setRepetitiveValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response = await employeesApi.addRepetitive(repetitiveValue.addState ? apiData : updateData)
            const responseData = response.data 
            if(response.status ===  200 && responseData.STATUS === 'SUCCESSFUL'){
                const newData = responseData.INSERTED_DATA
                console.log('newData', newData)
                if(repetitiveValue.addState){

                
                    showToast('Duty Added Successfully', 'success')
                    addNewDuty(newData)
                    setRepetitiveValue((prevState)=>({
                        ...prevState,
                        show:false, 
                        addState:true,
                        emp_id:'',
                        enforce_till:'',
                        effective_date:'',
                        repetition_duration:'',
                        repetition_unit:'',
                        duty_title:'',
                        description:'',
                        permanent_duty:false,
                        duty_id:'',
                        getLoading:[]

                        
                    }))
                }else{

                    updateSingleDuty(newData)
                    showToast('Duty Updated successfully', 'success')
                    setRepetitiveValue((prevState)=>({
                        ...prevState,
                        show:false, 
                        addState:true,
                        emp_id:'',
                        enforce_till:'',
                        effective_date:'',
                        repetition_duration:'',
                        repetition_unit:'',
                        duty_title:'',
                        description:'',
                        permanent_duty:false,
                        duty_id:'',
                        getLoading:[]

                        
                    }))
                }

            }else{
                const error = responseData.ERROR_DESCRIPTION 
                showToast(error, 'error')
            }
            // console.log('response', response)
        }catch(err){
            console.log('err', err)
        }finally{
            setRepetitiveValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }

    const [deleteDutyValue, setDeleteDutyValue] = useState({
        id:'',
        show:false,
        empId:'',
        loading:false
    })

    const deleteDuty = (id, empId)=>{
        setDeleteDutyValue((prevState)=>({
            ...prevState,
            id:id,
            empId:empId,
            show:true
        }))
    }

    const toggleDeleteDuty = ()=>{
        setDeleteDutyValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const confirmDeleteDuty = async()=>{
        const apiData = {
            emp_data:[
                'license',
                deleteDutyValue.id,
                deleteDutyValue.empId

            ]
        }
        setDeleteDutyValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response = await employeesApi.deleteFromOfficialInfo(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                console.log('Hello')
                deleteSingleDuty(deleteDutyValue.id)
                setDeleteDutyValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
                showToast('Duty Removed Successfully', 'success')
            }
        }catch(err){

        }finally{

            setDeleteDutyValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }


    return { repetitiveValue,handleRepetitiveAdd, handleAddRepetitiveClose, handleChangeRepetitive, 
        handleSelectRepetitive,handleSubmitRepetitive,
        deleteDutyValue,deleteDuty,toggleDeleteDuty,confirmDeleteDuty,getSingleDuty
    }
}

export default useRepetitiveDutiesService