import React, { useState } from 'react'
import { FaUserCheck, FaChartBar, FaCheck, FaRegClock } from "react-icons/fa";
import useStore from '../../Store/store';
import MonthLateComers from '../../View/Attendance/MonthLateComers';
import { TiThListOutline } from "react-icons/ti";
import { IoAnalyticsOutline, IoAlarmOutline } from "react-icons/io5";
import { useNavigate } from 'react-router';
// import shiftApi from '../../Model/Data/ShiftPlanner/ShiftPlanner';
import attendanceApi from '../../Model/Data/Attendance/Attendance';
import { showToast } from '../../Components/Toaster/Toaster';
import ExportAttendance from '../../View/Attendance/ExportAttendance';
import ReportsLateComers from '../../View/Attendance/ReportsLateComers';
import EditTimeAdjustment from '../../View/Attendance/EditTimeAdjustment';
import CreateNewRequest from '../../View/Attendance/CreateNewRequest';

const useAttendance = () => {
    const openDrawer = useStore((state) => state.openDrawer)
    const closeDrawer = useStore((state) => state.closeDrawer)
    const settingDrawerTitle = useStore ((state) => state.settingDrawerTitle)
    const settingComponent = useStore ((state) => state.settingComponent)
    const settingDrawerSize = useStore ((state) => state.settingDrawerSize)
    const gettingLateComers = useStore ((state) => state.gettingLateComers)
    const allAttArchiveReport = useStore ((state) => state.allAttArchiveReport)
    const gettingAttReportArchive = useStore ((state) => state.gettingAttReportArchive)
    const branchesAttendance = useStore ((state) => state.branchesAttendance)
    const attendanceBranches = useStore ((state) => state.attendanceBranches)
    const empListAtt = useStore ((state) => state.empListAtt)
    const empSuggestionListAtt = useStore ((state) => state.empSuggestionListAtt)
    const gettingRequestAdj = useStore ((state) => state.gettingRequestAdj)
    const requestData = useStore ((state) => state.requestData)
    const requestPagination = useStore ((state) => state.requestPagination)
    const gettingAdjDetail = useStore ((state) => state.gettingAdjDetail)
    const individualRequestDetail = useStore ((state) => state.individualRequestDetail)
    const settingEditData = useStore ((state) => state.settingEditData)
    const editData = useStore ((state) => state.editData)
    const tempId = useStore ((state) => state.tempId)
    const settingId = useStore ((state) => state.settingId)
    const updatedAdjRequest = useStore ((state) => state.updatedAdjRequest)
    const updateTimeAdjustment = useStore ((state) => state.updateTimeAdjustment)
    
    // Employee recent attendance records state
    const [employeeRecentRecords, setEmployeeRecentRecords] = useState([])
    const [loadingRecentRecords, setLoadingRecentRecords] = useState(false)
    const [loading, setLoading] = useState(false)
    const [liveBiometricDevices, setLiveBiometricDevices] = useState([])
    
    const navigate = useNavigate();

    const AttendanceNavTitles = [
        {id:1, title: 'Individual Employee Report', link:'/attendance/individual-attendance/individual_attendance_report'},
        {id:2, title:'Current HR Policy', link:'/attendance/individual-attendance/current_hr_policy'},
        {id:3, title:'Raw Logs', link:'/attendance/individual-attendance/raw_attendance_logs'},
        {id:4, title:'Track Policy', link:'/attendance/individual-attendance/track_policy'}
      ]

    
    const thisMonthLateComers = () => {
        openDrawer()
        settingDrawerSize(1000)
        settingDrawerTitle('This Month Late Comers')
        // Show component immediately - static content will display right away
        settingComponent(<MonthLateComers />)
        // Always fetch fresh data when card is clicked
        gettingLateComers()
    }

    const lateComersReport = () => {
        openDrawer()
        // gettingLateComers()
        settingDrawerSize('45vw')
        settingDrawerTitle('Export Report')
        settingComponent(<ReportsLateComers
        />)
    }

    const exportAttendanceDrawer = () => {
        openDrawer()
        // gettingLateComers()
        settingDrawerSize('45vw')
        settingDrawerTitle('Export Attendance Record')
        settingComponent(<ExportAttendance    
        />)
    }

   
    const backNavigate = () => {
        navigate('/attendance')
    }

    const attendanceCardsItems = [
        {id:1, title: 'Export Attendance', icon : <FaUserCheck className="text-[25px] text-white"/>, onClick:() => exportAttendanceDrawer(), color: '#0ACF97', style:'text-white bg-[#0ACF97] hover:bg-[#0ACF97]/80'},
        {id:2, title: 'View Individual Employee Report', icon : <FaChartBar className='text-[25px] text-white'/> , link:'/attendance/individual-attendance/individual_attendance_report', color: '#3DA5F4', style:'text-white bg-[#3DA5F4] hover:bg-[#3DA5F4]/80'}, 
        {id:3, title: 'View Branchwise List Reporting', link:'/attendance/branch_wise_list_rep', icon : <TiThListOutline className='text-[25px] text-white'/> , color: '#FF4979', style:'text-white bg-[#FF4979] hover:bg-[#FF4979]/80'}, 
        {id:4, title: 'Raw Attendance Logs', link:'/attendance/raw_att_logs', icon : <FaCheck className='text-[25px] text-white'/> , color: '#FDA006', style:'text-white bg-[#FDA006] hover:bg-[#FDA006]/80'}, 
        {id:5, title: 'Attendance Report Archive', link:'/attendance/att_report_archive', icon : <IoAnalyticsOutline className='text-[25px] text-white'/>, color: '#ED61BC', style:'text-white bg-[#ED61BC] hover:bg-[#ED61BC]/80'}, 
        {id:6, title: 'Attendance Adjustment Request', icon : <FaRegClock className='text-[25px] text-white'/>,  link:'/attendance/attendance_adjust_req', color: '#56B6C2', style:'text-white bg-[#56B6C2] hover:bg-[#56B6C2]/80'}, 
        {id:7, title: 'Late Comers Report', icon : <IoAlarmOutline className='text-[25px] text-white'/>, onClick:() => lateComersReport(), color: '#6889D4', style:'text-white bg-[#6889D4] hover:bg-[#6889D4]/80'}, 
        {id:8, title: 'This Month Late Comers', icon : <FaRegClock className='text-[25px] text-white'/>, onClick: () => thisMonthLateComers(),  color: '#98C379', style:'text-white bg-[#98C379] hover:bg-[#98C379]/80'} 
    ]

    const excelLayoutOptions = [
        {id:1, title:'List View (multisheet)'},
        {id:2, title:'Calendrical View'},
        {id:3, title:'Calendrical Full View'},
    ]
    const [branchwiseRep, setBranchwiseRep] = useState({
        branch: null,
        department: null,
        month:'',
        year:'',
        employee: null
    })


    const flattenOptions = (data) => {
        // console.log('flatten', data)
        let flattenedOptions = [];
        data?.forEach((dept) => {
            flattenedOptions.push({ label: dept.name, value: dept.id, isParent: true });
            if (dept.children.length>0) {
                dept.children.forEach((subDept) => {
                    flattenedOptions.push({ label: subDept.name, value: subDept.id, isChild: true });
                });
            }
        });
        return flattenedOptions;
    };

    const [dept_subDeptA, setDept_subDeptA] = useState([])
    const gettingSubBranchesAttendance = async(id)=>{
        setLoading(true)
        console.log(id)
        const data = {parent_id: 0,branchId:id,getAll:true}
        try{
            const response = await attendanceApi.getSubDeptAtt(data)
            const resData = response.data
            
            if(response.status === 200 && resData.STATUS === "SUCCESSFUL"){
                setDept_subDeptA(resData.DB_DATA)
                flattenOptions(resData.DB_DATA)
            }else{
                setDept_subDeptA([])
            }
        }catch(err){
        }finally {
            setLoading(false)
        }
}

    const handleSelectChangeAttendance = (selectedOption, field) => {
        console.log('selectedoptions', selectedOption)
        console.log('field', field)
        if(field === 'branch'){
            gettingSubBranchesAttendance(selectedOption.value)
            setBranchwiseRep((prevState) => ({
            ...prevState,
            [field]: selectedOption,
        }));
    } else if(field === 'department'){
        setBranchwiseRep((prevState) => ({
        ...prevState,
        [field]: selectedOption,
    }));
  } else if(field === 'month'){
    setBranchwiseRep((prevState) => ({
        ...prevState,
        [field]: selectedOption,
    }));

  } else if(field === 'year'){
    setBranchwiseRep((prevState) => ({
        ...prevState,
        [field]: selectedOption,
    }));

  } else if(field === 'employee'){
    setBranchwiseRep((prevState) => ({
        ...prevState,
        [field]: selectedOption,
    }));
  }
}

    const [attBranchList, setAttBranchList] = useState([])
    const getBranchWiseAttList = async(e) => {
        e.preventDefault();
        setLoading(true)
        ///console.log('which data is coming here', branchwiseRep.branch.value)
        const Bdata  = {
            branch: branchwiseRep.branch.value,
            deptt_id : branchwiseRep.department.value,
            month : branchwiseRep.month.value,
            year : branchwiseRep.year.value,
            emp_id: branchwiseRep.employee ? branchwiseRep.employee.value : null
        }
        ///console.log('data', Bdata)

        try{
            const response = await attendanceApi.getBranchWiseAtt(Bdata)
            const data = response.data
            ///console.log('branch wise', data)

            if(response.status === 200 && data.STATUS === 'SUCCESS'){
                setAttBranchList(data.DB_DATA)
            }
            
        } catch(error){
            console.log(error);
             showToast(error?.response?.data?.ERROR_DESCRIPTION, 'error')
        }finally {
            setLoading(false)
        }
    }

    const [showTable, setShowTable] = useState(false);
    const handleGetAttendance = (e) => {
        if (branchwiseRep.branch === null){
            showToast('Select Branch', 'error')
            return

        } else if( branchwiseRep.department === null){
            showToast('Select Department', 'error')
            return
        } else if(branchwiseRep.month=== ''){
            showToast('Select Month', 'error')
            return
        } else if(branchwiseRep.year === '') {
            showToast('Select Year', 'error')
            return
        } else {
            getBranchWiseAttList(e);
            setShowTable(true); 
        }
        
    };

    const [rawAtt, setRawAtt] = useState({
        emp_Id : '',
        month:'',
        year:''
    })

    const [rawLogsAtt, setRawLogsAtt] = useState([])

    const onChangeRaw = (selectedOption, field) => {
            setRawAtt((prevState) => ({
                ...prevState,
                [field]: selectedOption,
            }));
    }

    const [showTableRaw, setShowTableRaw] = useState(false);
    const handleGetAttRawLogs = async(e) => {
       /// console.log('rawAtt', rawAtt)
        if (e && e.preventDefault) {
            e.preventDefault()
        }
        setLoading(true)
        
        // Check if values are null, undefined, empty string, or don't have value property
        if (!rawAtt.emp_Id || rawAtt.emp_Id === null || rawAtt.emp_Id === '' || !rawAtt.emp_Id.value){
            showToast('Select Employee', 'error')
            setLoading(false)
            return
        } else if(!rawAtt.month || rawAtt.month === '' || !rawAtt.month.value){
            showToast('Select Month', 'error')
            setLoading(false)
            return
        } else if(!rawAtt.year || rawAtt.year === '' || !rawAtt.year.value) {
            showToast('Select Year', 'error')
            setLoading(false)
            return
        } else {
            const rawLogs  = {
                empId : rawAtt.emp_Id.value,
                month : rawAtt.month.value,
                year : rawAtt.year.value,
            }
            try{
                const response = await attendanceApi.getRawAttLogs(rawLogs) 
                const data = response.data 
                ///console.log('Raw Logs', data)
                if(data.STATUS === 'SUCCESS'){
                    setRawLogsAtt(data.DB_DATA)
                } else {
                    setRawLogsAtt([])

                }
            } catch(error){
                // showToast(error?.response?.data?.ERROR_DESCRIPTION)
                console.log(error)
            }finally {
                setLoading(false)
            }
            setShowTableRaw(true); 
        }
        
    };

    const [isIndividualAtt, setIsIndividualAtt] = useState(false)
    const [individualExport, setIndividualExport] = useState(false)

    const handleCheckboxChangeAtt = (e) => {
        if (individualExport) {
            setIndividualExport(e.target.checked)
        } else {
            setIsIndividualAtt(e.target.checked)
        }
    }

    const NewAdjustRequest = () => {
        openDrawer()
        gettingLateComers()
        settingDrawerSize(500)
        settingDrawerTitle('Custom Form')
        settingComponent(<CreateNewRequest />)
    }

    // const [requestData, setRequestData] = useState([])
    // const gettingRequestAdj = async() => {
    //     const dataReq = {
    //         form_label : 'ATT_TIME_ADJUSTMENT',
    //         getall : 'false',
    //         last_id : ''
    //     }
    //     console.log('dataReqTest',  dataReq)
    //     try{
    //         const response  = await attendanceApi.getAdjustRequest(dataReq)
    //         const data = response.data
    //         console.log('req data' ,data)
    //         if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
    //             setRequestData(data.DB_DATA)
    //         } 
    //     }catch(error){
    //         console.log(error)
    //     }

    // }

    const handleCloseAttDetail = () => {
        navigate(`/attendance/attendance_adjust_req`)
      }

    const handleDetailRequest = (id) => {
        navigate(`/attendance/attendance_adjust_req/detail_card/${id}`)
        gettingAdjDetail(id)

    }

   
    const editAdjRequest = (data) => {
        settingId(data._id)
        // console.log('edittt', data)
        settingEditData(data)
        openDrawer()
        gettingLateComers()
        settingDrawerSize(500)
        settingDrawerTitle('Edit Time Adjustment')
        settingComponent(<EditTimeAdjustment 
            data = {data}

        />)
    }


    

    const [editValues, setEditValues] = useState({
        id:'',
        in_time : editData.in_time,
        out_time : editData.out_time
    })

    const validationEditForm = () => {
        if(editValues.in_time === ''){
            showToast('In time is required', 'error')
            return
        } else if(editValues.out_time === ''){
            showToast('Out time is required', 'error')
            return
        }
        return true
    }

    const handleEditRequestedAdj = async(e) => {
        e.preventDefault()
        setLoading(true)
        const validate = validationEditForm()
        const dataEdit = {
            id : tempId,
            intime: editValues.in_time,
            outtime:editValues.out_time
        }

        const dataupdate = {
            _id : tempId,
            in_time: editValues.in_time,
            out_time:editValues.out_time
        }

        console.log('data',dataEdit)
        if(validate){
        try{
                const result = await updateTimeAdjustment(tempId, editValues.in_time, editValues.out_time)
                if(result.success){
                    showToast(result.data?.ERROR_DESCRIPTION || 'Time adjustment updated successfully', 'success')
                    updatedAdjRequest(dataupdate)
                    setEditValues({
                        id:'',
                        in_time : '',
                        out_time: ''
                    })
                    closeDrawer()
                } else {
                    showToast(result.error || 'Failed to update time adjustment', 'error')
                }
        }catch(error){
            console.log(error)
        }finally {
            setLoading(false)
        }
    }

    }

    const handleChangeReqAdj = (e) => {
        const {name, value} = e.target
        setEditValues((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    }

    const handleLoadMoreRequests = () => {
        gettingRequestAdj(true)
    }
    
    // Function to get employee recent attendance records
    const getEmployeeRecentRecords = async (empId) => {
        if (!empId) {
            showToast('Employee ID is required', 'error');
            return;
        }

        setLoadingRecentRecords(true);
        try {
            const response = await attendanceApi.getEmployeeRecentRecords(empId);
            const data = response.data;
            
            console.log('Employee Recent Records Response:', data);
            
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                setEmployeeRecentRecords(data.DB_DATA || []);
                // showToast('Recent attendance records loaded successfully', 'success');
            } else {
                setEmployeeRecentRecords([]);
                showToast(data.ERROR_DESCRIPTION || 'Failed to load recent records', 'error');
            }
        } catch (error) {
            console.error('Error fetching employee recent records:', error);
            setEmployeeRecentRecords([]);
            showToast(error.response?.data?.ERROR_DESCRIPTION || 'Failed to load recent records', 'error');
        } finally {
            setLoadingRecentRecords(false);
        }
    };

    const getLiveBiometricDevices = async() => {
        try {
            const response = await attendanceApi.getLiveBiometricDevices()
            const data = response.data
            //console.log('Live Biometric Devices', data)
            setLiveBiometricDevices(data.DB_DATA || [])
        } catch (error) {
            console.error('Error fetching live biometric devices:', error)
            setLiveBiometricDevices([])
        }
    };

    const updateLiveBiometricDevice = async(data) => {
        const updateData = {
            device_id: data.device_id,
            device_name: data.device_name
        }
        try {
            const response = await attendanceApi.updateLiveBiometricDevice(updateData)
            const data = response.data
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                showToast('Live biometric device updated successfully', 'success')
                setLiveBiometricDevices(data.DB_DATA || [])
                getLiveBiometricDevices();
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to update live biometric device', 'error')
            }
            console.log('Update Live Biometric Device', data)
        } catch (error) {
            console.error('Error updating live biometric device:', error)
        }
    };

  return {attendanceCardsItems,gettingLateComers, backNavigate, branchwiseRep, allAttArchiveReport, gettingAttReportArchive, attendanceBranches, branchesAttendance, handleSelectChangeAttendance, dept_subDeptA, flattenOptions, gettingSubBranchesAttendance, getBranchWiseAttList, attBranchList, showTable, setShowTable, handleGetAttendance, excelLayoutOptions, empListAtt, empSuggestionListAtt, rawLogsAtt, setRawLogsAtt, onChangeRaw, handleGetAttRawLogs, showTableRaw, setShowTableRaw, handleCheckboxChangeAtt, isIndividualAtt, individualExport,
    NewAdjustRequest, gettingRequestAdj, requestData, requestPagination, handleLoadMoreRequests, handleCloseAttDetail, individualRequestDetail, handleDetailRequest, editAdjRequest, handleEditRequestedAdj, editData, editValues, handleChangeReqAdj, updateTimeAdjustment, updatedAdjRequest,
    // Employee recent records
    employeeRecentRecords, loadingRecentRecords, getEmployeeRecentRecords, loading, setLoading, AttendanceNavTitles, getLiveBiometricDevices, liveBiometricDevices, updateLiveBiometricDevice
  }
}

export default useAttendance