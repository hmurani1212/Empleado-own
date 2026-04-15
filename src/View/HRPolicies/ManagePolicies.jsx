import React, { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { Checkbox } from "@material-tailwind/react";
import useHRPolicies from "../../ViewModel/HRPoliciesViewModel/HRPoliciesServices";
import PoliciesList from "./PoliciesList";
import PoliciesGrid from "./PoliciesGrid";
import { FaListUl } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { motion, AnimatePresence } from "framer-motion";

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

  const [initialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      await getAllBranchesHrPolicy();

      if (!mountPolicies) {
        setInitialLoading(true);
        try {
          await getAllHrPolicies();
        } catch (error) {
          console.error("Error fetching policies:", error);
        } finally {
          setInitialLoading(false);
        }
      } else {
        setInitialLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Branch Filter */}
            <div className="w-full md:w-56">
              <CustomSelect
                placeHolderTitle="Filter by Branch"
                value={filterValuesHr?.branchName ? { value: filterValuesHr.branchName, label: filterValuesHr.branchName } : null}
                options={[
                  { value: "", label: "All Branches" },
                  ...((policyBranches || []).filter(
                    (b) =>
                      b &&
                      String(b.id) !== "0" &&
                      b.branch_name &&
                      b.branch_name !== "All Branches"
                  ).map((ele) => ({
                    value: ele.branch_name,
                    label: ele.branch_name,
                    id: ele.id,
                  })) || []),
                ]}
                onChangeHandler={(selectedOption) => {
                  if (!selectedOption || selectedOption.value === "") {
                    handleFilterChangePolicy("branchName", "");
                  } else {
                    const selectedBranch = (policyBranches || []).find(
                      (branch) => branch.branch_name === selectedOption.value
                    );
                    handleFilterChangePolicy("branchName", selectedBranch);
                  }
                }}
                customStyles={false}
              />
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-64 h-[42px] bg-gray-50 rounded-xl border border-gray-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <BiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  className="w-full h-full bg-transparent text-sm text-gray-700 font-poppins pl-10 pr-4 rounded-xl focus:outline-none placeholder:text-gray-400"
                  placeholder="Search policies..."
                  value={hrPolicySearch?.search || ""}
                  name="search"
                  onChange={handlePoliciesChange}
                />
            </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            {/* Inactive Checkbox */}
            <div className="flex items-center">
              <Checkbox
                color="blue"
                label={
                  <span className="font-poppins text-sm font-medium text-gray-600">
                    Inactive Policies
                  </span>
                }
                checked={isChecked}
                onChange={(e) => statusPolicies(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* View Toggle */}
            <div className="bg-gray-100/50 p-1 rounded-lg border border-gray-200 flex items-center gap-1">
                <button
                  onClick={handleListToggleHr}
                  className={`p-2 rounded-md transition-all duration-200 cursor-pointer ${
                    listViewHr 
                      ? "bg-white text-bgBlue shadow-sm" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="List View"
                >
                  <FaListUl size={16} />
                </button>
                <button
                  onClick={handleGridToggle}
                  className={`p-2 rounded-md transition-all duration-200 cursor-pointer ${
                    !listViewHr 
                      ? "bg-white text-bgBlue shadow-sm" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Grid View"
                >
                  <IoGrid size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={listViewHr ? "list" : "grid"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {listViewHr ? (
            <PoliciesList
              allHrpolicies={allPolicies}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              loading={initialLoading}
              onLoadMore={handleLoadMore}
              onNextPage={goToNextPage}
              onPreviousPage={goToPreviousPage}
              onGoToPage={goToPage}
              paginationData={getPaginationData()}
            />
          ) : (
            <PoliciesGrid
              allHrpolicies={allPolicies}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              loading={initialLoading}
              onLoadMore={handleLoadMore}
              onNextPage={goToNextPage}
              onPreviousPage={goToPreviousPage}
              onGoToPage={goToPage}
              paginationData={getPaginationData()}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ManagePolicies;