import { Typography, Button } from "@material-tailwind/react";
import React, { useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import CustomButton from "../../Components/CustomButton/CustomButton";
import useCometencyServices from "../../ViewModel/PerformnaceViewModel/competencyServices";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddCompetency from "./AddCompetency";
import EmployeeCompetency from "./EmployeeCompetency";
import { FaEye, FaArrowLeft } from "react-icons/fa6";
import {
  Outlet,
  useLocation,
  useOutletContext,
  useNavigate,
} from "react-router";

const Competency = () => {
  const {
    gettingPRCSelect,
    competencyValue,
    comptencyData,
    addCompetencyValue,
    handleToggleAddCompetency,
    handleAddCompetency,
    handleSelectAddCompetency,
    handleSelectCompetency,
    handleSearchCompetency,
    handleChangeAddCompetency,
    addComptency,
    deleteCompteny,
    handleSubmitAddCompetency,
    handleRemoveEmp,
    handleSubComptency,
  } = useCometencyServices();

  // Get the profile view handler from the parent component
  const {
    handleProfileView,
    currentView,
    showProfile,
    selectedEmployeeId,
    competencyData,
  } = useOutletContext() || {};

  const tableHeader = [
    "Emp ID",
    "Employee Name",
    "Total Competency Scales",
    "Score",
    "Actions",
  ];

  console.log("showProfile showProfile", competencyData);

  const location = useLocation();
  const navigate = useNavigate();

  const handleBackToPerformance = () => {
    navigate("/performance");
  };

  const handleProfileClick = async (employeeId) => {
    try {
      // Trigger the profile view with competency type
      if (handleProfileView) {
        handleProfileView(employeeId, "competency");
      }
    } catch (error) {
      console.error("Error fetching employee profile:", error);
    }
  };

  // {location.pathname.includes('detail_card') ? (<Outlet />) :

  useEffect(() => {
    gettingPRCSelect();
  }, []);

  return (
    <>
      {location.pathname.includes("sub-competency") ? (
        <Outlet />
      ) : showProfile &&
        currentView === "competency" &&
        competencyData &&
        competencyData.length > 0 ? (
        <EmployeeCompetency />
      ) : (
        <>
          <div className="flex flex-col gap-6 py-2">
            <div className="flex items-end justify-between">
              <div className="flex gap-2">
                <div className="w-64">
                  <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                    Performance
                  </label>
                  <CustomSelect
                    placeHolderTitle="Performance"
                    cStyle={true}
                    value={competencyValue.performance_id}
                    options={[
                      { value: null, label: "All" },
                      ...competencyValue.performance?.map((ele) => ({
                        value: ele._id,
                        label: ele.name,
                      })),
                    ]}
                    onChangeHandler={(selectedOption) =>
                      handleSelectCompetency(selectedOption, "performance_id")
                    }
                  />
                </div>
                <div className="relative w-64">
                  <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                    Search Employee
                  </label>
                  <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-1/2 mt-3 right-3 -translate-y-2/4">
                    <span>
                      <BiSearch />
                    </span>
                  </div>
                  <input
                    className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                    placeholder="Search Employee"
                    name="name"
                    value={competencyValue.searchText}
                    onChange={(e) => handleSearchCompetency(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <CustomButton
                  className="bg-[#8bc9f8]"
                  title="Create New Competency"
                  onClick={handleAddCompetency}
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
                            {/* {head} */}
                            {head}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comptencyData?.map((ele, i) => {
                      const isLast = i === comptencyData?.length - 1;
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
                              // color="blue-gray"
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
                              {ele.total_competency}
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
                              className="text-primary-100 cursor-pointer"
                              onClick={() =>
                                handleProfileClick(ele.employee_id)
                              }
                            >
                              <FaEye />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {comptencyData?.length === 0 && (
                  <div className="text-center py-8">
                    <Typography
                      variant="h6"
                      color="gray"
                      className="font-normal"
                    >
                      No competencies found
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          </div>
          {addCompetencyValue.show && (
            <PortalDrawer
              open={addCompetencyValue.show}
              compo={
                <AddCompetency
                  addCompetencyValue={addCompetencyValue}
                  performance={competencyValue.performance}
                  handleSelectAddCompetency={handleSelectAddCompetency}
                  handleChangeAddCompetency={handleChangeAddCompetency}
                  addComptency={addComptency}
                  deleteCompteny={deleteCompteny}
                  handleSubmitAddCompetency={handleSubmitAddCompetency}
                  handleRemoveEmp={handleRemoveEmp}
                />
              }
              title="Add Competency"
              closeDrawer={handleToggleAddCompetency}
              widthSize={600}
            />
          )}
        </>
      )}
    </>
  );
};

export default Competency;