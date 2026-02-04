import { Button, Option, Select, Typography } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import { getAllAge } from "../../services/__hireServices";
import { FaEye } from "react-icons/fa";
import { format } from "date-fns";
import useStore from "../../Store/store";
import { useTalentPoolServices } from "../../ViewModel/HireViewModel2/hireServices_2";

const TalentPool = () => {
  const { getTalentPoolData, resetTalentPool } = useTalentPoolServices();
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

  useEffect(() => {
    // Initial load of talent pool data
    fetchData(filters);

    // Cleanup on unmount
    return () => {
      resetTalentPool();
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
    const apiValue = value === "" ? undefined : value;

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
                label="Label Filter"
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={filters.label_id || ""}
                onChange={(val) => handleFilterChange("label_id", val)}
              >
                {/* <Option value="">All Labels</Option> */}
                <Option value="1">Label 1</Option>
                <Option value="2">Label 2</Option>
                <Option value="3">Label 3</Option>
              </Select>
            </div>

            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                Gender Filter
              </label>
              <Select
                label="Gender Filter"
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={filters.gender || ""}
                onChange={(val) => handleFilterChange("gender", val)}
              >
                {/* <Option value="">All Genders</Option> */}
                <Option value="0">Female</Option>
                <Option value="1">Male</Option>
              </Select>
            </div>

            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                Age From
              </label>
              <Select
                label="Age From"
                // labelProps={{className: "hidden"}}
                color="blue"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={filters?.age_from}
                onChange={(val) => handleFilterChange("age_from", val)}
              >
                {/* <Option>Any Age</Option> */}
                {age.map((age, i) => (
                  <Option key={i} value={age}>
                    {age}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
                Age To
              </label>
              <Select
                color="blue"
                label="Age To"
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                value={filters.age_to || ""}
                onChange={(val) => handleFilterChange("age_to", val)}
              >
                {/* <Option value="">Any Age</Option> */}
                {age.map((age, i) => (
                  <Option key={i} value={age}>
                    {age}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="pr-2">
          {talentPoolLoading && currentPage === 1 ? (
            <div className="text-center py-4">Loading...</div>
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
                                href={ele.candidate.cv_name}
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