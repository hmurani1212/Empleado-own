import React, { useEffect, useState } from 'react'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react'
import { FaPencil } from 'react-icons/fa6'
import CustomButton from '../../Components/CustomButton/CustomButton'
import useEmployeeCheckList from '../../ViewModel/EmployeeViewModel/EmpCheckListServices'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'
import AddEditEmployeeCheckList from './AddEditEmployeeCheckList'

const EmployeeCheckList = () => {

  const { gettingEmployeeCheckList,employeeCheckListData } = useEmployees()
  const {employeeCheckListValue, toggleEmpCheckList, handleEmpCheckList,
    handleEditCheckList,
    handleChangeEmpCheckList,
    handleChangeRequestInfo,addNewRequestInput,removeRequestInput,
    handleSelectEmpCheckList,handleCheckListSearchEmp,
    saveChecklist

  } = useEmployeeCheckList()

  useEffect(()=>{
    gettingEmployeeCheckList()
  },[])

  const [open, setOpen] = useState(null);
  const handleOpen = (value) => setOpen(open === value ? null : value);
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
  };

  // const new_data = 

  return (
    <>
    <div className='flex flex-col gap-4 py-2 pb-1 px-2'>
      <div className='flex items-center justify-between'>
        <span className='text-[15px] font-medium text-bgBlue font-Urbanist'>Employee Requirement Checklist</span>
        <CustomButton
          title='Define New Checklist'
          onClick={handleEmpCheckList}
        />
      </div>
      <div className='py-2 pb-1 pl-2 w-[500px]'>
        <div className='flex flex-col gap-3'>
        {employeeCheckListData?.map((ele)=>(

          <Accordion key={ele.id} open={open === ele.id} icon={<Icon id={ele.id} open={open} />}
            className='border border-customGray-100 rounded-lg px-4'
          >
            <AccordionHeader onClick={() => handleOpen(ele.id)} className={`text-[15px] ${open === ele.id ?'border-b border-b-customGray-100' : 'border-b-0'}`}>{ele.title}</AccordionHeader>
            <AccordionBody>
              <div className='flex'>
                <div className='space-y-2 flex-1'>
                  <div className='flex'>
                    <span className='flex-1 text-customBlue text-[15px]'>
                      Applicable For
                    </span>
                    <span className='flex-1 text-[15px]'>
                      {ele?.forDept}
                    </span>
                  </div>
                  <div className='flex'>
                    <span className='flex-1 text-customBlue text-[15px]'>
                      Person Responsible
                    </span>
                    <span className='flex-1 text-[15px]'>
                      {ele?.person_responsible}
                    </span>
                  </div>
                  <div className='flex'>
                    <span className='flex-1 text-customBlue text-[15px]'>
                      Average Completion
                    </span>
                    <span className='flex-1 text-[15px]'>
                      {ele?.avg_completion_time}
                    </span>
                  </div>
                </div>
                <div className='flex-[.1]'>
                  <span 
                    className='w-8 h-8 flex items-center justify-center border border-customGreen-200 text-customGreen-200 rounded-lg cursor-pointer hover:bg-customGreen-200 hover:text-white transition-colors'
                    onClick={() => handleEditCheckList(ele)}
                    title="Edit Checklist"
                  >
                    <FaPencil />
                  </span>
                </div>
              </div>
            </AccordionBody>
          </Accordion>

        ))}
        </div>
      </div>
    </div>

    {employeeCheckListValue.show &&

      <PortalDrawer 
        open={employeeCheckListValue.show}
        closeDrawer={toggleEmpCheckList}
        title={employeeCheckListValue.isEdit ? 'Edit Checklist' : 'Define New Checklist'}
        widthSize={800}
        compo = {
          <AddEditEmployeeCheckList 
            handleChangeEmpCheckList = {handleChangeEmpCheckList}
            employeeCheckListValue = {employeeCheckListValue}
            handleChangeRequestInfo = {handleChangeRequestInfo}
            addNewRequestInput = {addNewRequestInput}
            removeRequestInput = {removeRequestInput}
            handleSelectEmpCheckList = {handleSelectEmpCheckList}
            handleCheckListSearchEmp = {handleCheckListSearchEmp}
            saveChecklist = {saveChecklist}
          />
        }
      
      />
    }
    </>
  )
}

export default EmployeeCheckList