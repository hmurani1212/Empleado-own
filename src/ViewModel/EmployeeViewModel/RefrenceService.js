import { useState } from "react"
import employeesApi from "../../Model/Data/Employees/Employees"
import { showToast } from "../../Components/Toaster/Toaster"
import useStore from "../../Store/store"

const useReferenceService = ()=>{

    const addNewReference = useStore((state)=> state.addNewReference)

    const [referenceValue, setReferenceValue] = useState({
        show:false,
        emp_id:'',
        contact:'',
        address:'',
        emp_ref_id:'',
        emp_ref_dept:'',
        emp_ref_branch:'',
        emp_ref_source:null,
        relation:'',
        ref_name:'',
        branchesList: [],
        branch:null,
        dept_list:[],
        department:null,
        empList:[],
        emp:null
    })

    const handleReferenceAdd = (empID)=>{
        setReferenceValue((prevState)=>({
            ...prevState,
            emp_id:empID,
            show:true,
            contact:'',
            address:'',
            emp_ref_id:'',
            emp_ref_dept:'',
            emp_ref_branch:'',
            emp_ref_source:null,
            relation:'',
            ref_name:'',
            branchesList: [],
            branch:null,
            dept_list:[],
            department:null,
            empList:[],
            emp:null,
            loading:false

            
        }))

    }
    const handleReferenceAddClose = ()=>{
        setReferenceValue((prevState)=>({
            ...prevState, 
            show:false
        }))
    }


    const handleSelectReference = (selected, field)=>{
        setReferenceValue((prevState)=>({
            ...prevState,
            [field]:selected
        }))
        if(field === 'emp_ref_source'){

            if(selected.value === '1'){
                gettingBranches()
            }
        }
        if(field === 'branch'){
            getDepartments(selected.value)
        }
        if(field === 'department'){
            getEmployees(selected.value)
        }
    }


    const gettingBranches = async()=>{
        try{

            const response = await employeesApi.gettingRefBranches()
            const responseData = response.data 
            if(responseData.STATUS === 'SUCCESSFUL'){
                const dbdata = responseData.DB_DATA 
                setReferenceValue((prevState)=>({
                    ...prevState,
                    branchesList:dbdata
                }))

            }else{
                const error = responseData.ERROR_DESCRIPTION 
                showToast(error, 'error')
                setReferenceValue((prevState)=>({
                    ...prevState,
                    branchesList:[]
                }))
            }

        }catch(err){

        }
    }

    const getDepartments = async(id)=>{
        const apiData = {
            bid:id
        }
        try{
            const response =await employeesApi.gettingRefDepartments(apiData)

            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                const dbdata = responseData.DB_DATA
                setReferenceValue((prevState)=>({
                    ...prevState,
                    dept_list:dbdata
                }))
            }else{
                const error = responseData.ERROR_DESCRIPTION 
                showToast(error, 'error')
                setReferenceValue((prevState)=>({
                    ...prevState,
                    dept_list:[]
                }))
            }
        }catch(err){
            
        }
    }
    const getEmployees = async(id)=>{
        const apiData = {
            deptt_id:id
        }
        try{
            const response =await employeesApi.gettingRefEmployees(apiData)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                const dbdata = responseData.DB_DATA
                // console.log('dbdata', dbdata)
                setReferenceValue((prevState)=>({
                    ...prevState,
                    empList:dbdata
                }))
            }else{
                const error = responseData.ERROR_DESCRIPTION 
                showToast(error, 'error')
                setReferenceValue((prevState)=>({
                    ...prevState,
                    empList:[]
                }))
            }
            // console.log('response', response)
        }catch(err){
            
        }
    }


    const handleReferenceInputChange = (e)=>{
        const {name, value} = e.target
        setReferenceValue((prevState)=>({
            ...prevState,
            [name]:value
        }))
    }


    const referenceValidation = ()=>{
        const {ref_name, relation, emp_ref_source, branch, department, emp,
            address,contact

        } = referenceValue

        if(ref_name === ''){
            showToast('Name is required', 'error')
            return
        }
        else if(relation === ''){
            showToast('Relation is required', 'error')
            return
        }
        else if(emp_ref_source === null){
            showToast('Select source', 'error')
            return
        }
        else if(emp_ref_source.value === '1'){
            if(branch === null){
                showToast('Select Branch', 'error')
                return

            }
            if(department === null){
                showToast('Select Department', 'error')
                return

            }
            if(emp === null){
                showToast('Select Employee', 'error')
                return

            }
        }
        else if(address === ''){
            showToast('Address is required', 'error')
            return

        }
        else if(contact === ''){
            showToast('Contact is required', 'error')
            return

        }
        return true
    }

    const handleSubmitReference = async()=>{
        

        const validation = referenceValidation()
        if(validation){
            setReferenceValue((prevState)=>({
                ...prevState,
                loading:true
            }))
            const apiData = {
                emp_id:referenceValue.emp_id,
                contact:referenceValue.contact,
                address:referenceValue.address,
                emp_ref_id:referenceValue.emp_ref_source.value === '1' ? referenceValue.emp.value : '',
                emp_ref_dept:referenceValue.emp_ref_source.value === '1' ? referenceValue.department.value : '',
                emp_ref_branch:referenceValue.emp_ref_source.value === '1' ? referenceValue.branch.value:'',
                emp_ref_source:referenceValue.emp_ref_source.value,
                relation:referenceValue.relation,
                ref_name:referenceValue.ref_name,

            }
            
        

       
            try{
                const response = await employeesApi.addReference(apiData)
                const responseData = response.data
                if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                    const newData = responseData.INSERTED_DATA
                    addNewReference(newData)
                    showToast('Reference Added Successfully','success')
                    setReferenceValue((prevState)=>({
                        ...prevState,
                        show:false
                    }))
                }else{
                    const error = responseData.ERROR_DESCRIPTION
                    showToast(error, 'error')
                }
            }catch(err){

            }finally{

                setReferenceValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
            }
        }
    }


    return{
        handleReferenceAdd,referenceValue,handleReferenceAddClose,
        handleSelectReference,handleReferenceInputChange,handleSubmitReference
    }
 
}


export default useReferenceService