import { useState } from "react"
import employeesApi from "../../Model/Data/Employees/Employees"
import { officialInfoTage } from "../../services/EmpServices"
import useStore from "../../Store/store"
import { showToast } from "../../Components/Toaster/Toaster"


const useEmpProfileInfo = ()=>{

    const deletingReportingManager = useStore((state)=> state.deletingReportingManager)
    const addingReportingManager = useStore((state)=> state.addingReportingManager)
    const updateEmpProfileJobDescription = useStore((state)=> state.updateEmpProfileJobDescription)
    const updateEmpOfficialInfo = useStore((state)=> state.updateEmpOfficialInfo)
    const updatingEmployeementStatus = useStore((state)=> state.updatingEmployeementStatus)

    const [officialInfoValue, setOfficialInfoValue] = useState({
        show:false,
        loading:false,
        emp_id:'',
        employment_status:'',
        eobi:'',
        provident_fund:'',
        social_security:'',
        insurance:'',
        health_benefits:'',
        branches_list:[],
        branch:null,
        departments_list:[],
        department:null,
        join_date:'',
        probationFrom:'',
        probationUpto:'',
        job_description:'',
        designation:null,
        designation_list:[],
        tag:null,
        tag_list:[],
        new_tag:'',
        eobi_number:'',
        trainingFrom:'',
        trainingUpto:'',
        training_fields:[],
        training:null,
        trainingField:'',
        eobi_number:'',
        social_sec_number:'',
        providentFundEligibilty:{}


    })


    const convertDateToYYYYMMDD = (timestamp) => {

       // Convert the string timestamp to number (assuming it's in seconds)
        const timestampInMilliseconds = parseInt(timestamp, 10) * 1000;

        // Create a Date object from the timestamp in milliseconds
        const date = new Date(timestampInMilliseconds);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            throw new Error('Invalid timestamp');
        }

        // Format the date to YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    }


    const handleEmpOfficialProfileEdit = async(id)=>{
        setOfficialInfoValue((prevState)=>({
            ...prevState, 
            loading:true
        }))

        const apiData = {
            emp_id:id
        }

        try{
            const response = await employeesApi.getEmpOfficialInfo(apiData)
            console.log('response', response)
            const responseData = response.data 
            const dbData = responseData.DB_DATA
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                setOfficialInfoValue((prevState)=>({
                    ...prevState, 
                    emp_id:dbData.data.emp_id,
                    employment_status:dbData.data.employment_status.toLowerCase(),
                    eobi:dbData.data.eobi,
                    eobi_number:dbData.data.eobi_number,
                    provident_fund:dbData.data.provident_fund,
                    social_security:dbData.data.social_security,
                    social_sec_number:dbData.data.social_sec_number,
                    insurance:dbData.data.insurance,
                    health_benefits:dbData.data.health_benefits,
                    branches_list:dbData.branches_list,
                    departments_list:flattenOptions(dbData.dept),
                    branch:dbData.data.branch_id,
                    department:dbData.data.deptt_id,
                    join_date:convertDateToYYYYMMDD(dbData.data.join_date),
                    job_description:dbData.data.job_description,
                    designation:dbData.data.designation,
                    trainingFrom:dbData.data.contract_from === null ? '': dbData.data.contract_from,
                    trainingUpto:dbData.data.contract_upto === null ? '': dbData.data.contract_upto,
                    designation_list:dbData.designations_optionslist,
                    training_fields:[...dbData.training_fields , {id:'other', field_name:'Other' }],
                    tag:dbData.data.tag_id,
                    tag_list:dbData.emp_tags_list.length > 0  ? [...officialInfoTage, ...dbData.emp_tags_list ]  : officialInfoTage,
                    providentFundEligibilty:dbData.providentFund,
                    show: true,
                }))
            }
            
        }catch(error){
            console.log('error', error)
        }finally{
            setOfficialInfoValue((prevState)=>({
                ...prevState, 
                loading:false
            }))
        }
    }
    
    const handleCloseEditEmpOfficialInfo =()=>{
        
        setOfficialInfoValue((prevState)=>({
            ...prevState, 
            show: false
        }))
    }



    const handleEmpOfficialInputChange = (e)=>{
        const {name, value} = e.target;
        setOfficialInfoValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
    }


    const handleSelectOfficialInfo =(selected, field)=>{

        if(field === 'branch'){

            setOfficialInfoValue((prevState)=>({
                ...prevState,
                [field]: selected
            }))
            gettingDepartments(selected.value)
        }else if(field === 'department'){
            setOfficialInfoValue((prevState)=>({
                ...prevState,
                [field]: selected
            }))
            gettingDesignations(selected.value)

        }else if(field === 'employment_status'){
            setOfficialInfoValue((prevState)=>({
                ...prevState,
                [field]: selected
            }))
            updatingEmployeementStatus(selected)

        }   
        else{

            setOfficialInfoValue((prevState)=>({
                ...prevState,
                [field]: selected
            }))
        }
    }



    const gettingDepartments = async(id)=>{
        const data = {parent_id: 0,branchId:id,getAll:true}
        try{

            const response = await employeesApi.gettingSubDepts(data)
            const resData = response.data
            console.log('response', response)
            if(response.status === 200 && resData.STATUS === "SUCCESSFUL"){
                setOfficialInfoValue((prevState)=>({
                    ...prevState, 
                    departments_list:flattenOptions(resData.DB_DATA),
                    department:'',
                }))
            }else{
            }
        }catch(err){
        }
    }
    const gettingDesignations = async(id)=>{
        const data = {d_id: id}
        try{

            const response = await employeesApi.getDesignations(data)
            const resData = response.data
            // console.log('response', response)
            if(response.status === 200 && resData.STATUS === "SUCCESSFUL"){
                setOfficialInfoValue((prevState)=>({
                    ...prevState, 
                    designation_list:resData.DB_DATA,
                    designation:'',
                }))
            }else{
            }
        }catch(err){
        }
    }



    /* */

    const flattenOptions = (data) => {
        // console.log('flatten', data)

        let flattenedOptions = [];
        // console.log('data', data)

        data?.forEach((dept) => {
            flattenedOptions.push({ label: dept.name, value: dept.id, isParent: true });
            
            if (dept.children?.length>0) {
                // console.log('***')
                dept.children.forEach((subDept) => {
                    flattenedOptions.push({ label: subDept.name, value: subDept.id, isChild: true });
                });
            }
        });
        // console.log('flattenedOptions', flattenedOptions)

        return flattenedOptions;
    };





    const getValue = (val) => (typeof val === 'object' && val !== null ? val.value.toString() : val);


    // const validateEmpInfo = ()=>{
    //     const {emp_id, tag, new_tag, eobi, eobi_number,
    //         social_security, social_sec_number, job_description,
    //     } = officialInfoValue
    //     if(emp_id === ''){
    //         return {isValid:false, message:"EMP ID Can't be Empty"}
    //     }
    //     if(tag.value === 'other'){
    //         if(new_tag === ''){
    //             return {isValid:false, message:"Tag Can't be Empty"}
    //         }
    //     }
    //     if(eobi === '1'){
    //         if(eobi_number === ''){
    //             return {isValid:false, message:"EOBI Can't be Empty"}
    //         }
    //     }
    //     if(social_security === '1'){
    //         if(social_sec_number === ''){
    //             return {isValid:false, message:"Social Can't be Empty"}
    //         }
    //     }
    //     if(job_description === ''){
    //         return {isValid:false, message:"Job Description Can't be Empty"}
    //     }

    //     return {isValid: true, message:''}
    // }


    const handleUpdateEmpOfficialInfo = async(id, empId)=>{
        // const validation = validateEmpInfo();
        // if (!validation.isValid) {
        //     showToast(validation.message, 'error'); // Display the validation message to the user
        //     return;
        // }

        setOfficialInfoValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        
        const employmentStatus = getValue(officialInfoValue.employment_status).toLowerCase();
        console.log('employmentStatus', employmentStatus)
        const apiData ={
            id:id,
            emp_deptt:getValue(officialInfoValue.department),
            new_emp_tag: getValue(officialInfoValue.tag) === 'other' ?  officialInfoValue.new_tag : '',
            emp_tag:getValue(officialInfoValue.tag),
            designation:getValue(officialInfoValue.designation),
            insurance:officialInfoValue.insurance,
            social_sec_number:officialInfoValue.social_security === '1' ? officialInfoValue.social_sec_number : '',
            health_benefits:officialInfoValue.health_benefits,
            social_security:officialInfoValue.social_security,
            eobi_number: officialInfoValue.eobi === '1' ? officialInfoValue.eobi_number : '',
            eobi:officialInfoValue.eobi,
            probation_upto:officialInfoValue.probationUpto,
            probation_from:officialInfoValue.probationFrom,
            join_date:officialInfoValue.join_date,
            training_field_new:getValue(officialInfoValue.training) === 'other' ? officialInfoValue.trainingField : '',
            emp_training_field:employmentStatus === 'trainee' ? getValue(officialInfoValue.training) : '',
            contract_upto: (employmentStatus === 'trainee' || employmentStatus === 'contract') ? officialInfoValue.trainingUpto : '',
            contract_from: (employmentStatus === 'trainee' || employmentStatus === 'contract') ? officialInfoValue.trainingFrom : '', // Fixed from trainingUpto to trainingFrom
            job_description:officialInfoValue.job_description,
            employment_status:getValue(officialInfoValue.employment_status),
            emp_branch:getValue(officialInfoValue.branch),
            emp_id:officialInfoValue.emp_id,
            provident_fund:officialInfoValue.provident_fund


        }
        try{

            


            const response = await employeesApi.updatingOfficialInfo(apiData)
            console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                updateEmpOfficialInfo(apiData)
                setOfficialInfoValue((prevState)=>({
                    ...prevState,
                    show:false,
                    employment_status:''
                }))
                ///showToast('Employee Official Information Updated Successfully', 'success')
            }else{
                const error = responseData.ERROR_DESCRIPTION 
                showToast(error, 'error')
            }

        }catch(err){

        }finally{
            setOfficialInfoValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }

    }

    
    /* */

    /*  start of reporting Manager */



    const [reportManagerValue, setReportingManagerValue] = useState({
        show:false,
        empID:'',
        reportingId:'',
        loading:false,
        managerEmp:[],
        empManager:null,
    })


    const removeReportingManagerOfficial = (id, ele)=>{
        
        setReportingManagerValue((prevState)=>({
            ...prevState,
            reportingId:ele.id,
            empID:id,
            show:true
        }))

        console.log('id', ele)
    }
    const handleSelectEmpManager = (selected, field)=>{
        
        setReportingManagerValue((prevState)=>({
            ...prevState,
            [field]: selected

        }))
    }


    const confirmReportingManagerDelete = async()=>{

        const apiData = {
            emp_data:['reporting_to',  reportManagerValue.reportingId, reportManagerValue.empID ]
        }
        
        setReportingManagerValue((prevState)=>({
            ...prevState,
            loading:true
        }))

        try{
            const response = await employeesApi.deleteFromOfficialInfo(apiData)
            console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                deletingReportingManager(reportManagerValue.reportingId)
                showToast('Reporting Manager Removed Successfully', 'success')
            } 
        }catch(err){
            console.log('err', err)
        }finally{
            
            setReportingManagerValue((prevState)=>({
                ...prevState,
                loading: false,
                show:false
            }))
        }
    }

    const toggleConfirmationDialog = ()=>{
        setReportingManagerValue((prevState)=>({
            ...prevState,
            show: false
        }))
    }



    const serachEmpReportingManager = (id, value, actionMeta)=>{
        const apiData = {emp_id:id, search:value}
        if (actionMeta.action === 'input-change') {
            debouncedSearchEmp(apiData)
        }
    }



    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    }


    

    const serachEmp = async(apiData)=>{
        try{
            const response = await employeesApi.searchManagerEmp(apiData)
            const responseData = await response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){

                setReportingManagerValue((prevState)=>({
                    ...prevState,
                    managerEmp:responseData.DB_DATA
                }))

            }
            console.log('response', response)
        }catch(err){
            
        }
        
    }

    const debouncedSearchEmp = debounce(serachEmp, 1000); 


    const addReportingManager = async(id)=>{
        
        console.log('******', reportManagerValue.empManager)

        if(reportManagerValue.empManager === null){
            showToast('Select Manager', 'error')
            return 
        }
        setReportingManagerValue((prevState)=>({
            ...prevState,
            loading: true
        }))
        const data = {
            emp_id : id,
            report_to:reportManagerValue.empManager.value

        }

        try{
            const response = await employeesApi.assingManage(data)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === 'SUCCESSFUL'){
                showToast('Reporting Manager Added Successfully', 'success')
                addingReportingManager(responseData.INSERTED_DATA)
                setReportingManagerValue((prevState)=>({
                    ...prevState,
                    empManager:null,
                    managerEmp:[]
                }))
            }
            console.log('response', response)

        }catch(err){

        }finally{
            setReportingManagerValue((prevState)=>({
                ...prevState,
                loading: false
            }))
        }
    }


    /*  End of reporting Manager */




    /*  Start of Job Description */


    const [jobDescriptionValue, setJobDescriptionValue] = useState({
        show:false, 
        job_description:'',
        loading:false
    })


    const handleEditJobDesction=(data)=>{
        setJobDescriptionValue((prevState)=>({
            ...prevState,
            show:true,
            job_description: data

        }))
    }


    const handleUpdateJobDescription = async(id)=>{

        const data = {
            empId: id, 
            description:jobDescriptionValue.job_description
        }
        
        
        try{
            setJobDescriptionValue((prevState)=>({
                ...prevState,
                loading:true

            }))
            const response = await employeesApi.updatingJobDescription(data)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                updateEmpProfileJobDescription(data)
                showToast('Job Description Updated Successfully', 'success')
                setJobDescriptionValue((prevState)=>({
                    ...prevState,
                    job_description: '',
                    show:false,
                    
                }))
            }else{
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }
        }catch(err){
            console.log(err)
        }finally{

            setJobDescriptionValue((prevState)=>({
                ...prevState,
                loading:false
                
            }))
        }
    }


    const handleCloseJobDescription = ()=>{
        setJobDescriptionValue((prevState)=>({
            ...prevState,
            show:false,
            job_description: ''

        }))
    }


    const handleJobDescriptOnChange = (e)=>{
        const {name ,value} = e.target
        setJobDescriptionValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
    }
    /*  End of Job Description */



    



    return { 
        officialInfoValue,handleEmpOfficialProfileEdit, handleCloseEditEmpOfficialInfo,
        handleEmpOfficialInputChange, flattenOptions,handleSelectOfficialInfo,
        removeReportingManagerOfficial, reportManagerValue,confirmReportingManagerDelete,toggleConfirmationDialog,
        serachEmpReportingManager, handleSelectEmpManager,addReportingManager,handleUpdateEmpOfficialInfo,
        jobDescriptionValue, handleEditJobDesction,handleUpdateJobDescription, handleCloseJobDescription, handleJobDescriptOnChange
        
    }

}

export default useEmpProfileInfo