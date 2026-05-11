import {
  Button,
  MenuItem,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
import { formatTimestamp } from "../Branches/utils";
import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { getAllMonths } from "../../services/__appServicesData";
import { getAllYearsHire, getCityNamesFromIds, buildVacancyPublicShareUrl } from "../../services/__hireServices";
import { showToast } from "../../Components/Toaster/Toaster";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import useStore from "../../Store/store";
import { useNavigate } from "react-router";
import { useDebounce } from "../../services/__debounceServices";
import { VacanciesListTableSkeleton } from "./HireSkeletons";

function getVacancyCityList(hire, allCities) {
  const names = getCityNamesFromIds(hire.locations, allCities);
  if (names.length) return names;
  if (Array.isArray(hire.city_name) && hire.city_name.length)
    return hire.city_name.map((x) => String(x));
  return [];
}

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
  const openDrawer = useStore((state) => state.openDrawer);
  const settingComponent = useStore((state) => state.settingComponent);
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle);
  const settingDrawerSize = useStore((state) => state.settingDrawerSize);

  const openRemainingLocationsDrawer = useCallback((vacancyTitle, cities) => {
    const rest = cities.slice(1);
    settingDrawerTitle("Locations");
    settingDrawerSize?.();
    settingComponent(
      <div className="space-y-4 font-Urbanist">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Vacancy
          </p>
          <p className="text-sm font-medium text-slate-800">
            {vacancyTitle?.trim() ? vacancyTitle : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Additional locations ({rest.length})
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-[#474747]">
            {rest.map((city, idx) => (
              <li key={`${city}-${idx}`}>{city}</li>
            ))}
          </ul>
        </div>
      </div>
    );
    openDrawer();
  }, [
    openDrawer,
    settingComponent,
    settingDrawerTitle,
    settingDrawerSize,
  ]);

  /** Shared table chrome — vertical rules + uniform padding (standardized grid). */
  const vacancyThClass =
    "px-3 py-3.5 align-middle border-r border-gray-200/70 last:border-r-0 bg-gray-50/95";
  const vacancyTdClass =
    "px-3 py-3 align-middle border-r border-gray-100 last:border-r-0";

  /** Column labels + header alignment (body alignment set per `<td>`). Matches other admin tables (Departments / Applications). */
  const vacancyTableColumns = [
    { label: "Title", headerClass: "text-left" },
    { label: "Age Limit", headerClass: "text-center" },
    { label: "Total Applicant", headerClass: "text-center" },
    { label: "Gender Ratio", headerClass: "text-center" },
    { label: "Valid Through", headerClass: "text-center" },
    { label: "Status", headerClass: "text-center" },
    { label: "Location", headerClass: "text-left" },
    { label: "Share Link", headerClass: "text-center" },
    { label: "Actions", headerClass: "text-center" },
  ];
  const months = getAllMonths();
  const years = getAllYearsHire();

  const [filters, setFilters] = useState({
    status: "1", // Default to Active Vacancy
    title: "",
    year_date: "",
    month_date: "",
  });

  /** While user is focused / opened the select; used only to hide inner placeholder (labels above stay visible). */
  const [yearSelectInteracting, setYearSelectInteracting] = useState(false)
  const [monthSelectInteracting, setMonthSelectInteracting] = useState(false)

  const hasYearValue = Boolean(filters.year_date)
  const hasMonthValue = Boolean(filters.month_date)

  /** Placeholder inside the field: show when empty and not interacting; hide on click/open; restore on close without pick. */
  const showYearPlaceholder = !hasYearValue && !yearSelectInteracting
  const showMonthPlaceholder = !hasMonthValue && !monthSelectInteracting

  const yearSelectRef = useRef(null)
  const monthSelectRef = useRef(null)

  /** Second click on the trigger closes the menu without blurring — restore placeholder when closing with no value. */
  const handleYearSelectClick = () => {
    const root = yearSelectRef.current
    const menuWasOpen = root?.querySelector('ul[role="listbox"]') != null
    if (menuWasOpen) {
      queueMicrotask(() => setYearSelectInteracting(false))
    } else {
      setYearSelectInteracting(true)
    }
  }

  const handleMonthSelectClick = () => {
    const root = monthSelectRef.current
    const menuWasOpen = root?.querySelector('ul[role="listbox"]') != null
    if (menuWasOpen) {
      queueMicrotask(() => setMonthSelectInteracting(false))
    } else {
      setMonthSelectInteracting(true)
    }
  }

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

  /** Not on applicant list routes — avoid stale "loading" when opening `/hire/vacancies_list`. */
  useEffect(() => {
    useStore.setState({ allApplicantsLoading: false });
    return () => {
      useStore.setState({ allApplicantsLoading: true });
    };
  }, []);

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
        newFilters.year_date = value === "all" ? "" : value;
        break;
      case "monthFilter":
        newFilters.month_date = value === "all" ? "" : getMonthShortName(value);
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

  // Public vacancy URL for social share + copy (source_id = vacancy id from API)
  const handleCopyVacancyLink = async (vacancy) => {
    const text = buildVacancyPublicShareUrl(vacancy?.id)
    if (!text) {
      showToast("Unable to build link for this vacancy.", "error")
      return
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        showToast("Link copied to clipboard", "success")
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          const successful = document.execCommand("copy")
          if (successful) {
            showToast("Link copied to clipboard", "success")
          } else {
            throw new Error("execCommand failed")
          }
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (err) {
      console.error("Copy failed:", err)
      showToast("Failed to copy link. Please try again.", "error")
    }
  }

  // Social media sharing — uses same public URL as copy (LinkedIn, Facebook, X)
  const handleSocialShare = (platform, vacancy) => {
    const careerPageUrl = buildVacancyPublicShareUrl(vacancy?.id)
    if (!careerPageUrl) return
    const shareText = `Check out this job opportunity: ${vacancy.title}`

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          careerPageUrl
        )}&quote=${encodeURIComponent(shareText)}`
        break
      case "instagram":
        // No web share URL; open site — user can paste from Copy link
        shareUrl = "https://www.instagram.com/"
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          careerPageUrl
        )}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(careerPageUrl)}`
        break
      default:
        return
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer")
  }

  const vacanciesRows = allVacanciesList_data?.vacancies;
  const showVacanciesSkeleton =
    loading && (!vacanciesRows || vacanciesRows.length === 0);

  // console.log("allVacanciesList_data", allVacanciesList_data.response)
  return (
    <>
      <div className="w-full min-w-0 max-w-full flex flex-col gap-4 px-0">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">Filter by vacancy</label>
              <Select
               className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                labelProps={{className: "hidden"}}
                onChange={(val) => handleFilterChange("statusFilter", val)}
                value={filters.status}
                selected={() => {
                  const selectedItem = filterByStatusMenu?.find(
                    (ele) => String(ele.statusFilter) === String(filters.status)
                  )
                  return (
                    <span className="text-[12px] font-Urbanist font-medium text-gray-400">
                      {selectedItem?.title || "Filter by vacancy"}
                    </span>
                  )
                }}
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
              <label
                className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist"
                htmlFor="hire-year-filter"
              >
                Year Filter
              </label>
              <Select
                ref={yearSelectRef}
                id="hire-year-filter"
                labelProps={{ className: "hidden" }}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                name="yearFilter"
                value={filters.year_date ? String(filters.year_date) : "all"}
                onChange={(val) => {
                  handleFilterChange("yearFilter", val)
                  setYearSelectInteracting(false)
                }}
                selected={() => {
                  return (
                    <span className="text-[12px] font-Urbanist font-medium text-gray-400">
                      {filters.year_date || "All"}
                    </span>
                  )
                }}
                onClick={handleYearSelectClick}
                onFocus={() => setYearSelectInteracting(true)}
                containerProps={{
                  onBlur: (e) => {
                    const next = e.relatedTarget
                    if (next && e.currentTarget.contains(next)) return
                    setYearSelectInteracting(false)
                  },
                }}
              >
                <Option value="all">All</Option>
                {years.map((year, i) => (
                  <Option key={i} value={String(year)}>
                    {year}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label
                className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist"
                htmlFor="hire-month-filter"
              >
                Month Filter
              </label>
              <Select
                ref={monthSelectRef}
                id="hire-month-filter"
                labelProps={{ className: "hidden" }}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={
                  filters.month_date
                    ? months.find(
                        (m) => getMonthShortName(m.id) === filters.month_date
                      )?.id?.toString()
                    : "all"
                }
                onChange={(val) => {
                  handleFilterChange("monthFilter", val)
                  setMonthSelectInteracting(false)
                }}
                selected={() => {
                  if (hasMonthValue) {
                    const selectedMonth = months.find(
                      (m) => getMonthShortName(m.id) === filters.month_date
                    )
                    return (
                      <span className="text-[12px] font-Urbanist font-medium text-gray-400">
                        {selectedMonth?.title || filters.month_date}
                      </span>
                    )
                  }
                  return (
                    <span className="text-[12px] font-Urbanist font-medium text-gray-400">
                      All
                    </span>
                  )
                }}
                onClick={handleMonthSelectClick}
                onFocus={() => setMonthSelectInteracting(true)}
                containerProps={{
                  onBlur: (e) => {
                    const next = e.relatedTarget
                    if (next && e.currentTarget.contains(next)) return
                    setMonthSelectInteracting(false)
                  },
                }}
              >
                <Option value="all">All</Option>
                {months.map((month) => (
                  <Option key={month.id} value={String(month.id)}>
                    {month.title}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Table — table-auto + Location w-0/max-w + Share nowrap so no huge gap between those columns */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden w-full min-w-0">
          <div className="min-h-[calc(100vh-100px)] w-full min-w-0 overflow-x-auto overflow-y-auto customScroll">
            <table className="w-full min-w-[1000px] table-auto border-collapse text-sm">
              <thead className="sticky top-0 z-20 backdrop-blur-sm border-b border-gray-200">
                <tr>
                  {vacancyTableColumns.map((col) => (
                    <th
                      key={col.label}
                      scope="col"
                      className={vacancyThClass}
                    >
                      <Typography
                        className={`font-semibold uppercase tracking-wider text-[11px] text-gray-500 font-poppins leading-tight ${col.headerClass}`}
                      >
                        {col.label}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {showVacanciesSkeleton ? (
                  <VacanciesListTableSkeleton
                    rows={8}
                    colCount={vacancyTableColumns.length}
                  />
                ) : !vacanciesRows || vacanciesRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={vacancyTableColumns.length}
                      className="p-4 text-center"
                    >
                      <Typography className="text-gray-500">
                        No record found
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  vacanciesRows.map((hire, index) => {
                    const locationCities = getVacancyCityList(hire, allCities);

                    return (
                      <tr key={index} className="hover:bg-brand-50/30 transition-colors">
                        <td className={`${vacancyTdClass} text-left max-w-[16rem]`}>
                          <Typography
                            className="font-medium text-[#474747] font-Urbanist text-[13px] capitalize cursor-pointer hover:text-brand-500 transition-colors line-clamp-2 break-words"
                            onClick={() => handleAllApps(hire.id)}
                          >
                            {hire.title}
                          </Typography>
                        </td>

                        <td className={`${vacancyTdClass} text-center whitespace-nowrap`}>
                          <Typography className="font-normal text-[#474747] font-Urbanist text-[13px] tabular-nums">
                            {hire.age_from} - {hire.age_upto}
                          </Typography>
                        </td>

                        <td className={`${vacancyTdClass} text-center whitespace-nowrap`}>
                          <Typography className="font-normal text-[#474747] font-Urbanist text-[13px] tabular-nums">
                            {hire.total_applications}
                          </Typography>
                        </td>

                        <td className={`${vacancyTdClass} text-center whitespace-nowrap`}>
                          <Typography className="font-normal text-[#474747] font-Urbanist text-[13px]">
                            {hire.req_gender === 0
                              ? "Female"
                              : hire.req_gender === 1
                              ? "Male"
                              : hire.req_gender === 2
                              ? "Both"
                              : "N/A"}
                          </Typography>
                        </td>

                        <td className={`${vacancyTdClass} text-center whitespace-nowrap`}>
                          <Typography className="font-normal text-[#474747] font-Urbanist text-[13px] tabular-nums">
                            {formatTimestamp(hire.end_date).split(",")[0] +
                              "," +
                              formatTimestamp(hire.end_date).split(",")[1]}
                          </Typography>
                        </td>

                        <td className={`${vacancyTdClass} text-center whitespace-nowrap`}>
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold font-Urbanist whitespace-nowrap ${
                              hire.status === "ACTIVE"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : hire.status === "EXPIRED"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : hire.status === "DRAFT"
                                ? "bg-gray-100 text-gray-500 border border-gray-200"
                                : "bg-orange-50 text-orange-600 border border-orange-200"
                            }`}
                          >
                            {hire.status === "DRAFT"
                              ? "Deactivated"
                              : hire.status === "ACTIVE"
                              ? "Active"
                              : hire.status === "EXPIRED"
                              ? "Expired"
                              : "Closed"}
                          </span>
                        </td>

                        <td
                          className={`${vacancyTdClass} w-0 min-w-0 max-w-[11rem] text-left`}
                        >
                          {locationCities.length === 0 ? (
                            <Typography className="font-normal text-[#474747] font-Urbanist text-[13px] text-left">
                              —
                            </Typography>
                          ) : locationCities.length === 1 ? (
                            <Typography className="font-normal text-[#474747] font-Urbanist text-[13px] text-left line-clamp-2 break-words">
                              {locationCities[0]}
                            </Typography>
                          ) : (
                            <div className="flex max-w-full min-w-0 flex-nowrap items-center gap-x-1 text-left">
                              <span className="min-w-0 truncate font-normal text-[#474747] font-Urbanist text-[13px]">
                                {locationCities[0]}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openRemainingLocationsDrawer(
                                    hire.title,
                                    locationCities
                                  );
                                }}
                                className="inline-flex shrink-0 items-center justify-center self-center rounded px-0.5 py-0 text-[13px] font-semibold leading-none text-[#3da5f4] hover:bg-[#EFF8FF] hover:underline cursor-pointer border-0 bg-transparent font-Urbanist"
                                aria-label={`Show ${
                                  locationCities.length - 1
                                } more locations`}
                              >
                                ...
                              </button>
                            </div>
                          )}
                        </td>

                        <td
                          className={`${vacancyTdClass} text-center whitespace-nowrap w-[1%]`}
                        >
                          <div
                            onMouseEnter={() => toggleMenuShare(index, true)}
                            onMouseLeave={() => toggleMenuShare(index, false)}
                            className="relative inline-flex items-center justify-center"
                          >
                            <Button
                              className="flex items-center justify-center gap-1 normal-case font-medium text-[11px] bg-[#EFF8FF] border border-[#3da5f4] text-[#3da5f4] px-2.5 py-1.5 min-w-0 max-w-full cursor-pointer whitespace-nowrap"
                              variant="outlined"
                            >
                              Share Link
                            </Button>

                            {openMenuShare[index] && (
                              <div className="border border-gray-200 z-30 rounded-lg absolute bg-white left-[-60px] min-w-[220px] shadow-md">
                                <motion.div
                                  initial={{ opacity: 0, y: 50 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 50 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div
                                    role="group"
                                    aria-label="Share on social media"
                                    className="flex flex-nowrap flex-row items-center justify-center gap-1 px-2 py-2"
                                  >
                                    {hireShareItems.map((menuItem) => (
                                      <button
                                        type="button"
                                        key={menuItem.id}
                                        title={menuItem.title}
                                        className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#F2F9FF] text-[#3DA5F4] cursor-pointer hover:bg-[#E3F2FD] h-9 w-9 p-0 border-0"
                                        onClick={() => {
                                          const platform =
                                            menuItem.id === 1
                                              ? "facebook"
                                              : menuItem.id === 2
                                              ? "instagram"
                                              : menuItem.id === 3
                                              ? "linkedin"
                                              : "twitter"
                                          handleSocialShare(platform, hire)
                                        }}
                                      >
                                        <span className="inline-flex">{menuItem.icon}</span>
                                      </button>
                                    ))}
                                  </div>
                                  <div className="border-t border-gray-100 px-2 pb-2 pt-1">
                                    <button
                                      type="button"
                                      className="w-full rounded-md bg-[#3DA5F4] text-white text-[11px] font-Urbanist font-medium py-1.5 px-2 hover:bg-[#2d8fd6] transition-colors cursor-pointer"
                                      onClick={() => handleCopyVacancyLink(hire)}
                                    >
                                      Copy link
                                    </button>
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          </div>
                        </td>

                        <td
                          className={`${vacancyTdClass} text-center whitespace-nowrap w-[1%]`}
                        >
                          <div
                            onMouseEnter={() => toggleMenuHire(index, true)}
                            onMouseLeave={() => toggleMenuHire(index, false)}
                            className="relative inline-flex items-center justify-center"
                          >
                            <Button
                              className="flex items-center justify-center gap-1.5 normal-case font-medium text-[11px] bg-[#EFF8FF] border border-[#3da5f4] text-[#3da5f4] px-2.5 py-1.5 cursor-pointer whitespace-nowrap"
                              variant="outlined"
                            >
                              Action
                              <FaChevronDown
                                strokeWidth={2.5}
                                className={`h-2.5 w-2.5 shrink-0 transition-transform transform ${
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
                    className="px-3 py-2 cursor-pointer text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
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
                          className={`px-3 py-1.5 cursor-pointer text-[clamp(12px,1vw,14px)] rounded transition-colors ${
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
                          className={`px-3 py-1.5 cursor-pointer text-[clamp(12px,1vw,14px)] rounded transition-colors ${
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
                    className="px-3 py-2 cursor-pointer text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
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