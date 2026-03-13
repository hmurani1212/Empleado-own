import React, { useEffect, useState } from 'react'
import useStore from '../../Store/store'
import NewShiftForm from '../../View/ShiftPlanners/NewShiftForm'
import shiftApi from '../../Model/Data/ShiftPlanner/ShiftPlanner'
import { showToast } from '../../Components/Toaster/Toaster'
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import AddTeamForm from '../../View/ShiftPlanners/AddTeamForm'
import AddMemberForm from '../../View/ShiftPlanners/AddMemberForm'
import EditMemberForm from '../../View/ShiftPlanners/EditMemberForm'
import CreateNewShiftForm from '../../View/ShiftPlanners/CreateNewShiftForm'
import departmentsApi from '../../Model/Data/Departments/Departments'

const useShiftManagement = () => {
    const gettingAllShift = useStore((state) => state.gettingAllShift)
    const allShiftData = useStore((state) => state.allShiftData)
    const getAllBranchesShift = useStore((state) => state.getAllBranchesShift)
    const branchesShift = useStore((state) => state.branchesShift)
    const openDrawer = useStore ((state) => state.openDrawer)
    const settingDrawerTitle = useStore ((state) => state.settingDrawerTitle)
    const settingComponent = useStore ((state) => state.settingComponent)
    const settingDrawerSize = useStore ((state) => state.settingDrawerSize)
    const closeDrawer = useStore ((state) => state.closeDrawer)
    const mountShift = useStore((state) => state.mountShift)
    const addNewPlanner = useStore((state) => state.addNewPlanner)
    const gettingShifts = useStore((state) => state.gettingShifts)
    const shiftPlannersData = useStore((state) => state.shiftPlannersData)
    const gettingShiftTeams = useStore((state) => state.gettingShiftTeams)
    const allShiftTeams = useStore((state) => state.allShiftTeams)
    const gettingShiftTeamMembers = useStore((state) => state.gettingShiftTeamMembers)
    const allTeamMembers = useStore((state) => state.allTeamMembers)
    const deleteMember = useStore((state) => state.deleteMember)
    const availableTeams = useStore((state) => state.availableTeams)
    const selectedMemberForEdit = useStore((state) => state.selectedMemberForEdit)
    const gettingAvailableTeams = useStore((state) => state.gettingAvailableTeams)
    const setSelectedMemberForEdit = useStore((state) => state.setSelectedMemberForEdit)
    const updateMemberTeam = useStore((state) => state.updateMemberTeam)
    const teamId = useStore((state) => state.teamId)
    const settingTeamId = useStore((state) => state.settingTeamId)
    const idShift = useStore((state) => state.idShift)
    const settingShiftId = useStore((state) => state.settingShiftId)
    const addNewTeam = useStore((state) => state.addNewTeam)
    const allEmployeesDept = useStore((state) => state.allEmployeesDept)
    const employeesPagination = useStore((state) => state.employeesPagination)
    const deptEmployeesPlanner = useStore((state) => state.deptEmployeesPlanner)
    const addNewMemberPlanner = useStore((state) => state.addNewMemberPlanner)
    const emptyEmpList = useStore((state) => state.emptyEmpList)
    const settingPlannerId = useStore((state) => state.settingPlannerId)
    const plannerId = useStore((state) => state.plannerId)
    const creatingNewShift = useStore((state) => state.creatingNewShift)
    const rotatorSettingsData = useStore((state) => state.rotatorSettingsData)
    const allRotatorClock = useStore((state) => state.allRotatorClock)
    const allRotatorStatus = useStore((state) => state.allRotatorStatus)
    const rotatorId = useStore((state) => state.rotatorId)
    const clearAllPlannerData = useStore((state) => state.clearAllPlannerData)

    const shiftMenu = [
      {id:1, title:'Edit', icon:<FaPencilAlt className='text-green-500'/>},
      {id:2, title:'Delete', icon:<FaTrash className='text-red-500'/>}
    ]

    const [openDialog, setOpenDialog] = useState(false)
    const [isCreatingPlanner, setIsCreatingPlanner] = useState(false)
    const [isAddingTeam, setIsAddingTeam] = useState(false)
    const [isCreatingShift, setIsCreatingShift] = useState(false)
    const [isDeletingMember, setIsDeletingMember] = useState(false)
    const [isUpdatingMember, setIsUpdatingMember] = useState(false)
    const [isAddingMember, setIsAddingMember] = useState(false)
    const [isUpdatingRotator, setIsUpdatingRotator] = useState(false)
    const [isDownloadingRoster, setIsDownloadingRoster] = useState(false)

    const [memberId, setMemberId] = useState('')
    const handleDialog = (ele) => {
      setOpenDialog(!openDialog)
      setMemberId(ele)
    }
    const handleShiftMenu = (id, ele) => {
      switch(id) {
        case 1:
          handleEditMember(ele)
        break;

        case 2:
        console.log('Delete here')
        handleDialog(ele)

        break;

        default:
          console.log('Default Case')
      }
    }

    const handleCreateNewShift = async () => {
      await getAllBranchesShift()
      const freshBranches = useStore.getState().branchesShift
      openDrawer()
      settingDrawerSize(620)
      settingDrawerTitle('Create New Shift Planner')
      settingComponent(<NewShiftForm
        branchesShift={freshBranches}
      />)}

      
      const [plannerValues, setPlannerValues] = useState({
        branch : '',
        planner_name : ''
      })

      console.log("planner Values ", plannerValues)

      const validateCreatePlanner = () => {
        console.log("planner Values from valodate ", plannerValues)
        if (plannerValues.branch === ''){
          showToast('BranchId is required', 'error')
          return
        } else if (/^\s*$/.test(plannerValues.planner_name)){
          showToast('Planner Name is required', 'error')
          return 
        }
        return true
      }

      const handleCreatePlanner = async(e) => {
        e.preventDefault()

        const validate = validateCreatePlanner()

        const planner = {
        branch_id : plannerValues.branch,
        planner_name : plannerValues.planner_name

        }
        
        setIsCreatingPlanner(true)
        try{
          if (validate) {
            const response = await shiftApi.createPlanner(planner)
            const data = response.data
            console.log('Shift Creation', response)
            if(response.status === 201 && data.STATUS === "SUCCESSFUL"){
              gettingAllShift();
              setPlannerValues({
                branch : '',
                planner_name : ''
              })
              addNewPlanner(data.DB_DATA)
              showToast('Planner added Successfully', 'success')
              closeDrawer()
            }
          }
      } catch(error) {
          console.log(error)
      } finally {
          setIsCreatingPlanner(false)
      }       
    }

    const handleBranchShift = (name, event) => {
        
      console.log('Leave name, event', name, event)

      setPlannerValues((prevState) => ({
          ...prevState,
          [name] : event
      })) 
    }

    const handleShiftValues = (e) => {
      const {name, value} = e.target
      setPlannerValues((prevState) => ({
        ...prevState,
        [name] : value
      }))
    }

    // <-- Shifts -->
  const [selectedShift, setSelectedShift] = useState(null);

  const handleCardClick = (shift) => {
    console.log(shift)
    setSelectedShift(shift);
    gettingShifts(shift)
    console.log("shift from handleCardClick", shift)
    const id = shift.id || shift.planner_id
    
    settingPlannerId(id)
  }

  const [newShift, setNewShift] = useState(null)

  const handleShiftCard = (shift) => {
    // console.log('2nd one', shift)
    setNewShift(shift)
    gettingShiftTeams(shift)
   
  }

  const [teamMember, setTeamMember] = useState(null)
  const handleTeamCard = (shift) => {
    // console.log('3rd one', shift)
    settingTeamId(shift.id)
    setTeamMember(shift)
    gettingShiftTeamMembers(shift)
    fetchingAllBranchesPlanner()

  }

  const handleBackToGrid = () => {
    if(teamMember){
      setTeamMember(null)
    } else if(newShift) {
      setNewShift(null)
    }  else {
      setSelectedShift(null);
    }
  }

  const resetNestedStates = () => {
    setTeamMember(null)
    setNewShift(null)
  }

  const [openMenuShift, setOpenMenuShift] = useState([])
  const toggleMenuShift = (index, isOpen) => {
    setOpenMenuShift((prevOpenMenu) => ({
      ...prevOpenMenu,
      [index] : isOpen
    }))
  }

  const handleDeleteMember = async() => {
    // console.log('For Delete', memberId.emp_id, teamId)
    const delData = {
      emp_id: memberId.emp_id,
      team_id: teamId
    }

    setIsDeletingMember(true)
    try{
      const response = await shiftApi.deleteTeamMember(delData)
      const data = response.data
      console.log('Delete', data)

      if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
        setOpenDialog(false)
        deleteMember(memberId.emp_id)
        showToast('Member Deleted Successfully', 'success')
      } else {
        showToast(`${data.ERROR_DESCRIPTION}`, 'error')
      }
    } catch (error){
      console.log(error)
      if (error.response && error.response.data) {
        showToast(error.response.data.ERROR_DESCRIPTION || 'Server Error', 'error')
      }
    } finally {
      setIsDeletingMember(false)
    }
  }

  const handleAddTeam = (shiftId) => {
    // console.log('for shift id', shiftId)
    settingShiftId(shiftId.id)
    openDrawer()
    settingDrawerSize(620)
    settingDrawerTitle('Add Team')
    settingComponent(<AddTeamForm  

    />)}

    // <-- Add Team --> 
    const [newTeamValues, setNewTeamValues] = useState({
      shift_id: '',
      team_name:'',
      team_off_days:[]
    })

    const validateShiftTeams = () => {
      if(idShift === '') {
        showToast('Shift Id is required', 'error')
        return

      } else if(/^\s*$/.test(newTeamValues.team_name)) {
        showToast('Team Name is required', 'error')
        return
      }

      return true
    }

    const handleAddNewTeam = async(e) => {
      e.preventDefault()
      const validate = validateShiftTeams()
      console.log(idShift)

      const newTeamData = {
        shift_id: String(idShift),
        team_name: newTeamValues.team_name,
        team_off_days:newTeamValues.team_off_days.map(day => day.toLowerCase())
      }
      
      setIsAddingTeam(true)
      try{
        if(validate) {
          const response = await shiftApi.addTeams(newTeamData)
          const data = response.data
          console.log('add team', data)
          
          if(response.status === 201 && data.STATUS === 'SUCCESSFUL'){
            showToast('Team Added Successfully', 'success')
            setNewTeamValues({
              shift_id: '',
              team_name:'',
              team_off_days:[]
            })
            addNewTeam(data.DB_DATA)
            closeDrawer()
          }
        }
        
      } catch(error){
        console.log(error)
      } finally {
        setIsAddingTeam(false)
      }
    }

    const handleChangeTeam = (e) => {
      const {name, value, type, checked} = e.target

      if (type === 'checkbox') {
        setNewTeamValues((prevState) => ({
            ...prevState,
            [name]: checked
        }));
    } else {
      setNewTeamValues((prevState) => ({
            ...prevState,
            [name]: value
        }));
    }
    }
  
    const handleCheckboxChange = (e) => {
      const { name, checked, value } = e.target;
      console.log('****',  name, checked, value)
        setNewTeamValues((prevState) => {
          const team_off_days = checked
          ? [...prevState.team_off_days, name]
          : prevState.team_off_days.filter((day) => day !== name);
    
          return {
            ...prevState,
            team_off_days
          };
        });
  
  };


  // <-- Add Team Member -->
  const [newMemberValues, setNewMemberValues] = useState({
    department: null,
    branch: null,
    ids : []
  })  

  const handleAddMember = (team) => {
    console.log('Add Memeber', team.id, teamId)
    emptyEmpList()
    openDrawer()
    fetchingAllBranchesPlanner()
    settingDrawerSize(620)
    settingDrawerTitle('Add New Member')
    settingComponent(<AddMemberForm 
      teamId = {teamId}
      teamBranches = {teamBranches}
    />)
  }

  const [teamBranches, setTeamBranches]  = useState([])

  const fetchingAllBranchesPlanner = async()=>{
    try{
        const response = await departmentsApi.gettingAllDepartments()
        console.log('branches response',response)
        const data = response.data
        console.log("data of the branches", data)
        if(response.status ===  200 && data.STATUS === "SUCCESSFUL"){
          setTeamBranches(data.DB_DATA.branches)
        }

    }catch(err){

    }
}



const flattenOptions = (data) => {
  console.log('flatten', data);
  let flattenedOptions = [];

  data?.departments?.forEach((dept) => {
    flattenedOptions.push({
      label: dept.name,
      value: dept.id,
      isParent: true
    });

    if (dept.children?.length > 0) {
      dept.children.forEach((subDept) => {
        flattenedOptions.push({
          label: subDept.name,
          value: subDept.id,
          isChild: true
        });
      });
    }
  });

  return flattenedOptions;
};

const [dept_subDeptP, setDept_subDeptP] = useState([])

const gettingSubBranchesPlanner = async(id)=>{
  console.log("id", id)
  const data = {branchId: id}
  try{

      const response = await departmentsApi.manageDepartments(data.branchId)
      console.log('sub dept', response)
      const resData = response.data
      
      if(response.status === 200 && resData.STATUS === "SUCCESSFUL"){
          setDept_subDeptP(resData.DB_DATA)
          flattenOptions(resData.DB_DATA)
      }else{
        setDept_subDeptP([])
      }
  }catch(err){

  }
}

  const handleSelectChangePlanner = (selectedOption, field) => {
    console.log('selectedoptions', selectedOption)
    console.log('field', field)
    if(field === 'branch'){
      emptyEmpList()
      gettingSubBranchesPlanner(selectedOption.value)
      setNewMemberValues((prevState) => ({
        ...prevState,
        [field]: selectedOption,
        ids : []
    }));

  } else if(field === 'department'){
    // Extract the value - handle 0 correctly (0 is falsy but valid)
    // If selectedOption is an object with a value property, use it (even if 0)
    // Otherwise, use selectedOption directly if it's a primitive value
    const deptId = (selectedOption && typeof selectedOption === 'object' && 'value' in selectedOption)
      ? selectedOption.value
      : selectedOption
    console.log('Department ID being sent:', deptId)
    // Reset to page 1 when department changes
    deptEmployeesPlanner(deptId, 1, 10)
    setNewMemberValues((prevState) => ({
      ...prevState,
      [field]: selectedOption,
      ids : []
    }));
  }  
}

  const validateMember = () => {
    if(newMemberValues.ids.length === 0){
      showToast('Select Employees', 'error')
      return
    } else if(newMemberValues.teamId === ''){
      showToast('Team ID is required', 'error')
    } 

    return true
  }

  const handleAddMemberPlanner = async(e) => {
    console.log(teamId)
    e.preventDefault()
    const validate = validateMember()

    const addMemberData = {
      emp_ids : newMemberValues.ids,
      team_id : teamId
    }

    setIsAddingMember(true)
      try{
        if(validate) {
          const response = await shiftApi.addTeamMembers(addMemberData)
          const data = response.data
          console.log('Added', response)

          if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
            addNewMemberPlanner([data.DB_DATA.added_employees])
            gettingShiftTeamMembers({id: teamId})
            setNewMemberValues({
              department: null,
              branch: null,
              ids : []
            })
            showToast('Member Added Successfully', 'success')
            closeDrawer()
          } else {
            showToast(`${data.ERROR_DESCRIPTION}`, 'error')
          }
        } 
      } catch(error){
        console.log(error)
        if (error.response && error.response.data) {
          showToast(error.response.data.ERROR_DESCRIPTION || 'Server Error', 'error')
        }
      } finally {
        setIsAddingMember(false)
      }
  }

  const handleCheckEmp = (e) => {
    const {value, checked} = e.target
    console.log('handleCheckEmp',value, checked)

    setNewMemberValues((prevState) => {
      const ids = checked
      ? [...prevState.ids, value]
      : prevState.ids.filter((id) => id !== value);

      return {
        ...prevState,
        ids
      };
    }
  );

  }


  // <-- Create New Shift -->

  const [shiftNewValues, setShiftNewValues] = useState({
    planner_id : '',
    shift_name : '',
    opening_time : '',
    closing_time : ''
  })

  const handleNewShift = (planner) => {
    // console.log('shift if', planner.id || planner.planner_id)
    // const id = planner.id || planner.planner_id
    
    // settingPlannerId(id)
    openDrawer()
    settingDrawerSize(620)
    settingDrawerTitle('Create New Shift')
    settingComponent(<CreateNewShiftForm 
      plannerId = {String(plannerId)}
    />)
  }

  const validateShifts = () => {
     if(/^\s*$/.test(shiftNewValues.shift_name)){
      showToast('Shift Name is required', 'error')
      return;

    } else if(shiftNewValues.opening_time === '') {
      showToast('Opening Time is required', 'error')
      return;

    } else if(shiftNewValues.closing_time ===''){
      showToast('Closing Time is required', 'error')
      return;
    }
    return true
  }

  const createNewShift = async(e) => {
    console.log('I am planner Id', plannerId)

    e.preventDefault()
    const validate = validateShifts()

    const shiftData = {
      planner_id : String(plannerId),
      shift_name : shiftNewValues.shift_name,
      opening_time : shiftNewValues.opening_time,
      closing_time : shiftNewValues.closing_time,
    }

    console.log('shiftData', shiftData)

    setIsCreatingShift(true)
    try{

      if(validate) {
        const response = await shiftApi.createNewShift(shiftData)
        const data = response.data
        
        console.log('Creating New Shift', response)
        
        if(response.status === 201 && data.STATUS ==='SUCCESSFUL'){
          showToast('New Shift Created Successfully', 'success')
          setShiftNewValues({
            planner_id : '',
            shift_name : '',
            opening_time : '',
            closing_time : ''
          })
          
          creatingNewShift(data.DB_DATA)
          closeDrawer()
        } else {
          showToast(data.ERROR_DESCRIPTION, 'error')
        }
      } 
    } catch(error){
      console.log(error)
    } finally {
      setIsCreatingShift(false)
    }
  }

  const handleChangeShift = (e) => {
    const {name, value} = e.target
    setShiftNewValues((prevState) => ({
      ...prevState,
      [name] : value
    }))
  }

  // <-- Rotator Setting -->
  const [openDialogRotator, setOpenDialogRotator] = useState(false)
  const handleDialogRotator = () => {
    setOpenDialogRotator(!openDialogRotator)  
  }

  const [openRosterDialog, setOpenRosterDialog] = useState(false)
  const handleRosterDialog = () => {
    console.log('handleRosterDialog called, current state:', openRosterDialog)
    setOpenRosterDialog(!openRosterDialog)
    console.log('handleRosterDialog new state should be:', !openRosterDialog)
  }


  const handleRotator = (planner) => {
    handleDialogRotator()
    console.log(planner.id)
    rotatorSettingsData(planner.id)
    settingPlannerId(planner.id)
  }

  const [rotatorSettingValues, setRotatorSettingValues] = useState({
    rotator : '',
    planner_id :'',
    period : '',
    from :'',
    onRotator: '',
    offRotator: ''
  })

  const [rosterValues, setRosterValues] = useState({
    dateFrom: '',
    dateUpto: ''
  })

  const changeRotatorSetting = async(e) => {
    e.preventDefault()
    
    if (!rotatorId) {
      showToast('Rotator ID is missing', 'error')
      return
    }
    
    const periodValue = rotatorSettingValues.period || allRotatorClock?.DB_DATA?.rotator_data?.period_days
    
    if (!periodValue || isNaN(periodValue)) {
      showToast('Period must be a valid number', 'error')
      return
    }
    
    if (!rotatorSettingValues.from) {
      showToast('Please select a date', 'error')
      return
    }
    
    const setRotatorData = {
      rotator_id : parseInt(rotatorId),
      period : Number(periodValue),
      from : rotatorSettingValues.from
    }

    setIsUpdatingRotator(true)
    try{
      const response = await shiftApi.setRotatorSetting(setRotatorData)
      const data = response.data
      console.log("rldklshkldskdhskdh", response)

      if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
        showToast('Rotator Setting Updated Successfully', 'success')
        setRotatorSettingValues({
          rotator : '',
          planer_id :'',
          period : '',
          from :'',
          onRotator: '',
          offRotator: ''
        })
        console.log('Closing rotator dialog')
        handleDialogRotator()
      } else {
        showToast(`${data.ERROR_DESCRIPTION}`, 'error')
      }
    } catch(error){
      console.log(error)
      showToast('Failed to update rotator settings', 'error')
    } finally {
      setIsUpdatingRotator(false)
    }

  }

  const handleChangeRotator = (e) => {
    const {name, value} = e.target
    setRotatorSettingValues((prevState) => ({
      ...prevState,
      [name] : value
    }))
  }

  const handleRotatorRadioChange = async (shiftId, value) => {
    const newStatus = value === 'on' ? 1 : 0
    const shift = allRotatorStatus.DB_DATA.find(s => `shift_${s.shift_id}` === shiftId)
    
    console.log('Shift ID:', shiftId)
    console.log('Value:', value)
    console.log('New Status:', newStatus)
    console.log('Shift found:', shift)
    console.log('Current shift status:', shift?.status)
    
    if (!shift) return
    
    try {
      console.log('Sending to API:', {
        shift_id: shift.shift_id,
        planner_id: plannerId,
        status: newStatus
      })
      
      await shiftApi.updateShiftRotatorStatus({
        shift_id: shift.shift_id,
        planner_id: plannerId,
        status: newStatus
      })
      
      const updatedShifts = allRotatorStatus.DB_DATA.map(s => {
        if (`shift_${s.shift_id}` === shiftId) {
          return { ...s, status: newStatus }
        }
        return s
      })
      
      useStore.setState({
        allRotatorStatus: { DB_DATA: updatedShifts }
      })
      
      console.log('Updated shifts:', updatedShifts)
      showToast('Shift status updated successfully', 'success')
    } catch (error) {
      console.log(error)
      showToast('Failed to update shift status', 'error')
    }
  }

  const handleRosterChange = (e) => {
    const {name, value} = e.target
    setRosterValues((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleDownloadRoster = async () => {
    if (!rosterValues.dateFrom || !rosterValues.dateUpto) {
      showToast('Please select both dates', 'error')
      return
    }

    setIsDownloadingRoster(true)
    try {
      const shiftsWithStatusOn = allRotatorStatus.DB_DATA.filter(shift => shift.status === 1)
      
      if (shiftsWithStatusOn.length === 0) {
        showToast('No shifts with rotator status ON', 'error')
        return
      }

      let downloadCount = 0
      let errorCount = 0

      for (const shift of shiftsWithStatusOn) {
        try {
          const response = await shiftApi.downloadRoster({
            shift_id: shift.shift_id,
            date_from: rosterValues.dateFrom,
            date_upto: rosterValues.dateUpto
          })

          const data = response.data
          console.log('Roster API Response:', data)

          if (response.status === 200 && data.STATUS === 'SUCCESSFUL' && data.DB_DATA) {
            // Convert JSON data to CSV format
            const rosterData = data.DB_DATA
            let csvContent = ''
            
            // Create CSV header and rows based on the roster data structure
            if (rosterData.roster && Array.isArray(rosterData.roster)) {
              // Add header
              csvContent += 'Employee Name,'
              const dates = Object.keys(rosterData.roster[0] || {}).filter(key => key !== 'employee_name')
              csvContent += dates.join(',') + '\n'
              
              // Add rows
              rosterData.roster.forEach(emp => {
                csvContent += `${emp.employee_name},`
                dates.forEach(date => {
                  csvContent += `${emp[date] || ''},`
                })
                csvContent += '\n'
              })
            } else {
              csvContent = JSON.stringify(rosterData, null, 2)
            }
            
            // Create and download CSV file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${shift.shift_name}_roster.csv`
            link.style.display = 'none'
            document.body.appendChild(link)
            link.click()
            setTimeout(() => {
              document.body.removeChild(link)
              window.URL.revokeObjectURL(url)
            }, 100)
            downloadCount++
          } else {
            console.log('No roster data available')
            errorCount++
          }
        } catch (shiftError) {
          console.log(`Failed to download roster for ${shift.shift_name}`, shiftError)
          errorCount++
        }
      }

      if (downloadCount > 0) {
        showToast(`${downloadCount} roster(s) downloaded successfully`, 'success')
      }
      if (errorCount > 0) {
        showToast(`${errorCount} roster(s) failed. Please save rotator settings first.`, 'error')
      }
      handleRosterDialog()
    } catch (error) {
      console.log(error)
      showToast('Failed to download roster', 'error')
    } finally {
      setIsDownloadingRoster(false)
    }
  }

  // <-- Edit Member -->
  const [editMemberValues, setEditMemberValues] = useState({
    emp_id: '',
    current_team_id: '',
    new_team_id: null,
    member_name: '',
    schedule_changing_time: false,
    schedule_date: '',
    schedule_time: '',
    show_schedule_time_picker: false,
    move_back_date: '',
    move_back_time: '',
    show_time_picker: false
  })

  const handleEditMember = (member) => {
    console.log('Edit Member', member)
    setSelectedMemberForEdit(member)
    setEditMemberValues({
      emp_id: member?.emp_id || '',
      current_team_id: teamId || '',
      new_team_id: null,
      member_name: member?.name || '',
      schedule_changing_time: false,
      schedule_date: '',
      schedule_time: '',
      show_schedule_time_picker: false,
      move_back_date: '',
      move_back_time: '',
      show_time_picker: false
    })
    gettingAvailableTeams(member?.emp_id)
    openDrawer()
    settingDrawerSize(620)
    settingDrawerTitle('Change Employee Team')
    settingComponent(<EditMemberForm />)
  }

  const handleEditSelectChange = (selectedOption, field) => {
    if(field === 'move_back_date' || field === 'schedule_date' || field === 'move_back_time' || field === 'schedule_time') {
      setEditMemberValues((prevState) => ({
        ...prevState,
        [field]: selectedOption.target.value
      }))
    } else {
      setEditMemberValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }))
    }
  }

  const handleEditCheckboxChange = (e, field) => {
    const { checked } = e.target
    setEditMemberValues((prevState) => ({
      ...prevState,
      [field]: checked
    }))
  }

  const validateEditMember = () => {
    if(!editMemberValues.new_team_id) {
      showToast('Please select a team', 'error')
      return false
    }
    return true
  }

  const handleUpdateMember = async(e) => {
    e.preventDefault()
    const validate = validateEditMember()

    if (!validate) {
      return
    }

    // Safely extract team_id value
    const teamIdValue = editMemberValues.new_team_id?.value || editMemberValues.new_team_id
    
    if (!teamIdValue) {
      showToast('Please select a team', 'error')
      return
    }

    const updateData = {
      emp_id: parseInt(editMemberValues.emp_id) || parseInt(selectedMemberForEdit?.emp_id),
      team_id: parseInt(teamIdValue),
      schedule: editMemberValues.schedule_changing_time,
      SCTime: editMemberValues.schedule_changing_time ? `${editMemberValues.schedule_date} ${editMemberValues.schedule_time}` : null,
      SCRevertDate: editMemberValues.move_back_date || null,
      SCRevertTime: editMemberValues.move_back_time || null
    }
    
    console.log('updateData', updateData)
    setIsUpdatingMember(true)
    try {
      const response = await shiftApi.updateTeamMember(updateData)
      console.log("update team member ", response)
      const data = response.data
      
      if(response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        updateMemberTeam(data.DB_DATA)
        setEditMemberValues({
          emp_id: '',
          current_team_id: '',
          new_team_id: null,
          member_name: '',
          schedule_changing_time: false,
          schedule_date: '',
          schedule_time: '',
          show_schedule_time_picker: false,
          move_back_date: '',
          move_back_time: '',
          show_time_picker: false
        })
        showToast('Member Updated Successfully', 'success')
        closeDrawer()
      } else {
        showToast(data.ERROR_DESCRIPTION || 'Update Failed', 'error')
      }
    } catch(error) {
      console.log(error)
      if (error.response && error.response.data) {
        showToast(error.response.data.ERROR_DESCRIPTION || 'Server Error', 'error')
      }
    } finally {
      setIsUpdatingMember(false)
    }
  }


  return {gettingAllShift, allShiftData, getAllBranchesShift, handleCreateNewShift, branchesShift, mountShift, handleCreatePlanner, plannerValues, handleBranchShift, handleShiftValues, gettingShifts, shiftPlannersData, selectedShift, handleCardClick, handleBackToGrid, handleShiftCard, newShift, allShiftTeams, gettingShiftTeamMembers, allTeamMembers, teamMember, handleTeamCard, openMenuShift,toggleMenuShift, shiftMenu, handleShiftMenu, handleDialog,
    openDialog, handleDeleteMember, handleAddTeam, handleAddNewTeam, handleChangeTeam, newTeamValues, handleCheckboxChange, handleAddMember, newMemberValues, teamBranches, fetchingAllBranchesPlanner, handleSelectChangePlanner, dept_subDeptP, flattenOptions, allEmployeesDept, employeesPagination, deptEmployeesPlanner, handleAddMemberPlanner, handleCheckEmp, handleNewShift, createNewShift, shiftNewValues, handleChangeShift, handleRotator, handleDialogRotator, openDialogRotator,
    allRotatorStatus, allRotatorClock, changeRotatorSetting, rotatorSettingValues, handleChangeRotator, handleRotatorRadioChange, openRosterDialog, handleRosterDialog, rosterValues, handleRosterChange, handleDownloadRoster, editMemberValues, availableTeams, handleEditMember, handleEditSelectChange, handleUpdateMember, handleEditCheckboxChange,
    isCreatingPlanner, isAddingTeam, isCreatingShift, isDeletingMember, isUpdatingMember, isAddingMember, isUpdatingRotator, isDownloadingRoster, clearAllPlannerData, resetNestedStates
   }
}

export default useShiftManagement