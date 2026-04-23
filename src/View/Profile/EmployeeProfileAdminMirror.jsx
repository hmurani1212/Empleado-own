/**
 * Deprecated: `/profile` now renders `EmpProfile` (self-service My Profile) in `Routers.jsx`.
 * This file is kept only as a reference; do not wire it back to `/profile` or employees will
 * land on the admin `AdminEmployeeProfile` shell again.
 */
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useEmpDashboard from "../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices";
import { getDecodedToken } from "../../Authentication/jwt_decode";

/** @deprecated Redirect helper; not used by routes. */
const EmployeeProfileAdminMirror = () => {
  const { empDashboardData, gettingEmpDashboardData } = useEmpDashboard();
  const [empId, setEmpId] = useState(null);

  useEffect(() => {
    const d = new Date();
    gettingEmpDashboardData(d.getMonth() + 1, d.getFullYear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fromDash = empDashboardData?.section1?.emp_id;
    if (fromDash != null && fromDash !== "") {
      setEmpId(String(fromDash));
      return;
    }
    const dec = getDecodedToken();
    const fallback =
      dec?.emp_id ??
      dec?.org_data?._id ??
      dec?.org_data?.emp_id;
    if (fallback != null && fallback !== "") {
      setEmpId(String(fallback));
    }
  }, [empDashboardData]);

  if (!empId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500 text-sm">
        Loading profile…
      </div>
    );
  }

  return <Navigate to={`/employee-profile/${empId}`} replace />;
};

export default EmployeeProfileAdminMirror;
