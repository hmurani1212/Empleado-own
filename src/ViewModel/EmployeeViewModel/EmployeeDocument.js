import { useState } from "react"
import employeesApi from "../../Model/Data/Employees/Employees"
import { showToast } from "../../Components/Toaster/Toaster"
import useStore from "../../Store/store"

const useEmployeeDocument = ()=>{

    const deleteAcademicRecord = useStore((state)=> state.deleteAcademic)
    const addNewAcademic = useStore((state)=> state.addNewAcademic)
    const updateSingleAcademic = useStore((state)=> state.updateSingleAcademic)

    /* Start of Accedemic Setting*/
    
    const [academicsValue, setAcademicsValue] = useState({
        show:false,
        loading:false,
        emp_id:'',
        remarks:'',
        board_univ:'',
        division:null,
        grade:null,
        total_marks:'',
        obtained_marks:'',
        study_type:'',
        major_subject:'',
        passing_year:'',
        degree_id:null,
        degree_list:[],
        addState:true,
        academic_id:''
    })

    const handleAccedemicAdd = (empID)=>{
        gettingDegreeList()
        setAcademicsValue((prevState)=>({
            ...prevState,
            emp_id:empID,
            show:true,
            addState:true,
            remarks:'',
            board_univ:'',
            division:null,
            grade:null,
            total_marks:'',
            obtained_marks:'',
            study_type:'',
            major_subject:'',
            passing_year:'',
            degree_id:null,
            
        }))

    }
    const handleAccedemicAddClose = ()=>{
        setAcademicsValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }
    


    const gettingDegreeList = async()=>{
        try{
            const response = await employeesApi.getDegreeList()
            console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                const DB_DATA = responseData.DB_DATA
                setAcademicsValue((prevState)=>({
                    ...prevState,
                    degree_list:DB_DATA
                }))
            }
        }catch(err){

        }
    }


    const handleSelectAcademic = (selected, field)=>{
        setAcademicsValue((prevState)=>({
            ...prevState,
            [field]:selected
        }))
    }
    const handleAcademicInputChange = (e)=>{
        const {name, value} = e.target
        setAcademicsValue((prevState)=>({
            ...prevState,
            [name]:value
        }))
    }


    const academicValidatio = ()=>{
        const {degree_id, passing_year, major_subject, study_type,
            obtained_marks, total_marks, grade, division, board_univ, remarks
        } = academicsValue
        
        if(degree_id === null){
            showToast('Select Degree', 'error')
            return
        }
        else if(passing_year === ''){
            showToast('Passing Year is Required', 'error')
            return
        }
        else if(major_subject === ''){
            showToast('Degree Title/Major Subjects is Required', 'error')
            return
        }
        else if(study_type === ''){
            showToast('Study Type is Required', 'error')
            return
        }
        else if(obtained_marks === ''){
            showToast('Obtained Marks/GPA is Required', 'error')
            return
        }
        else if(total_marks === ''){
            showToast('Total Marks/GPA is Required', 'error')
            return
        }
        else if(grade === null){
            showToast('Select Grade', 'error')
            return
        }
        else if(division === ''){
            showToast('Select Division', 'error')
            return
        }
        else if(board_univ === ''){
            showToast('Borad/University is Required', 'error')
            return
        }
        else if(remarks === ''){
            showToast('Remarks is Required', 'error')
            return
        }

        return true

    }


    const getValue = (val) => (typeof val === 'object' && val !== null ? val.value.toString() : val);


    const handleSubmitAcademics = async()=>{
       

        const validation = academicValidatio()

        const setapiData = {
            emp_id:academicsValue.emp_id,
            remarks:academicsValue.remarks,
            board_univ:academicsValue.board_univ,
            total_marks:academicsValue.total_marks,
            major_subject:academicsValue.major_subject,
            passing_year:academicsValue.passing_year,
            study_type:academicsValue.study_type,
            division:getValue(academicsValue.division),
            degree_id:getValue(academicsValue.degree_id),
            grade:getValue(academicsValue.grade),
            obtained_marks:academicsValue.obtained_marks,
        }
        const updateapiData = {
            emp_id:academicsValue.emp_id,
            remarks:academicsValue.remarks,
            board_univ:academicsValue.board_univ,
            total_marks:academicsValue.total_marks,
            major_subject:academicsValue.major_subject,
            passing_year:academicsValue.passing_year,
            study_type:academicsValue.study_type,
            division:getValue(academicsValue.division),
            degree_id:getValue(academicsValue.degree_id),
            grade:getValue(academicsValue.grade),
            obtained_marks:academicsValue.obtained_marks,
            id:academicsValue.academic_id
        }
        if(validation){

        
            setAcademicsValue((prevState)=>({
                ...prevState,
                loading:true
            }))
            try{
                const response = await employeesApi.addAcademic(academicsValue.addState ? setapiData : updateapiData )
                console.log('response', response)
                const responseData = await response.data 
                if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                    const newData = responseData.INSERTED_DATA
                    if(academicsValue.addState){

                        addNewAcademic(newData)
                        showToast('Academic Added Successfully', 'success')
                        setAcademicsValue((prevState)=>({
                            ...prevState,
                            show:false,
                            addState:true,
                            remarks:'',
                            board_univ:'',
                            division:null,
                            grade:null,
                            total_marks:'',
                            obtained_marks:'',
                            study_type:'',
                            major_subject:'',
                            passing_year:'',
                            degree_id:null,
                            
                        }))
                    }else{
                        updateSingleAcademic(newData)
                        showToast('Academic Updated Successfully', 'success')
                        setAcademicsValue((prevState)=>({
                            ...prevState,
                            show:false,
                            addState:true,
                            remarks:'',
                            board_univ:'',
                            division:null,
                            grade:null,
                            total_marks:'',
                            obtained_marks:'',
                            study_type:'',
                            major_subject:'',
                            passing_year:'',
                            degree_id:null,
                            
                        }))
                    }
                }else{
                    const error = responseData.ERROR_DESCRIPTION
                    showToast(error, 'error')
                }
            }catch(err){
                console.log(err)    
            }finally{
                setAcademicsValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
            }
        }

        // console.log(academicsValue)
    }


    const [deleteAcademicValue, setDeleteAcademicValue] = useState({
        id:'',
        show:false,
        empId:'',
        loading:false
    })

    const deleteAcademic = (id, empId)=>{
        setDeleteAcademicValue((prevState)=>({
            ...prevState,
            id:id,
            empId:empId,
            show:true
        }))
    }

    const toggleDeleteAcademic = ()=>{
        setDeleteAcademicValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const confirmDeleteAcademic = async()=>{
        const apiData = {
            emp_data:[
                'academic',
                deleteAcademicValue.id,
                deleteAcademicValue.empId

            ]
        }
        setDeleteAcademicValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        try{
            const response = await employeesApi.deleteFromOfficialInfo(apiData)
            console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                deleteAcademicRecord(deleteAcademicValue.id)
                setDeleteAcademicValue((prevState)=>({
                    ...prevState,
                    show:false
                }))
                showToast('Academic Removed Successfully', 'success')
            }
        }catch(err){

        }finally{

            setDeleteAcademicValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }


    const getSingleAcademic = async(id, empId)=>{

        const apiData = {
            id:id, 
            emp_id:empId

        }
        try {
            const response = await employeesApi.getSingleAcademic(apiData)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                const DB_DATA =responseData.DB_DATA
                setAcademicsValue((prevState)=>({
                    ...prevState,
                    addState:false,
                    board_univ:DB_DATA.board_univ,
                    degree_id:{value:DB_DATA.program_list.selected.id, label: DB_DATA.program_list.selected.name},
                    degree_list:DB_DATA.program_list.all,
                    passing_year:DB_DATA.passing_year,
                    major_subject:DB_DATA.degree_title,
                    study_type:DB_DATA.study_type,
                    obtained_marks:DB_DATA.obtained_marks_gpa,
                    total_marks:DB_DATA.total_marks_gpa,
                    grade:DB_DATA.grade,
                    division:DB_DATA.division,
                    remarks:DB_DATA.remarks,
                    show:true,
                    emp_id:empId,
                    academic_id:id

                }))

            }
            // console.log('response', response)

        } catch (error) {
            
        }
    }

    /* End of Accedemic Setting*/


    return { academicsValue, handleAccedemicAdd, handleAccedemicAddClose, handleSelectAcademic,
        handleAcademicInputChange, handleSubmitAcademics,deleteAcademic, deleteAcademicValue,toggleDeleteAcademic,
        confirmDeleteAcademic,getSingleAcademic
    }
}

export default useEmployeeDocument

