import React, { useEffect, useState, useRef } from 'react'
import React, { useEffect, useState } from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import SearchReactSelect from '../../Components/CustomSelect/SearchReactSelect'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { FaXmark } from 'react-icons/fa6'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import { getContentByLabel } from '../../services/getContentService'
import { showToast } from '../../Components/Toaster/Toaster'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'
import { FaInfoCircle } from 'react-icons/fa'
import { Button } from '@material-tailwind/react'

const CONTENT_LABELS = {
  performance: 'CYCLESELECT_PERFORMANCE_EMP',
  competency: 'COMPETENCY_PERFORMANCE_EMP',
}

const AddCompetency = (props) => {
    const { performance,addCompetencyValue,handleSelectAddCompetency,handleChangeAddCompetency, addComptency,deleteCompteny, handleSubmitAddCompetency, handleRemoveEmp} = props
    
    // Use the same hook as Create Performance Review Cycle
    const { empBranches, fetchingAllBranches, gettingSubBranches, dept_subDept, Get_All_Employeefn, Get_All_Employee } = useEmployees();
    const { empBranches, fetchingAllBranches } = useEmployees();

    const [contentDrawerOpen, setContentDrawerOpen] = useState(false)
    const [contentData, setContentData] = useState(null)
    const [contentLang, setContentLang] = useState('ENGLISH')
    const [contentLoading, setContentLoading] = useState(false)

    const openContentDrawer = async (contentLabel) => {
      setContentDrawerOpen(true)
      setContentLang('ENGLISH')
      setContentLoading(true)
      setContentData(null)
      try {
        const res = await getContentByLabel(contentLabel)
        if (res?.STATUS === 'SUCCESSFUL' && res?.DATA?.[0]?.contents?.length) {
          setContentData(res.DATA[0])
        } else {
          showToast('Content not available', 'error')
          setContentDrawerOpen(false)
        }
      } catch (err) {
        showToast('Failed to load content', 'error')
        setContentDrawerOpen(false)
      } finally {
        setContentLoading(false)
      }
    }
    
    // State for cascading dropdowns
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    
    // Use ref to track if data has been fetched to prevent duplicate calls
    const hasFetchedDataRef = useRef(false);
    const previousShowStateRef = useRef(false);
    const lastFetchedBranchIdRef = useRef(null);
    
    // Only fetch data when modal opens (addCompetencyValue.show changes from false to true)
    useEffect(() => {
        // Check if modal just opened (was closed, now open)
        const modalJustOpened = addCompetencyValue.show && !previousShowStateRef.current;
        
        if (modalJustOpened && !hasFetchedDataRef.current) {
            // Fetch data only when modal opens for the first time
            fetchingAllBranches();
            Get_All_Employeefn();
            hasFetchedDataRef.current = true;
        }
        
        // Update previous show state
        previousShowStateRef.current = addCompetencyValue.show;
        
        // Reset fetch flag when modal closes
        if (!addCompetencyValue.show) {
            hasFetchedDataRef.current = false;
            lastFetchedBranchIdRef.current = null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addCompetencyValue.show]);
    
    // Sync local state with addCompetencyValue when it changes
    useEffect(() => {
        if (addCompetencyValue.branchId) {
            setSelectedBranch(addCompetencyValue.branchId);
            // Load departments when branch is set - only if branchId actually changed
            if (addCompetencyValue.branchId.value !== undefined) {
                const branchValue = addCompetencyValue.branchId.value === 0 || addCompetencyValue.branchId.value === '0' ? 0 : addCompetencyValue.branchId.value;
                
                // Only fetch if this is a different branch than the last one we fetched
                if (lastFetchedBranchIdRef.current !== branchValue) {
                    lastFetchedBranchIdRef.current = branchValue;
                    gettingSubBranches(branchValue);
                }
            }
        } else {
            setSelectedBranch(null);
            lastFetchedBranchIdRef.current = null;
        }
        
        if (addCompetencyValue.departmentId) {
            setSelectedDepartment(addCompetencyValue.departmentId);
        } else {
            setSelectedDepartment(null);
        }
        
        // Reset employee selection when branch or department changes
        if (!addCompetencyValue.branchId || !addCompetencyValue.departmentId) {
            setSelectedEmployee(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addCompetencyValue.branchId, addCompetencyValue.departmentId]);

    return ( 
    <>
    <form className='space-y-3' onSubmit={handleSubmitAddCompetency}>
        <div className='space-y-2'>
            <div className='flex items-center gap-1.5'>
              <label className='text-[#698592] text-[12px]'>Performance</label>
              <FaInfoCircle className='text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0' onClick={() => openContentDrawer(CONTENT_LABELS.performance)} />
            </div>
            <CustomSelect 
                placeHolderTitle = 'Performance'
                cStyle = {true}
                value={addCompetencyValue.pID}
                options={performance?.map((ele) => ({ value: ele._id, label: ele.name }))} 
                onChangeHandler={(selectedOption) => handleSelectAddCompetency(selectedOption, 'pID')}
            />
        </div>
        <div className='flex gap-2'>
            <div className='space-y-2 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <label className='text-[#698592] text-[12px]'>Competency</label>
                  <FaInfoCircle className='text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0' onClick={() => openContentDrawer(CONTENT_LABELS.competency)} />
                </div>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                    type='text' 
                    placeholder='Competency'
                    value={addCompetencyValue.comptency}
                    name='comptency' 
                    onChange={handleChangeAddCompetency}
                />
            </div>
            <div className='mt-8 flex-[0.4] flex justify-end'>
                <CustomButton 
                    title='Add Competency'
                    onClick={addComptency}
                    type="button"
                />
            </div>
        </div>
        {addCompetencyValue?.competencyList?.length > 0 &&
            <div className='flex items-center gap-2 flex-wrap'>
                {addCompetencyValue?.competencyList?.map((ele, i)=>(
                    <div key={i} className='flex flex-row items-center p-2 gap-2 bg-primary-100 rounded-lg cursor-pointer'>
                        <span className='text-[12px]'>
                            {ele.name}
                        </span>
                        <span className='h-5 w-5 text-[12px] flex items-center justify-center rounded-full bg-red-500 text-white'
                            onClick={()=>deleteCompteny(i)}
                        >
                            <FaXmark />
                        </span>
                    </div>
                ))}
            </div>        
        }
        <div>

        </div>
        {addCompetencyValue.pID !== null && 
        <>
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Branch</label>
                <SearchReactSelect
                    placeHolderTitle="Branch"
                    value={selectedBranch}
                    options={[
                        { value: 0, label: 'All Branches' },
                        ...(empBranches?.map((branch) => ({
                            value: branch.id,
                            label: branch.branch_name,
                        })) || [])
                    ]}
                    onChangeHandler={async (selectedOption) => {
                        setSelectedBranch(selectedOption);
                        setSelectedDepartment(null);
                        setSelectedEmployee(null);
                        
                        // Load departments for the selected branch
                        const branchValue = selectedOption?.value === 0 || selectedOption?.value === '0' ? 0 : selectedOption?.value;
                        
                        // Update ref before calling API to prevent duplicate calls from useEffect
                        if (branchValue !== undefined && branchValue !== null && lastFetchedBranchIdRef.current !== branchValue) {
                            lastFetchedBranchIdRef.current = branchValue;
                            await gettingSubBranches(branchValue);
                        }
                        
                        // Call handleSelectAddCompetency which will handle the state update
                        await handleSelectAddCompetency(selectedOption, "branchId");
                        
                        // If "All Branches" is selected, auto-select "All Departments"
                        if (branchValue === 0) {
                            const allDeptOption = { value: 0, label: 'All Departments' };
                            setSelectedDepartment(allDeptOption);
                            // Small delay to ensure departments are loaded before setting
                            setTimeout(async () => {
                                await handleSelectAddCompetency(allDeptOption, "departmentId");
                            }, 200);
                        }
                    }}
                    cStyle={true}
                    customStyles={{
                        control: (base) => ({
                            ...base,
                            fontSize: '14px',
                            minHeight: '36px',
                            border: 'none',
                            borderRadius: '10px',
                            backgroundColor: 'white',
                            boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
                            }
                        }),
                        menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                            borderRadius: '10px',
                            boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                            border: 'none'
                        }),
                        menuList: (base) => ({
                            ...base,
                            maxHeight: '200px !important',
                            height: 'auto !important',
                            borderRadius: '10px',
                        }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                                ? '#3DA5F4'
                                : state.isFocused
                                    ? '#E3F1FF'
                                    : 'transparent',
                            color: state.isSelected ? 'white' : '#333',
                            '&:hover': {
                                backgroundColor: state.isSelected ? '#2B8FD4' : '#F0F8FF',
                            }
                        }),
                        singleValue: (base) => ({
                            ...base,
                            fontSize: '14px',
                            color: '#474747',
                        }),
                        placeholder: (base) => ({
                            ...base,
                            fontSize: '14px',
                            color: '#999',
                        })
                    }}
                />
            </div>
            <div className='flex items-center gap-3'>
                <div className='space-y-2 flex-1'>
                    <label className='text-[#698592] text-[12px]'>Departments</label>
                    <SearchReactSelect
                        placeHolderTitle="Department"
                        value={selectedDepartment}
                        options={[
                            { value: 0, label: 'All Departments' },
                            ...(Array.isArray(dept_subDept?.departments) 
                                ? dept_subDept.departments.map((dept) => ({
                                    value: dept.id,
                                    label: dept.name,
                                }))
                                : Array.isArray(dept_subDept)
                                    ? dept_subDept.map((dept) => ({
                                        value: dept.value || dept.id,
                                        label: dept.label || dept.name,
                                    }))
                                    : [])
                        ]}
                        onChangeHandler={async (selectedOption) => {
                            setSelectedDepartment(selectedOption);
                            setSelectedEmployee(null);
                            await handleSelectAddCompetency(selectedOption, "departmentId");
                        }}
                        cStyle={true}
                        customStyles={{
                            control: (base) => ({
                                ...base,
                                fontSize: '14px',
                                minHeight: '36px',
                                border: 'none',
                                borderRadius: '10px',
                                backgroundColor: 'white',
                                boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
                                }
                            }),
                            menu: (base) => ({
                                ...base,
                                zIndex: 9999,
                                borderRadius: '10px',
                                boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                                border: 'none'
                            }),
                            menuList: (base) => ({
                                ...base,
                                maxHeight: '200px !important',
                                height: 'auto !important',
                                borderRadius: '10px',
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected
                                    ? '#3DA5F4'
                                    : state.isFocused
                                        ? '#E3F1FF'
                                        : 'transparent',
                                color: state.isSelected ? 'white' : '#333',
                                '&:hover': {
                                    backgroundColor: state.isSelected ? '#2B8FD4' : '#F0F8FF',
                                }
                            }),
                            singleValue: (base) => ({
                                ...base,
                                fontSize: '14px',
                                color: '#474747',
                            }),
                            placeholder: (base) => ({
                                ...base,
                                fontSize: '14px',
                                color: '#999',
                            })
                        }}
                    />
                </div>
                <div className='space-y-2 flex-1'>
                    <label className='text-[#698592] text-[12px]'>Employee</label>
                    <SearchReactSelect
                        placeHolderTitle="Select Employee"
                        value={selectedEmployee}
                        options={[
                            { value: 0, label: 'All Employees' },
                            ...(Array.isArray(Get_All_Employee)
                                ? Get_All_Employee
                                    .filter(emp => {
                                        // Filter by branch if selected and not "All Branches" (value 0)
                                        if (selectedBranch?.value && selectedBranch.value !== 0 && selectedBranch.value !== '0') {
                                            const branchValue = Number(selectedBranch.value) || selectedBranch.value;
                                            const branchId = Number(selectedBranch.id) || selectedBranch.id;
                                            const empBranchId = Number(emp.branch_id) || emp.branch_id;
                                            const empBranchObjId = Number(emp.branch?.id) || emp.branch?.id;

                                            if (empBranchId !== branchValue &&
                                                empBranchId !== branchId &&
                                                empBranchObjId !== branchValue &&
                                                empBranchObjId !== branchId &&
                                                emp.branch !== branchValue &&
                                                emp.branch !== branchId) {
                                                return false;
                                            }
                                        }

                                        // Filter by department if selected and not "All Departments" (value 0)
                                        if (selectedDepartment?.value && selectedDepartment.value !== 0 && selectedDepartment.value !== '0') {
                                            const deptValue = Number(selectedDepartment.value) || selectedDepartment.value;
                                            const deptId = Number(selectedDepartment.id) || selectedDepartment.id;
                                            const empDeptId = Number(emp.department_id) || Number(emp.dept_id) || emp.department_id || emp.dept_id;
                                            const empDeptObjId = Number(emp.department?.id) || emp.department?.id;

                                            if (empDeptId !== deptValue &&
                                                empDeptId !== deptId &&
                                                empDeptObjId !== deptValue &&
                                                empDeptObjId !== deptId &&
                                                emp.department !== deptValue &&
                                                emp.department !== deptId) {
                                                return false;
                                            }
                                        }

                                        return true;
                                    })
                                    .map((emp) => ({
                                        value: emp.id || emp.emp_id || emp.employee_id,
                                        label: `${emp.name} (ID: ${emp.id || emp.emp_id || emp.employee_id})`
                                    }))
                                : [])
                        ]}
                        onChangeHandler={async (selectedOption) => {
                            setSelectedEmployee(selectedOption);
                            // If "All Employees" is selected, handle it differently
                            if (selectedOption && (selectedOption.value === 0 || selectedOption.value === '0')) {
                                await handleSelectAddCompetency(selectedOption, "empId");
                            } else if (selectedOption) {
                                // For specific employee selection, it will be added to selectedEmp array
                                await handleSelectAddCompetency(selectedOption, "empId");
                            } else {
                                // If cleared, reset
                                setSelectedEmployee(null);
                            }
                        }}
                        cStyle={true}
                        isClearable={true}
                        customStyles={{
                            control: (base) => ({
                                ...base,
                                fontSize: '14px',
                                minHeight: '36px',
                                border: 'none',
                                borderRadius: '10px',
                                backgroundColor: 'white',
                                boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
                                }
                            }),
                            menu: (base) => ({
                                ...base,
                                zIndex: 9999,
                                borderRadius: '10px',
                                boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                                border: 'none'
                            }),
                            menuList: (base) => ({
                                ...base,
                                maxHeight: '200px !important',
                                height: 'auto !important',
                                borderRadius: '10px',
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected
                                    ? '#3DA5F4'
                                    : state.isFocused
                                        ? '#E3F1FF'
                                        : 'transparent',
                                color: state.isSelected ? 'white' : '#333',
                                '&:hover': {
                                    backgroundColor: state.isSelected ? '#2B8FD4' : '#F0F8FF',
                                }
                            }),
                            singleValue: (base) => ({
                                ...base,
                                fontSize: '14px',
                                color: '#474747',
                            }),
                            placeholder: (base) => ({
                                ...base,
                                fontSize: '14px',
                                color: '#999',
                            })
                        }}
                    />
                </div>
            </div>
            {addCompetencyValue.selectedEmp && addCompetencyValue.selectedEmp.length > 0 && (
                <div className='space-y-2'>
                    <label className='text-[#698592] text-[12px]'>Selected Employees</label>
                    <div className='space-y-2'>
                        {addCompetencyValue.selectedEmp.map((emp, index) => (
                            <div key={emp.value} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-[12px] font-medium text-blue-800">
                                    {emp.label}
                                </span>
                                <span
                                    className="h-5 w-5 text-[12px] flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer hover:bg-red-600"
                                    onClick={() => handleRemoveEmp(emp)}
                                >
                                    <FaXmark />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
        }
        <div>
            <CustomButton 
                title='Submit'
            />
        </div>
    </form>

    <PortalDrawer
      open={contentDrawerOpen}
      closeDrawer={() => setContentDrawerOpen(false)}
      direction='right'
      widthSize='45vw'
      title={contentData?.contents?.find((c) => c.lang === contentLang)?.main_heading ?? ''}
      compo={
        <div className='flex flex-col gap-4'>
          {contentLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='w-8 h-8 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin' />
            </div>
          ) : contentData?.contents?.length ? (
            <>
              <div
                className='text-gray-800 text-sm font-Urbanist leading-relaxed prose prose-sm max-w-none'
                dangerouslySetInnerHTML={{
                  __html:
                    contentData.contents.find((c) => c.lang === contentLang)?.content ??
                    contentData.contents.find((c) => c.lang === 'ENGLISH')?.content ??
                    '',
                }}
              />
              <div className='flex gap-2 mt-4 border-t border-gray-200 pt-4'>
                <Button
                  size='sm'
                  className={`flex-1 font-Urbanist text-[12px] ${contentLang === 'ENGLISH' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setContentLang('ENGLISH')}
                >
                  ENGLISH
                </Button>
                <Button
                  size='sm'
                  className={`flex-1 font-Urbanist text-[12px] ${contentLang === 'URDU' ? 'bg-[#3DA5F4] text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setContentLang('URDU')}
                >
                  URDU
                </Button>
              </div>
            </>
          ) : null}
        </div>
      }
    />
    </>
  )
}

export default AddCompetency