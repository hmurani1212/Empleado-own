import { useEmployeeRolePermissions } from "../../hooks/useEmployeeRolePermissions";

/** Triggers OneID role-permissions fetch as soon as the main shell mounts (non-admin). */
const EmployeeRolePermissionsPrefetch = () => {
  useEmployeeRolePermissions();
  return null;
};

export default EmployeeRolePermissionsPrefetch;
