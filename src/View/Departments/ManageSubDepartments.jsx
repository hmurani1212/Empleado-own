import {
  Button,
  Card,
  CardBody,
  IconButton,
  MenuItem,
  Typography,
} from "@material-tailwind/react";
import React, { useRef } from "react";
import useSubDept from "../../ViewModel/DepartmentsViewModel/SubDeptServices";
import { useNavigate, useParams, useLocation } from "react-router";
import { FaChevronDown, FaEye } from "react-icons/fa";
import useDepartments from "../../ViewModel/DepartmentsViewModel/DepartmentsServices";
import { IoArrowBackOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import useDropdownService from "../../services/__dropDownHoverService";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";

const ManageSubDepartments = () => {
  const subDeptHeader = [
    "Department Name",
    "Number of Employees",
    "Head Of Department",
    "Sub Departments",
    "Designation(s)",
    "Action",
  ];
  // const allDeptDetails = ['0']
  const params = useParams();
  // console.log(params)
  const {
    handleDesignation,
    handleEmpDetails,
    handleMenuDept,
    deptActionTitle,
    toggleMenuDept,
    openMenuDept,
    openDialogDept,
    handleDialogDept,
    handleDeleteDept,
  } = useDepartments();
  const {
    subDept,
    handleNestedSubDept,
    backToParent,
    handleAddSubDept,
    backToHome,
  } = useSubDept();
  // console.log("subDeptsubDept", subDept)
  const { triggerRefs, getDropdownPosition } = useDropdownService();
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex flex-col space-y-4">
        <div className="flex gap-2 text-[12px] justify-end">
          <Button 
            className="capitalize font-medium bg-[#8bc9f8] p-2"
            onClick={() => navigate(`/departments/createNewDept/${params.id}`)}
          >
            Add new department
          </Button>
          {/* <Button className='capitalize font-medium bg-[#FF4979] p-2' >Back</Button> */}
          {/* <Button className='capitalize font-medium bg-[#8bc9f8] p-2' onClick={() => handleNavigateCreateNewDept()}>Add new department</Button>
              <Button className='capitalize font-medium bg-[#FF4979] p-2' onClick={handleBackDept}>Back</Button> */}
        </div>
        <Card className="w-100 drop-shadow">
          <CardBody className="overflow-x-scroll sideMenu customScroll flex flex-col space-y-4">
            <div className="flex justify-between">
              <div className="space-x-2">
                {/* <IconButton className='h-7 w-7 bg-[#8bc9f8]' onClick={()=>backToParent(subDept[0], params.id)}>
                        <span><IoArrowBackOutline className='text-[12px]' /></span>
                      </IconButton> */}
                <span className="font-semibold text-[14px] capitalize">
                  Manage Sub department
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  className="capitalize font-medium bg-[#8bc9f8] p-2"
                  onClick={() => handleAddSubDept(params)}
                >
                  Add Sub-Department
                </Button>
                <Button
                  className="capitalize font-medium bg-[#FF4979] p-2"
                  onClick={() => backToHome(params)}
                >
                  Back
                </Button>
              </div>
            </div>
            <div>
              <table className="w-full min-w-max text-left h-full">
                <thead className="sticky top-[-9px] z-20">
                  <tr>
                    {subDeptHeader?.map((head, i) => (
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
                  {subDept?.length > 0 ? (
                    subDept?.map((department, index) => {
                      const isLast = index === subDept.length - 1;
                      const classes = isLast
                        ? "p-4"
                        : "p-4 border-b border-blue-gray-50";

                      return (
                        <tr key={index} className={classes}>
                          <td className={classes}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {department.name ||
                                department.dept_name ||
                                department.title}
                            </Typography>
                          </td>

                          {/* <td className={classes}>
                              <Typography 
                              variant='small' 
                              color='blue-gray' 
                              className='font-normal'
                              >
                                {department.description}
                              </Typography>
                            </td> */}

                          <td className={classes}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              <div className="flex gap-2 items-center">
                                <div className="border p-[4px] text-[#ffae42]">
                                  {/* {console.log("department?._count?.employees"), department?._count?.employees} */}
                                  {department?._count?.employees || "0"}
                                </div>
                                <span
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleEmpDetails(department.id)
                                  }
                                >
                                  View
                                </span>
                              </div>
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              {department.Hod_dep}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              <div className="flex gap-2 items-center">
                                <div
                                  className="border p-[4px] text-[#ffae42]"
                                  onClick={() =>
                                    handleNestedSubDept(department, params.id)
                                  }
                                >
                                  {department.subDpt_count || "0"}
                                </div>
                                <span
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleNestedSubDept(department, params.id)
                                  }
                                >
                                  View
                                </span>
                              </div>
                            </Typography>
                          </td>
                          <td>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal"
                            >
                              <FaEye
                                className="border-solid border-2 border-[#8bc9f8] p-[3px] text-[27px] text-[#8bc9f8] cursor-pointer"
                                onClick={() =>
                                  handleDesignation(
                                    department.designation,
                                    department.id
                                  )
                                }
                              />
                            </Typography>
                          </td>

                          <td className={classes}>
                            <div
                              ref={(el) => (triggerRefs.current[index] = el)}
                              onMouseEnter={() => toggleMenuDept(index, true)}
                              onMouseLeave={() => toggleMenuDept(index, false)}
                              className="relative"
                            >
                              <Button
                                className="flex items-center gap-2 capitalize font-normal text-[13px] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]"
                                variant="outlined"
                              >
                                Action
                                <FaChevronDown
                                  strokeWidth={2.5}
                                  className={`transition-transform transform ${
                                    openMenuDept[index] ? "rotate-180" : ""
                                  }`}
                                />
                              </Button>
                              {openMenuDept[index] && (
                                <div
                                  className={`border border-gray-200 rounded-lg absolute z-10 bg-white w-[200px] left-[-120px] shadow-md z-[9999] ${
                                    getDropdownPosition(index) === "top"
                                      ? "bottom-full"
                                      : "top-full"
                                  }`}
                                >
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      y:
                                        getDropdownPosition(index) === "top"
                                          ? -50
                                          : 50,
                                    }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{
                                      opacity: 0,
                                      y:
                                        getDropdownPosition(index) === "top"
                                          ? -50
                                          : 50,
                                    }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ul className="flex w-full flex-col gap-1">
                                      {deptActionTitle.map((menuItem) => (
                                        <MenuItem
                                          className="flex items-center justify-between"
                                          key={menuItem.id}
                                          onClick={() =>
                                            handleMenuDept(
                                              menuItem.id,
                                              department
                                            )
                                          }
                                        >
                                          <Typography variant="small">
                                            {menuItem.title}
                                          </Typography>
                                          <span>{menuItem.icon}</span>
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
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={subDeptHeader.length}
                        className="p-2 text-center"
                      >
                        {subDept && subDept.length === 0 ? (
                          <div className="flex flex-col items-center space-y-2 py-4">
                            <Typography variant="small" color="blue-gray" className="font-normal">
                              No Sub Departments found
                            </Typography>
                            {/* <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                              This department doesn't have any sub-departments yet
                            </Typography> */}
                          </div>
                        ) : (
                          "No record found"
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>

                <ConfirmationDialog
                  openDialog={openDialogDept}
                  handleOpen={handleDialogDept}
                  handleConfirm={(e) => handleDeleteDept(e)}
                  title={"Confirm Delete"}
                  message={"Are you sure to Delete this Department?"}
                />
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ManageSubDepartments;
