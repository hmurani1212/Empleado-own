import React, { useMemo } from "react";
import CustomCardAttendance from "../../Components/CustomCard/CustomCardAttendance";
import useAttendance from "../../ViewModel/AttendanceViewModel/AttendanceServices";
import { Outlet, useLocation, useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import EmpAttendance from "../EmployeeView/EmpAttendance/EmpAttendance";
import { getUserData } from "../../Authentication/jwt_decode";
import { useEmployeeRolePermissions } from "../../hooks/useEmployeeRolePermissions";
import { filterAttendanceManagementCards } from "../../utils/attendanceManagementCardPermissions";

const Attendance = () => {
  const {
    attendanceCardsItems,
    empSuggestionListAtt,
    gettingAttReportArchive,
    gettingLateComers,
    branchesAttendance,
    gettingRequestAdj,
    loading,
  } = useAttendance();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = getUserData();
  const { data: rolePermData } = useEmployeeRolePermissions();
  const visibleCards = useMemo(
    () =>
      filterAttendanceManagementCards(
        attendanceCardsItems,
        rolePermData?.permissions,
        userData?.roleId
      ),
    [attendanceCardsItems, rolePermData?.permissions, userData?.roleId]
  );

  const handleNavLinksAtt = (e, link, id) => {
    e.preventDefault();
    // console.log(link)
    navigate(link);

    // Tooba
    // Case 2: View Individual Employee Report
    // Case 7: Late Comers Report

    switch (id) {
      case 1:
        // branchesAttendance()
        break;

      case 2:
        // View Individual Employee Report - Load employee list for selection
        // empSuggestionListAtt()
        break;

      case 3:
        // branchesAttendance()
        break;

      case 4:
        // empSuggestionListAtt()
        break;

      case 5:
        // gettingAttReportArchive()
        break;

      case 6:
        // gettingRequestAdj()

        break;

      case 7:
        // branchesAttendance()
        break;

      case 8:
        //  gettingLateComers()
        break;

      default:
        break;
    }
  };
  const isAttendanceSubPage =
    location.pathname.includes("branch_wise_list_rep") ||
    location.pathname.includes("att_report_archive") ||
    location.pathname.includes("raw_att_logs") ||
    location.pathname.includes("individual-attendance") ||
    location.pathname.includes("attendance_adjust_req");

  return (
    <>
      <div className="flex flex-col py-6 px-6 gap-6 min-h-screen bg-background">
        <div>
           <div className="flex flex-col gap-1">
             <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Attendance Management</h1>
             <p className="text-sm text-gray-500">Your daily attendance and permission-based reports.</p>
           </div>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <div className="h-full">
            {isAttendanceSubPage ? (
              <Outlet />
            ) : (
              <>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-6 shadow-sm mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Your daily attendance</h2>
                  <EmpAttendance embedded />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Reports &amp; tools</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {visibleCards.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="h-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <NavLink
                          onClick={(e) => handleNavLinksAtt(e, item.link, item.id)}
                          className="block h-full"
                        >
                          <CustomCardAttendance
                            title={item.title}
                            color={item.color}
                            icon={item.icon}
                            onClick={item.onClick}
                          />
                        </NavLink>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Attendance;