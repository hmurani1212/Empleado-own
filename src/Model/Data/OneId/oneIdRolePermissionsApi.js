import { axiosInstancecoremodule } from "../../base";

/**
 * GET /api/v1/oneid-permissions/role-permissions/by-name/{roleName}?app_id=
 * roleName: JWT role_id (e.g. "Testing Reporting Manager") — encoded in URL.
 */
export async function fetchRolePermissionsByName(roleName, appId = 10) {
  if (!roleName) {
    throw new Error("roleName is required");
  }
  const encoded = encodeURIComponent(String(roleName).trim());
  const { data } = await axiosInstancecoremodule.request({
    method: "GET",
    url: `/api/v1/oneid-permissions/role-permissions/by-name/${encoded}`,
    params: { app_id: appId },
  });
  if (data?.STATUS !== "SUCCESSFUL") {
    const msg =
      data?.ERROR_DESCRIPTION || data?.ERROR_FILTER || "Role permissions request failed";
    throw new Error(msg);
  }
  return data.DB_DATA ?? null;
}
