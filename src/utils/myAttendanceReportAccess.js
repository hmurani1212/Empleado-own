import { getUserData, getDecodedToken } from "../Authentication/jwt_decode";

/** User IDs (oneid or emp_id) allowed to see "My Attendance" individual report in the sidebar. */
export const MY_ATTENDANCE_REPORT_ALLOWED_USER_IDS = Object.freeze(["10686619"]);

function getCurrentUserIds() {
  const userData = getUserData();
  const decoded = getDecodedToken();
  const ids = [
    userData?.oneid,
    decoded?.oneid,
    decoded?.emp_id,
    decoded?.org_data?.emp_id,
    decoded?.org_data?._id,
    decoded?.id,
  ];
  return ids
    .filter((id) => id != null && id !== "")
    .map((id) => String(id));
}

/** True when the logged-in user may access the individual attendance report module. */
export function isMyAttendanceReportUser() {
  const allowed = new Set(
    MY_ATTENDANCE_REPORT_ALLOWED_USER_IDS.map(String)
  );
  return getCurrentUserIds().some((id) => allowed.has(id));
}
