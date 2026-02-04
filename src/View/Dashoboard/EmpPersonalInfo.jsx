import {  Typography } from '@material-tailwind/react'
import React from 'react'
import { BsTrash2 } from 'react-icons/bs'
import { CiEdit } from 'react-icons/ci'
import useDashboard from '../../ViewModel/DashboardViewModel/DashboardServices'
import { FaXmark } from 'react-icons/fa6'
import { TiTick  } from 'react-icons/ti'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import {  genderList, maritalStatusList } from '../../services/EmpServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import CustomDialog from '../../Components/CustomDialog/CustomDialog'
import AddNewContact from './AddNewContact'
import useEmpContactService from '../../ViewModel/EmployeeViewModel/EmpContactService'
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog'


const contactsHeader = [
    'Type', 'Title', 'Detail', 'Country Code', 'Network', 'Action'
]

const EmpPersonalInfo = (props) => {
    const { data } = props
    const personalInfo = data?.personalInfo?.emp_data
    const nationality = data?.nationality
    const contacts =data?.personalInfo?.emp_contact

    const {handleEmpProfileEdit, empPersonalInfoValue,handleCloseEditEmpInfo, handleSelectEditChange, allCountries,
        handleEmpProfileChange,handleUpdateEmpProfile
    } = useDashboard()



    const { handleAddNewContactClose, handleAddNewContact, newContactValue,
        handleContactEdit, handleSelectAddContactChange,
        deleteEmpContact,deleteContact, toggleDeleteEmpContact,confirmDeleteContact,
        handleSubmitNewContact,handleNewContactChange, handleUpdateContact
    } = useEmpContactService()


    const getValue = (val) => (typeof val === 'object' && val !== null ? val.value : val);




  return (
    <div className='space-y-4'>
        <div>
            <span className='text-[#3DA5F4]'>{data.empView.section.title}</span>
        </div>
        <div className='space-y-3 border-t border-b border-[#cccccc] py-2'>
                 {empPersonalInfoValue.show &&
                <div className='flex items-center'>
                    <div className='flex-[0.5]'>
                        <span className='font-bold text-[15px] text[#474747]'>Name</span>
                    </div>
                    <div className='flex-1 flex items-center justify-between'>
                        
                        <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                            type='text' value={empPersonalInfoValue?.name} name='name' 
                            onChange={handleEmpProfileChange}
                        />

                        {empPersonalInfoValue.show &&

                            <div className='flex items-center gap-2'>
                                <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                                    onClick={handleCloseEditEmpInfo}
                                ><FaXmark /></span>
                                <span className='bg-[#0acf97] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                                    onClick={()=>handleUpdateEmpProfile(personalInfo.id)}
                                ><TiTick /></span>
                            </div>
                        }
                    
                    </div>
                </div>
            }
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Date of Birth</span>
                </div>
                <div className='flex-1 flex items-center justify-between'>
                    {empPersonalInfoValue.show ? 
                        <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-gray-500 outline-none'
                            type='date' value={empPersonalInfoValue?.dob} name='dob' 
                            onChange={handleEmpProfileChange}
                        />
                    :
                        <span>{personalInfo?.dob}</span>
                    }
                    
                    {!empPersonalInfoValue.show &&
                        <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                        onClick={()=>handleEmpProfileEdit(personalInfo.id)}
                        ><CiEdit /></span>
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Father Name</span>
                </div>
                <div className='flex-1'>
                    {empPersonalInfoValue.show ? 
                        <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none'
                            type='text' value={empPersonalInfoValue?.f_name} name='f_name' 
                            onChange={handleEmpProfileChange}
                        />
                        :
                        <span>{personalInfo?.f_name}</span>
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Gender</span>
                </div>
                <div className='flex-1'>
                    {empPersonalInfoValue.show ? 
                        <div className='w-[70%]'>
                            <CustomSelect 
                                placeHolderTitle = 'Select Gender'
                                value={
                                    genderList.find(option => option.id == empPersonalInfoValue.gender) 
                                    ? { value: genderList.find(option => option.id == empPersonalInfoValue.gender).id, 
                                        label:genderList.find(option => option.id == empPersonalInfoValue.gender).title
                                    }
                                    :
                                    empPersonalInfoValue.gender
                                }
                                options={genderList?.map((type) => ({ value: type.id, label: type.title }))} 
                                onChangeHandler={(selectedOption) => handleSelectEditChange(selectedOption, 'gender')}
                                customStyles={false}
                                
                            />
                        </div>
                    :    
                        <span>{personalInfo.gender == 0 ? 'Female' : personalInfo.gender == 1 ? 'Male' : 'Other'}</span>
                    
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Nationality</span>
                </div>
                <div className='flex-1'>
                    {empPersonalInfoValue.show ? 
                        <div className='w-[70%]'>
                            <CustomSelect 
                                placeHolderTitle='Country'
                                value={
                                    empPersonalInfoValue?.nationality?.find(country => country.id == empPersonalInfoValue.country) 
                                    ? { 
                                        value: `${empPersonalInfoValue?.nationality?.find(country => country.id == empPersonalInfoValue.country).id}`, 
                                        label: empPersonalInfoValue?.nationality?.find(country => country.id == empPersonalInfoValue.country).name 
                                    } 
                                    : empPersonalInfoValue.country
                                }
                                options={ empPersonalInfoValue?.nationality?.map((country) => ({
                                    value: `${country.id}`,
                                    label: country.name
                                }))}
                                onChangeHandler={(selectedOption) => handleSelectEditChange(selectedOption, 'country')}
                                customStyle={false}
                            />
                        </div>
                        :
                        (
                            empPersonalInfoValue?.nationality?.find(country => country.id == getValue(empPersonalInfoValue.country))
                            ? <span>{empPersonalInfoValue.nationality.find(country => country.id == getValue(empPersonalInfoValue.country)).name}</span>
                            : <span>{nationality.name}</span>
                        )
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    
                    <span className='font-bold text-[15px] text[#474747]'>City</span>
                </div>
                <div className='flex-1'>
                    {empPersonalInfoValue.show ? 
                        <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none'
                            type='text' value={empPersonalInfoValue?.city} name='city' 
                            onChange={handleEmpProfileChange}
                        />
                        :
                        <span>{personalInfo?.city}</span>
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Domicile</span>
                </div>
                <div className='flex-1'>
                     {empPersonalInfoValue.show ? 
                        <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none'
                            type='text' value={empPersonalInfoValue?.domicile} name='domicile' 
                            onChange={handleEmpProfileChange}
                        />
                        :
                    <span>{personalInfo.domicile}</span>
                     }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Religion</span>
                </div>
                <div className='flex-1'>
                     {empPersonalInfoValue.show ? 
                        <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none'
                            type='text' value={empPersonalInfoValue?.religion} name='religion' 
                            onChange={handleEmpProfileChange}
                        />
                        :
                    <span>{personalInfo.religion}</span>
                     }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Marital Status</span>
                </div>
                <div className='flex-1'>
                    {empPersonalInfoValue.show ? 
                    <div className='w-[70%]'>
                        <CustomSelect 
                            placeHolderTitle = 'Select Marital Status'
                            value={
                                maritalStatusList.find(option => option.id == empPersonalInfoValue.martial_status) 
                                ? { value: maritalStatusList.find(option => option.id == empPersonalInfoValue.martial_status).id, 
                                    label:maritalStatusList.find(option => option.id == empPersonalInfoValue.martial_status).title
                                }
                                :
                                empPersonalInfoValue.martial_status
                            }
                            options={maritalStatusList?.map((type) => ({ value: type.id, label: type.title }))} 
                            onChangeHandler={(selectedOption) => handleSelectEditChange(selectedOption, 'martial_status')}
                            customStyles={false}
                            
                        />
                    </div>
                    :    
                        <span>{personalInfo.martial_status == 0 ? 'Single' : personalInfo.martial_status == 1 ? 'Married' : 'Other'}</span>
                    
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Blood Group</span>
                </div>
                <div className='flex-1'>
                    {empPersonalInfoValue.show ? 
                    <div className='w-[70%]'>
                    <CustomSelect 
                        placeHolderTitle='Blood Group'
                        value={
                            empPersonalInfoValue.blood_groups.includes(empPersonalInfoValue.blood_group)
                            ? { value: empPersonalInfoValue.blood_group, label: empPersonalInfoValue.blood_group }

                            : empPersonalInfoValue.blood_group
                        }
                        options={ empPersonalInfoValue?.blood_groups?.map((blood_group) => ({
                            value: `${blood_group}`,
                            label: blood_group
                        }))}
                        onChangeHandler={(selectedOption) => handleSelectEditChange(selectedOption, 'blood_group')}
                        customStyle={false}
                        />
                    </div>
                    :
                        <span>{personalInfo.blood_group}</span>
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>{empPersonalInfoValue.show ? 'Disability (write if any)' : 'Disability'}</span>
                </div>
                <div className='flex-1'>
                    {empPersonalInfoValue.show ? 
                        <textarea 
                            rows="7" 
                            // cols="50" 
                            name="disability"
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none'
                            onChange={handleEmpProfileChange}
                        >
                        </textarea>
                    :
                        <span>{personalInfo.disability}</span>
                    }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>Passport/NIC #</span>
                </div>
                <div className='flex-1'>
                     {empPersonalInfoValue.show ? 
                        <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md   py-[10px] px-[17px] border border-[#cccccc] outline-none'
                            type='text' value={empPersonalInfoValue?.passport_no} name='passport_no' 
                            onChange={handleEmpProfileChange}    
                        />
                        :
                    <span>{personalInfo.passport_no}</span>
                     }
                </div>
            </div>
            <div className='flex items-center'>
                <div className='flex-[0.5]'>
                    <span className='font-bold text-[15px] text[#474747]'>NTN #</span>
                </div>
                <div className='flex-1'>
                     {empPersonalInfoValue.show ? 
                        <input 
                            className='w-[70%] text-[#333333] text-[12px] rounded-md  py-[10px] px-[17px] border border-[#cccccc] outline-none'
                            type='text' value={empPersonalInfoValue?.ntn_no} name='ntn_no' 
                            onChange={handleEmpProfileChange}
                        />
                        :
                    <span>{personalInfo.ntn_no}</span>
                     }
                </div>
            </div>
        </div>
        <div className='space-y-3'>
            <div className='flex items-center justify-between'>
                <span className='text-[#3DA5F4]'>Contact Info</span>
                <CustomButton 
                    title='Add Contact'
                    onClick={handleAddNewContact}
                />
            </div>
            <div className='space-y-3 pb-2'>
                <table className="w-full min-w-max table-auto text-start">
                    <thead>
                    <tr>
                        {contactsHeader.map((head) => (
                            <th
                                key={head}
                                className="py-4 text-left"
                            >
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="leading-none font-semibold"
                                >
                                    {head}
                                </Typography>
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                        {contacts?.map((ele, i)=>(
                            <tr key={i}>
                            <td className='py-2'>

                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal capitalize"
                                    >
                                        {ele?.contact_type}
                                    </Typography>
                            </td>
                            <td className='py-2'>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {ele?.contact_title}
                                    </Typography>
                            </td>
                            <td className='py-2'>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal"
                                >
                                    {ele?.contact}
                                </Typography>
                                {/* } */}
                            </td>
                            <td className='py-2'>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {allCountries?.find((country) => country.id === ele.country_id)?.country_name || ''}
                                    </Typography>
                            </td>
                            <td className='py-2'>
                                {/* {contactEditValue?.showEdit?.includes(i) ? 
                                    <CustomSelect
                                            placeHolderTitle='Network'
                                            value={contactMobileNetwroks.find(network => network.networkName === contactEditValue.mobile_network[i]?.label)
                                                ? { value: contactEditValue.mobile_network[i].value, label: contactEditValue.mobile_network[i].label }
                                                : { value: ele.mobile_network, label: ele.mobile_network }
                                            }
                                            options={contactMobileNetwroks.map((network) => ({ value: network.networkName, label: network.networkName }))}
                                            onChangeHandler={(selectedOption) => handleSelectContactChange(selectedOption, 'mobile_network', i)}
                                            customStyles={false}
                                        />
                                        : */}
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {ele?.mobile_network}
                                    </Typography>
                                {/* } */}
                            </td>
                           
                            
                           
                            <td className='py-2'>
                                {/* {contactEditValue.showEdit.includes(i) ? 
                                    <div className='flex  items-center gap-2'>
                                        <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                                            onClick={()=>handleCloseEditPhone(i)}
                                        ><FaXmark /></span>
                                        <span className='bg-[#0acf97] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'><TiTick /></span>
                                    </div>
                                    : */}
                                    <div className='flex  items-center gap-2'>
                                        <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                                            onClick={()=>handleContactEdit(ele)}
                                            ><CiEdit /></span>
                                        <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                                            onClick={()=>deleteContact(ele.id ,personalInfo.id )}
                                        ><BsTrash2 /></span>
                                    </div>
                                {/* } */}
                            </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        {newContactValue.show && 
            <CustomDialog 
                title={newContactValue.addState ? 'Add New Contact' : 'Update Contact'}
                openDialog={newContactValue.show}
                handleOpen = {handleAddNewContactClose}
                compo={
                    <AddNewContact 
                        allCountries ={allCountries}
                        handleSelectAddContactChange = {handleSelectAddContactChange}
                        newContactValue = {newContactValue}
                        handleSubmitNewContact = {handleSubmitNewContact}
                        handleNewContactChange = {handleNewContactChange}
                        empId= {personalInfo.id}
                        handleUpdateContact = {handleUpdateContact}
                    />
                }
                size="md"
                confirmBtn ={true}
                footer={false}
                outsidePress = {false}

            />
        }
        <ConfirmationDialog 
            openDialog= {deleteEmpContact.show}
            title = 'Delete Confirmation'
            message = {`Are you sure you want to Delete this Contact`}
            handleConfirm = {confirmDeleteContact}
            handleOpen = {toggleDeleteEmpContact}
            loading = {deleteEmpContact.loading }

        />
    </div>
  )
}

export default EmpPersonalInfo