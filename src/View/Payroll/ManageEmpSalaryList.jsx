import {
  Button,
  MenuItem,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import React, { useEffect } from "react";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";
import { FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import useManageEmpSalary from "../../ViewModel/PayrollViewModel/ManageEmpSalaryServices";
import payrollApi from "../../Model/Data/Payroll/Payroll";
import { showToast } from "../../Components/Toaster/Toaster";
import { Loader2 } from "lucide-react";

const ManageEmpSalaryList = (props) => {
  const headList = [
    "Employee Id",
    "Employee",
    "Branch",
    "Department",
    "Salary Template(Basic pay)",
    "Current Salary",
    "Incentive",
    "Deduction",
    "Payable Salary",
    "Actions",
  ];
  const { allEmpSalary, templates, onRefresh } = props;
  const { toggleMenuEmpSalary, openMenuEmpSalary, empSalaryActionMenu } =
    usePayroll();
  const {
    handleActionManageEmpSalary,
    openSalaryHistory,
    loading,
    setLoading,
  } = useManageEmpSalary();

  // Track template changes for each employee
  const [templateChanges, setTemplateChanges] = React.useState({});

  // Use templates from props if available, otherwise fallback to empty array
  const availableTemplates = templates || [];

  // Handle template change for an employee
  const handleTemplateChange = (employeeId, newTemplateId) => {
    setTemplateChanges((prev) => ({
      ...prev,
      [employeeId]: newTemplateId,
    }));
  };

  // Handle update button click
  const handleUpdateTemplate = async (employeeId) => {
    setLoading(true);
    const newTemplateId = templateChanges[employeeId];

    try {
      const response = await payrollApi.updateEmployeeSalaryTemplate(
        employeeId,
        newTemplateId
      );
      const data = response.data;

      if (data && (data.success === true || data.STATUS === "SUCCESS")) {
        showToast("Salary template updated successfully!", "success");

        // Remove from templateChanges after successful update
        setTemplateChanges((prev) => {
          const newChanges = { ...prev };
          delete newChanges[employeeId];
          return newChanges;
        });

        // Refresh the employee list to get updated data
        if (onRefresh && typeof onRefresh === "function") {
          onRefresh();
        }
      } else {
        showToast(
          data?.ERROR_DESCRIPTION || "Failed to update salary template",
          "error"
        );
      }
    } catch (error) {
      showToast("Error updating salary template. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Check if employee has pending template change
  const hasTemplateChanged = (employeeId, currentTemplateId) => {
    return (
      templateChanges[employeeId] !== undefined &&
      templateChanges[employeeId] !== currentTemplateId?.toString()
    );
  };

  // Get display value for template select
  const getTemplateValue = (employeeId, currentTemplateId) => {
    if (templateChanges[employeeId] !== undefined) {
      return templateChanges[employeeId];
    }

    // Try to find the template ID in different possible fields
    const employee = allEmpSalary?.find((emp) => emp.id === employeeId);
    if (employee) {
      // Check if employee has wf_salary_template object
      if (employee.wf_salary_template && employee.wf_salary_template.id) {
        return employee.wf_salary_template.id.toString();
      }

      // Fallback to other possible fields
      const possibleTemplateIds = [
        employee.salary_template_id,
        employee.template_id,
        employee.st_id,
        employee.salaryTemplateId,
        employee.templateId,
      ];

      const validTemplateId = possibleTemplateIds.find(
        (id) => id !== null && id !== undefined && id !== ""
      );
      if (validTemplateId) {
        return validTemplateId.toString();
      }
    }

    return currentTemplateId ? currentTemplateId.toString() : undefined;
  };
  return (
    <>
      <div className="bg-white rounded-[10px] drop-shadow-md w-full p-2">
        <div className="relative w-full min-h-[calc(100vh-100px)] overflow-auto customScroll">
          <table className="min-w-full table-fixed text-center">
          <colgroup>
    <col style={{ width: '10%' }} />
    <col style={{ width: '10%' }} />
    <col style={{ width: '10%' }} />
    <col style={{ width: '10%' }} />
    <col style={{ width: '10%' }} />
    <col style={{ width: '10%' }} />
    <col style={{ width: '10%' }} />
    <col style={{ width: '10%' }} />
    <col style={{ width: '10%' }} />
    <col style={{ width: '10%' }} />
  </colgroup>
            <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
              <tr>
                {(headList || []).map((head, i) => (
                  <th key={i} className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                    <Typography
                      // variant="small"
                      // color="blue-gray"
                      className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(allEmpSalary || []).map((data, index) => {
                const isLast = index === (allEmpSalary || []).length - 1;
                const classes = isLast
                  ? "px-[clamp(4px,0.8vw,12px)] py-4" : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]"
                return (
                  <tr key={index}>
                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {data.id || "N/A"}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {data.name || "N/A"}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {data.org_branches?.branch_name || "N/A"}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {data?.wf_depts?.name || "N/A"}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <div className="flex flex-col items-center gap-2 justify-center h-full text-[clamp(10px,0.8vw,13px)] font-normal text-[#474747] font-Urbanist">
                        <Select
                        className="text-[clamp(10px,0.8vw,13px)] font-normal text-[#474747] font-Urbanist"
                          key={`template-${data.id}-${
                            availableTemplates.length
                          }-${
                            data.wf_salary_template?.id ||
                            data.salary_template_id ||
                            data.template_id ||
                            data.st_id
                          }`}
                          label="Salary Template"
                          color="blue"
                          value={getTemplateValue(
                            data.id,
                            data.wf_salary_template?.id
                          )}
                          onChange={(val) => handleTemplateChange(data.id, val)}
                        >
                          {availableTemplates.map((ele) => (
                            <Option key={ele.id} value={ele.id.toString()}>
                              {ele.name} - {ele.salary_amount}
                            </Option>
                          ))}
                        </Select>
                        {hasTemplateChanged(
                          data.id,
                          data.salary_template_id
                        ) && (
                          <Button
                            size="sm"
                            color="blue"
                            className="capitalize font-normal text-[clamp(10px,0.9vw,14px)] px-2 py-1 w-fit self-start w-20"
                            onClick={() => handleUpdateTemplate(data.id)}
                          >
                            {loading ? (
                              <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                              "Update"
                            )}
                          </Button>
                        )}
                      </div>
                    </td>

                    <td className={classes}>
                      <div
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist cursor-pointer"
                        onClick={() => openSalaryHistory(data)}
                      >
                        {data.salary_with_increaments || "N/A"}
                      </div>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {data.incent}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {Number(data.deduction).toFixed(2)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {Number(data.salary_with_increaments_incent_deduct).toFixed(2) || "N/A"}
                      </Typography>
                    </td>

                    {/* Manage Employee Salary -> Column (Salary Template (Basic Pay)): Should be prefilled & implement update functionality */}
                    <td className={classes}>
                      <div
                        onMouseEnter={() => toggleMenuEmpSalary(index, true)}
                        onMouseLeave={() => toggleMenuEmpSalary(index, false)}
                        className="relative"
                      >
                        <Button
                          className="flex items-center gap-2 capitalize font-normal text-[clamp(10px,0.8vw,13px)] border border-[#3DA5F4] text-[#3DA5F4] px-[10px] py-[5px] bg-[#EFF8FF] rounded-[7px]"
                          // variant="outlined"
                        >
                          Action
                          <FaChevronDown
                            strokeWidth={2.5}
                            className={`transition-transform transform ${
                              openMenuEmpSalary[index] ? "rotate-180" : ""
                            }`}
                          />
                        </Button>
                        {openMenuEmpSalary[index] && (
                          <div className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white left-[-125px] w-[200px] shadow-md ${index<=5 ? "top-full" : "bottom-full"}`}>
                            <motion.div
                              initial={{ opacity: 0, y: 50 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 50 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ul className="flex w-full flex-col gap-1">
                                {(empSalaryActionMenu || []).map((menuItem) => (
                                  <MenuItem
                                    className="flex items-center justify-between"
                                    key={menuItem.id}
                                    onClick={() =>
                                      handleActionManageEmpSalary(
                                        menuItem.id,
                                        data
                                      )
                                    }
                                  >
                                    <Typography variant="small">
                                      {menuItem.title}
                                    </Typography>
                                    <span>{menuItem.icon}</span>
                                  </MenuItem>
                                ))}
                              </ul>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ManageEmpSalaryList;