import React, { useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { Typography, Button } from "@material-tailwind/react";
import useGoalServices from "../../ViewModel/PerformnaceViewModel/goalServices";
import useStore from "../../Store/store";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { FaEye, FaPlus, FaClipboardList } from "react-icons/fa6";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddEditGoal from "./AddEditGoal";
import EmployeeGoals from "./EmployeeGoals";
import {
  Outlet,
  useLocation,
  useOutletContext,
  useNavigate,
} from "react-router";
import { motion } from "framer-motion";
import { PerformanceTableSkeleton } from "./PerformanceSkeletons";

const Goals = () => {
  const tableHeader = [
    "Emp ID",
    "Employee Name",
    "No. of Goals",
    "Score",
    "Actions",
  ];
  const {
    gettingPRCSelect,
    goalsValue,
    handleSelectGoals,
    goalsData,
    handleAddGoal,
    toggleAddGoal,
    addGoalValue,
    handleChangeAddGoal,
    handleNewGoal,
    handleRemoveEmp,
    handleViewEmployeeGoals,
    employeeGoalsData,
    handleGoalsSearch,
    goalsLoading,
  } = useGoalServices();

  const location = useLocation();
  const navigate = useNavigate();

  const handleProfileClick = async (employeeId) => {
    try {
      console.log("Profile click - Employee ID:", employeeId);
      handleViewEmployeeGoals(employeeId, "Employee Name");
    } catch (error) {
      console.error("Error fetching employee profile:", error);
    }
  };

  useEffect(() => {
    gettingPRCSelect();
  }, [gettingPRCSelect]);

  return (
    <>
      {location.pathname.includes("sub-goals") ? (
        <Outlet />
      ) : employeeGoalsData && employeeGoalsData.length > 0 ? (
        <EmployeeGoals />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="w-full md:w-64">
                <CustomSelect
                  placeHolderTitle="Select Cycle"
                  value={goalsValue.performance_id}
                  options={[
                    { value: null, label: "All Cycles" },
                    ...goalsValue.performance?.map((ele) => ({
                      value: ele._id,
                      label: ele.name,
                    })),
                  ]}
                  onChangeHandler={(selectedOption) =>
                    handleSelectGoals(selectedOption, "performance_id")
                  }
                  customStyles={false}
                />
              </div>
              
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={goalsValue.searchText}
                  onChange={handleGoalsSearch}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                />
                {goalsValue.searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>

            <Button
              className="bg-bgBlue text-white shadow-blue-500/20 hover:shadow-blue-500/40 capitalize font-medium text-sm px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
              onClick={handleAddGoal}
            >
              <FaPlus size={12} /> Add Goal
            </Button>
          </div>

          {/* Table */}
          {goalsLoading ? (
            <PerformanceTableSkeleton headers={tableHeader} />
          ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="min-h-[calc(100vh-250px)] overflow-auto customScroll">
              <table className="min-w-full table-auto text-center">
                <thead className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
                  <tr>
                    {tableHeader?.map((head, i) => (
                      <th key={i} className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                        <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {goalsData?.map((ele, i) => (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="p-4">
                        <span className="text-xs font-medium text-gray-500 font-poppins bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          #{ele.employee_id}
                        </span>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm font-semibold text-gray-900 font-poppins">
                          {ele.employee_name}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                          {ele.total_goals} Goals
                        </span>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm font-medium text-gray-700 font-poppins">
                          {ele.total_score && Number(ele.total_score) > 0 ? `${ele.total_score}/10` : '0/10'}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="text"
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => handleProfileClick(ele.employee_id)}
                          title="View Employee Profile"
                        >
                          <FaEye size={18} />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                  
                  {goalsData?.length === 0 && (
                    <tr>
                      <td colSpan={tableHeader.length} className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                            <FaClipboardList className="text-3xl text-gray-300" />
                          </div>
                          <Typography color="gray" className="font-medium font-poppins">
                            No goals found
                          </Typography>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {addGoalValue.show && (
            <PortalDrawer
              open={addGoalValue.show}
              compo={
                <AddEditGoal
                  performance={goalsValue.performance}
                  handleSelectGoals={handleSelectGoals}
                  addGoalValue={addGoalValue}
                  handleChangeAddGoal={handleChangeAddGoal}
                  handleNewGoal={handleNewGoal}
                  handleRemoveEmp={handleRemoveEmp}
                />
              }
              title="Add Goal"
              closeDrawer={toggleAddGoal}
              widthSize={550}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Goals;