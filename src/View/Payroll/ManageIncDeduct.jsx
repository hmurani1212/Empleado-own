import {
  Card,
  CardBody,
  Input,
  Radio,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import React, { useEffect } from "react";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import useManageEmpSalary from "../../ViewModel/PayrollViewModel/ManageEmpSalaryServices";
import SubmitButton from "../../Components/SubmitButton/SubmitButton";
import { FaPencilAlt, FaTimes } from "react-icons/fa";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import useIncentDeductServicesForm from "../../ViewModel/PayrollViewModel/ManageIncentDeductServicesForm";

const ManageIncDeduct = () => {
  const headInc = ["Title", "Amount", "Recurring", "Action"];

  const {
    incentData,
    deductData,
    handleDialogAllowance,
    handleDeleteAllowance,
    openDialogAllowance,
    allIncentDeductListBoth,
    gettingAllIncentDeductListBoth,
    idSet,
    gettingManageIncDeduct,
    loading,
  } = useManageEmpSalary();

  // Create a wrapper function to refresh data with current employee ID
  const refreshData = () => {
    console.log("RefreshData called with idSet:", idSet);
    // Use gettingManageIncDeduct instead of gettingCreatedIncentDeductList to avoid unnecessary API calls
    gettingManageIncDeduct(idSet);
  };

  // Combine incentData and deductData for display
  const combinedIncentDeductList = [
    ...(incentData || []).map((item) => ({ ...item, d_type: "INCENTIVE" })),
    ...(deductData || []).map((item) => ({ ...item, d_type: "DEDUCTION" })),
  ];

  const {
    isChecked,
    handleCheckboxChange,
    handleChangeSelect,
    handleAddIncDeduct,
    addIncDecValues,
    handleChangeType,
    isEditing,
    handleEditItem,
    handleCancelEdit,
    loading: formLoading,
  } = useIncentDeductServicesForm(
    idSet,
    refreshData,
    combinedIncentDeductList,
    allIncentDeductListBoth
  );

  // Load data on component mount and when idSet changes
  useEffect(() => {
    if (idSet) {
      gettingManageIncDeduct(idSet);
    }
    gettingAllIncentDeductListBoth();
    // Load active templates for form dropdown (left side)
    // Note: gettingCreatedIncentDeductList is now handled by gettingManageIncDeduct
    // which is called when navigating to this page, so we don't need to call it again here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSet]);

  return (
    <>
      {/* Tooba */}
      {/* Manage Employee Salary Action -> Incentive/Deduction -> Manage Incentive/Deduction : Edit Incentvie & Deduction, Adding Incentive, Deduction */}

      <div className="flex lg:flex-row flex-col gap-3 p-2 w-full">
        <form onSubmit={(e) => handleAddIncDeduct(e)}>
          <div className="lg:w-[450px] w-full">
            <Card>
              <CardBody>
                <div className="flex flex-col space-y-3 text-[12px]">
                  <div>
                    <label className="text-[#3da5f4] text-[14px] font-semibold">
                      Type
                    </label>
                    <div className="flex gap-4">
                      <div>
                        <Radio
                          color="blue"
                          name="type"
                          label="Incentive"
                          value="0"
                          checked={addIncDecValues.type === "0"}
                          onChange={handleChangeType}
                        />
                      </div>
                      <div>
                        <Radio
                          color="blue"
                          name="type"
                          label="Deductions"
                          value="1"
                          checked={addIncDecValues.type === "1"}
                          onChange={handleChangeType}
                        />
                      </div>
                    </div>
                  </div>

                  {addIncDecValues.type === "0" && (
                    <div>
                      <div>
                        <label className="text-[#3da5f4] text-[14px] font-semibold">
                          Title
                        </label>
                        <div>
                          <CustomSelect
                            placeHolderTitle="New Incentive"
                            options={allIncentDeductListBoth
                              ?.filter(
                                (item) =>
                                  item.d_type === "INCENTIVE" &&
                                  item.status === "ACTIVE"
                              )
                              ?.map((incent) => ({
                                value: incent.id,
                                label: incent.title,
                              }))}
                            value={addIncDecValues.title}
                            onChangeHandler={(selected) =>
                              handleChangeSelect(selected, "title")
                            }
                            customStyles={false}
                          />
                        </div>

                        {/* <div className='text-[#3da5f4] font-semibold'>
                      <Checkbox color='blue' label='Subjected to attendance'  checked={isChecked} onChange={handleCheckboxChange} />
                    </div> */}
                      </div>

                      {/* <div>
                    {isChecked && (
                      <div>
                        <div>
                          <Radio label='Pay as per Payroll Formula' name='a_per_day_rate_type' color='blue' value='payroll_formula' checked={addIncDecValues.a_per_day_rate_type === 'payroll_formula'} 
                          onChange={handleChangeType}
                          />
                        </div>
                      
                        <div>
                          <Radio label='Pay a fixed amount/day' name='a_per_day_rate_type' color='blue' value='per_day' checked={addIncDecValues.a_per_day_rate_type === 'per_day'}
                          onChange={handleChangeType}
                          />
                        </div>
                    
                        <div>
                          <Radio label='Pay for present days' name='a_per_day_rate_type' color='blue' value='for_earned_days' checked={addIncDecValues.a_per_day_rate_type === 'for_earned_days'}
                          onChange={handleChangeType}
                          />
                        </div>
                    
                        <div>
                          <Radio label=' Pay for present and holidays' name='a_per_day_rate_type' color='blue' value='for_earned_and_holidays' checked={addIncDecValues.a_per_day_rate_type === 'for_earned_and_holidays'}
                          onChange={handleChangeType}
                          />
                        </div>
                      </div>
                    )}
                  </div> */}
                    </div>
                  )}

                  {addIncDecValues.type === "1" && (
                    <div>
                      <CustomSelect
                        placeHolderTitle="New Deduction"
                        options={allIncentDeductListBoth
                          ?.filter(
                            (item) =>
                              item.d_type === "DEDUCTION" &&
                              item.status === "ACTIVE"
                          )
                          ?.map((deduct) => ({
                            value: deduct.id,
                            label: deduct.title,
                          }))}
                        value={addIncDecValues.title}
                        onChangeHandler={(selected) =>
                          handleChangeSelect(selected, "title")
                        }
                        customStyles={false}
                      />
                    </div>
                  )}

                  <div>
                    <Input
                      type="text"
                      label="Total Amount"
                      color="blue"
                      name="total_amount"
                      value={addIncDecValues.total_amount}
                      onChange={handleChangeType}
                      onBlur={(e) => {
                        // Validate and format on blur
                        const value = e.target.value;
                        if (value && value.trim() !== "") {
                          const numValue = Number(
                            value.replace(/,/g, "").trim()
                          );
                          if (!isNaN(numValue) && numValue >= 0) {
                            // Update with cleaned value
                            handleChangeType({
                              target: {
                                name: "total_amount",
                                value: String(numValue),
                              },
                            });
                          }
                        }
                      }}
                    />
                  </div>

                  {addIncDecValues.type === "0" && (
                    <div>
                      <label className="text-[#3da5f4] text-[14px] font-semibold">
                        Is Taxable?
                      </label>
                      <div className="flex gap-3">
                        <Radio
                          label="Yes"
                          color="blue"
                          name="is_taxable"
                          value="1"
                          checked={addIncDecValues.is_taxable === "1"}
                          onChange={handleChangeType}
                        />
                        <Radio
                          label="No"
                          color="blue"
                          name="is_taxable"
                          value="0"
                          checked={addIncDecValues.is_taxable === "0"}
                          onChange={handleChangeType}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[#3da5f4] text-[14px] font-semibold">
                      Recursion Limit
                    </label>
                    <div className="flex gap-3">
                      <Radio
                        label="Recurring Equal"
                        color="blue"
                        name="recursion"
                        value="1"
                        checked={addIncDecValues.recursion === "1"}
                        onChange={handleChangeType}
                      />
                      <Radio
                        label="One Time"
                        color="blue"
                        name="recursion"
                        value="0"
                        checked={addIncDecValues.recursion === "0"}
                        onChange={handleChangeType}
                      />
                    </div>
                  </div>

                  {addIncDecValues.recursion === "1" && (
                    <div>
                      <div>
                        <label className="text-[#3da5f4] text-[14px] font-semibold">
                          Recursion Limit
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <Radio
                          label="Unlimited"
                          color="blue"
                          name="inc_recursion_limit"
                          value="unlimited"
                          checked={
                            addIncDecValues.inc_recursion_limit === "unlimited"
                          }
                          onChange={handleChangeType}
                        />

                        <Radio
                          label="Limited"
                          color="blue"
                          name="inc_recursion_limit"
                          value="limited"
                          checked={
                            addIncDecValues.inc_recursion_limit === "limited"
                          }
                          onChange={handleChangeType}
                        />
                      </div>

                      {addIncDecValues.inc_recursion_limit === "unlimited" && (
                        <div className="flex flex-col space-y-4">
                          <div>
                            <Input
                              label="Month (Start date/month)"
                              type="month"
                              color="blue"
                              name="unlimited_start_date"
                              value={addIncDecValues.unlimited_start_date}
                              onChange={handleChangeType}
                            />
                          </div>

                          <div>
                            <Textarea
                              label="Description (if any)"
                              color="blue"
                              name="description"
                              value={addIncDecValues.description}
                              onChange={handleChangeType}
                            />
                          </div>
                        </div>
                      )}

                      {addIncDecValues.inc_recursion_limit === "limited" && (
                        <div className="flex flex-col space-y-4">
                          <div>
                            <Input
                              label="Month (Start date/month)"
                              type="month"
                              color="blue"
                              name="onetime_month"
                              value={addIncDecValues.onetime_month}
                              onChange={handleChangeType}
                            />
                          </div>
                          <div>
                            <Input
                              label="End Month (when to stop,given month is inclusive)"
                              type="month"
                              color="blue"
                              name="end_month"
                              value={addIncDecValues.end_month}
                              onChange={handleChangeType}
                            />
                          </div>

                          <div>
                            <Textarea
                              label="Description"
                              color="blue"
                              name="description"
                              value={addIncDecValues.description}
                              onChange={handleChangeType}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {addIncDecValues.recursion === "0" && (
                    <div className="flex flex-col space-y-4">
                      <div>
                        <Input
                          label="Month (Start date/month)"
                          color="blue"
                          type="month"
                          name="onetime_month"
                          value={addIncDecValues.onetime_month}
                          onChange={handleChangeType}
                        />
                      </div>

                      <div>
                        <Textarea
                          label="Description"
                          color="blue"
                          name="description"
                          value={addIncDecValues.description}
                          onChange={handleChangeType}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <SubmitButton
                      title={isEditing ? "Update" : "Confirm"}
                      loading={formLoading}
                    />
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        disabled={formLoading}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </form>

        <div className="flex flex-col space-y-4 lg:w-[65%] w-full bg-white rounded-[10px] drop-shadow-md p-4">
          <div className="flex justify-between">
            <div>
              <span className="text-[#3da5f4] font-semibold">
                Incentive/Deduction Lists
              </span>
            </div>
            {/* <div>
            <CustomButton title='Export'/>
          </div> */}
          </div>

          <div>
            <div>
              <span className="text-[#3da5f4] font-semibold">Incentives</span>
            </div>

            <div className="">
              <table className="w-full text-center">
                <thead className="">
                  <tr>
                    {headInc?.map((head, i) => (
                      <th key={i} className="bg-[#F8F9FA] p-4">
                        <Typography
                          variant="small"
                          // color='blue-gray'
                          className="font-medium leading-none font-Urbanist text-[14px] text-[#474747] capitalize"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {combinedIncentDeductList?.filter(
                    (item) => item.d_type === "INCENTIVE"
                  ).length > 0 ? (
                    combinedIncentDeductList
                      ?.filter((item) => item.d_type === "INCENTIVE")
                      ?.map((ele, index) => {
                        const filteredIncentives =
                          combinedIncentDeductList?.filter(
                            (item) => item.d_type === "INCENTIVE"
                          ) || [];
                        const isLast = index === filteredIncentives.length - 1;
                        const classes = isLast
                          ? "p-4"
                          : "p-4 border-b border-[#F2F2F9]";

                        return (
                          <tr key={index}>
                            <td className={classes}>
                              <Typography
                                variant="small"
                                // color='blue-gray'
                                className="font-normal font-Urbanist text-[14px] text-[#474747]"
                              >
                                {ele.title}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                variant="small"
                                // color='blue-gray'
                                className="font-normal font-Urbanist text-[14px] text-[#474747]"
                              >
                                {ele.amount || "N/A"}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                variant="small"
                                // color='blue-gray'
                                className="font-normal font-Urbanist text-[14px] text-[#474747]"
                              >
                                {ele.re_occuring || "N/A"}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                variant="small"
                                // color='blue-gray'
                                className="font-normal font-Urbanist text-[14px] text-[#474747]"
                              >
                                <div className="flex gap-4 justify-center">
                                  <div>
                                    <FaPencilAlt
                                      className="text-green-500 cursor-pointer"
                                      onClick={() => handleEditItem(ele)}
                                    />
                                  </div>

                                  <div>
                                    <FaTimes
                                      className="text-red-500 cursor-pointer"
                                      onClick={() =>
                                        handleDialogAllowance({
                                          id: ele.id,
                                          type: "incentive",
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </Typography>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td
                        colSpan={headInc.length}
                        className="p-2 text-center font-normal font-Urbanist text-[12px] text-[#474747]"
                      >
                        No record found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div>
              <span className="text-[#3da5f4] font-semibold">Deductions</span>
            </div>

            <div className="">
              <table className="w-full text-center">
                <thead className="">
                  <tr>
                    {headInc?.map((head, i) => (
                      <th key={i} className="bg-[#F8F9FA] p-4">
                        <Typography
                          variant="small"
                          // color='blue-gray'
                          className="font-medium leading-none font-Urbanist text-[14px] text-[#474747] capitalize"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {combinedIncentDeductList?.filter(
                    (item) => item.d_type === "DEDUCTION"
                  ).length > 0 ? (
                    combinedIncentDeductList
                      ?.filter((item) => item.d_type === "DEDUCTION")
                      ?.map((ele, index) => {
                        const filteredDeductions =
                          combinedIncentDeductList?.filter(
                            (item) => item.d_type === "DEDUCTION"
                          ) || [];
                        const isLast = index === filteredDeductions.length - 1;
                        const classes = isLast
                          ? "p-4"
                          : "p-4 border-b border-[#F2F2F9]";

                        return (
                          <tr key={index}>
                            <td className={classes}>
                              <Typography
                                variant="small"
                                // color='blue-gray'
                                className="font-normal font-Urbanist text-[14px] text-[#474747]"
                              >
                                {ele.title}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                variant="small"
                                // color='blue-gray'
                                className="font-normal font-Urbanist text-[14px] text-[#474747]"
                              >
                                {ele.amount || "N/A"}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                variant="small"
                                // color='blue-gray'
                                className="font-normal font-Urbanist text-[14px] text-[#474747]"
                              >
                                {ele.re_occuring || "N/A"}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                variant="small"
                                // color='blue-gray'
                                className="font-normal font-Urbanist text-[14px] text-[#474747]"
                              >
                                <div className="flex gap-4 justify-center">
                                  <div>
                                    <FaPencilAlt
                                      className="text-green-500 cursor-pointer"
                                      onClick={() => handleEditItem(ele)}
                                    />
                                  </div>

                                  <div>
                                    <FaTimes
                                      className="text-red-500 cursor-pointer"
                                      onClick={() =>
                                        handleDialogAllowance({
                                          id: ele.id,
                                          type: "deduction",
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </Typography>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td
                        colSpan={headInc.length}
                        className="p-2 text-center font-normal font-Urbanist text-[12px] text-[#474747]"
                      >
                        No record found
                      </td>
                    </tr>
                  )}
                </tbody>
                <ConfirmationDialog
                  openDialog={openDialogAllowance}
                  handleOpen={handleDialogAllowance}
                  title="Confirm Delete"
                  message="Are you sure to delete this Allowance?"
                  loading={loading}
                  handleConfirm={() => handleDeleteAllowance()}
                  showBtns={false}
                />
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageIncDeduct;