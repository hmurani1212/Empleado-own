import { Card, CardBody, MenuItem, Typography } from "@material-tailwind/react";
import React, { useEffect } from "react";
import { IoMdMore } from "react-icons/io";
import { motion } from "framer-motion";
import useShiftManagement from "../../ViewModel/ShiftManagementViewModel/ShiftManagementServices";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";

const TeamMemberCard = (props) => {
  const { allTeamMembers, display } = props;
  const {
    openMenuShift,
    toggleMenuShift,
    shiftMenu,
    handleShiftMenu,
    handleDialog,
    openDialog,
    handleDeleteMember,
    isDeletingMember,
  } = useShiftManagement();

  return (
    // Tooba
    // Edit Team Member
    <div className={display}>
      {allTeamMembers?.map((ele, i) => (
        <motion.button whileHover={{ scale: 1.01 }} key={i}>
          <div className="relative w-[200px]">
            <Card className="bg-bgBlue rounded-[10px] shadow-none cursor-pointer h-[75px]">
              <CardBody className="flex items-center justify-center space-x-2 p-0 py-4 text-[14px]">
                <div className="flex items-center justify-center">
                  {/* <div className="flex justify-between"> */}
                  {/* <div className=""> */}
                  <div>
                    <img
                      className="rounded-full w-[40px] h-[40px]"
                      src={`https://emp-beta.veevotech.com/${ele.dp}`}
                    />
                  </div>
                </div>

                <div className="flex flex-col text-white text-[10px]">
                  <span className="font-medium">{ele.name}</span>
                  <div className="flex gap-2 text-[10px] text-white">
                    <div>Emp ID</div>
                    <div className="font-medium">{ele.emp_id}</div>
                  </div>
                </div>

                <div
                  onMouseEnter={() => toggleMenuShift(i, true)}
                  onMouseLeave={() => toggleMenuShift(i, false)}
                  className="absolute top-1 right-0"
                >
                  <div className="text-white text-[20px] cursor-pointer">
                    <IoMdMore />
                  </div>

                  {openMenuShift[i] && (
                    <div className="border border-gray-200 rounded-lg absolute z-10 bg-white left-[-142px] w-[155px] shadow-md">
                      <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ul className="flex w-full flex-col gap-1">
                          {shiftMenu
                            .filter(
                              (item) =>
                                item.title !== "Activate" &&
                                item.title !== "Deactivate"
                            )
                            .map((menuItem) => (
                              <MenuItem
                                className="flex items-center justify-between"
                                key={menuItem.id}
                                onClick={() =>
                                  handleShiftMenu(menuItem.id, ele)
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
              </CardBody>
            </Card>

            <ConfirmationDialog
              openDialog={openDialog}
              handleOpen={handleDialog}
              handleConfirm={handleDeleteMember}
              title={"Confirm Delete"}
              message={"Are you sure to Delete this Member?"}
              loading={isDeletingMember}
            />
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default TeamMemberCard;