import { Button, Option, Select, Typography } from "@material-tailwind/react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { getAllAge } from "../../services/__hireServices";
import { FaEye } from "react-icons/fa";
import { format, set } from "date-fns";
import useStore from "../../Store/store";
import { useTalentPoolServices } from "../../ViewModel/HireViewModel2/hireServices_2";
import useHire from "../../ViewModel/HireViewModel/HireServices";

import { TalentPoolTableSkeleton } from "./HireSkeletons";

const TalentPool = () => {
  const { getTalentPoolData, resetTalentPool } = useTalentPoolServices();
  const { GetLabel_def, Label_data } = useHire();
  // console.log('what is this', Label_data)
  // console.log('what is this', GetLabel_def)
  // console.log('what is this', Label_data)
  const allTalentPool = useStore((state) => state.allTalentPool);
  const talentPoolError = useStore((state) => state.talentPoolError);
  const talentPoolLoading = useStore((state) => state.talentPoolLoading);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    gender: "",
    age_from: "",
    age_to: "",
    label_id: "",
  });

  /** Placeholder UX (same as Vacancies Year/Month): outer label only; inner grey hint toggles with open/focus. */
  const [labelIx, setLabelIx] = useState(false);
  const [genderIx, setGenderIx] = useState(false);
  const [ageFromIx, setAgeFromIx] = useState(false);
  const [ageToIx, setAgeToIx] = useState(false);
  const [Label_data_1, setLabelData] = useState([]);
  // console.log('what is this', Label_data_1);

  const labelRef = useRef(null);
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

  const showLabelPh = !hasLabelFilterValue && !labelIx;
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
      const next = e.relatedTarget;
      if (next && e.currentTarget.contains(next)) return;
      setIx(false);
    },
  }), []);

  const genderSelectValue = hasGenderValue ? String(filters.gender) : "";

  useEffect(() => {
    // Initial load of talent pool data
    fetchData(filters);
    GetLabel_def();
    setLabelData(Label_data);

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
    const result = await getTalentPoolData(filterParams);
    if (result?.success && Array.isArray(result?.data)) {
      setHasMore(result.data.length === 10); // Assuming 10 items per page
    } else {
      setHasMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    const newFilters = { ...filters, page: nextPage };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const handleFilterChange = async (filterName, value) => {
    // Convert empty strings to undefined for API
    let apiValue = value === "" ? undefined : value;
    // Age selects: Option values must stay string (see Material Tailwind Select — internal indexOf(value) is strict)
    if (
      (filterName === "age_from" || filterName === "age_to") &&
      apiValue !== undefined
    ) {
      apiValue = String(apiValue);
    }

    const newFilters = {
      ...filters,
      page: 1, // Reset to first page when filter changes
      [filterName]: apiValue,
    };

    setCurrentPage(1);
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const talentHead = ["Candidate", "City", "CV", "Talent", "Added"];
  const age = getAllAge();

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp * 1000), "dd MMM yyyy");
  };

  return (
    <>
      <div className="pl-2 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                All Labels
              </label>
              <Select
                ref={labelRef}
                labelProps={{ className: "hidden" }}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={hasLabelFilterValue ? String(filters.label_id) : ""}
                onChange={(val) => {
                  handleFilterChange("label_id", val);
                  setLabelIx(true);
                }}
                selected={(optionEl) => {
                  if (hasLabelFilterValue) return optionEl;
                  if (showLabelPh) {
                    return (
                      <span className="text-[12px] font-Urbanist font-medium text-gray-400">
                        All Labels
                      </span>
                    );
                  }
                  return (
                    <span className="text-[12px] font-Urbanist text-[#474747]">
                      &nbsp;
                    </span>
                  );
                }}
                onClick={() => clickSelect(labelRef, setLabelIx)}
                onFocus={() => setLabelIx(true)}
                containerProps={containerBlur(setLabelIx)}
              >
                
                {
                  Label_data.length === 0 ? (
                    <Option value="" disabled>
                      No labels available
                    </Option>
                  ) : (
                    Label_data.map((label) => (
                      <Option key={label.id} value={String(label.id)}>
                        {label.label_name}
                      </Option>
                    ))
                  )
                }


                {/* <Option value="1">Label 1</Option>
                <Option value="2">Label 2</Option>
                <Option value="3">Label 3</Option> */}
              </Select>
            </div>

            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                Gender Filter
              </label>
              <Select
                ref={genderRef}
                labelProps={{ className: "hidden" }}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
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
                    <span className="text-[12px] font-Urbanist text-[#474747]">
                      &nbsp;
                    </span>
                  );
                }}
                onClick={() => clickSelect(genderRef, setGenderIx)}
                onFocus={() => setGenderIx(true)}
                containerProps={containerBlur(setGenderIx)}
              >
                <Option value="0">Female</Option>
                <Option value="1">Male</Option>
              </Select>
            </div>

            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                Age From
              </label>
              <Select
                ref={ageFromRef}
                labelProps={{ className: "hidden" }}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={
                  hasAgeFromValue ? String(filters.age_from) : ""
                }
                onChange={(val) => {
                  handleFilterChange("age_from", val);
                  setAgeFromIx(false);
                }}
                selected={(optionEl) => {
                  if (hasAgeFromValue) {
                    return (
                      optionEl ?? (
                        <span className="text-[12px] font-Urbanist font-medium text-[#474747]">
                          {filters.age_from}
                        </span>
                      )
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
                    <span className="text-[12px] font-Urbanist text-[#474747]">
                      &nbsp;
                    </span>
                  );
                }}
                onClick={() => clickSelect(ageFromRef, setAgeFromIx)}
                onFocus={() => setAgeFromIx(true)}
                containerProps={containerBlur(setAgeFromIx)}
              >
                {age.map((a, i) => (
                  <Option key={i} value={String(a)}>
                    {a}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                Age To
              </label>
              <Select
                ref={ageToRef}
                labelProps={{ className: "hidden" }}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={hasAgeToValue ? String(filters.age_to) : ""}
                onChange={(val) => {
                  handleFilterChange("age_to", val);
                  setAgeToIx(false);
                }}
                selected={(optionEl) => {
                  if (hasAgeToValue) {
                    return (
                      optionEl ?? (
                        <span className="text-[12px] font-Urbanist font-medium text-[#474747]">
                          {filters.age_to}
                        </span>
                      )
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
                    <span className="text-[12px] font-Urbanist text-[#474747]">
                      &nbsp;
                    </span>
                  );
                }}
                onClick={() => clickSelect(ageToRef, setAgeToIx)}
                onFocus={() => setAgeToIx(true)}
                containerProps={containerBlur(setAgeToIx)}
              >
                {age.map((a, i) => (
                  <Option key={i} value={String(a)}>
                    {a}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="pr-2">
          {talentPoolLoading && currentPage === 1 ? (
            <TalentPoolTableSkeleton rows={8} />
          ) : talentPoolError ? (
            <div className="text-center py-4 text-red-500">
              {talentPoolError}
            </div>
          ) : (
            <table className="w-full min-w-max text-left h-full text-[12px]">
              <thead className="sticky top-[0px] z-20">
                <tr>
                  {talentHead?.map((head, i) => (
                    <th
                      key={i}
                      className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70 capitalize"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTalentPool?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={talentHead?.length}
                      className="p-4 text-center"
                    >
                      No record found
                    </td>
                  </tr>
                ) : (
                  allTalentPool?.map((ele, index) => {
                    const isLast = index === allTalentPool?.length - 1;
                    const classes = isLast
                      ? "p-2"
                      : "p-2 border-b border-blue-gray-50";

                    return (
                      <tr key={index}>
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal text-[#4D7CFF]"
                          >
                            <div className="flex items-center gap-2">
                              <img
                                className="rounded-full w-[35px] h-[35px] object-cover"
                                src={
                                  ele?.candidate?.photo ||
                                  "https://elephant.veevotech.com/files/4f5449794e444d3d/9_ada242b8323e152.png"
                                }
                                alt={ele?.candidate?.name || "Profile"}
                              />
                              <span className="pl-[5px]">
                                {ele?.candidate?.name || "N/A"}
                              </span>
                            </div>
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {ele?.candidate?.city?.city_name || "N/A"}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {ele?.candidate?.cv_name ? (
                              <a
                                href={`https://hiring.veevotech.com/candidate_cv/${ele.candidate.cv_folder}/${ele.candidate.cv_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FaEye className="text-[#3DA5F4] text-[20px] cursor-pointer" />
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {ele.talent || "N/A"}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {ele.unix_timestamp
                              ? formatTimestamp(ele.unix_timestamp)
                              : "N/A"}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* Load More Button */}
          {!talentPoolLoading &&
            !talentPoolError &&
            hasMore &&
            allTalentPool?.length > 0 && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={handleLoadMore}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={talentPoolLoading}
                >
                  {talentPoolLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default TalentPool;