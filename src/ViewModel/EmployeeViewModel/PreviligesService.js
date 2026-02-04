import { useState } from "react"
import { showToast } from "../../Components/Toaster/Toaster"
import employeesApi from "../../Model/Data/Employees/Employees"
import useStore from "../../Store/store"

const usePriviligesService = ()=>{


    const deleteSinglePrivilege = useStore((state)=> state.deleteSinglePrivilege)
    const settingPrivilegesData = useStore((state)=> state.settingPrivilegesData)
    const privilegesData = useStore((state)=> state.privilegesData)
    const addingSingleRole = useStore((state)=> state.addingSingleRole)
    
    const [privilegesValue, setPrivileges] = useState({
        ip_filter: '',
        privileges:null,
        loading: false, 


    })



    const handleSelectPrivileges = (selected, field)=>{
        setPrivileges((pervState)=>({
            ...pervState,
            [field]: selected
        }))
    }


    const handlePrivilegesInputChange = (e)=>{
        const { name, value } = e.target 
        setPrivileges((prevState)=>({
            ...prevState,
            [name]: value
        })) 
    }


    const handleAddRole = async(id)=>{

        if(privilegesValue.privileges === null){
            showToast('Select Privileges', 'error')
            return
        }

        const apiData = {
            emp_id: id, 
            ip_filter:privilegesValue.ip_filter,
            privileges:privilegesValue.privileges.value
        }
        setPrivileges((prevState)=>({
            ...prevState,
            loading: true
        }))

        try {
            const response = await employeesApi.addPrivileges(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                
                const newData = responseData.INSERTED_DATA
                addingSingleRole(newData)
                setPrivileges((prevState)=>({
                    ...prevState,
                    privileges: null
                }))
                gettingEmpPrivileges(id)
                
            }else{
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }
            console.log('response', response)
        } catch (error) {
            
        }finally{
            setPrivileges((prevState)=>({
                ...prevState,
                loading: false
            }))
        }
    }


    const [addingPrivilegesValue, setAddingPrivilegeValue] = useState({
        show:false, 
        loading: false
    })

    const gettingEmpPrivileges = async(id)=>{
        const apiData = {
            pre_empId: id
        }
        try{
            const response = await employeesApi.getPrivileges(apiData)
            console.log('response', response)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const DB_DATA = responseData.DB_DATA 
                settingPrivilegesData(DB_DATA)
                setAddingPrivilegeValue((prevState)=>({
                    ...prevState,
                    show:true
                }))
            }else{
                settingPrivilegesData({})
            }
        }catch(err){
            console.log('err', err)
        }
    }

    const handleAddPrivilegesClose = ()=>{
        setAddingPrivilegeValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const [deletePrivilegeValue, setDeletePrivilegesValue] = useState({

        show:false,
        emp_id:'',
        loading:false,
        role_id:'',
        id:null,
    })

    const deletePrivileges = (empId, data)=>{
        console.log('data', data)
        const {role} = data
        if(role === 'Employee'){
            showToast('User minimum role cannot be deleted', 'error')
            return
        } 

        setDeletePrivilegesValue((prevState)=>({
            ...prevState,
            emp_id:empId,
            role_id: role,
            id:data.id,
            show:true
        }))
    }

    const toggleDeletePrivileges = ()=>{
        setDeletePrivilegesValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const confirmDeletePrivileged = async()=>{
        const apiData = {
            
            emp_id:deletePrivilegeValue.emp_id,
            role_id: deletePrivilegeValue.role_id
        }
        setDeletePrivilegesValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response = await employeesApi.deletePrivilege(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){

                deleteSinglePrivilege(deletePrivilegeValue.id)
                setDeletePrivilegesValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
                showToast('Privileges Removed Successfully', 'success')
            }
        }catch(err){

        }finally{

            setDeletePrivilegesValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }




    



    return { privilegesValue, handleSelectPrivileges, handlePrivilegesInputChange,handleAddRole,
        deletePrivileges,deletePrivilegeValue,toggleDeletePrivileges,
        confirmDeletePrivileged, privilegesData,
        handleAddPrivilegesClose, addingPrivilegesValue, gettingEmpPrivileges
     }


}

export default usePriviligesService