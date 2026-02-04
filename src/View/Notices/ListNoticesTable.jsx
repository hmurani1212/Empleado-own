import { Typography, Button, Menu, MenuHandler, MenuItem, MenuList, } from '@material-tailwind/react'
import React, { useEffect } from 'react'
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices'
import { formatTimestamp } from '../Branches/utils'
import { FaChevronDown } from "react-icons/fa";
import { motion } from 'framer-motion';
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog"
import CustomDialog from '../../Components/CustomDialog/CustomDialog';
import NoticesView from './NoticesView';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import EditNoticeForm from './EditNoticeForm';

const ListNoticesTable = () => {
  const {allNoticesList, getAllNoticesList,deleteNotices, openMenu, noticeMount, noticesMenuItems, toggleMenuNotices,  openDialog, handleMenuItemsNotices,handleDelete,
  openViewDialog, setOpenViewDialog, handleView, loading,addNoticeValue,handleEditNoticeToggle,
  noticesBranches,filterDepartmentsNotices,handleEditNotice,handleNewNotice,handleAddNoticeBranch
} = useNotice()
  const data = ['Month', 'Notice ID', 'Notice Title', 'Recipient', 'Created Date', 'Actions']

  console.log('addNoticeValue', addNoticeValue)

  useEffect(() => {
   
    if(!noticeMount){

        getAllNoticesList()
    }
}, []);

  return (
    <table className="w-full min-w-max text-left h-full">
        <thead className='sticky top-[-9px] z-20'>
            <tr>
                {data?.map((head,i)=>(
                    <th 
                        key={i}
                        className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                    >
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal leading-none opacity-70 capitalize"
                        >
                            {head}
                        </Typography>
                    </th>
                ))}
            </tr>
        </thead>
        <tbody>
        {allNoticesList?.map((ele, index) => {
            const isLast = index === data.length - 1;
            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

    return (
        <tr key={index}>

            <td className={classes}>
                <Typography 
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                >
                    -
                </Typography>
            </td>

            <td className={classes}>
                <Typography 
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                >
                    {ele.id}
                </Typography>
            </td>

            <td className={classes}>
                <Typography 
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                >
                    {ele.title}
                </Typography>
            </td>

            <td className={classes}>
                <Typography 
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                >
                    {ele.emp_name ? ele.emp_name : "All Branches"}
                </Typography>
            </td>

            <td className={classes}>
                <Typography 
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                >
                    {formatTimestamp(ele.timestamp)}
                </Typography>
            </td>




            <td className={classes}>
                <div onMouseEnter={() => toggleMenuNotices(index, true)} onMouseLeave={() => toggleMenuNotices(index, false)} className='relative'>
                  <Button 
                    
                    className='flex items-center gap-2 capitalize font-normal text-[13px] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]'
                      variant="outlined"
                  >
                    Action
                    <FaChevronDown
                      strokeWidth={2.5}
                      className={`transition-transform transform ${openMenu[index] ? "rotate-180" : ""}`}
                      />
                  </Button>

                  {openMenu[index] && (
                        <div className='border border-gray-200 rounded-lg absolute z-10 bg-white left-[-60px] w-[200px] shadow-md' 
                        >
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.2 }}
                        >
                            
                            <ul className="flex w-full flex-col gap-1">
                            {/* 2 is menuItem id while 1 is for activate and 0 is deactivate */}
                            
                            {noticesMenuItems.map(menuItem => (
                                <MenuItem className='flex items-center justify-between' key={menuItem.id} onClick={() => handleMenuItemsNotices(menuItem.id, ele)}>
                                <Typography variant="small">{menuItem.title}</Typography>
                                {/* <span>{menuItem.icon}</span> */}
                                </MenuItem>
                            ))}
                            </ul>
                        </motion.div>
                        </div>
                    )}
                </div>
              </td>

            </tr>
            );
        })}

            
        </tbody>

        <ConfirmationDialog
            openDialog = {openDialog}
            handleOpen={handleDelete}
            handleConfirm={() => deleteNotices()} 
            title = {'Confirm Delete'}
            loading = { loading }
            message = {'Are you sure to Delete this notice?'}
        />

        <CustomDialog 
            openDialog = {openViewDialog}
            handleOpenDialog={handleView}
            handleOpen = {() => setOpenViewDialog(false)}
            title = {'View Notice Detail'}
            compo = {
                <NoticesView />
            }
            showBtns={false}
        />

        {addNoticeValue?.show && 
            <PortalDrawer 
                open={addNoticeValue.show}
                addNoticeValue = {addNoticeValue}
                closeDrawer = {handleEditNoticeToggle}
                widthSize={800}
                title='Update Notice'
                compo ={
                    <EditNoticeForm 
                        noticesBranches ={noticesBranches}
                        filterDepartmentsNotices ={filterDepartmentsNotices}
                        addNoticeValue ={addNoticeValue}
                        handleEditNotice ={handleEditNotice}
                        handleNewNotice ={handleNewNotice}
                        handleAddNoticeBranch ={handleAddNoticeBranch}
                    />
                }
            />
        }



    </table>
  )
}

export default ListNoticesTable