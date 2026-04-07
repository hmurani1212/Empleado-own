/**
 * Normalize GET /api/v1/employees/branch/:id responses for the Branch Admin picker.
 */

export function parseBranchEmployeesPayload(responseData) {
    const db = responseData?.DB_DATA;
    if (db == null) {
        return { employees: [], admins: [] };
    }
    if (Array.isArray(db)) {
        return { employees: db, admins: [] };
    }
    const employees =
        db.employees ??
        db.Employees ??
        db.employee_list ??
        db.employeeList ??
        [];
    const admins =
        db.Existig_admin ??
        db.Existing_admin ??
        db.existing_admin ??
        db.branch_admins ??
        db.BRANCH_ADMIN_DATA ??
        [];
    return {
        employees: Array.isArray(employees) ? employees : [],
        admins: Array.isArray(admins) ? admins : [],
    };
}

export function getBranchEmployeeRecordId(emp) {
    if (emp == null || typeof emp !== "object") return undefined;
    const id =
        emp.id ??
        emp.employee_id ??
        emp.user_id ??
        emp.emp_id ??
        emp.oneid ??
        emp.one_id;
    return id;
}

export function getBranchEmployeeDisplayLabel(emp) {
    const id = getBranchEmployeeRecordId(emp);
    const name =
        emp.name ??
        emp.full_name ??
        emp.employee_name ??
        emp.user_full_name ??
        emp.fullUsername ??
        emp.user_name;
    const nameStr = name != null ? String(name).trim() : "";
    if (nameStr) {
        return id != null ? `${nameStr} (${id})` : nameStr;
    }
    return id != null ? String(id) : "Unknown";
}

/**
 * Build react-select options; exclude rows already branch admins.
 */
function idKey(v) {
    if (v == null || v === "") return null;
    return String(v);
}

export function buildBranchAdminEmployeeOptions(brnachAdminData) {
    const rawList = Array.isArray(brnachAdminData?.DB_DATA) ? brnachAdminData.DB_DATA : [];

    const adminIds = new Set();
    (brnachAdminData?.BRANCH_ADMIN_DATA || []).forEach((admin) => {
        [admin.employee_id, admin.id, admin.user_id].forEach((x) => {
            const k = idKey(x);
            if (k) adminIds.add(k);
        });
    });

    return rawList
        .map((emp) => {
            const value = getBranchEmployeeRecordId(emp);
            const k = idKey(value);
            if (!k) return null;
            if (adminIds.has(k)) return null;
            const numeric = Number(value);
            const optionValue = Number.isFinite(numeric) && String(numeric) === k ? numeric : value;
            return {
                value: optionValue,
                label: getBranchEmployeeDisplayLabel(emp),
            };
        })
        .filter(Boolean);
}
