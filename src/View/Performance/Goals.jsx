import React, { useEffect, useContext } from "react";
import { BiSearch } from "react-icons/bi";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { Typography } from "@material-tailwind/react";
import useGoalServices from "../../ViewModel/PerformnaceViewModel/goalServices";
import useStore from "../../Store/store";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
// import useDropdownService from '../../services/__dropDownHoverService'
// import usePerformanceServices from '../../ViewModel/PerformnaceViewModel/performanceServices'
// import { PRCActionList } from '../../services/__performanceServices'
import { FaEye } from "react-icons/fa6";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddEditGoal from "./AddEditGoal";
import EmployeeGoals from "./EmployeeGoals";
import {
  Outlet,
  useLocation,
  useOutletContext,
  useNavigate,
} from "react-router";

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
    handleSubGoals,
    handleViewEmployeeGoals,
    employeeGoalsData,
    employeeGoalsNext,
    handleLoadMoreEmployeeGoals,
    handleGoalsSearch,
  } = useGoalServices();

  // Get the profile view handler from the parent component
  const {
    handleProfileView,
    currentView,
    showProfile,
    selectedEmployeeId,
    goalsData: employeeGoalsDataFromContext,
  } = useOutletContext() || {};

  // Get the API function from store
  const { gettingGoalsByEmployeeId } = useStore();

  // const { getDropdownPosition, triggerRefs } = useDropdownService()
  // const { toggleMenuValue,openMenuValue,} = usePerformanceServices()

  const location = useLocation();
  const navigate = useNavigate();

  const handleBackToPerformance = () => {
    navigate("/performance");
  };

  const handleProfileClick = async (employeeId) => {
    try {
      console.log("Profile click - Employee ID:", employeeId);

      // Fetch the employee goals data - this will trigger the EmployeeGoals component to show
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
        <div className="flex flex-col gap-6 py-2 pb-1">
          <div className="flex items-end justify-between">
            <div className="flex gap-2">
              <div className="w-64">
                <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                  Select Cycle
                </label>
                <CustomSelect
                  placeHolderTitle="All"
                  cStyle={true}
                  value={goalsValue.performance_id}
                  options={[
                    { value: null, label: "All" },
                    ...goalsValue.performance?.map((ele) => ({
                      value: ele._id,
                      label: ele.name,
                    })),
                  ]}
                  onChangeHandler={(selectedOption) =>
                    handleSelectGoals(selectedOption, "performance_id")
                  }
                />
              </div>
              <div className="relative w-64">
                <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                  Search Goal
                </label>
                <input
                  type="text"
                  placeholder="Search goals..."
                  value={goalsValue.searchText}
                  onChange={handleGoalsSearch}
                  className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                />
                <BiSearch className="absolute right-3 top-1/2 mt-3 transform -translate-y-1/2 text-gray-400" />
                {goalsValue.searchLoading && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <CustomButton
                title="Add Goal"
                onClick={() => {
                  handleAddGoal();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              />
            </div>
          </div>
          <div className="bg-white rounded-[10px] drop-shadow-md p-2">
            <div className="h-[calc(100vh-100px)] overflow-auto customScroll">
              <table className="w-full text-center">
                <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                  <tr>
                    {tableHeader?.map((head, i) => (
                      <th key={i} className="bg-[#F8F9FA] p-4">
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {goalsData?.map((ele, i) => {
                    const isLast = i === goalsData?.length - 1;
                    const classes = isLast
                      ? "p-4"
                      : "p-4 border-b border-[#F2F2F9]";

                    return (
                      <tr key={i}>
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {ele.employee_id}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gary"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {ele.employee_name}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {ele.total_goals}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {ele.total_score}
                          </Typography>
                        </td>
                        <td
                          className={`${classes} flex items-center justify-center`}
                        >
                          <span
                            className="text-blue-500 cursor-pointer hover:text-blue-700"
                            onClick={() => handleProfileClick(ele.employee_id)}
                            title="View Employee Profile"
                          >
                            <FaEye />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {console.log(
            "Main Goals - Modal rendering check - addGoalValue.show:",
            addGoalValue.show
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