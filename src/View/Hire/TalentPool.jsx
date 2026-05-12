import { Button, Option, Select, Typography } from "@material-tailwind/react";
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { getAllAge } from "../../services/__hireServices";
import { FaEye } from "react-icons/fa";
import { format } from "date-fns";
import useStore from "../../Store/store";
import { useTalentPoolServices } from "../../ViewModel/HireViewModel2/hireServices_2";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";

import { TalentPoolTableSkeleton } from "./HireSkeletons";

const TalentPool = () => {
  const { getTalentPoolData, resetTalentPool } = useTalentPoolServices();
  const { GetLabel_def } = useHire();
  // console.log('what is this', Label_data)
  // console.log('what is this', GetLabel_def)
  // console.log('what is this', Label_data)
  const allTalentPool = useStore((state) => state.allTalentPool);
  const labelData = useStore((state) => state.labelData);
  const talentPoolError = useStore((state) => state.talentPoolError);
  const talentPoolLoading = useStore((state) => state.talentPoolLoading);

  const talentPoolPaginationData = useStore((state) => state.talentPoolPaginationData);
  const [filters, setFilters] = useState({
    page: 1,
    gender: "",
    age_from: "",
    age_to: "",
    label_id: "",
  });

  /** Placeholder UX for non–react-select filters only */
  const [genderIx, setGenderIx] = useState(false);
  const [ageFromIx, setAgeFromIx] = useState(false);
  const [ageToIx, setAgeToIx] = useState(false);

  const genderRef = useRef(null);
  const ageFromRef = useRef(null);
  const ageToRef = useRef(null);

  const hasLabelFilterValue =
    filters.label_id !== undefined &&
    filters.label_id !== null &&
    String(filters.label_id).trim() !== "";
  const hasGenderValue =
    filters.gender !== undefined &&
    filters.gender !== null &&
    filters.gender !== "";
  const hasAgeFromValue =
    filters.age_from !== undefined &&
    filters.age_from !== null &&
    String(filters.age_from).trim() !== "";
  const hasAgeToValue =
    filters.age_to !== undefined &&
    filters.age_to !== null &&
    String(filters.age_to).trim() !== "";

  const showGenderPh = !hasGenderValue && !genderIx;
  const showAgeFromPh = !hasAgeFromValue && !ageFromIx;
  const showAgeToPh = !hasAgeToValue && !ageToIx;

  const clickSelect = useCallback((ref, setIx) => {
    const root = ref.current;
    const menuWasOpen = root?.querySelector('ul[role="listbox"]') != null;
    if (menuWasOpen) {
      queueMicrotask(() => setIx(false));
    } else {
      setIx(true);
    }
  }, []);

  const containerBlur = useCallback((setIx) => ({
    onBlur: (e) => {
      // Delay the blur handling to avoid conflicts with click events
      setTimeout(() => {
        const next = e.relatedTarget;
        if (next && e.currentTarget.contains(next)) return;
        setIx(false);
      }, 100);
    },
  }), []);

  const genderSelectValue = hasGenderValue ? String(filters.gender) : "";

  useEffect(() => {
    // Initial load of talent pool data
    fetchData(filters);
    GetLabel_def();

    // Cleanup on unmount
    return () => {
      resetTalentPool();
    };
  }, []);

  useEffect(() => {
    useStore.setState({ allApplicantsLoading: false });
    return () => {
      useStore.setState({ allApplicantsLoading: true });
    };
  }, []);

  const fetchData = async (filterParams) => {
    await getTalentPoolData(filterParams);
  };

  const goToTalentPoolPage = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const handleFilterChange = async (filterName, value) => {
    const newFilters = {
      ...filters,
      page: 1,
      [filterName]: value ?? "",
    };
  
    setFilters(newFilters);
  
    const apiFilters = {
      ...newFilters,
      label_id: newFilters.label_id || undefined,
      gender: newFilters.gender || undefined,
      age_from: newFilters.age_from || undefined,
      age_to: String(newFilters.age_to) || undefined,
    };
  
    fetchData(apiFilters);
  };

  // const handleFilterChange = async (filterName, value) => {
  //   // Convert empty strings to undefined for API
  //   const apiValue = value === "" ? undefined : String(value);

  //   const newFilters = {
  //     ...filters,
  //     page: 1, // Reset to first page when filter changes
  //     [filterName]: apiValue,
  //   };

  //   setCurrentPage(1);
  //   setFilters(newFilters);
  //   fetchData(newFilters);
  // };

  const talentHead = ["Candidate", "City", "CV", "Talent", "Added"];
  const age = getAllAge();

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp * 1000), "dd MMM yyyy");
  };

  const labelSelectOptions = useMemo(() => {
    if (!labelData?.length) {
      return [{ value: "", label: "No labels available" }];
    }
    return [
      { value: "", label: "All Labels" },
      ...labelData.map((l) => ({
        value: String(l.id),
        label: l.label_name ?? String(l.id),
      })),
    ];
  }, [labelData]);

  const labelSelectValue = useMemo(() => {
    if (!labelSelectOptions.length) return null;
    if (!labelData?.length) return labelSelectOptions[0];
    if (!hasLabelFilterValue) {
      return labelSelectOptions.find((o) => o.value === "") ?? labelSelectOptions[0];
    }
    return (
      labelSelectOptions.find((o) => String(o.value) === String(filters.label_id)) ??
      labelSelectOptions[0]
    );
  }, [labelSelectOptions, labelData, hasLabelFilterValue, filters.label_id]);

  const labelSelectStyles = useMemo(
    () => ({
      control: (base) => ({
        ...base,
        minHeight: 38,
        borderRadius: 8,
        border: "none",
        boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)",
        fontSize: 12,
      }),
      option: (base, state) => ({
        ...base,
        fontSize: 12,
        cursor: state.isDisabled ? "not-allowed" : "pointer",
        backgroundColor: state.isSelected
          ? "#dbeafe"
          : state.isFocused
            ? "#eff6ff"
            : "#ffffff",
        color: state.isDisabled ? "#9ca3af" : "#374151",
        fontWeight: state.isSelected ? 600 : 400,
      }),
    }),
    []
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px] w-full max-w-[280px]">
              <label className="text-customBlack-100 text-[12px] px-2 font-medium font-Urbanist">
                All Labels
              </label>
              <div className="mt-1">
                <CustomSelect
                  isTrue
                  placeHolderTitle="All Labels"
                  options={labelSelectOptions}
                  value={labelSelectValue}
                  onChangeHandler={(opt) => {
                    if (!labelData?.length) return;
                    handleFilterChange("label_id", opt?.value ?? "");
                  }}
                  isSearchable={false}
                  isClearable={false}
                  disabled={!labelData?.length}
                  customStyles={labelSelectStyles}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                />
              </div>
              {/* Legacy Material Select removed — react-select highlights only the selected option */}
            </div>

            <div>
              <label className="text-customBlack-100 text-[12px] px-2 font-medium font-Urbanist">
                Gender Filter
              </label>
              <Select
                ref={genderRef}
                labelProps={{ className: "hidden" }}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-4 text-customBlack-100 w-full h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={filters.gender ? String(filters.gender) : ""}
                onChange={(val) => {
                  handleFilterChange("gender", val);
                  setGenderIx(false);
                }}
                selected={() => {
                  if (hasGenderValue) {
                    const genderLabel =
                      filters.gender === "0" ? "Female"
                      : filters.gender === "1" ? "Male"
                      : "All";
                    return (
                      <span className="text-[12px] font-Urbanist font-medium text-gray-400">
                        {genderLabel}
                      </span>
                    );
                  }
                  return (
                    <span className="text-[12px] font-Urbanist font-medium text-gray-400">
                      All
                    </span>
                  );
                }}
                onClick={() => clickSelect(genderRef, setGenderIx)}
                onFocus={() => setGenderIx(true)}
                containerProps={containerBlur(setGenderIx)}
              >
                <Option value="">All</Option>
                <Option value="0">Female</Option>
                <Option value="1">Male</Option>
              </Select>
              {/* <Select
                ref={genderRef}
                labelProps={{ className: "hidden" }}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-customBlack-100 w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={genderSelectValue}
                onChange={(val) => {
                  handleFilterChange("gender", val);
                  setGenderIx(false);
                }}
                selected={(optionEl) => {
                  if (hasGenderValue) return optionEl;
                  if (showGenderPh) {
                    return (
                      <span className="text-[12px] font-Urbanist font-medium text-gray-400">
                        Gender Filter
                      </span>
                    );
                  }
                  return (
                    <span className="text-[12px] font-Urbanist text-customBlack-100">
                      &nbsp;
                    </span>
                  );
                }}
                onClick={() => clickSelect(genderRef, setGenderIx)}
                onFocus={() => setGenderIx(true)}
                containerProps={containerBlur(setGenderIx)}
              >
                <Option value="">All</Option>
                <Option value="0">Female</Option>
                <Option value="1">Male</Option>
              </Select> */}
            </div>

            <div>
              <label className="text-customBlack-100 text-[12px] px-2 font-medium font-Urbanist">
                Age From
              </label>
              <Select
                ref={ageFromRef}
                labelProps={{ className: "hidden" }}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-4 text-gray-400 w-full h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={filters.age_from ? String(filters.age_from) : ""}
                onChange={(val) => {
                  handleFilterChange("age_from", val);
                  setAgeFromIx(false);
                }}
                selected={() => {
                  if (hasAgeFromValue) {
                    return (
                      <span className="text-[12px] font-Urbanist font-medium text-customBlack-100">
                        {filters.age_from}
                      </span>
                    );
                  }
                  if (showAgeFromPh) {
                    return (
                      <span className="text-[12px] font-Urbanist font-medium text-gray-400">
                        Age From
                      </span>
                    );
                  }
                  return (
                    <span className="text-[12px] font-Urbanist text-customBlack-100">
                      &nbsp;
                    </span>
                  );
                }}
                onClick={() => clickSelect(ageFromRef, setAgeFromIx)}
                onFocus={() => setAgeFromIx(true)}
                containerProps={containerBlur(setAgeFromIx)}
              >
                <Option value="">Age From</Option>
                {age.map((ageValue) => (
                  <Option key={`age-from-${ageValue}`} value={String(ageValue)}>
                    {ageValue}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-customBlack-100 text-[12px] px-2 font-medium font-Urbanist">
                Age To
              </label>
              <Select
                ref={ageToRef}
                labelProps={{ className: "hidden" }}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-4 text-customBlack-100 w-full h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={filters.age_to ? String(filters.age_to) : ""}
                onChange={(val) => {
                  handleFilterChange("age_to", val);
                  setAgeToIx(false);
                }}
                selected={() => {
                  if (hasAgeToValue) {
                    return (
                      <span className="text-[12px] font-Urbanist font-medium text-customBlack-100">
                        {filters.age_to}
                      </span>
                    );
                  }
                  if (showAgeToPh) {
                    return (
                      <span className="text-[12px] font-Urbanist font-medium text-gray-400">
                        Age To
                      </span>
                    );
                  }
                  return (
                    <span className="text-[12px] font-Urbanist text-customBlack-100">
                      &nbsp;
                    </span>
                  );
                }}
                onClick={() => clickSelect(ageToRef, setAgeToIx)}
                onFocus={() => setAgeToIx(true)}
                containerProps={containerBlur(setAgeToIx)}
              >
                <Option value="">Age To</Option>
                {age.map((ageValue) => (
                  <Option key={`age-to-${ageValue}`} value={String(ageValue)}>
                    {ageValue}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
          {talentPoolError ? (
            <div className="p-6 text-center text-red-500 text-sm font-Urbanist">
              {talentPoolError}
            </div>
          ) : (
            <div className="overflow-auto customScroll min-h-[calc(100vh-300px)]">
              <table className="w-full min-w-max text-left">
                <thead className="sticky top-0 z-20 bg-[#F8F9FA]">
                  <tr>
                    {talentHead?.map((head, i) => (
                      <th key={i} className="bg-[#F8F9FA] p-4">
                        <Typography className="font-medium leading-none text-customBlack-100 font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {talentPoolLoading && talentPoolPaginationData?.currentPage === 1 ? (
                    <TalentPoolTableSkeleton rows={8} />
                  ) : allTalentPool?.length === 0 ? (
                    <tr>
                      <td colSpan={talentHead?.length} className="p-6 text-center">
                        <Typography className="text-gray-500 font-Urbanist text-sm">
                          No record found
                        </Typography>
                      </td>
                    </tr>
                  ) : (
                    allTalentPool?.map((ele, index) => {
                      const isLast = index === allTalentPool?.length - 1;
                      const classes = isLast
                        ? "p-4"
                        : "p-4 border-b border-[#F2F2F9]";

                      return (
                        <tr key={index} className="hover:bg-brand-50/30 transition-colors">
                          <td className={classes}>
                            <div className="flex items-center gap-2">
                              <img
                                className="rounded-full w-[35px] h-[35px] object-cover"
                                src={
                                  ele?.candidate?.photo ||
                                  "https://elephant.veevotech.com/files/4f5449794e444d3d/9_ada242b8323e152.png"
                                }
                                alt={ele?.candidate?.name || "Profile"}
                              />
                              <Typography className="font-medium text-customBlack-100 font-Urbanist text-[clamp(12px,0.9vw,14px)] capitalize">
                                {ele?.candidate?.name || "--"}
                              </Typography>
                            </div>
                          </td>

                          <td className={classes}>
                            <Typography className="font-normal text-customBlack-100 font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize">
                              {ele?.candidate?.city?.city_name || "--"}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography className="font-normal text-customBlack-100 font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize">
                              {ele?.candidate?.cv_name ? (
                                <a
                                  href={`https://hiring.veevotech.com/candidate_cv/${ele.candidate.cv_folder}/${ele.candidate.cv_name}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FaEye className="text-[#3DA5F4] text-[20px] cursor-pointer" />
                                </a>
                              ) : (
                                "--"
                              )}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography className="font-normal text-customBlack-100 font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize">
                              {ele.talent || "--"}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography className="font-normal text-customBlack-100 font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize">
                              {ele.unix_timestamp
                                ? formatTimestamp(ele.unix_timestamp)
                                : "--"}
                            </Typography>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!talentPoolLoading && !talentPoolError && allTalentPool?.length > 0 && talentPoolPaginationData?.totalRecords > 10 && (
            <div className="w-full flex justify-center items-center gap-1 py-4 border-t border-gray-100">
              {talentPoolPaginationData.currentPage > 1 ? (
                <button className="px-3 py-2 cursor-pointer text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1" onClick={() => goToTalentPoolPage(talentPoolPaginationData.currentPage - 1)}>
                  <span>‹</span><span>Previous</span>
                </button>
              ) : (
                <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1"><span>‹</span><span>Previous</span></div>
              )}
              <div className="flex items-center gap-1">
                {(() => {
                  const { currentPage, totalPages } = talentPoolPaginationData;
                  const pages = totalPages <= 10
                    ? Array.from({ length: totalPages }, (_, i) => i + 1)
                    : (() => {
                        const p = [1];
                        if (currentPage > 3) p.push('…');
                        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) p.push(i);
                        if (currentPage < totalPages - 2) p.push('…');
                        p.push(totalPages);
                        return p;
                      })();
                  return pages.map((page, i) =>
                    typeof page === 'string' ? (
                      <span key={i} className="px-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8]">{page}</span>
                    ) : (
                      <button key={page} onClick={() => goToTalentPoolPage(page)}
                        className={`px-3 py-1.5 cursor-pointer text-[clamp(12px,1vw,14px)] rounded transition-colors ${page === currentPage ? 'bg-[#1a73e8] text-white font-medium' : 'text-[#1a73e8] hover:bg-gray-100'}`}>
                        {page}
                      </button>
                    )
                  );
                })()}
              </div>
              {talentPoolPaginationData.currentPage < talentPoolPaginationData.totalPages ? (
                <button className="px-3 py-2 cursor-pointer text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1" onClick={() => goToTalentPoolPage(talentPoolPaginationData.currentPage + 1)}>
                  <span>Next</span><span>›</span>
                </button>
              ) : (
                <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1"><span>Next</span><span>›</span></div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TalentPool;