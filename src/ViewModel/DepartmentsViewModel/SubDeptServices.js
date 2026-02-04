import { useNavigate, useParams } from "react-router";
import useStore from "../../Store/store";
import AddSubDepartment from "../../View/Departments/AddSubDepartment";
import { useState } from "react";
import { showToast } from "../../Components/Toaster/Toaster";
import departmentsApi from "../../Model/Data/Departments/Departments";
import { validateAddSubDepartment } from "../../Validation/Validation";

const useSubDept = ()=>{

    const gettingSubDept = useStore((state)=> state.gettingSubDept)
    const subDept = useStore((state)=> state.subDept)
    const settingMainParent = useStore((state)=> state.settingMainParent)
    const settingParentId = useStore((state)=> state.settingParentId)
    const mainParentID = useStore((state)=> state.mainParentID)
    const parentID = useStore((state)=> state.parentID)
    const deptFound = useStore((state)=> state.deptFound)



    const openDrawer = useStore ((state) => state.openDrawer)
    const closeDrawer = useStore ((state) => state.closeDrawer)
    const settingDrawerTitle = useStore ((state) => state.settingDrawerTitle)
    const settingComponent = useStore ((state) => state.settingComponent)
    const settingDrawerSize = useStore ((state) => state.settingDrawerSize)


    const handleSubDesginationAddition = useStore ((state) => state.handleSubDesginationAddition)
    

    const navigate = useNavigate()

    const handleSubDept = (data, id)=>{
        // console.log('data', data, id)
        settingMainParent(data.id)
        // navigate(`/leavesPlanner/leaves_group/viewLeaves/${groupId}`);
        navigate(`/departments/manageDept/${id}/manage_sub_dep/${data.id}`)
        const apidata = {bid:id, parent_id: data.id}
        gettingSubDept(apidata)
        
    }
    
    const handleNestedSubDept = (data, id)=>{
        // console.log(data, id)
        settingParentId(data.parent_id)
        navigate(`/departments/manageDept/${id}/manage_sub_dep/${data.id}`)
        const apidata = {bid:id, parent_id: data.id}
        gettingSubDept(apidata)
    }


    const backToParent  =(data, id)=>{
        // console.log('data', data, id)

        if(!deptFound){

            navigate(`/departments/manageDept/${id}/manage_sub_dep/${parentID}`)
            const apidata = {bid:id, parent_id: parentID}
            gettingSubDept(apidata)
            // if(data === undefined){
            //     navigate(`/departments/manageDept/${id}`)
            // }
        }else{
            if(data?.parent_id == 0 || parentID === 0){
                navigate(`/departments/manageDept/${id}`)
            }else{
                navigate(`/departments/manageDept/${id}/manage_sub_dep/${data.parent_id}`)
                const apidata = {bid:id, parent_id: data.parent_id}
                gettingSubDept(apidata)
            }
        }
            
    }

    const backToHome = (data)=>{
        // console.log('data', data)
        navigate(`/departments/manageDept/${data.id}`)
    }


    
    const [newDesigValue, setNewDesigValue] = useState({
        addDesigntions: 1,
        designations: [{ value: '' }],
        dept_name:'',
        dept_description:'',
        loading:false,
    });
    
    
    const handleAddSubDept= (data)=>{

       
        
        openDrawer()
        settingDrawerSize(500)
        settingDrawerTitle('Add Sub Departments')
        settingComponent(<AddSubDepartment 
            data = {data}
        />)  
        

    }

    const handleNewDesignations = () => {
        if (newDesigValue.addDesigntions >= 5) {
            showToast('You can only add up to 5 designations', 'error');
            return;
        }

        // Check if any existing designation field is empty
        const hasEmptyDesignation = newDesigValue.designations.some(designation => 
            !designation.value || designation.value.trim() === ''
        );

        if (hasEmptyDesignation) {
            showToast('Please fill the current designation field before adding a new one', 'error');
            return;
        }

        setNewDesigValue((prevState) => ({
            ...prevState,
            addDesigntions: prevState.addDesigntions + 1,
            designations: [
                ...prevState.designations,
                {value:''}
            //   { name: `Designation ${prevState.addDesigntions + 1}`, value: '' }
            ]
        }));
    };


    const handleInputChangeDes = (index, event) => {
        const { value } = event.target;
        const newDesignations = [...newDesigValue.designations];
        newDesignations[index] = { ...newDesignations[index], value };
        setNewDesigValue((prevState) => ({
            ...prevState,
            designations: newDesignations
        }));
    };
  
    const handleRemoveNewDesignation = (index) => {
        const newDesignations = newDesigValue.designations.filter((_, i) => i !== index);
        setNewDesigValue((prevState) => ({
            ...prevState,
            addDesigntions: prevState.addDesigntions - 1,
            designations: newDesignations
        }));
    };


    const handleChangeDesignation = (e)=>{
        const { name, value } = e.target

        setNewDesigValue((prevState) => ({
            ...prevState,
            [name]: value
        }));
    }

    const submitSubDept =async(e, data)=>{
        e.preventDefault()
        // console.log('data', data)
        const addData = {
            branch_id:data.id,
            parent_deptt  : data.subDeptid,
            designation : newDesigValue.designations.map(designation => designation.value),
            dept_name:newDesigValue.dept_name,
            description:newDesigValue.dept_description
            
        }
        const validateData = {

            designation : newDesigValue.designations.map(designation => designation.value),
            dept_name:newDesigValue.dept_name,
            description:newDesigValue.dept_description
            
        }
        
        
        
        try{
            await validateFormData(validateData);
            setNewDesigValue((prevState)=>({
                ...prevState,
                loading:true
            }))
            const response = await departmentsApi.addNewSubDesignation(addData)
            const responseData = response.data

            // console.log('response', response)

            if(responseData.STATUS === 'SUCCESSFUL'){
                showToast('Data Added Successfully', 'success')
                handleSubDesginationAddition(responseData.DB_DATA)
                closeDrawer()
                

            } else {
                showToast(data.ERROR_DESCRIPTION, 'error')
            }

        }catch(error){
             showToast(error?.response?.data?.ERROR_DESCRIPTION, 'error');
            if (error.name === 'ValidationError') {
                // Validation error from form data
                showToast(error.message, 'error');
            } else {
                // Other errors (e.g., network error, API error response)
                console.log(error)
            }
        }finally{
            setNewDesigValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }


    const validateFormData = async (formData) => {
        const fields = Object.keys(formData);

        for (const field of fields) {
            try {
                await validateAddSubDepartment.validateAt(field, formData);
            } catch (error) {
                throw error; // Throw the first validation error encountered
            }
        }
    };


    return { handleSubDept, subDept,handleNestedSubDept, backToParent, handleAddSubDept, submitSubDept,
        newDesigValue,handleNewDesignations,
        handleInputChangeDes, handleRemoveNewDesignation, handleChangeDesignation, backToHome
     }
}

export default useSubDept