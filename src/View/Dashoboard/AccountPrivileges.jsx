import { Popover, PopoverContent, PopoverHandler, Typography } from '@material-tailwind/react'
import React from 'react'
import { BsTrash2 } from 'react-icons/bs'
import CustomButton from '../../Components/CustomButton/CustomButton'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { customPrivileges } from '../../services/EmpServices'
import usePriviligesService from '../../ViewModel/EmployeeViewModel/PreviligesService'
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog'
import CustomDialog from '../../Components/CustomDialog/CustomDialog'

import AddingPrivileges from './AddingPrivileges'


const roleHeader = ['Role', 'Description', 'Action']



const AccountPrivileges = (props) => {
  const { data } = props
  
  const personalInfo = data?.personalInfo
  const userRoles = personalInfo?.user_roles


  const [openPopover, setOpenPopover] = React.useState(false);
 
  const triggers = {
    onMouseEnter: () => setOpenPopover(true),
    onMouseLeave: () => setOpenPopover(false),
  };


  const { handleSelectPrivileges, privilegesValue, handlePrivilegesInputChange,handleAddRole,
    deletePrivileges,toggleDeletePrivileges,deletePrivilegeValue,confirmDeletePrivileged,
    addingPrivilegesValue,handleAddPrivilegesClose,privilegesData,
    // testingHandle,handleRadioChange, visibleChildren,selectedValues,originalChildValues, organizedData

   } = usePriviligesService()

  return (
    <>
      <div className='space-y-4'>
        <div>
          <span className='text-[#3DA5F4]'>Account & Privileges</span>
        </div>
        <div className='space-y-3 border-t border-gray-500 pt-10 pb-5'>
          <div className='flex-1 px-2 space-y-1 w-96' >
            <label className='text-[#698592] text-[12px]'>Privilleges</label>
            <CustomSelect 
                placeHolderTitle = 'Privilleges'
                value={ privilegesValue?.privileges}
                options={customPrivileges?.map((type) => ({ value: type.value, label:type.title}))} 
                onChangeHandler={(selectedOption) => handleSelectPrivileges(selectedOption, 'privileges')}
                customStyles={false}
                
            />
          </div>
          <div className='flex-1 px-2 space-y-1 w-96'>
            <label className='text-[#698592] text-[12px]'>IP Filter</label>
            <Popover open={openPopover} handler={setOpenPopover}>

              <PopoverHandler {...triggers}> 
                  <input 
                      className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                      type='text' 
                      value={privilegesValue?.ip_filter} 
                      name='ip_filter' 
                      onChange={handlePrivilegesInputChange}
                  />
              </PopoverHandler>
              <PopoverContent {...triggers} className="z-[999999] max-w-[26rem] bg-[#F8FAFC]">
                <Typography>
                  You may restrict this user to access Empleado only from some specific IP(s) You may specifiy a range or just specific IP or IPs e.g. to set a range 127.27 OR specific IP address e.g. 127.27.0.0, 127.27.0.1
                </Typography>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <CustomButton 
              title = 'Grant Role'
              loading= {privilegesValue.loading}
              onClick={()=>handleAddRole(personalInfo?.emp_data?.id)}
            />
          </div>
        </div>
        <div className='space-y-3 border-t border-gray-500 py-2'>
          <table className="w-full min-w-max table-auto text-start">
            <thead>
              <tr>
                {roleHeader.map((head) => (
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
              {userRoles?.map((ele, i)=>(
                <tr key={i}>
                  <td className='py-2'>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {ele?.role}
                    </Typography>
                  </td>
                  <td className='py-2'>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {ele?.role_desc}
                    </Typography>
                  </td>
                  <td className='py-2'>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      <div>
                        <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                          onClick={()=>deletePrivileges(personalInfo?.emp_data?.id, ele)}
                        ><BsTrash2 /></span>
                      </div>
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmationDialog 
        openDialog= {deletePrivilegeValue.show}
        title = 'Delete Confirmation'
        message = 'Are you sure you want to Delete this Role ?'
        handleConfirm = {confirmDeletePrivileged}
        handleOpen = {toggleDeletePrivileges}
        loading = {deletePrivilegeValue.loading}

      />
      <CustomDialog 
        openDialog = {addingPrivilegesValue.show}
        handleOpen = {handleAddPrivilegesClose}
        outsidePress = {false}
        title='Adding Privileges'
        compo={ <AddingPrivileges 
          privilegesData = {privilegesData}
          handleAddPrivilegesClose = {handleAddPrivilegesClose}
          empId = {personalInfo?.emp_data?.id}
        /> }
        footer={false}
        size="lg"
      />
    </>
  )
}

export default AccountPrivileges