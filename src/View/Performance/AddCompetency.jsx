import React, { useEffect } from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { FaXmark } from 'react-icons/fa6'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'

const AddCompetency = (props) => {
    const { performance,addCompetencyValue,handleSelectAddCompetency,handleChangeAddCompetency, addComptency,deleteCompteny, handleSubmitAddCompetency, handleRemoveEmp} = props
    
    // Use the same hook as Create Performance Review Cycle
    const { empBranches, fetchingAllBranches } = useEmployees();
    
    // Load branches when component mounts (same as Create Performance Review Cycle)
    useEffect(() => {
        fetchingAllBranches();
    }, []);

    return ( 
    <form className='space-y-3' onSubmit={handleSubmitAddCompetency}>
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Performance</label>
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
                <label className='text-[#698592] text-[12px]'>Competency</label>  
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
                <CustomSelect 
                    placeHolderTitle = 'Branch'
                    value={addCompetencyValue.branchId}
                    options={empBranches?.map((branch) => ({
                        value: branch.id,
                        label: branch.branch_name,
                    }))}
                    onChangeHandler={(selectedOption) => handleSelectAddCompetency(selectedOption, 'branchId')}
                    customStyles={false}
                />
            </div>
            <div className='flex items-center gap-3'>
                <div className='space-y-2 flex-1'>
                    <label className='text-[#698592] text-[12px]'>Departments</label>
                    <CustomSelect 
                        placeHolderTitle = 'Department'
                        options={addCompetencyValue?.departmentsList}
                        cStyle={true}
                        value={addCompetencyValue.departmentId}
                        onChangeHandler={(selectedOption) => handleSelectAddCompetency(selectedOption, 'departmentId')}
                    />
                </div>
                <div className='space-y-2 flex-1'>
                    <label className='text-[#698592] text-[12px]'>Employee</label>
                    <CustomSelect 
                        placeHolderTitle = 'Select Employee'
                        value={addCompetencyValue?.empId}
                        options={addCompetencyValue?.empList?.map((employee) => ({
                            value: employee?.id,
                            label: employee?.name,
                        }))}
                        onChangeHandler={(selectedOption) => handleSelectAddCompetency(selectedOption, 'empId')}
                        customStyles={false}
                        isClearable={true}
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
  )
}

export default AddCompetency