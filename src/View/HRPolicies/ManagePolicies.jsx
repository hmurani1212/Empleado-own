import React, { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { Checkbox, Option, Select } from "@material-tailwind/react";
import useHRPolicies from "../../ViewModel/HRPoliciesViewModel/HRPoliciesServices";
import PoliciesList from "./PoliciesList";
import PoliciesGrid from "./PoliciesGrid";
import { FaListUl } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";

// Custom Branch Select Component with Animations
const CustomBranchSelect = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const selectedOption = options.find((option) => option.value === value) || {
    label: "All Branches",
  };

  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    if (isOpen) {
      setIsOpen(false);
      setTimeout(() => setIsAnimating(false), 200);
    } else {
      setIsOpen(true);
      setTimeout(() => setIsAnimating(false), 200);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsAnimating(true);
    setIsOpen(false);
    setTimeout(() => setIsAnimating(false), 200);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".custom-branch-select")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative custom-branch-select">
      <div className="relative">
        <button
          type="button"
          className={`w-full h-[38px] px-3 py-2 text-[12px] rounded-[8px] bg-white text-left focus:outline-none focus:ring-0 focus:border-none drop-shadow-sm text-[#474747] font-Urbanist font-normal border-none transition-all duration-200 ease-out transform`}
          //      ${
          //     isOpen
          //         ? 'border-blue-500 shadow-lg scale-[1.01]'
          //         : 'border-gray-300 hover:border-gray-400 hover:shadow-sm hover:scale-[1.005]'
          // }`}
          onClick={handleToggle}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 0.5rem center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1.5em 1.5em",
            paddingRight: "2.5rem",
            transform: isOpen ? "scale(1.01)" : "scale(1)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {selectedOption.label}
        </button>

        {/* Floating Label */}
        <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
          {label}
        </label>

        {/* Animated Dropdown */}
        <div
          className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden ${
            isOpen
              ? "opacity-100 visible transform scale-100 translate-y-0"
              : "opacity-0 invisible transform scale-95 -translate-y-2"
          } transition-all duration-200 ease-out`}
          style={{
            maxHeight: isOpen ? "400px" : "0px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="py-1 max-h-96 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ${
                  value === option.value
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700"
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ManagePolicies = () => {
  const {
    listViewHr,
    handleListToggleHr,
    handleGridToggle,
    selectBranchHandler,
    allPolicies,
    mountPolicies,
    getAllHrPolicies,
    handlePoliciesChange,
    policyBranches,
    getAllBranchesHrPolicy,
    isChecked,
    handleCheckbox,
    statusPolicies,
    handleFilterChangePolicy,
    filterValuesHr,

    hrPoliciesScrollRef,
    clearAllFilters,
    branchId,
    hrPolicySearch,
    handleLoadMore,
    hasMore,
    isLoadingMore,
    currentPage,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    getPaginationData,
  } = useHRPolicies();

  const { empBranches, fetchingAllBranches } = useEmployees();
  useEffect(() => {
    if (!mountPolicies) {
      getAllHrPolicies();
    }
    // Always fetch branches when component mounts
    fetchingAllBranches();
  }, []);
  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div className="flex lg:flex-row md:flex-row flex-col lg:items-end md:items-end items-start gap-3">
            <div className="w-[200px]">
              <label className="text-[12px] text-[#474747] font-Urbanist font-medium px-2">
                Filter by Branch
              </label>
              <CustomBranchSelect
                className="text-[12px] text-[#474747] font-Urbanist font-medium outline-none border-none drop-shadow-sm bg-white focus:outline-none focus:ring-0 focus:border-none focus:border-0"
                // label="Filter by Branch"
                value={filterValuesHr?.branchName || ""}
                options={[
                  { value: "", label: "All Branches" },
                  ...(empBranches?.map((ele) => ({
                    value: ele.branch_name,
                    label: ele.branch_name,
                    id: ele.id,
                  })) || []),
                ]}
                onChange={(selectedValue) => {
                  if (selectedValue === "") {
                    handleFilterChangePolicy("branchName", "");
                  } else {
                    const selectedBranch = empBranches?.find(
                      (branch) => branch.branch_name === selectedValue
                    );
                    handleFilterChangePolicy("branchName", selectedBranch);
                  }
                }}
              />
            </div>

            <div className="w-[200px]">
              <label className="text-[12px] text-[#474747] font-Urbanist font-medium px-2">
                Search by name
              </label>
              <div className="relative w-full min-w-[200px] h-[38px] bg-white rounded-[7px] px-3 drop-shadow-sm ">
                <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
                  <span>
                    <BiSearch />
                  </span>
                </div>
                <input
                  className="w-full h-full bg-transparent text-[#474747] border-none outline-none text-[12px] font-Urbanist rounded-[7px]"
                  placeholder="Search Branch"
                  value={hrPolicySearch?.search || ""}
                  name="search"
                  onChange={handlePoliciesChange}
                />
              </div>
            </div>

            <div className="text-[14px] text-[#474747] font-Urbanist font-medium">
              <Checkbox
                color="blue"
                label="Inactive policies"
                checked={isChecked}
                onChange={(e) => statusPolicies(e.target.checked)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pr-2">
            <span
              className="cursor-pointer text-[#9B9B9B]"
              style={{ color: listViewHr ? "#3DA5F4" : "" }}
              onClick={handleListToggleHr}
            >
              <FaListUl />
            </span>
            <span
              className="cursor-pointer text-[#9B9B9B]"
              style={{ color: listViewHr ? "" : "#3DA5F4" }}
              onClick={handleGridToggle}
            >
              <IoGrid />
            </span>
          </div>
        </div>

        {listViewHr ? (
          <div>
            <div
              className="customScroll"
              ref={hrPoliciesScrollRef}
            >
              <PoliciesList
                allHrpolicies={allPolicies}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
                onNextPage={goToNextPage}
                onPreviousPage={goToPreviousPage}
                onGoToPage={goToPage}
                paginationData={getPaginationData()}
              />
            </div>
          </div>
        ) : (
          <div>
            <div
              className="customScroll"
              style={{ overflowY: "auto", height: "calc(100vh - 98px)" }}
            >
              <PoliciesGrid
                allHrpolicies={allPolicies}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
                onNextPage={goToNextPage}
                onPreviousPage={goToPreviousPage}
                onGoToPage={goToPage}
                paginationData={getPaginationData()}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManagePolicies;