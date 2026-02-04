import { Button, Input, Typography } from '@material-tailwind/react'
import React, { useEffect } from 'react'
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog"
import useDepartments from '../../ViewModel/DepartmentsViewModel/DepartmentsServices'
import { BsPlusSquareFill } from "react-icons/bs";
import AddNewDesignation from './AddNewDesignation';

const ViewDesignations = (props) => {
  const designationData = ['ID', 'Designation', 'Actions']
  const { deptId } = props
  const { handleDeleteDesignation, openDialogDesig, newDesignation, handleDialogDesig, handleEditDesignation, editInput, editDesValue, editDesignation, designationInput, handleChangeEditDes, designations, designationPagination, handleLoadMoreDesignations, isLoadingMoreDesignations, closeAddDesignationForm, showAddDesignationForm } = useDepartments()
  // console.log("what is the result here", designations)
  return (
    <>
      <div className='flex flex-col space-y-2 sm:space-y-4 px-2 sm:px-4 md:px-[1.1vw]'>
        {!showAddDesignationForm && (
          <div className='flex items-center justify-end gap-2 sm:gap-3' onClick={newDesignation}>
            <span className='text-[12px] text-[#474747] font-Urbanist font-medium'>Add New Designation</span>
            <div>
              <BsPlusSquareFill className='text-lg sm:text-xl md:text-[25px] text-[#8bc9f8] cursor-pointer' />
            </div>
          </div>
        )}

        {showAddDesignationForm ? (
          <div className='flex flex-col space-y-3 sm:space-y-4'>
            <hr />
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0'>
              <h3 className='text-[1.1vw] font-semibold'>Add New Designation</h3>
              <Button 
                variant='outlined' 
                color='red' 
                size='sm'
                className='w-full sm:w-auto'
                onClick={closeAddDesignationForm}
              >
                Back
              </Button>
            </div>
            <AddNewDesignation />
          </div>
        ) : (
          <>
            <div className='bg-white rounded-[10px] p-2 drop-shadow-md overflow-x-auto -mx-2 sm:mx-0 sideMenu customScroll'>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max text-center">
                  <thead className="sticky top-[-9px] z-20 bg-[#F8F9FA] rounded-[8px]">
                    <tr>
                      {designationData?.map((head, i) => (
                        <th key={i} className="bg-[#F8F9FA] p-4">
                          <Typography className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize">
                            {head}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {designations?.length > 0 ? (
                      designations.map((designation, index) => {
                        const isLast = index === designations.length - 1;
                        const classes = isLast ? 'p-4' : 'p-4 border-b border-[#F2F2F9]';

                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className={classes}>
                              <Typography className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal">
                                {designation.id}
                              </Typography>
                            </td>

                            <td className={classes}>
                              {editDesignation && editDesValue.d_id === designation.id ? (
                                <div className="flex justify-center">
                                  <Input
                                    label="Designation Title"
                                    value={editDesValue.d_title}
                                    name='d_title'
                                    color='blue'
                                    onChange={(e) => handleChangeEditDes(e)}
                                    className='text-[clamp(12px,0.9vw,14px)] max-w-[200px]'
                                  />
                                </div>
                              ) : (
                                <Typography className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal break-words">
                                  {designation.title || designation.designation}
                                </Typography>
                              )}
                            </td>

                            <td className={classes}>
                              <div className="flex items-center justify-center gap-2">
                                {editDesignation && editDesValue.d_id === designation.id ? (
                                  <Button
                                    size="sm"
                                    className="capitalize font-medium text-[12px] bg-[#8bc9f8] px-3 py-1.5 hover:bg-[#7ab8e7] rounded-[8px]"
                                    onClick={(e) => handleEditDesignation(e)}
                                  >
                                    Save
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="capitalize font-medium text-[12px] bg-[#8bc9f8] px-3 py-1.5 hover:bg-[#7ab8e7] rounded-[8px]"
                                    onClick={() => editInput(designation)}
                                  >
                                    Edit
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className="capitalize font-medium text-[12px] bg-[#FF4979] px-3 py-1.5 hover:bg-[#e63d69] rounded-[8px]"
                                  onClick={() => handleDialogDesig(designation.id, deptId)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={designationData?.length || 3} className="p-4">
                          <div className="flex flex-col items-center justify-center gap-2 text-center py-8">
                            <span className="text-[#292929] font-medium text-[16px]">
                              No designations found
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Load More Button */}
            {designationPagination?.hasMore && (
              <div className="w-full flex justify-center mt-4 sm:mt-6 mb-2 sm:mb-4 px-2 sm:px-0">
                <Button
                  className="flex items-center gap-2 capitalize font-normal text-xs sm:text-sm md:text-[13px] border border-[#3da5f4] text-[#3da5f4] px-4 sm:px-5 md:px-[20px] py-2 sm:py-[10px] w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  variant="outlined"
                  onClick={handleLoadMoreDesignations}
                  disabled={isLoadingMoreDesignations}
                >
                  {isLoadingMoreDesignations ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}

            <ConfirmationDialog
              openDialog={openDialogDesig}
              handleOpen={handleDialogDesig}
              handleConfirm={handleDeleteDesignation}
              title={'Confirm Delete'}
              message={'Are you sure you want to delete this designation?'}
            />
          </>
        )}
      </div>
    </>
  )
}

export default ViewDesignations