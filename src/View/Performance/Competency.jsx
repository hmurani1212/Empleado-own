import { Typography, Button } from "@material-tailwind/react";
import React, { useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import useCometencyServices from "../../ViewModel/PerformnaceViewModel/competencyServices";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddCompetency from "./AddCompetency";
import EmployeeCompetency from "./EmployeeCompetency";
import { FaEye, FaPlus, FaClipboardList } from "react-icons/fa6";
import {
  Outlet,
  useLocation,
  useOutletContext,
  useNavigate,
} from "react-router";
import { motion } from "framer-motion";

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
  } = useCometencyServices();

  // Get the profile view handler from the parent component
  const {
    handleProfileView,
    currentView,
    showProfile,
    competencyData: competencyDataFromContext,
  } = useOutletContext() || {};

  const tableHeader = [
    "Emp ID",
    "Employee Name",
    "Total Competency Scales",
    "Score",
    "Actions",
  ];

  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    gettingPRCSelect();
  }, []);

  return (
    <>
      {location.pathname.includes("sub-competency") ? (
        <Outlet />
      ) : showProfile &&
        currentView === "competency" &&
        competencyDataFromContext &&
        competencyDataFromContext.length > 0 ? (
        <EmployeeCompetency />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="w-full md:w-64">
                <CustomSelect
                  placeHolderTitle="Filter by Performance"
                  value={competencyValue.performance_id}
                  options={[
                    { value: null, label: "All Cycles" },
                    ...competencyValue.performance?.map((ele) => ({
                      value: ele._id,
                      label: ele.name,
                    })),
                  ]}
                  onChangeHandler={(selectedOption) =>
                    handleSelectCompetency(selectedOption, "performance_id")
                  }
                  customStyles={false}
                />
              </div>

              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                  placeholder="Search Employee..."
                  name="name"
                  value={competencyValue.searchText}
                  onChange={(e) => handleSearchCompetency(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="bg-bgBlue text-white shadow-blue-500/20 hover:shadow-blue-500/40 capitalize font-medium text-sm px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
              onClick={handleAddCompetency}
            >
              <FaPlus size={12} /> Create Competency
            </Button>
          </div>

          {/* Table */}
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
                  {comptencyData?.map((ele, i) => (
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
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">
                          {ele.total_competency} Scales
                        </span>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm font-medium text-gray-700 font-poppins">
                          {ele.total_score}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="text"
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => handleProfileClick(ele.employee_id)}
                        >
                          <FaEye size={18} />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}

                  {comptencyData?.length === 0 && (
                    <tr>
                      <td colSpan={tableHeader.length} className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                            <FaClipboardList className="text-3xl text-gray-300" />
                          </div>
                          <Typography color="gray" className="font-medium font-poppins">
                            No competencies found
                          </Typography>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
        </div>
      )}
    </>
  );
};

export default Competency;