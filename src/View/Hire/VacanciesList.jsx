import {
  Button,
  MenuItem,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import React, { useEffect, useState, useCallback } from "react";
import { BiSearch } from "react-icons/bi";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
import { formatTimestamp } from "../Branches/utils";
import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { getAllMonths } from "../../services/__appServicesData";
import { getAllYearsHire, getCityNamesFromIds } from "../../services/__hireServices";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import useStore from "../../Store/store";
import { useNavigate } from "react-router";
import { useDebounce } from "../../services/__debounceServices";
const VacanciesList = () => {
  const {
    handleAllApps,
    hireShareItems,
    toggleMenuShare,
    filterByStatusMenu,
    toggleMenuHire,
    hireItems,
    openMenuHire,
    openMenuShare,
    handleMenuVacancies,
  } = useHire();

  const {
    getVacanciesWithFilters,
    allVacanciesList_data,
    handleDeactivate: handleDeactivate2,
    handleDeactivateVac: handleDeactivateVac2,
    deleteDialog: deleteDialog2,
    deleteVacancy: handleDeleteVacancy,
    actionType,
    paginationData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    loading,
  } = useHire_2();

  const allCities = useStore((state) => state.allCities);
  const gettingAllLocations = useStore((state) => state.gettingAllLocations);

  const dataVacancies = [
    "Title",
    "Age Limit",
    "Total Applicant",
    "Gender Ratio",
    "Valid Through",
    "Status",
    "Location",
    "Share Link",
    "Actions",
  ];
  const months = getAllMonths();
  const years = getAllYearsHire();

  const [filters, setFilters] = useState({
    status: "1", // Default to Active Vacancy
    title: "",
    year_date: "",
    month_date: "",
  });

  // Create a memoized debounced version of the search function
  const debouncedSearch = useDebounce(
    useCallback((searchText, currentFilters) => {
      const newFilters = { ...currentFilters, title: searchText };
      getVacanciesWithFilters(newFilters, 1); // Reset to page 1 on search
    }, []),
    500
  );

  // Load hiring cities so we can resolve vacancy.locations (from vacancy_location) to city names
  useEffect(() => {
    gettingAllLocations();
  }, [gettingAllLocations]);

  // Initial load with default Active Vacancy filter
  useEffect(() => {
    getVacanciesWithFilters({ page: 1, status: "1" });
  }, []); // Empty dependency array - only run once on mount

  const getMonthShortName = (monthNumber) => {
    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    return monthNames[monthNumber - 1];
  };

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters }; // Don't include page in filters
    switch (type) {
      case "statusFilter":
        newFilters.status = value;
        break;
      case "searchHire":
        newFilters.title = value;
        setFilters(newFilters); // Update UI immediately
        debouncedSearch(value, newFilters); // Debounce the API call with current filters
        return; // Return early to prevent duplicate API call
      case "yearFilter":
        newFilters.year_date = value;
        break;
      case "monthFilter":
        newFilters.month_date = getMonthShortName(value);
        break;
      default:
        break;
    }

    setFilters(newFilters);
    // Reset to page 1 when filters change
    getVacanciesWithFilters(newFilters, 1);
  };

  // Add new state for delete confirmation
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);

  const handleDeleteClick = (vacancy) => {
    setSelectedVacancy(vacancy);
    setDeleteConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedVacancy) {
      const success = await handleDeleteVacancy(selectedVacancy.id);
      setDeleteConfirmDialog(false);
      setSelectedVacancy(null);
      // Refresh the list with current filters after deletion
      if (success) {
        getVacanciesWithFilters(filters, paginationData.currentPage);
      }
    }
  };

  const handleMenuItems = (menuItem, hire) => {
    switch (menuItem.title) {
      case "Delete":
        handleDeleteClick(hire);
        break;
      case "Deactivate":
        handleDeactivate2(hire, "deactivate");
        break;
      case "Activate":
        handleDeactivate2(hire, "activate");
        break;
      // ... other cases ...
    }
  };

  const Navigate = useNavigate();

  // Social media sharing functions
  const handleSocialShare = (platform, vacancy) => {
    // Use the actual vacancy URL instead of hardcoded URL
    const careerPageUrl = `http://172.18.0.44:8080/10824961/vacancy/${vacancy.id}`;
    const shareText = `Check out this job opportunity: ${vacancy.title}`;

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          careerPageUrl
        )}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "instagram":
        // Instagram doesn't support direct URL sharing, but we can redirect to their website
        // Users can then copy the link and share it manually
        shareUrl = "https://www.instagram.com/";
        break;
      case "linkedin":
        // LinkedIn sharing URL
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          careerPageUrl
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(careerPageUrl)}`;
        break;
      default:
        return;
    }

    // Open in new window
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  // console.log("allVacanciesList_data", allVacanciesList_data.response)
  return (
    <>
      <div className="lg:px-2 md:px-2 px-0 flex flex-col gap-3">
        {/* <Hire data={allVacanciesList_data} /> */}
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">Filter by vacancy</label>
              <Select
               className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                labelProps={{className: "hidden"}}
                // label="Filter by Vacancy"
                onChange={(val) => handleFilterChange("statusFilter", val)}
                value={filters.status}
              >
                {filterByStatusMenu?.map((ele) => (
                  <Option value={`${ele.statusFilter}`} key={ele.id}>
                    {ele.title}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbansit">Search vacancy</label>
              <div className="relative w-full min-w-[200px] bg-white rounded-[8px]">
                <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
                  <span>
                    <BiSearch />
                  </span>
                </div>
                <input
                   className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  placeholder="Search vacancy"
                  name="searchHire"
                  value={filters.title}
                  onChange={(e) =>
                    handleFilterChange("searchHire", e.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">Year Filter</label>
              <Select
                label="Year Filter"
                // labelProps={{className: "hidden"}}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                name="yearFilter"
                value={filters.year_date}
                onChange={(val) => handleFilterChange("yearFilter", val)}
              >
                {years.map((year, i) => (
                  <Option key={i} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">Month Filter</label>
              <Select
                color="blue"
                label="Month Filter"
                // labelProps={{className: "hidden"}}
                 className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                placeholder="Select Month"
                value={
                  filters.month_date
                    ? months.find(
                        (m) => getMonthShortName(m.id) === filters.month_date
                      )?.id
                    : ""
                }
                onChange={(val) => handleFilterChange("monthFilter", val)}
              >
                {months.map((month) => (
                  <Option key={month.id} value={month.id}>
                    {month.title}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[10px] drop-shadow-md p-2">
          <div className="min-h-[calc(100vh-100px)] overflow-auto customScroll">
            <table className="w-full text-center">
              <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  {dataVacancies?.map((head, i) => (
                    <th key={i} className="bg-[#F8F9FA] p-4">
                      <Typography
                        // variant="small"
                        // color="blue-gray"
                        className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!allVacanciesList_data?.vacancies || allVacanciesList_data.vacancies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={dataVacancies.length}
                      className="p-4 text-center"
                    >
                      <Typography className="text-gray-500">
                        {loading ? "Loading vacancies..." : "No record found"}
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  allVacanciesList_data?.vacancies?.map((hire, index) => {
                    const isLast = index === allVacanciesList_data.length - 1;
                    const classes = isLast
                      ? "p-4"
                      : "p-4 border-b border-[#F2F2F9]";

                    return (
                      <tr key={index}>
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            onClick={() => handleAllApps(hire.id)}
                          >
                            {hire.title}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {hire.age_from} - {hire.age_upto}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {hire.total_applications}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {hire.req_gender === 0
                              ? "Female"
                              : hire.req_gender === 1
                              ? "Male"
                              : hire.req_gender === 2
                              ? "Both"
                              : "N/A"}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {formatTimestamp(hire.end_date).split(",")[0] +
                              "," +
                              formatTimestamp(hire.end_date).split(",")[1]}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {hire.status == "DRAFT"
                              ? "Deactivate"
                              : hire.status === "ACTIVE"
                              ? "Active"
                              : hire.status === "EXPIRED"
                              ? "Expired"
                              : "Closed"}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {(() => {
                              const names = getCityNamesFromIds(hire.locations, allCities);
                              if (names.length) return names.join(", ");
                              if (Array.isArray(hire.city_name) && hire.city_name.length)
                                return hire.city_name.join(", ");
                              return "—";
                            })()}
                          </Typography>
                        </td>

                        {/* Tooba */}
                        {/* share Links */}
                        <td className={classes}>
                          <div
                            onMouseEnter={() => toggleMenuShare(index, true)}
                            onMouseLeave={() => toggleMenuShare(index, false)}
                            className="relative flex items-center justify-center"
                          >
                            <Button
                              className="flex items-center gap-2 capitalize font-normal text-[clamp(10px,0.9vw,12px)] bg-[#EFF8FF] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]"
                              variant="outlined"
                            >
                              Share Link
                            </Button>

                            {openMenuShare[index] && (
                              <div className="border border-gray-200 z-30 rounded-lg absolute bg-white left-[-60px] w-[200px] shadow-md">
                                <motion.div
                                  initial={{ opacity: 0, y: 50 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 50 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ul className="flex w-full gap-1">
                                    {hireShareItems.map((menuItem) => (
                                      <MenuItem
                                        className="flex items-center justify-between bg-[#F2F9FF] m-[3px] text-[#3DA5F4] cursor-pointer hover:bg-[#E3F2FD]"
                                        key={menuItem.id}
                                        onClick={() => {
                                          const platform =
                                            menuItem.id === 1
                                              ? "facebook"
                                              : menuItem.id === 2
                                              ? "instagram"
                                              : menuItem.id === 3
                                              ? "linkedin"
                                              : "twitter";
                                          handleSocialShare(platform, hire);
                                        }}
                                      >
                                        <span>{menuItem.icon}</span>
                                      </MenuItem>
                                    ))}
                                  </ul>
                                </motion.div>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className={classes}>
                          <div
                            onMouseEnter={() => toggleMenuHire(index, true)}
                            onMouseLeave={() => toggleMenuHire(index, false)}
                            className="relative flex items-center justify-center"
                          >
                            <Button
                              className="flex items-center gap-2 capitalize font-normal text-[clamp(10px,0.9vw,12px)] bg-[#EFF8FF] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]"
                              variant="outlined"
                            >
                              Action
                              <FaChevronDown
                                strokeWidth={2.5}
                                className={`transition-transform transform ${
                                  openMenuHire[index] ? "rotate-180" : ""
                                }`}
                              />
                            </Button>

                            {openMenuHire[index] && (
                              <div
                                className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white w-[200px] left-[-100px] shadow-lg mt-0 ${index <=5 ? "top-full" : "bottom-full"}`}
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 50 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 50 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ul className="flex w-full flex-col gap-1">
                                    {hire.status === "DRAFT" ? (
                                      <MenuItem
                                        className="flex items-center justify-between"
                                        onClick={() =>
                                          handleDeactivate2(hire, "activate")
                                        }
                                      >
                                        <Typography variant="small">
                                          Activate
                                        </Typography>
                                      </MenuItem>
                                    ) : (
                                      <MenuItem
                                        className="flex items-center justify-between"
                                        onClick={() =>
                                          handleDeactivate2(hire, "deactivate")
                                        }
                                      >
                                        <Typography variant="small">
                                          Deactivate
                                        </Typography>
                                      </MenuItem>
                                    )}
                                    {/* Add Delete option */}
                                    <MenuItem
                                      className="flex items-center justify-between"
                                      onClick={() => handleDeleteClick(hire)}
                                    >
                                      <Typography
                                        variant="small"
                                        className="text-red-500"
                                      >
                                        Delete
                                      </Typography>
                                    </MenuItem>
                                    {hireItems
                                      .filter(
                                        (item) =>
                                          item.title !== "Activate" &&
                                          item.title !== "Deactivate" &&
                                          item.title !== "Delete"
                                      )
                                      .map((menuItem) => (
                                        <MenuItem
                                          className="flex items-center justify-between"
                                          key={menuItem.id}
                                          onClick={() =>
                                            handleMenuVacancies(
                                              menuItem.id,
                                              hire,
                                              2
                                            )
                                          }
                                        >
                                          <Typography variant="small">
                                            {menuItem.title}
                                          </Typography>
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
                  })
                )}
              </tbody>

              <ConfirmationDialog
                openDialog={deleteDialog2}
                handleOpen={() => handleDeactivate2(null)}
                handleConfirm={handleDeactivateVac2}
                title={
                  actionType === "activate"
                    ? "Confirm Activate"
                    : "Confirm Deactivate"
                }
                message={
                  actionType === "activate"
                    ? "Are you sure to activate this vacancy?"
                    : "Are you sure to deactivate this vacancy?"
                }
              />
            </table>

            {/* Google-style Pagination (same as EmployeesList) */}
            {allVacanciesList_data?.vacancies?.length > 0 && paginationData && paginationData.totalPages > 1 && (
              <div className="w-full flex justify-center items-center gap-1 mt-4 mb-4">
                {/* Previous Button */}
                {paginationData.currentPage > 1 ? (
                  <button
                    title="Previous Page"
                    className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                    onClick={goToPreviousPage}
                  >
                    <span>‹</span>
                    <span>Previous</span>
                  </button>
                ) : (
                  <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1">
                    <span>‹</span>
                    <span>Previous</span>
                  </div>
                )}
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const currentPage = paginationData.currentPage;
                    const totalPages = paginationData.totalPages;
                    
                    // If 10 or fewer pages, show all pages (like Google)
                    if (totalPages <= 10) {
                      return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1.5 text-[clamp(12px,1vw,14px)] rounded transition-colors ${
                            pageNum === currentPage
                              ? 'bg-[#1a73e8] text-white font-medium'
                              : 'text-[#1a73e8] hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ));
                    }
                    
                    // For more than 10 pages, show with ellipsis
                    const pages = [];
                    pages.push(1);
                    
                    if (currentPage > 3) {
                      pages.push('ellipsis-start');
                    }
                    
                    const startPage = Math.max(2, currentPage - 1);
                    const endPage = Math.min(totalPages - 1, currentPage + 1);
                    
                    for (let i = startPage; i <= endPage; i++) {
                      if (i !== 1 && i !== totalPages) {
                        pages.push(i);
                      }
                    }
                    
                    if (currentPage < totalPages - 2) {
                      pages.push('ellipsis-end');
                    }
                    
                    pages.push(totalPages);
                    
                    // Remove duplicates
                    const uniquePages = [];
                    const seen = new Set();
                    pages.forEach(page => {
                      if (typeof page === 'number' && !seen.has(page)) {
                        seen.add(page);
                        uniquePages.push(page);
                      } else if (typeof page === 'string') {
                        uniquePages.push(page);
                      }
                    });
                    
                    return uniquePages.map((page, index) => {
                      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8]">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1.5 text-[clamp(12px,1vw,14px)] rounded transition-colors ${
                            page === currentPage
                              ? 'bg-[#1a73e8] text-white font-medium'
                              : 'text-[#1a73e8] hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                </div>
                
                {/* Next Button */}
                {paginationData.currentPage < paginationData.totalPages ? (
                  <button
                    title="Next Page"
                    className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                    onClick={goToNextPage}
                  >
                    <span>Next</span>
                    <span>›</span>
                  </button>
                ) : (
                  <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1">
                    <span>Next</span>
                    <span>›</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add delete confirmation dialog */}
        <ConfirmationDialog
          openDialog={deleteConfirmDialog}
          handleOpen={() => setDeleteConfirmDialog(false)}
          handleConfirm={handleDeleteConfirm}
          title="Confirm Delete"
          message="Are you sure you want to delete this vacancy? This action cannot be undone."
        />
      </div>
    </>
  );
};

export default VacanciesList;