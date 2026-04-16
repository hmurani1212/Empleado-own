import React, { useEffect, useLayoutEffect, useState } from 'react'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react'
import { FaPencil } from 'react-icons/fa6'
import { ClipboardList } from 'lucide-react'
import CustomButton from '../../Components/CustomButton/CustomButton'
import useEmployeeCheckList from '../../ViewModel/EmployeeViewModel/EmpCheckListServices'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'
import AddEditEmployeeCheckList from './AddEditEmployeeCheckList'
import { EmployeeRequirementChecklistSkeleton } from './EmployeeCheckListSkeletons'
import useStore from '../../Store/store'

const EmployeeCheckList = () => {

  const { gettingEmployeeCheckList, employeeCheckListData, employeeCheckListLoading } = useEmployees()
  const {employeeCheckListValue, toggleEmpCheckList, handleEmpCheckList,
    handleEditCheckList,
    handleChangeEmpCheckList,
    handleChangeRequestInfo,addNewRequestInput,removeRequestInput,
    handleSelectEmpCheckList,handleCheckListSearchEmp,
    saveChecklist

  } = useEmployeeCheckList()

  useLayoutEffect(() => {
    useStore.setState({ employeeCheckListLoading: true })
  }, [])

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
        className={`${open === id ? "rotate-180" : ""} h-5 w-5 transition-transform text-gray-500`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    );
  };

  const hasItems = Array.isArray(employeeCheckListData) && employeeCheckListData.length > 0

  return (
    <>
    <div className="flex flex-col gap-6 py-2 pb-8 px-1 sm:px-2 max-w-5xl mx-auto w-full">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-card p-5 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 font-urbanist tracking-tight flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 shrink-0">
                <ClipboardList className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              Employee Requirement Checklist
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
              Configure requirement lists for new hires and role changes. Open a row to see who it applies to and who is responsible.
            </p>
          </div>
          <div className="shrink-0">
            <CustomButton
              title="Define New Checklist"
              onClick={handleEmpCheckList}
            />
          </div>
        </div>

        {employeeCheckListLoading ? (
          <EmployeeRequirementChecklistSkeleton rows={5} />
        ) : hasItems ? (
          <div className="flex flex-col gap-3 w-full max-w-3xl">
            {employeeCheckListData.map((ele)=>(
              <Accordion
                key={ele.id}
                open={open === ele.id}
                icon={<Icon id={ele.id} open={open} />}
                className="border border-gray-200 rounded-xl px-0 overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-brand-100/80 transition-all duration-200"
              >
                <AccordionHeader
                  onClick={() => handleOpen(ele.id)}
                  className={`text-[15px] font-medium cursor-pointer text-gray-900 font-urbanist px-4 py-3.5 ${open === ele.id ? 'border-b border-gray-100 bg-gradient-to-r from-brand-50/40 to-transparent' : 'border-b-0'}`}
                >
                  {ele.title}
                </AccordionHeader>
                <AccordionBody className="px-4 pt-1 pb-4">
                  <div className="flex gap-3">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                        <span className="text-brand-600 text-sm font-medium sm:flex-1 shrink-0">
                          Applicable For
                        </span>
                        <span className="flex-1 text-sm text-gray-700 break-words">
                          {ele?.forDept}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                        <span className="text-brand-600 text-sm font-medium sm:flex-1 shrink-0">
                          Person Responsible
                        </span>
                        <span className="flex-1 text-sm text-gray-700 break-words">
                          {ele?.person_responsible}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:gap-4 gap-1">
                        <span className="text-brand-600 text-sm font-medium sm:flex-1 shrink-0">
                          Average Completion
                        </span>
                        <span className="flex-1 text-sm text-gray-700">
                          {ele?.avg_completion_time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start pt-0.5">
                      <button
                        type="button"
                        className="w-9 h-9 flex items-center justify-center border border-emerald-200 text-emerald-600 rounded-lg cursor-pointer hover:bg-slate-500 hover:text-blue-300 hover:border-emerald-500 transition-colors shadow-sm"
                        onClick={() => handleEditCheckList(ele)}
                        title="Edit Checklist"
                      >
                        <FaPencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </AccordionBody>
              </Accordion>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 py-14 px-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-400 mb-4">
              <ClipboardList className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="text-sm font-medium text-gray-800">No checklists yet</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Create your first requirement checklist to track documents and tasks for new employees.
            </p>
            <div className="mt-5">
              <CustomButton title="Define New Checklist" onClick={handleEmpCheckList} />
            </div>
          </div>
        )}
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
