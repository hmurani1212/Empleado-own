
import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { approvedByData, approvedTypeData } from '../../services/__formApprovalServices'
import { useState } from 'react'
import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react'
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { BsGrid3X3GapFill } from 'react-icons/bs'
import { CSS } from '@dnd-kit/utilities'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { BiPlus, BiTrash } from 'react-icons/bi'
import formApprovalApi from '../../Model/Data/FormApproval/FormApproval'
import { showToast } from '../../Components/Toaster/Toaster'

const ApprovalFlowTemp = (props) => {
  const { handleSelectDefAppFlow, defineApprovalFlowValue, handleDragEnd, handleChangeApprovalFlow, handleAddMoreAccordian, removeApprovalStage, toggleDefApprovalFlow, setDefineApprovalFlowValue } = props
  // console.log('defineApprovalFlowValue', defineApprovalFlowValue.approvalSatges)
  const [open, setOpen] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleOpen = (value) => setOpen(open === value ? null : value);

  // Handle form submission
  const handleSubmitApprovalFlow = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!defineApprovalFlowValue.name?.trim()) {
        showToast('Template Title is required!', 'error');
        return;
      }

      if (!defineApprovalFlowValue.approved_by) {
        showToast('Please select Approved By option', 'error');
        return;
      }

      if (!defineApprovalFlowValue.approved_type) {
        showToast('Please select Approved Type', 'error');
        return;
      }

      // Validate Approval Index for Sequential type with Designations or Employee
      if (defineApprovalFlowValue.approved_type?.value === 1 && 
          (defineApprovalFlowValue.approved_by?.value === 1 || defineApprovalFlowValue.approved_by?.value === 2)) {
        const missingIndex = defineApprovalFlowValue.approvalSatges.some((stage, index) => {
          if (defineApprovalFlowValue.approved_by?.value === 1 && !stage.desginationId) {
            return false; // Skip validation if designation not selected yet
          }
          if (defineApprovalFlowValue.approved_by?.value === 2 && !stage.empId) {
            return false; // Skip validation if employee not selected yet
          }
          return !stage.indexs || stage.indexs.trim() === '';
        });
        
        if (missingIndex) {
          showToast('Please enter Approval Index for all approval stages', 'error');
          return;
        }
      }

      // Prepare data for Node.js API
      const approvalData = {
        title: defineApprovalFlowValue.name,
        approval_hierarchy: defineApprovalFlowValue.approved_type?.value || 1,
        approval_type: defineApprovalFlowValue.approved_by?.value,
        reporting_level: defineApprovalFlowValue.approved_by?.value === 3 ? 5 : 0
      };

      // Handle different approval types
      if (defineApprovalFlowValue.approved_by?.value === 3) {
        // Reporting Manager - get level from first stage
        const firstStage = defineApprovalFlowValue.approvalSatges[0];
        if (firstStage?.levelUpto) {
          approvalData.reporting_level = parseInt(firstStage.levelUpto);
        }
        approvalData.designation_id = [];
        approvalData.employee_id = [];
        approvalData.approval_index = [];
      } else {
        // Employee or Designation approval
        const designation_ids = [];
        const employee_ids = [];
        const approval_indexs = [];
        const department_ids = [];
        const branch_ids = [];
        let shouldIncludeDeptAndBranch = false; // Track if we should include dept and branch

        defineApprovalFlowValue.approvalSatges.forEach((stage, index) => {
          if (defineApprovalFlowValue.approved_by?.value === 1) {
            // Designation approval
            designation_ids.push(stage.desginationId?.value || 0);
            employee_ids.push(0);
            
            // Get department_id and branch_id from stage selections
            const selectedDepartmentId = stage.departmentId?.value ?? stage.departmentId ?? 0;
            const selectedBranchId = stage.branchId?.value ?? stage.branchId ?? 0;
            
            // Convert to numbers to handle string values
            const deptId = selectedDepartmentId && selectedDepartmentId !== 0 && selectedDepartmentId !== "0" 
              ? Number(selectedDepartmentId) 
              : 0;
            const branchId = selectedBranchId && selectedBranchId !== 0 && selectedBranchId !== "0" 
              ? Number(selectedBranchId) 
              : 0;
            
            department_ids.push(deptId);
            branch_ids.push(branchId);
            shouldIncludeDeptAndBranch = true; // Track that we should include dept and branch for designation
          } else if (defineApprovalFlowValue.approved_by?.value === 2) {
            // Employee approval
            designation_ids.push(0);
            
            // Get values - handle both object and direct value cases
            const selectedEmployeeId = stage.empId?.value ?? stage.empId ?? 0;
            const selectedDepartmentId = stage.departmentId?.value ?? stage.departmentId ?? 0;
            const selectedBranchId = stage.branchId?.value ?? stage.branchId ?? 0;
            
            // Convert to number for consistent comparison
            const empIdNum = Number(selectedEmployeeId);
            
            employee_ids.push(empIdNum);
            
            // Always include department_id and branch_id for Employee approval type
            shouldIncludeDeptAndBranch = true;
            
            // Debug logging
            console.log('Approval Flow Submission - Stage:', {
              index,
              stage,
              selectedEmployeeId,
              empIdNum,
              stageEmpId: stage.empId,
              empListLength: stage.empList?.length,
              selectedDepartmentId,
              selectedBranchId,
              fullStage: JSON.stringify(stage, null, 2)
            });
            
            // Initialize with values from stage selections (branch and department dropdowns)
            // Convert to numbers to handle string values
            let deptId = selectedDepartmentId && selectedDepartmentId !== 0 && selectedDepartmentId !== "0" 
              ? Number(selectedDepartmentId) 
              : 0;
            let branchId = selectedBranchId && selectedBranchId !== 0 && selectedBranchId !== "0" 
              ? Number(selectedBranchId) 
              : 0;
            
            // Variable to track if we found employee data
            let empData = null;
            
            // If employee is selected (not "All"), try to get department_id and branch_id from employee data
            if (empIdNum > 0 && selectedEmployeeId !== 0 && selectedEmployeeId !== "0" && selectedEmployeeId !== null) {
              console.log('Employee is selected, trying to get department_id and branch_id from employee data');
              
              // Try to get empData from the selected option first (if CustomSelect preserves it)
              empData = stage.empId?.empData;
              
              // If not found, try to find it from empList
              if (!empData && stage.empList && Array.isArray(stage.empList)) {
                const selectedEmployee = stage.empList.find(emp => {
                  const empValue = Number(emp.value);
                  return empValue === empIdNum || emp.value === selectedEmployeeId || emp.value === String(selectedEmployeeId) || String(emp.value) === String(selectedEmployeeId);
                });
                empData = selectedEmployee?.empData;
                
                console.log('Employee lookup result:', {
                  selectedEmployee,
                  empData,
                  searchingFor: empIdNum,
                  selectedEmployeeId,
                  empListSample: stage.empList.slice(0, 3).map(e => ({ value: e.value, hasEmpData: !!e.empData }))
                });
              } else if (empData) {
                console.log('Found empData directly from stage.empId:', empData);
              } else {
                console.log('No empData found - will use stage selections');
              }
              
              // Extract department_id and branch_id from employee data if available
              if (empData) {
                // Try different possible field names based on API response structure
                const empDeptId = empData?.dept_id ?? empData?.emp_dept ?? empData?.department_id ?? empData?.deptt_id ?? empData?.data?.dept_id ?? empData?.data?.emp_dept ?? empData?.data?.deptt_id ?? empData?.emp_data?.deptt_id ?? null;
                const empBranchId = empData?.branch_id ?? empData?.emp_branch ?? empData?.branchId ?? empData?.data?.branch_id ?? empData?.data?.emp_branch ?? empData?.emp_data?.branch_id ?? null;
                
                // Use employee's department/branch if available (including 0 as valid value)
                // Use nullish coalescing to check if value exists (including 0)
                if (empDeptId !== null && empDeptId !== undefined) {
                  deptId = Number(empDeptId);
                }
                if (empBranchId !== null && empBranchId !== undefined) {
                  branchId = Number(empBranchId);
                }
                
                console.log('Extracted employee data:', {
                  empDeptId,
                  empBranchId,
                  finalDeptId: deptId,
                  finalBranchId: branchId,
                  empDataKeys: Object.keys(empData),
                  empDataFull: empData
                });
              } else {
                console.log('No empData available, using stage selections (branch/department dropdowns)');
              }
            } else {
              console.log('Employee is "All" (0), using branch and department from stage selections');
              // When employee is "All", use the selected branch and department from dropdowns
              // Values are already set from stage selections above
            }
            
            // If department filter is "All" (0), use 0 for department_id
            if (selectedDepartmentId === 0 || selectedDepartmentId === "0") {
              deptId = 0;
            }
            
            // If branch filter is "All" (0), use 0 for branch_id
            if (selectedBranchId === 0 || selectedBranchId === "0") {
              branchId = 0;
            }
            
            console.log('Final values before pushing:', {
              deptId,
              branchId,
              empIdNum,
              selectedDepartmentId,
              selectedBranchId,
              hasEmpData: !!empData,
              isAllEmployee: empIdNum === 0
            });
            
            // Always push department_id and branch_id for Employee approval type
            department_ids.push(deptId);
            branch_ids.push(branchId);
          }
          // Use approval_index from stage if available (for Sequential type), otherwise use index + 1
          const approvalIndex = (defineApprovalFlowValue.approved_type?.value === 1 && stage.indexs) 
            ? parseInt(stage.indexs) || 1
            : (index + 1);
          approval_indexs.push(approvalIndex);
        });

        approvalData.designation_id = designation_ids;
        approvalData.employee_id = employee_ids;
        approvalData.approval_index = approval_indexs;
        
        // Add department_id and branch_id arrays when approval type is Designation (1) or Employee (2)
        if (shouldIncludeDeptAndBranch) {
          approvalData.department_id = department_ids;
          approvalData.branch_id = branch_ids;
        }
      }

      console.log('Submitting approval flow data:', approvalData);
      console.log('Full defineApprovalFlowValue:', defineApprovalFlowValue);

      // Submit to Node.js API
      const response = await formApprovalApi.createApprovalFlow(approvalData);

      if (response.data.STATUS === 'SUCCESSFUL') {
        showToast('Approval Flow created successfully!', 'success');
        
        // Preserve branch list for form functionality
        const existingBranchList = defineApprovalFlowValue.approvalSatges[0]?.branchList || [];
        
        // Reset all form fields to initial state
        setDefineApprovalFlowValue({
          show: true,
          approved_type: null,
          approved_by: null,
          name: '',
          approvalSatges: [
            { 
              id: 1, 
              empId: null, 
              empList: [], 
              departmentId: null, 
              departmentList: [], 
              branchId: null, 
              branchList: existingBranchList, 
              desginationList: [], 
              desginationId: null, 
              indexs: '1', 
              levelUpto: '5' 
            },
          ]
        });
        
        // Reset accordion open state
        setOpen(null);
        
        toggleDefApprovalFlow(); // Close the drawer
      } else {
        showToast(response.data.ERROR_DESCRIPTION || 'Failed to create approval flow', 'error');
      }

    } catch (error) {
      console.error('Error creating approval flow:', error);
      showToast('Failed to create approval flow. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  function Icon({ id, open }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={`${open === id ? "rotate-180" : ""} h-5 w-5 transition-transform`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    );
  }


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  // console.log('defineApprovalFlowValue', defineApprovalFlowValue)




  return (
    <form onSubmit={handleSubmitApprovalFlow}>
      <div className='flex flex-col gap-3'>
        <div className='space-y-2'>
          <label className='text-[#698592] text-[12px]'>Template Title</label>
          <input
            className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
            type='text'
            value={defineApprovalFlowValue.name}
            name='name'
            onChange={handleChangeApprovalFlow}
            placeholder='Enter Template Title'
            required
          />
        </div>
        <div className='space-y-2'>
          <label className='text-[#698592] text-[12px]'>Approved By</label>
          <CustomSelect
            placeHolderTitle='Approved By'
            options={approvedByData?.map((ele) => ({ value: ele.value, label: ele.name }))}
            onChangeHandler={(selectedOption) => handleSelectDefAppFlow(selectedOption, 'approved_by')}
            customStyles={false}
            value={defineApprovalFlowValue?.approved_by}


          />
        </div>
        <div className='space-y-2'>
          <label className='text-[#698592] text-[12px]'>Approved Type</label>
          <CustomSelect
            placeHolderTitle='Approved Type'
            options={approvedTypeData?.map((ele) => ({ value: ele.value, label: ele.name }))}
            onChangeHandler={(selectedOption) => handleSelectDefAppFlow(selectedOption, 'approved_type')}
            customStyles={false}
            value={defineApprovalFlowValue?.approved_type}
            disabled={defineApprovalFlowValue?.approved_by?.value === 3 ? true : false}
          />
        </div>


        {defineApprovalFlowValue.approved_by !== null &&
          <div className='space-y-3'>
            <DndContext onDragEnd={handleDragEnd} sensors={sensors} >
              <SortableContext items={defineApprovalFlowValue.approvalSatges.map(item => item.id)} strategy={rectSortingStrategy}>
                {defineApprovalFlowValue?.approvalSatges?.map((approvalFlow, index) => {
                  return (
                    <DragableAccordian
                      key={approvalFlow.id} // Use a unique id
                      approvalFlow={approvalFlow}
                      index={index}
                      open={open}
                      handleOpen={handleOpen}
                      icon={<Icon id={approvalFlow.id} open={open} />}
                      defineApprovalFlowValue={defineApprovalFlowValue}
                      handleSelectDefAppFlow={handleSelectDefAppFlow}
                      handleChangeApprovalFlow={handleChangeApprovalFlow}
                      handleAddMoreAccordian={handleAddMoreAccordian}
                      removeApprovalStage={removeApprovalStage}
                      setDefineApprovalFlowValue={setDefineApprovalFlowValue}
                    />
                  )
                })}
              </SortableContext>
            </DndContext>
          </div>
        }


        <div>
          <CustomButton
            title={isSubmitting ? 'Creating...' : 'Set Approval Flow'}
            type='submit'
            disabled={isSubmitting}
          />
        </div>

      </div>
    </form>
  )
}


function DragableAccordian(props) {
  const { approvalFlow, index, open, handleOpen, icon, defineApprovalFlowValue, handleSelectDefAppFlow, handleChangeApprovalFlow, handleAddMoreAccordian,
    removeApprovalStage, setDefineApprovalFlowValue
  } = props
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id: approvalFlow.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms ease', // Fallback for smoothness
    touchAction: 'none', // Prevents default gestures on touch devices
  };


  return (
    <div ref={setNodeRef} style={style} {...attributes} className='flex items-center gap-2'>
      <div
        {...listeners}
        node={setActivatorNodeRef}
        className="p-1 flex items-center cursor-grab hover:bg-gray-100 rounded"
      >
        <BsGrid3X3GapFill className="w-6 h-6 text-primary-100" />
      </div>
      <Accordion key={approvalFlow.id} open={open === approvalFlow.id} icon={icon} className='border border-gray-400 rounded-lg p-2'>
        <AccordionHeader onClick={() => handleOpen(approvalFlow.id)} className='text-[15px]'>{`Approval Stage ${index + 1}`}</AccordionHeader>
        <AccordionBody>
          <div className='space-y-3'>
            {defineApprovalFlowValue?.approved_by?.value === 3 ?


              <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Level Upto</label>
                <input
                  className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                  type='number'
                  name='levelUpto'
                  min='1'
                  max='10'
                  defaultValue='5'
                  onChange={(e) => {
                    setDefineApprovalFlowValue((prevState) => ({
                      ...prevState,
                      approvalSatges: prevState.approvalSatges.map((stage, i) =>
                        i === index ? { ...stage, levelUpto: e.target.value } : stage
                      )
                    }));
                  }}
                  placeholder='Enter number of levels (default: 5)'
                />
              </div>
              :
              <>
                <div className='space-y-2'>
                  <label className='text-[#698592] text-[12px]'>Branch</label>
                  <CustomSelect
                    placeHolderTitle='Branch'
                    options={Array.isArray(approvalFlow?.branchList) ? approvalFlow.branchList : []}
                    onChangeHandler={(selectedOption) => handleSelectDefAppFlow(selectedOption, 'branchId', index)}
                    customStyles={false}
                    value={approvalFlow?.branchId}

                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-[#698592] text-[12px]'>Department</label>
                  <CustomSelect
                    placeHolderTitle='Department'
                    options={Array.isArray(approvalFlow?.departmentList) ? approvalFlow.departmentList : []}
                    onChangeHandler={(selectedOption) => handleSelectDefAppFlow(selectedOption, 'departmentId', index)}
                    cStyle={true}
                    value={approvalFlow?.departmentId}

                  />
                </div>
                {defineApprovalFlowValue?.approved_by?.value === 1 ?


                  <>
                    <div className='space-y-2'>
                      <label className='text-[#698592] text-[12px]'>Designation</label>
                      <CustomSelect
                        placeHolderTitle='Designation'
                        options={Array.isArray(approvalFlow?.desginationList) ? approvalFlow.desginationList : []}

                        onChangeHandler={(selectedOption) => handleSelectDefAppFlow(selectedOption, 'desginationId', index)}
                        customStyles={false}
                        value={approvalFlow?.desginationId}

                      />
                    </div>
                    {defineApprovalFlowValue?.approved_type?.value === 1 && (
                      <div className='space-y-2 pb-16'>
                        <label className='text-[#698592] text-[12px]'>Approval Index</label>
                        <input
                          className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                          type='number'
                          name='indexs'
                          min='1'
                          value={approvalFlow?.indexs || '1'}
                          onChange={(e) => {
                            setDefineApprovalFlowValue((prevState) => ({
                              ...prevState,
                              approvalSatges: prevState.approvalSatges.map((stage, i) =>
                                i === index ? { ...stage, indexs: e.target.value || '1' } : stage
                              )
                            }));
                          }}
                          placeholder='Enter Approval Index'
                          required
                        />
                      </div>
                    )}
                    {defineApprovalFlowValue?.approved_type?.value !== 1 && (
                      <div className='pb-16'></div>
                    )}
                  </>

                  :

                  defineApprovalFlowValue?.approved_by?.value === 2 ?
                    <>
                      <div className='space-y-2'>
                        <label className='text-[#698592] text-[12px]'>Employee</label>
                        <CustomSelect
                          placeHolderTitle='Employee'
                          options={Array.isArray(approvalFlow?.empList) ? approvalFlow.empList : []}
                          onChangeHandler={(selectedOption) => handleSelectDefAppFlow(selectedOption, 'empId', index)}
                          customStyles={false}
                          value={approvalFlow?.empId}

                        />
                      </div>
                      {defineApprovalFlowValue?.approved_type?.value === 1 && (
                        <div className='space-y-2 pb-16'>
                          <label className='text-[#698592] text-[12px]'>Approval Index</label>
                          <input
                            className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                            type='number'
                            name='indexs'
                            min='1'
                            value={approvalFlow?.indexs || '1'}
                            onChange={(e) => {
                              setDefineApprovalFlowValue((prevState) => ({
                                ...prevState,
                                approvalSatges: prevState.approvalSatges.map((stage, i) =>
                                  i === index ? { ...stage, indexs: e.target.value || '1' } : stage
                                )
                              }));
                            }}
                            placeholder='Enter Approval Index'
                            required
                          />
                        </div>
                      )}
                      {defineApprovalFlowValue?.approved_type?.value !== 1 && (
                        <div className='pb-16'></div>
                      )}
                    </>

                    :

                    null
                }
              </>
            }
          </div>
        </AccordionBody>
      </Accordion>
      <div className='flex items-center gap-2'>
        {index !== 0 && (
          <span className="w-10 h-10 rounded-lg text-white flex items-center justify-center bg-red-500"
            onClick={() => removeApprovalStage(approvalFlow.id)}
          >
            <BiTrash />
          </span>
        )}

        {/* Show the BiPlus icon only for the first item (index 0) */}
        {index === 0 && (
          <span className="w-10 h-10 rounded-lg text-white flex items-center justify-center bg-primary-100"
            onClick={handleAddMoreAccordian}
          >
            <BiPlus />
          </span>
        )}
      </div>
    </div>
  )
}


export default ApprovalFlowTemp