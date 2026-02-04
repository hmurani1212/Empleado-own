import React, { useState, useEffect } from "react";
import { Button, Input, Radio, Typography } from "@material-tailwind/react";
import { FaInfoCircle, FaPlus, FaTimes } from "react-icons/fa";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import useStore from "../../Store/store";
import { showToast } from "../../Components/Toaster/Toaster";
import payrollApi from "../../Model/Data/Payroll/Payroll";

const SettingPayroll = () => {
  const [activeSection, setActiveSection] = useState("tax_exemptions");
  const [formData, setFormData] = useState({
    branch: null,
    employeeSalaryPercentage: "",
    limitAbovePercentage: "",
    paymentFrequency: "monthly",
    // EOBI fields
    eobiSalary: "",
    empContribution: "",
    employerContribution: "",
    // Provident Fund fields
    fundEligibility: "all",
    minDuration: "",
    empContributionPF: "",
    employerContributionPF: "",
  });

  // Income Tax Slabs state (now managed by store)

  const [newSlab, setNewSlab] = useState({
    branch: null,
    amountFrom: "",
    amountUpto: "",
    taxRatePercent: "",
    taxRateAmount: "",
  });

  // Modal state for tax slab form
  const [isTaxSlabModalOpen, setIsTaxSlabModalOpen] = useState(false);
  const [isTaxExemptionModalOpen, setIsTaxExemptionModalOpen] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isTaxSlabModalOpen || isTaxExemptionModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isTaxSlabModalOpen, isTaxExemptionModalOpen]);
  const [isSaving, setIsSaving] = useState(false);

  // Tax exemption form state
  const [newExemption, setNewExemption] = useState({
    title: "",
    percentage: "",
  });

  // Tax Exemptions state (now managed by store)

  // Get branches from store
  const copyBranchesData = useStore((state) => state.copyBranchesData);
  const getAllBranchesPayroll = useStore(
    (state) => state.getAllBranchesPayroll
  );
  const savingSocialSecuritySettings = useStore(
    (state) => state.savingSocialSecuritySettings
  );
  const savingMedicalAllowanceSettings = useStore(
    (state) => state.savingMedicalAllowanceSettings
  );
  const savingEOBISettings = useStore((state) => state.savingEOBISettings);
  const savingProvidentFundSettings = useStore(
    (state) => state.savingProvidentFundSettings
  );

  // Get tax data from store
  const taxExemptions = useStore((state) => state.taxExemptions || []);
  const taxSlabs = useStore((state) => state.incomeTaxSlabs || []);
  const getTaxExemptions = useStore((state) => state.getTaxExemptions);
  const getIncomeTaxSlabs = useStore((state) => state.getIncomeTaxSlabs);
  const deleteTaxExemption = useStore((state) => state.deleteTaxExemption);
  const deleteIncomeTaxSlab = useStore((state) => state.deleteIncomeTaxSlab);

  // Fetch branches and data on component mount
  useEffect(() => {
    if (
      !copyBranchesData ||
      !Array.isArray(copyBranchesData) ||
      copyBranchesData.length === 0
    ) {
      getAllBranchesPayroll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when navigating to specific sections
  useEffect(() => {
    if (activeSection === "income_tax_slabs") {
      getIncomeTaxSlabs();
    } else if (activeSection === "tax_exemptions") {
      getTaxExemptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const navigationItems = [
    { id: "social_security", label: "Social Security", active: false },
    { id: "medical_allowance", label: "Medical Allowance", active: false },
    { id: "eobi", label: "EOBI", active: false },
    { id: "provident_fund", label: "Provident Fund", active: false },
    { id: "income_tax_slabs", label: "Income Tax Slabs", active: false },
    { id: "tax_exemptions", label: "Tax Exemptions", active: true },
  ];

  // Prepare branch options - Add "All Branches" option with value 0
  const branchOptions = [
    { value: 0, label: "All Branches" },
    ...(copyBranchesData && Array.isArray(copyBranchesData)
      ? copyBranchesData.map((branch) => ({
          value: branch.id,
          label: branch.branch_name,
        }))
      : []),
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save and Reset functions for form sections
  const handleSave = async () => {
    // Validation - Allow 0 for "All Branches"
    if (!formData.branch) {
      showToast("Please select a branch", "error");
      return;
    }

    // Check if branch value is valid (allow 0 for "All Branches", but not null/undefined/empty)
    const branchValue = formData.branch.value;
    if (
      branchValue !== 0 &&
      branchValue !== "0" &&
      (branchValue === null || branchValue === undefined || branchValue === "")
    ) {
      showToast("Please select a branch", "error");
      return;
    }

    if (activeSection === "social_security") {
      if (!formData.employeeSalaryPercentage) {
        showToast("Please enter employee salary percentage", "error");
        return;
      }

      // Validate percentage range
      const percentage = parseFloat(formData.employeeSalaryPercentage);
      if (isNaN(percentage) || percentage < 1 || percentage > 100) {
        showToast(
          "Invalid percentage value provided. Percentage ranges from 1-100",
          "error"
        );
        return;
      }

      setIsSaving(true);

      try {
        const result = await savingSocialSecuritySettings({
          branch_id: formData.branch.value === 0 ? 0 : formData.branch.value,
          social_security_percentage: formData.employeeSalaryPercentage,
          med_allowance_percentage: 0,
          max_salary_limit: formData.limitAbovePercentage || 0,
          ss_payment_duration:
            formData.paymentFrequency === "monthly" ? "month" : "year",
          medallowance_duration: "year",
        });

        if (result.success) {
          showToast("Social security settings saved successfully", "success");
        } else {
          showToast(result.error || "Failed to save settings", "error");
        }
      } catch (error) {
        console.error("Error saving social security settings:", error);
        console.error("Error response:", error.response);
        console.error("Error response data:", error.response?.data);
        showToast("An error occurred while saving settings", "error");
      } finally {
        setIsSaving(false);
      }
    } else if (activeSection === "medical_allowance") {
      if (!formData.employeeSalaryPercentage) {
        showToast("Please enter medical allowance percentage", "error");
        return;
      }

      // Validate percentage range
      const percentage = parseFloat(formData.employeeSalaryPercentage);
      if (isNaN(percentage) || percentage < 1 || percentage > 100) {
        showToast(
          "Invalid percentage value provided. Percentage ranges from 1-100",
          "error"
        );
        return;
      }

      setIsSaving(true);

      try {
        const result = await savingMedicalAllowanceSettings({
          branch_id: formData.branch.value === 0 ? 0 : formData.branch.value,
          social_security_percentage: 0,
          med_allowance_percentage: formData.employeeSalaryPercentage,
          max_salary_limit: formData.limitAbovePercentage || 0,
          ss_payment_duration: "year",
          medallowance_duration:
            formData.paymentFrequency === "monthly" ? "month" : "year",
        });

        console.log("Medical allowance result:", result);
        if (result.success) {
          showToast("Medical allowance settings saved successfully", "success");
        } else {
          showToast(result.error || "Failed to save settings", "error");
        }
      } catch (error) {
        console.error("Error saving settings:", error);
        showToast("An error occurred while saving settings", "error");
      } finally {
        setIsSaving(false);
      }
    } else if (activeSection === "eobi") {
      if (!formData.empContribution || formData.empContribution.trim() === "") {
        showToast("Please enter employee contribution", "error");
        return;
      }

      // Validate percentage range
      const percentage = parseFloat(formData.empContribution);
      if (isNaN(percentage) || percentage < 1 || percentage > 100) {
        showToast(
          "Invalid percentage value provided. Percentage ranges from 1-100",
          "error"
        );
        return;
      }

      setIsSaving(true);

      try {
        const result = await savingEOBISettings({
          branch_id: formData.branch.value === 0 ? 0 : formData.branch.value,
          eobi_percentage: formData.empContribution,
          max_salary_limit: formData.eobiSalary || 0,
          eobi_payment_duration:
            formData.paymentFrequency === "monthly" ? "month" : "year",
          employer_contribution: formData.employerContribution || 0,
        });

        if (result.success) {
          showToast("EOBI settings saved successfully", "success");
        } else {
          showToast(result.error || "Failed to save settings", "error");
        }
      } catch (error) {
        console.error("Error saving settings:", error);
        showToast("An error occurred while saving settings", "error");
      } finally {
        setIsSaving(false);
      }
    } else if (activeSection === "provident_fund") {
      if (
        !formData.empContributionPF ||
        formData.empContributionPF.trim() === ""
      ) {
        showToast("Please enter employee contribution percentage", "error");
        return;
      }

      // Validate percentage range
      const percentage = parseFloat(formData.empContributionPF);
      if (isNaN(percentage) || percentage < 1 || percentage > 100) {
        showToast(
          "Invalid percentage value provided. Percentage ranges from 1-100",
          "error"
        );
        return;
      }

      setIsSaving(true);

      try {
        const result = await savingProvidentFundSettings({
          branch_id: formData.branch.value === 0 ? 0 : formData.branch.value,
          provident_fund_percentage: formData.empContributionPF,
          max_salary_limit: formData.limitAbovePercentage || 0,
          provident_fund_payment_duration:
            formData.paymentFrequency === "monthly" ? "month" : "year",
          employer_contribution: formData.employerContributionPF || 0,
          p_fund_eligibility: formData.fundEligibility || "all",
          min_duration: formData.minDuration || 1,
        });

        if (result.success) {
          showToast("Provident Fund settings saved successfully", "success");
        } else {
          showToast(result.error || "Failed to save settings", "error");
        }
      } catch (error) {
        console.error("Error saving settings:", error);
        showToast("An error occurred while saving settings", "error");
      } finally {
        setIsSaving(false);
      }
    } else {
      showToast("This section is not yet implemented", "info");
    }
  };

  const handleReset = () => {
    setFormData({
      branch: null,
      employeeSalaryPercentage: "",
      limitAbovePercentage: "",
      paymentFrequency: "monthly",
      // EOBI fields
      eobiSalary: "",
      empContribution: "",
      employerContribution: "",
      // Provident Fund fields
      fundEligibility: "all",
      minDuration: "",
      empContributionPF: "",
      employerContributionPF: "",
    });
  };

  // Tax Slabs functions
  const handleNewSlabChange = (field, value) => {
    setNewSlab((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSlab = () => {
    // Reset form and open modal
    setNewSlab({
      branch: null,
      amountFrom: "",
      amountUpto: "",
      taxRatePercent: "",
      taxRateAmount: "",
    });
    setIsTaxSlabModalOpen(true);
  };

  const handleDeleteSlab = async (id) => {
    try {
      const result = await deleteIncomeTaxSlab(id);

      // Check if deletion was successful - store returns { success: true } on success
      if (result && result.success) {
        showToast("Tax slab deleted successfully", "success");
        // Refresh the data to update UI immediately
        await getIncomeTaxSlabs(true); // Force reload
      } else {
        showToast("Failed to delete tax slab", "error");
      }
    } catch (error) {
      console.error("Error deleting tax slab:", error);
      showToast("Failed to delete tax slab", "error");
    }
  };

  // Tax Exemptions functions

  const handleDeleteTaxExemption = async (id) => {
    try {
      const result = await deleteTaxExemption(id);

      // Check if deletion was successful - store returns { success: true } on success
      if (result && result.success) {
        showToast("Tax exemption deleted successfully", "success");
        // Refresh the data to update UI immediately
        await getTaxExemptions(true); // Force reload
      } else {
        showToast("Failed to delete tax exemption", "error");
      }
    } catch (error) {
      console.error("Error deleting tax exemption:", error);
      showToast("Failed to delete tax exemption", "error");
    }
  };

  const handleSaveTaxSlab = async (e) => {
    e.preventDefault(); // Prevent form submission and page refresh

    // Validate branch - Allow 0 for "All Branches"
    if (!newSlab.branch) {
      showToast("Please select a branch", "error");
      return;
    }

    const branchValue = newSlab.branch.value;
    if (
      branchValue !== 0 &&
      branchValue !== "0" &&
      (branchValue === null || branchValue === undefined || branchValue === "")
    ) {
      showToast("Please select a branch", "error");
      return;
    }

    if (
      !newSlab.amountFrom ||
      !newSlab.amountUpto ||
      !newSlab.taxRatePercent ||
      !newSlab.taxRateAmount
    ) {
      showToast("Please fill in all fields", "error");
      return;
    }

    // Validate percentage range
    const percentage = parseFloat(newSlab.taxRatePercent);
    if (isNaN(percentage) || percentage < 1 || percentage > 100) {
      showToast(
        "Invalid percentage value provided. Percentage ranges from 1-100",
        "error"
      );
      return;
    }

    setIsSaving(true);
    try {
      // Prepare API data
      const apiData = {
        branch_id: newSlab.branch.value === 0 ? 0 : newSlab.branch.value,
        amount_from: parseFloat(newSlab.amountFrom),
        amount_upto: parseFloat(newSlab.amountUpto),
        tax_rate_percent: parseFloat(newSlab.taxRatePercent),
        tax_rate_amount: parseFloat(newSlab.taxRateAmount),
      };

      // Call API
      const response = await payrollApi.saveTaxSlabSettings(apiData);

      // Check if response is successful (handle different response structures)
      if (
        response &&
        (response.status === "SUCCESSFUL" ||
          response.STATUS === "SUCCESSFUL" ||
          response.success ||
          !response.error)
      ) {
        showToast("Tax slab added successfully", "success");
        handleCloseTaxSlabModal();
        // Refresh the data using store method with force reload
        console.log("Refreshing tax slabs data after successful save...");
        await getIncomeTaxSlabs(true); // Force reload
      } else {
        showToast(
          response.message || response.error || "Failed to add tax slab",
          "error"
        );
      }
    } catch (error) {
      console.error("Error adding tax slab:", error);
      showToast("Failed to add tax slab", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseTaxSlabModal = () => {
    setIsTaxSlabModalOpen(false);
    setNewSlab({
      branch: null,
      amountFrom: "",
      amountUpto: "",
      taxRatePercent: "",
      taxRateAmount: "",
    });
  };

  const handleNewExemptionChange = (field, value) => {
    setNewExemption((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddExemption = () => {
    // Reset form and open modal
    setNewExemption({
      title: "",
      percentage: "",
    });
    setIsTaxExemptionModalOpen(true);
  };

  const handleSaveTaxExemption = async (e) => {
    e.preventDefault(); // Prevent form submission and page refresh
    if (!newExemption.title || !newExemption.percentage) {
      showToast("Please fill in all fields", "error");
      return;
    }

    // Validate percentage range
    const percentage = parseFloat(newExemption.percentage);
    if (isNaN(percentage) || percentage < 1 || percentage > 100) {
      showToast(
        "Invalid percentage value provided. Percentage ranges from 1-100",
        "error"
      );
      return;
    }

    setIsSaving(true);
    try {
      // Prepare API data - using first branch as default since no branch selection in exemption form
      const apiData = {
        branch_id:
          copyBranchesData && copyBranchesData.length > 0
            ? copyBranchesData[0].id
            : 1,
        title: newExemption.title,
        percent: parseFloat(newExemption.percentage),
      };

      // Call API
      const response = await payrollApi.saveTaxExemptionSettings(apiData);

      // Check if response is successful (handle different response structures)
      if (
        response &&
        (response.status === "SUCCESSFUL" ||
          response.STATUS === "SUCCESSFUL" ||
          response.success ||
          !response.error)
      ) {
        showToast("Tax exemption added successfully", "success");
        handleCloseTaxExemptionModal();
        // Refresh the data using store method with force reload
        console.log("Refreshing tax exemptions data after successful save...");
        await getTaxExemptions(true); // Force reload
      } else {
        showToast(
          response.message || response.error || "Failed to add tax exemption",
          "error"
        );
      }
    } catch (error) {
      console.error("Error adding tax exemption:", error);
      showToast("Failed to add tax exemption", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseTaxExemptionModal = () => {
    setIsTaxExemptionModalOpen(false);
    setNewExemption({
      title: "",
      percentage: "",
    });
  };

  const renderFormContent = () => {
    switch (activeSection) {
      case "income_tax_slabs":
        return (
          <div className="space-y-4">
            {/* Add Slab Button */}
            <div className="flex justify-end">
              <Button
                // color='blue'
                size="sm"
                className="flex items-center gap-2 bg-bgBlue text-white capitalize font-medium text-[12px] font-Urbanist py-2 px-4 rounded-[7px] hover:bg-blue-600 cursor-pointer"
                onClick={handleAddSlab}
              >
                <FaPlus className="w-3 h-3" />
                Add Slab
              </Button>
            </div>

            {/* Tax Slabs Table */}
            <table className="w-full">
              <thead className="">
                <tr>
                  <th className="bg-[#F8F9FA] p-4 text-center">
                    <Typography
                      // color="blue-gray"
                      className="font-medium leading-none capitalize text-[14px] text-[#474747] font-Urbanist"
                      // style={{ fontSize: '15px' }}
                    >
                      Rate From
                    </Typography>
                  </th>
                  <th className="bg-[#F8F9FA] p-4 text-center">
                    <Typography
                      // color="blue-gray"
                      className="font-medium leading-none capitalize text-[14px] text-[#474747] font-Urbanist"
                      // style={{ fontSize: '15px' }}
                    >
                      Rate Upto
                    </Typography>
                  </th>
                  <th className="bg-[#F8F9FA] p-4 text-center">
                    <Typography
                      // color="blue-gray"
                      className="font-medium leading-none capitalize text-[14px] text-[#474747] font-Urbanist"
                      // style={{ fontSize: '15px' }}
                    >
                      Tax Rate
                    </Typography>
                  </th>
                  <th className="bg-[#F8F9FA] p-4 text-center">
                    <Typography
                      // color="blue-gray"
                      className="font-medium leading-none capitalize text-[14px] text-[#474747] font-Urbanist"
                      // style={{ fontSize: '15px' }}
                    >
                      Action
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {taxSlabs.length > 0 ? (
                  taxSlabs.map((slab, i) => {
                    const isLast = i === taxSlabs.length - 1;
                    const classes = isLast
                      ? "p-4 text-center"
                      : "p-4 border-b border-[#F2F2F9] text-center";
                    return (
                      <tr key={slab.id}>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[14px] text-[#474747] font-Urbanist font-normal"
                            // style={{ fontSize: '13px' }}
                            // style={{ fontSize: '13px' }}
                          >
                            {slab.amount_from}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[14px] text-[#474747] font-Urbanist font-normal"
                            // style={{ fontSize: '13px' }}
                            // style={{ fontSize: '13px' }}
                          >
                            {slab.amount_upto}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[14px] text-[#474747] font-Urbanist font-normal"
                            // style={{ fontSize: '13px' }}
                          >
                            PKR {slab.amount_deduction} &{" "}
                            {slab.percent_deduction} %
                          </Typography>
                        </td>
                        <td className={classes}>
                          <button
                            onClick={() => handleDeleteSlab(slab.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center">
                      <Typography
                        color="gray"
                        className="text-sm"
                        style={{ fontSize: "12px" }}
                      >
                        No tax slabs defined.
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case "tax_exemptions":
        return (
          <div className="space-y-4">
            {/* Add Tax Exemption Button */}
            <div className="flex justify-end">
              <Button
                // color='blue'
                size="sm"
                className="flex items-center gap-2 bg-bgBlue text-white capitalize font-medium text-[12px] font-Urbanist py-2 px-4 rounded-[7px] hover:bg-blue-600 cursor-pointer"
                onClick={handleAddExemption}
              >
                <FaPlus className="w-3 h-3" />
                Add Tax Exemption
              </Button>
            </div>

            {/* Tax Exemptions Table */}
            <table className="w-full">
              <thead className="">
                <tr>
                  <th className="bg-[#F8F9FA] p-4 text-center">
                    <Typography
                      // color="blue-gray"
                      className="font-medium text-[14px] text-[#474747] font-Urbanist leading-none capitalize"
                      // style={{ fontSize: '15px' }}
                    >
                      Title
                    </Typography>
                  </th>
                  <th className="bg-[#F8F9FA] p-4 text-center">
                    <Typography
                      // color="blue-gray"
                      className="font-medium text-[14px] text-[#474747] font-Urbanist leading-none capitalize"
                      // style={{ fontSize: '15px' }}
                    >
                      Percentage
                    </Typography>
                  </th>
                  <th className="bg-[#F8F9FA] p-4 text-center">
                    <Typography
                      // color="blue-gray"
                      className="font-medium text-[14px] text-[#474747] font-Urbanist   leading-none capitalize"
                      // style={{ fontSize: '15px' }}
                    >
                      Action
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {taxExemptions.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-4 text-center">
                      <Typography
                        color="blue-gray"
                        className="text-sm"
                        style={{ fontSize: "12px" }}
                      >
                        No tax exemption defined.
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  taxExemptions.map((exemption, i) => {
                    const isLast = i === taxExemptions.length - 1;
                    const classes = isLast
                      ? "p-4 text-center"
                      : "p-4 border-b border-[#F2F2F9] text-center";
                    return (
                      <tr key={exemption.id}>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[14px] text-[#474747] font-Urbanist font-normal"
                            // style={{ fontSize: '13px' }}
                          >
                            {exemption.exemption_title}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // color="blue-gray"
                            className="text-[14px] text-[#474747] font-Urbanist font-normal"
                            // style={{ fontSize: '13px' }}
                          >
                            {exemption.percentage}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <button
                            onClick={() =>
                              handleDeleteTaxExemption(exemption.id)
                            }
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        );

      case "social_security":
        return (
          <div className="space-y-4">
            {/* Select Branch */}
            <div>
              <label className="text-[#698592] text-[12px] font-semibold block">
                Select Branch
              </label>
              <div className="w-full max-w-md">
                <CustomSelect
                  placeHolderTitle="Choose a branch"
                  value={formData.branch}
                  options={branchOptions}
                  onChangeHandler={(selectedOption) =>
                    handleInputChange("branch", selectedOption)
                  }
                  customStyles={false}
                />
              </div>
            </div>

            {/* % of employee salary */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[#698592] text-[12px] font-semibold">
                  % of employee salary
                </label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-help" />
              </div>
              <div className="w-full max-w-md">
                <Input
                  label="Enter percentage"
                  color="blue"
                  value={formData.employeeSalaryPercentage}
                  onChange={(e) =>
                    handleInputChange(
                      "employeeSalaryPercentage",
                      e.target.value
                    )
                  }
                  placeholder="Enter percentage"
                />
              </div>
            </div>

            {/* Limit above %age to below max salary */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[#698592] text-[12px] font-semibold">
                  Limit above %age to below max salary
                </label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-help" />
              </div>
              <div className="w-full max-w-md">
                <Input
                  label="Enter limit"
                  color="blue"
                  value={formData.limitAbovePercentage}
                  onChange={(e) =>
                    handleInputChange("limitAbovePercentage", e.target.value)
                  }
                  placeholder="Enter limit"
                />
              </div>
            </div>

            {/* Social Security is paid */}
            <div>
              <label className="text-[#698592] text-[12px] font-medium block">
                Social Security is paid
              </label>
              <div className="flex gap-3">
                <Radio
                  className="w-3 h-3 rounded-full p-2"
                  id="monthly"
                  color="blue"
                  size="sm"
                  name="paymentFrequency"
                  value="monthly"
                  checked={formData.paymentFrequency === "monthly"}
                  onChange={() =>
                    handleInputChange("paymentFrequency", "monthly")
                  }
                  label={
                    <Typography
                      color="blue-gray"
                      className="font-Urbanist text-[14px] text-[#474747] font-normal"
                    >
                      Monthly
                    </Typography>
                  }
                />
                <Radio
                  className="w-3 h-3 rounded-full p-2"
                  id="yearly"
                  size="sm"
                  color="blue"
                  name="paymentFrequency"
                  value="yearly"
                  checked={formData.paymentFrequency === "yearly"}
                  onChange={() =>
                    handleInputChange("paymentFrequency", "yearly")
                  }
                  label={
                    <Typography
                      color="blue-gray"
                      className="font-Urbanist text-[14px] text-[#474747] font-normal"
                    >
                      Yearly
                    </Typography>
                  }
                />
              </div>
            </div>
          </div>
        );

      case "medical_allowance":
        return (
          <div className="space-y-4">
            {/* Select Branch */}
            <div>
              <label className="text-[#698592] text-[12px] font-semibold block">
                Select Branch
              </label>
              <div className="w-full max-w-md">
                <CustomSelect
                  placeHolderTitle="Choose a branch"
                  value={formData.branch}
                  options={branchOptions}
                  onChangeHandler={(selectedOption) =>
                    handleInputChange("branch", selectedOption)
                  }
                  customStyles={false}
                />
              </div>
            </div>

            {/* % of employee salary */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[#698592] text-[12px] font-semibold">
                  % of employee salary
                </label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-help" />
              </div>
              <div className="w-full max-w-md">
                <Input
                  label="Enter percentage"
                  color="blue"
                  value={formData.employeeSalaryPercentage}
                  onChange={(e) =>
                    handleInputChange(
                      "employeeSalaryPercentage",
                      e.target.value
                    )
                  }
                  placeholder="Enter percentage"
                />
              </div>
            </div>

            {/* Limit above %age to below max salary */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[#698592] text-[12px] font-semibold">
                  Limit above %age to below max salary
                </label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-help" />
              </div>
              <div className="w-full max-w-md">
                <Input
                  label="Enter limit"
                  color="blue"
                  value={formData.limitAbovePercentage}
                  onChange={(e) =>
                    handleInputChange("limitAbovePercentage", e.target.value)
                  }
                  placeholder="Enter limit"
                />
              </div>
            </div>

            {/* Duration of allowance */}
            <div>
              <label className="text-[#698592] text-[12px] font-medium block">
                Duration of allowance
              </label>
              <div className="flex gap-3">
                <Radio
                  className="w-3 h-3 rounded-full p-2"
                  id="med-monthly"
                  color="blue"
                  size="sm"
                  name="paymentFrequency"
                  value="monthly"
                  checked={formData.paymentFrequency === "monthly"}
                  onChange={() =>
                    handleInputChange("paymentFrequency", "monthly")
                  }
                  label={
                    <Typography
                      color="blue-gray"
                      className="font-Urbanist text-[14px] text-[#474747] font-normal"
                    >
                      Monthly
                    </Typography>
                  }
                />
                <Radio
                  className="w-3 h-3 rounded-full p-2"
                  id="med-yearly"
                  color="blue"
                  size="sm"
                  name="paymentFrequency"
                  value="yearly"
                  checked={formData.paymentFrequency === "yearly"}
                  onChange={() =>
                    handleInputChange("paymentFrequency", "yearly")
                  }
                  label={
                    <Typography
                      color="blue-gray"
                      className="font-Urbanist text-[14px] text-[#474747] font-normal"
                    >
                      Yearly
                    </Typography>
                  }
                />
              </div>
            </div>
          </div>
        );

      case "eobi":
        return (
          <div className="space-y-4">
            {/* Select Branch */}
            <div>
              <label className="text-[#698592] text-[12px] font-semibold block">
                Select Branch
              </label>
              <div className="w-full max-w-md">
                <CustomSelect
                  placeHolderTitle="Choose a branch"
                  value={formData.branch}
                  options={branchOptions}
                  onChangeHandler={(selectedOption) =>
                    handleInputChange("branch", selectedOption)
                  }
                  customStyles={false}
                />
              </div>
            </div>

            {/* Salary */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[#698592] text-[12px] font-semibold">
                  Salary
                </label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-help" />
              </div>
              <div className="w-full max-w-md">
                <Input
                  label="Enter salary"
                  color="blue"
                  value={formData.eobiSalary}
                  onChange={(e) =>
                    handleInputChange("eobiSalary", e.target.value)
                  }
                  placeholder="Enter salary"
                />
              </div>
            </div>

            {/* Employee Contribution */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[#698592] text-[12px] font-semibold">
                  Employee Contribution
                </label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-help" />
              </div>
              <div className="w-full max-w-md">
                <Input
                  label="Enter employee contribution"
                  color="blue"
                  value={formData.empContribution}
                  onChange={(e) =>
                    handleInputChange("empContribution", e.target.value)
                  }
                  placeholder="Enter employee contribution"
                />
              </div>
            </div>

            {/* Employer Contribution */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[#698592] text-[12px] font-semibold">
                  Employer Contribution
                </label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-help" />
              </div>
              <div className="w-full max-w-md">
                <Input
                  label="Enter employer contribution"
                  color="blue"
                  value={formData.employerContribution}
                  onChange={(e) =>
                    handleInputChange("employerContribution", e.target.value)
                  }
                  placeholder="Enter employer contribution"
                />
              </div>
            </div>
          </div>
        );

      case "provident_fund":
        return (
          <div className="space-y-4">
            {/* Select Branch */}
            <div>
              <label className="text-[#698592] text-[12px] font-semiboldblock">
                Select Branch
              </label>
              <div className="w-full max-w-md">
                <CustomSelect
                  placeHolderTitle="Choose a branch"
                  value={formData.branch}
                  options={branchOptions}
                  onChangeHandler={(selectedOption) =>
                    handleInputChange("branch", selectedOption)
                  }
                  customStyles={false}
                />
              </div>
            </div>

            {/* Eligibility - Radio buttons in grid-2 */}
            <div>
              <label className="text-[#698592] text-[12px] font-semibold block">
                Eligibility
              </label>
              <div className="flex gap-2 w-full max-w-md">
                <Radio
                  className="w-3 h-3 rounded-full p-2"
                  color="blue"
                  size="sm"
                  id="all_employee"
                  name="fundEligibility"
                  value="all"
                  checked={formData.fundEligibility === "all"}
                  onChange={() => handleInputChange("fundEligibility", "all")}
                  label={
                    <Typography className="font-Urbanist text-[14px] text-[#474747] font-normal">
                      All Employee
                    </Typography>
                  }
                />
                <Radio
                  className="w-3 h-3 rounded-full p-2"
                  color="blue"
                  size="sm"
                  id="individual"
                  name="fundEligibility"
                  value="individual"
                  checked={formData.fundEligibility === "individual"}
                  onChange={() =>
                    handleInputChange("fundEligibility", "individual")
                  }
                  label={
                    <Typography className="font-Urbanist text-[14px] text-[#474747] font-normal">
                      Set in each employee profile
                    </Typography>
                  }
                />
              </div>
            </div>

            {/* Eligibility Min Employment Duration */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[#698592] text-[12px] font-semibold">
                  Eligibility Min Employment Duration (months)
                </label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-help" />
              </div>
              <div className="w-full max-w-md">
                <Input
                  label="Enter minimum duration"
                  color="blue"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.minDuration}
                  onChange={(e) =>
                    handleInputChange("minDuration", e.target.value)
                  }
                  placeholder="Enter minimum duration in months"
                />
              </div>
            </div>

            {/* Employee Contribution */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[#698592] text-[12px] font-semibold">
                  Employee Contribution (%age)
                </label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-help" />
              </div>
              <div className="w-full max-w-md">
                <Input
                  label="Enter employee contribution percentage"
                  color="blue"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.empContributionPF}
                  onChange={(e) =>
                    handleInputChange("empContributionPF", e.target.value)
                  }
                  placeholder="e.g., 8.33"
                />
              </div>
            </div>

            {/* Employer Contribution */}
            <div>
              <div className="flex items-center gap-2">
                <label className="text-[#698592] text-[12px] font-semibold">
                  Employer Contribution (%age)
                </label>
                <FaInfoCircle className="text-gray-400 text-sm cursor-help" />
              </div>
              <div className="w-full max-w-md">
                <Input
                  label="Enter employer contribution percentage"
                  color="blue"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.employerContributionPF}
                  onChange={(e) =>
                    handleInputChange("employerContributionPF", e.target.value)
                  }
                  placeholder="e.g., 8.33"
                />
              </div>
            </div>

            {/* Calculate Provident Fund On - Radio buttons */}
            <div>
              <label className="text-[#698592] text-[12px] font-semibold block">
                Calculate Provident Fund On
              </label>
              <div className="flex flex-col">
                <Radio
                  className="w-3 h-3 rounded-full p-2"
                  color="blue"
                  size="sm"
                  id="basic_pay"
                  name="calculateOn"
                  value="basic"
                  checked={formData.calculateOn === "basic"}
                  onChange={() => handleInputChange("calculateOn", "basic")}
                  label={
                    <Typography className="font-Urbanist text-[14px] text-[#474747] font-normal">
                      Basic Pay Only (Template Salary - No Increments)
                    </Typography>
                  }
                />
                <Radio
                  className="w-3 h-3 rounded-full p-2"
                  color="blue"
                  size="sm"
                  id="gross_pay"
                  name="calculateOn"
                  value="gross"
                  checked={formData.calculateOn === "gross"}
                  onChange={() => handleInputChange("calculateOn", "gross")}
                  label={
                    <Typography className="font-Urbanist text-[14px] text-[#474747] font-normal">
                      Gross Pay (Basic + Increments + Allowances)
                    </Typography>
                  }
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap bg-white relative rounded-[10px] mx-2 drop-shadow-md">
      {/* Left Column - Navigation Sidebar */}
      <div className="w-full lg:w-80 md:w-80 bg-[#F8F9FA] p-6 overflow-y-auto">
        <div className="relative">
          {navigationItems.map((item, index) => {
            const isActive = activeSection === item.id;
            const isLast = index === navigationItems.length - 1;

            return (
              <div
                key={item.id}
                className={`relative flex items-center gap-4 px-4 py-3 ${
                  isActive ? "bg-bgBlue rounded-[10px]" : ""
                }`}
              >
                {/* Timeline column */}
                <div className="relative flex flex-col items-center">
                  {/* Top line (connects previous circle) */}
                  {index !== 0 && (
                    <div className="absolute -top-6 w-[2px] h-6 bg-bgBlue" />
                  )}

                  {/* Circle */}
                  <div
                    className={`z-10 flex items-center justify-center w-4 h-4 rounded-full border-2 ${
                      isActive
                        ? "bg-bgBlue border-white"
                        : "bg-white border-bgBlue"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-white" : "bg-bgBlue"
                      }`}
                    />
                  </div>

                  {/* Bottom line (connects next circle) */}
                  {!isLast && (
                    <div className="absolute top-4 w-[2px] h-6 bg-bgBlue" />
                  )}
                </div>

                {/* Label */}
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`text-[14px] font-Urbanist font-medium transition-colors ${
                    isActive ? "text-white" : "text-[#474747]"
                  }`}
                >
                  {item.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column - Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-8 py-2">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[16px] font-Urbanist font-medium text-bgBlue">
              {navigationItems.find((item) => item.id === activeSection)?.label}
            </h1>
            <div className="w-full h-[1px] bg-[#F2F2F9]"></div>
          </div>

          {/* Form Content */}
          <div className="max-w-2xl mx-auto mb-8">{renderFormContent()}</div>

          {/* Action Buttons - Only for form sections */}
          {(activeSection === "social_security" ||
            activeSection === "medical_allowance" ||
            activeSection === "eobi" ||
            activeSection === "provident_fund") && (
            <div className="flex justify-center gap-4 mt-8">
              <Button
                // color='blue'
                variant="filled"
                onClick={handleSave}
                className="px-8 py-2 bg-bgBlue text-white capitalize font-medium text-[12px] font-Urbanist py-2 px-4 rounded-[7px] hover:bg-blue-600 cursor-pointer"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
              <Button
                color="red"
                variant="filled"
                onClick={handleReset}
                className="px-8 py-2 bg-red-500 text-white capitalize font-medium text-[12px] font-Urbanist py-2 px-4 rounded-[7px] hover:bg-red-600 cursor-pointer"
                disabled={isSaving}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tax Slab Form */}
      {isTaxSlabModalOpen && (
        <div
          className="fixed top-0 right-0 w-1/2 h-[100vh] bg-white shadow-xl border-l border-gray-200 z-[9999] overflow-y-auto"
          style={{
            top: 0,
            right: 0,
            width: "50%",
            height: "100vh",
            position: "fixed",
            margin: 0,
            padding: 0,
            border: "none",
            outline: "none",
          }}
        >
          <div className="min-h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-[#F2F2F9] bg-white">
              <h2 className="font-Urbanist text-[14px] font-medium text-[#474747]">
                Add Tax Slab
              </h2>
              <button
                onClick={handleCloseTaxSlabModal}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                <FaTimes size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTaxSlab} className="flex-1 p-6 w-full">
              <div className="space-y-6">
                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Branch Selection */}
                  <div className="grid grid-cols-3 gap-5 items-center">
                    <label className="text-[#698592] text-[12px] font-medium">
                      Branch
                    </label>
                    <div className="col-span-2">
                      <CustomSelect
                        placeHolderTitle="Select Branch"
                        value={newSlab.branch}
                        options={[
                          { value: 0, label: "All Branches" },
                          ...(copyBranchesData?.map((branch) => ({
                            value: branch.id,
                            label: branch.branch_name,
                          })) || []),
                        ]}
                        onChangeHandler={(value) =>
                          handleNewSlabChange("branch", value)
                        }
                        customStyles={false}
                        isSearchable={true}
                        isClearable={false}
                      />
                    </div>
                  </div>

                  {/* Amount From */}
                  <div className="grid grid-cols-3 gap-5 items-center">
                    <label className="text-[#698592] text-[12px] font-medium">
                      Amount From
                    </label>
                    <div className="col-span-2 relative">
                      <input
                        type="number"
                        placeholder="Enter amount from"
                        value={newSlab.amountFrom}
                        onChange={(e) =>
                          handleNewSlabChange("amountFrom", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        PKR
                      </span>
                    </div>
                  </div>

                  {/* Amount Upto */}
                  <div className="grid grid-cols-3 gap-5 items-center">
                    <label className="text-[#698592] text-[12px] font-medium">
                      Amount Upto
                    </label>
                    <div className="col-span-2 relative">
                      <input
                        type="number"
                        placeholder="Enter amount upto"
                        value={newSlab.amountUpto}
                        onChange={(e) =>
                          handleNewSlabChange("amountUpto", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        PKR
                      </span>
                    </div>
                  </div>

                  {/* Tax Rate % */}
                  <div className="grid grid-cols-3 gap-5 items-center">
                    <label className="text-[#698592] text-[12px] font-medium">
                      Tax Rate %
                    </label>
                    <div className="col-span-2 relative">
                      <input
                        type="number"
                        placeholder="0"
                        value={newSlab.taxRatePercent}
                        onChange={(e) =>
                          handleNewSlabChange("taxRatePercent", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Tax Rate Amount */}
                  <div className="grid grid-cols-3 gap-5 items-center">
                    <label className="text-[#698592] text-[12px] font-medium">
                      Tax Rate Amount
                    </label>
                    <div className="col-span-2 relative">
                      <input
                        type="number"
                        placeholder="Enter tax rate amount"
                        value={newSlab.taxRateAmount}
                        onChange={(e) =>
                          handleNewSlabChange("taxRateAmount", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        PKR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    // variant="outlined"
                    color="gray"
                    onClick={handleCloseTaxSlabModal}
                    disabled={isSaving}
                    className="px-8 py-2 bg-red-500 text-white capitalize font-medium text-[12px] font-Urbanist py-2 px-4 rounded-[7px] hover:bg-red-600 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="blue"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-2 bg-bgBlue text-white capitalize font-medium text-[12px] font-Urbanist py-2 px-4 rounded-[7px] hover:bg-blue-600 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <FaPlus className="w-4 h-4" />
                        Add Tax Slab
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Exemption Form */}
      {isTaxExemptionModalOpen && (
        <div className="fixed top-0 right-0 w-1/2 h-[100vh] bg-white shadow-xl border-l border-gray-200 z-[9999] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-2 border-b border-[#F2F2F9]">
            <h2 className="font-Urbanist text-[14px] font-medium text-[#474747]">
              Add Tax Exemption
            </h2>
            <button
              onClick={handleCloseTaxExemptionModal}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              <FaTimes size={15} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveTaxExemption} className="flex-1 p-6 w-full">
            <div className="space-y-6">
              {/* Form Fields */}
              <div className="space-y-6">
                {/* Title Field */}
                <div className="grid grid-cols-3 gap-5 items-center">
                  <label className="text-[#698592] text-[12px] font-medium">
                    Title
                  </label>
                  <div className="col-span-2 relative">
                    <input
                      type="text"
                      placeholder="e.g. medical allowances"
                      value={newExemption.title}
                      onChange={(e) =>
                        handleNewExemptionChange("title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Percentage Field */}
                <div className="grid grid-cols-3 gap-5 items-center">
                  <label className="text-[#698592] text-[12px] font-medium">
                    Percentage
                  </label>
                  <div className="col-span-2 relative">
                    <input
                      type="number"
                      placeholder="Enter percentage"
                      value={newExemption.percentage}
                      onChange={(e) =>
                        handleNewExemptionChange("percentage", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  // variant="outlined"
                  color="gray"
                  onClick={handleCloseTaxExemptionModal}
                  disabled={isSaving}
                  className="px-8 py-2 bg-red-500 text-white capitalize font-medium text-[12px] font-Urbanist py-2 px-4 rounded-[7px] hover:bg-red-600 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  // color="blue"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-2 bg-bgBlue text-white capitalize font-medium text-[12px] font-Urbanist py-2 px-4 rounded-[7px] hover:bg-blue-600 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus className="w-4 h-4" />
                      Add Tax Exemption
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingPayroll;