import { Button, Checkbox, Radio, Typography } from '@material-tailwind/react'
import React, { useEffect } from 'react'
import { notebookShareData, sharenotbookPermissionData, sharenotebookShareWithData, filterDepartmentsForBranch, fetchActiveEmployeesForBranchDept } from '../../services/__notesPoolServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import useEmployeeCheckList from '../../ViewModel/EmployeeViewModel/EmpCheckListServices'
import { IoCheckmarkCircleOutline } from 'react-icons/io5'
import { HiDocumentDuplicate } from 'react-icons/hi2'

// Share modal: keep dropdown inside dialog with comfortable spacing
const shareSelectStyles = {
  menu: (base) => ({
    ...base,
    marginTop: 6,
    marginBottom: 14,
    padding: '10px 12px',
    borderRadius: 12,
    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.14)',
    boxSizing: 'border-box',
  }),
  menuList: (base) => ({
    ...base,
    padding: '8px 10px',
  }),
  option: (base) => ({
    ...base,
    padding: '11px 14px',
    borderRadius: 8,
  }),
  control: (base) => ({
    ...base,
    paddingLeft: 10,
    paddingRight: 8,
  }),
}

const BranchView = (props)=>{
    const {shareNotebookValue, handleChangeShareNotebook} = props 
    const { fetchingAllBranches, empBranches } = useEmployees();

      useEffect(() => {
        fetchingAllBranches();
      }, [])

    return(
        <div className='flex flex-col'>
            <label className='text-[#698592] text-[12px]'>Select Branch</label>
            <div>
                {empBranches?.map((ele)=>(
                    <Checkbox 
                        key={ele.id}
                        color='blue'
                        name="empBranches_id"
                        value={ele.id}
                        label={
                            <Typography className='text-[12px]'>
                                {ele.branch_name}
                            </Typography>
                        }
                        onChange={handleChangeShareNotebook}
                    />
                ))}
            
            </div>
        </div>
    )
    
}
const DepartmentView = (props)=>{
    const {shareNotebookValue, handleToggleSubDept, handleChangeShareNotebook} = props 
    const { employeeCheckListValue, handleEmpCheckList } = useEmployeeCheckList();

    useEffect(() => {
        handleEmpCheckList();
    }, []);

    return(
        <div className='flex flex-col'>
            <label className='text-[#698592] text-[12px]'>Select Department</label>
            <div className='flex flex-col'>
                {employeeCheckListValue?.departmentList?.departments?.length > 0 && employeeCheckListValue.departmentList?.departments?.map((ele) => (
                    <div key={ele.id}>
                        {/* Parent Department */}
                        <Checkbox
                            color='blue'
                            label={
                                <Typography className='text-[12px]'>
                                    {ele.name}
                                </Typography>
                            }
                            name='empDepartment_id'
                            value={ele.id}
                            onClick={() => handleToggleSubDept(ele.id)}
                            onChange={handleChangeShareNotebook}
                        />

                        {/* Sub-departments */}
                        {shareNotebookValue.showSubDept.includes(ele.id) && ele.sub_dept && (
                            <div className='ml-4'>
                                {ele.sub_dept.map((subEle) => (
                                    <Checkbox
                                        key={subEle.id}
                                        color='blue'
                                        label={
                                            <Typography className='text-[12px]'>
                                                {subEle.name}
                                            </Typography>
                                        }
                                        name='empDepartment_id'
                                        value={ele.id}
                                        onChange={handleChangeShareNotebook}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
    
}



// const EmployeeView = (props)=>{
//     const {shareNotebookValue, handleSelectShareNote,handleChangeShareNotebook} = props
//     const { fetchingAllBranches, empBranches } = useEmployees();
//     const { employeeCheckListValue, handleEmpCheckList } = useEmployeeCheckList();

//     useEffect(() => {
//         fetchingAllBranches();
//         handleEmpCheckList();
//         console.log(employeeCheckListValue)
//         console.log("emp branc ????????????????????+++++++++++++++++++++++ : ", empBranches)
//     }, [])

//     return(
//         <div className='space-y-3'>
//             <div>
//                 <span className='text-[#698592] text-[12px]'>Employee</span>
//             </div>
//             <div className='flex justify-between items-center'>
//                 <div className='flex flex-col'>
//                     <label className='text-[#698592] text-[12px]'>Select Branch</label>
//                     <div className='w-96'>
//                         <CustomSelect 
//                             placeHolderTitle = 'Branch'
//                             options = {empBranches?.map((ele)=> ({value:ele.id, label:ele.branch_name}))}
//                             cStyle = {false}
//                             onChangeHandler = {(select)=> handleSelectShareNote(select, 'empBranches_id')}

//                             // value={shareNotebookValue?.notebook_id}
//                             // onChangeHandler = {(select)=> handleSelectShareNote(select, 'notebook_id')}

//                         />
//                     </div>
//                 </div>
//                 <div className='flex flex-col'>
//                     <label className='text-[#698592] text-[12px]'>Select Department</label>
//                     <div className='w-96'>
//                         <CustomSelect 
//                             placeHolderTitle = 'Department'
//                             options={employeeCheckListValue?.departmentList?.departments?.map((ele)=> ({value:ele.id, label:ele.name}))}
//                             cStyle = {true}
//                             value={employeeCheckListValue?.departmentList?.departments?.id}
//                             onChangeHandler = {(select)=> handleSelectShareNote(select, 'empDepartment_id')}

//                         />
//                     </div>
//                 </div>
//             </div>
//             <div className='flex items-center gap-1 flex-wrap'>
//                 {employeeCheckListValue?.departmentList?.departments?.map((ele) => ele?.employees).employees?.map((ele)=>(
//                     <Checkbox 
//                         name='emp_id'
//                         value={ele.id}
//                         key={ele.id}
//                         label={
//                             <Typography className='text-[12px]'>
//                                 {ele.name}
//                             </Typography>
//                         }
//                         onChange={handleChangeShareNotebook}
//                     />
//                 ))}
//             </div>
//         </div>
//     )
// }

const EmployeeView = (props) => {
    const { shareNotebookValue, handleSelectShareNote, handleChangeShareNotebook } = props;
    const { fetchingAllBranches, empBranches } = useEmployees();
    const { employeeCheckListValue, handleEmpCheckList } = useEmployeeCheckList();
  
    const [selectedBranch, setSelectedBranch] = React.useState(null);
    const [selectedDept, setSelectedDept] = React.useState(null);
    const [activeShareEmployees, setActiveShareEmployees] = React.useState([]);
    const [loadingShareEmployees, setLoadingShareEmployees] = React.useState(false);
  
    useEffect(() => {
      fetchingAllBranches();
    }, []);

    useEffect(() => {
      if (selectedBranch?.value === undefined || selectedBranch?.value === null) return;
      handleEmpCheckList(selectedBranch.value);
    }, [selectedBranch?.value]);

    useEffect(() => {
      if (!selectedDept?.value || selectedBranch?.value === undefined || selectedBranch?.value === null) {
        setActiveShareEmployees([]);
        return;
      }
      let cancelled = false;
      setLoadingShareEmployees(true);
      fetchActiveEmployeesForBranchDept(selectedBranch.value, selectedDept.value).then((rows) => {
        if (!cancelled) setActiveShareEmployees(rows);
      }).finally(() => {
        if (!cancelled) setLoadingShareEmployees(false);
      });
      return () => {
        cancelled = true;
      };
    }, [selectedDept?.value, selectedBranch?.value]);

    const filteredDepartments = selectedBranch
      ? filterDepartmentsForBranch(
          employeeCheckListValue?.departmentList?.departments,
          selectedBranch.value
        )
      : [];
  
    return (
      <div className="space-y-3">
        <div>
          <span className="text-[#698592] text-[12px]">Employee</span>
        </div>
  
        {/* Branch + Department side by side (UI same as your code) */}
        <div className="flex justify-between items-center">
          {/* Branch */}
          <div className="flex flex-col">
            <label className="text-[#698592] text-[12px]">Select Branch</label>
            <div className="w-96">
              <CustomSelect
                placeHolderTitle="Branch"
                options={empBranches?.map((ele) => ({
                  value: ele.id,
                  label: ele.branch_name,
                }))}
                cStyle={false}
                customStyles={shareSelectStyles}
                menuPlacement="auto"
                value={selectedBranch}
                onChangeHandler={(select) => {
                  setSelectedBranch(select);
                  setSelectedDept(null);
                  setActiveShareEmployees([]);
                  handleSelectShareNote(select, "empBranches_id");
                }}
              />
            </div>
          </div>
  
          {/* Department */}
          <div className="flex flex-col">
            <label className="text-[#698592] text-[12px]">Select Department</label>
            <div className="w-96">
              <CustomSelect
                placeHolderTitle="Department"
                options={filteredDepartments.map((ele) => ({
                  value: ele.id,
                  label: ele.name,
                }))}
                cStyle={true}
                customStyles={shareSelectStyles}
                menuPlacement="auto"
                value={selectedDept}
                onChangeHandler={(select) => {
                  setSelectedDept(select);
                  handleSelectShareNote(select, "empDepartment_id");
                }}
                isDisabled={!selectedBranch} // disable until branch is chosen
              />
            </div>
          </div>
        </div>
  
        <div className="flex items-center gap-1 flex-wrap">
          {loadingShareEmployees ? (
            <Typography className="text-[12px] text-gray-500">Loading employees…</Typography>
          ) : (
            activeShareEmployees.map((emp) => (
            <Checkbox
              name="emp_id"
              value={emp.id}
              key={emp.id}
              label={<Typography className="text-[12px]">{emp.name}</Typography>}
              onChange={handleChangeShareNotebook}
            />
          ))
          )}
        </div>
      </div>
    );
  };  
  


const ShareNoteBook = (props) => {
    const { handleChangeShareNotebook,shareNotebookValue,handleSelectShareNote,
        handleShareNotebookAdd,handleToggleSubDept,mySharedNotebooks,
        handleCopytoClipboard, handleCopytoClipboardMouseLeave, copied
     } = props

  return (
    <div className='space-y-4 mb-2'>
        <div className='flex items-center justify-between'>
            {notebookShareData.map((ele)=>(
                <Radio 
                    key={ele.id}
                    name="type"
                    checked={ ele.id === shareNotebookValue.type }
                    value={ele.id}
                    label={
                        <Typography>
                            {ele.title}
                        </Typography>
                    }
                    color='blue'
                    onChange={(e) => {
                        handleChangeShareNotebook(e);
                    }}
                />
            ))}
        </div>
        <div className='p-3 mb-6'>
            {
                shareNotebookValue.type === 1 ? 
                    (
                        <div className='space-y-3'>
                            <div className='w-96'>
                                <label className='text-[#698592] text-[12px]'>Select Shared Notebook</label>
                                <CustomSelect 
                                    placeHolderTitle = 'Choose a shared notebook'
                                    options = {Array.isArray(mySharedNotebooks) ? mySharedNotebooks.map((ele)=> ({value:ele._id, label:ele.notebook_name})) : []}
                                    cStyle = {false}
                                    value={shareNotebookValue?.shared_notebook_id}
                                    onChangeHandler = {(select)=> handleSelectShareNote(select, 'shared_notebook_id')}
                                />
                            </div>
                        </div>
                    )
                :
                shareNotebookValue.type === 2 ?
                    (
                        <div>
                        {/* // <div className={`space-y-2 ${shareNotebookValue.type == 2 && 'h-[calc(100vh-300px)] overflow-auto customScroll xl:h-[calc(100vh-600px)]' } border border-black`}> */}
                            <div className='flex-1 px-2 space-y-1 w-96'>
                                <label className='text-[#698592] text-[12px]'>Notebook Name</label>
                                <input 
                                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                                    type='text' 
                                    value={ shareNotebookValue?.notebook_name}
                                    name='notebook_name' 
                                    onChange={handleChangeShareNotebook}
                                />
                            </div>
                            <div className='flex-1 px-2 space-y-1'>
                                <label className='text-[#698592] text-[12px]'>Allow Permission</label>
                                <div className='flex flex-wrap'>
                                    {
                                        sharenotbookPermissionData.map((ele)=>(
                                            <Checkbox 
                                                key={ele.id}
                                                color='blue'
                                                label={
                                                    <Typography className='text-[12px]'>
                                                        {ele.title}
                                                    </Typography>
                                                }
                                                value={ele.fieldName}
                                                name='allowPermission'
                                                checked={shareNotebookValue.allowPermission.includes(ele.fieldName)}
                                                onChange={handleChangeShareNotebook}
                                            />
                                        ))
                                    }
                                </div>
                            </div>
                            <div className='flex-1 px-2 space-y-1'>
                                <label className='text-[#698592] text-[12px]'>Share With</label>
                                <div className='flex'>
                                    {
                                        sharenotebookShareWithData.map((ele)=>(
                                            <Checkbox 
                                                key={ele.id}
                                                color='blue'
                                                name="shareWith"
                                                value={ele.value}
                                                checked={ ele.value === shareNotebookValue.shareWith }
                                                label={
                                                    <Typography className='text-[12px]'>
                                                        {ele.title}
                                                    </Typography>
                                                }
                                                onChange={handleChangeShareNotebook}
                                            />
                                        ))
                                    }
                                </div>
                            </div>
                            {
                                shareNotebookValue.shareWith === "branch" ? 

                                <BranchView 
                                    shareNotebookValue = {shareNotebookValue}
                                    handleChangeShareNotebook = {handleChangeShareNotebook}
                                />

                                :

                                shareNotebookValue.shareWith === "dept" ?
                                <DepartmentView 
                                    shareNotebookValue = {shareNotebookValue}
                                    handleToggleSubDept = {handleToggleSubDept}
                                    handleChangeShareNotebook = {handleChangeShareNotebook}
                                />
                                :
                                shareNotebookValue.shareWith === "employee" ?
                                <EmployeeView 
                                    shareNotebookValue = {shareNotebookValue}
                                    handleSelectShareNote = {handleSelectShareNote}
                                    handleChangeShareNotebook = {handleChangeShareNotebook}
                                />
                                :

                                null
                            }
                        </div>
                    )
                :
                shareNotebookValue.type === 3 ?
                    (
                        <div>
                            <Button
                                onMouseLeave={handleCopytoClipboardMouseLeave}
                                onClick={() => handleCopytoClipboard(shareNotebookValue.textToCopy)}
                                className="flex items-center gap-x-3 px-4 py-2.5 lowercase bg-[#8bc9f8]  font-medium text-[12px]"
                            >
                                <Typography
                                    className="border-r border-black-400/50 pr-3 font-normal"
                                    variant="small"
                                >
                                    {shareNotebookValue.textToCopy}
                                </Typography>
                                {copied ? (
                                    <IoCheckmarkCircleOutline className="h-4 w-4 text-white" />
                                ) : (
                                    <HiDocumentDuplicate className="h-4 w-4 text-white" />
                                )}
                            </Button>
                        </div>
                    )
                :
                null
                    
            }
        </div>
        {shareNotebookValue.type !== 3 && 
            <div className='p-3'>
                <CustomButton 
                    title= 'Share'
                    onClick = {handleShareNotebookAdd}
                    type="button"
                    loading = {shareNotebookValue.loading}
                />
            </div>
        }
    </div>
  )
}

export default ShareNoteBook