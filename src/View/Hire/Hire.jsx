import { Button } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import CustomCard from "../../Components/CustomCard/CustomCard";
import useHire from "../../ViewModel/HireViewModel/HireServices";
//getVacanciesWithFilters
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useHireNewVacancy from "../../ViewModel/HireViewModel/HireNewVacancy";
import { Link } from "react-router-dom";
import { getUserData } from "../../Authentication/jwt_decode";
import CustomButton from "../../Components/CustomButton/CustomButton";
import useStore from "../../Store/store";
import { HireDashboardCardsSkeleton } from "./HireSkeletons";
import HireCareerSettingsModal from "./HireCareerSettingsModal";

const Hire = ({ data }) => {
  // Console log the props data
  // console.log("Hire component props data:", data?.response?.DB_DATA);
  const {
    hireMenu,
    hireCardList,
    get_record,
    handleNavCards,
  } = useHire();

  // const { allVacanciesList_data } = useHire_2();
  // console.log('allVacanciesList_data', allVacanciesList_data)
  // console.log("allVacanciesList", allVacanciesList_data.total_applications);

  const { createVacancy } = useHireNewVacancy();
  const hireCountsLoading = useStore((state) => state.hireCountsLoading);
  const location = useLocation();
  const navigate = useNavigate();
  const [careerSettingsOpen, setCareerSettingsOpen] = useState(false);

  const handleHireNavClickCards = (e, link, id) => {
    e.preventDefault();
    navigate(link);
    handleNavCards(id);
  };

  const token_data = getUserData();
  /// console.log('what is the testttt', token_data?.org_id)

  let org_id;
  if (token_data !== undefined) {
    org_id = token_data?.org_id;
  } else {
    org_id = 123;
  }
  // console.log("org_oneid", org_oneid)

  const handleHireNavClick = (e, link, id) => {
    e.preventDefault();
    navigate(link);
    // Removed gettingTalentPoolData() call as TalentPool component manages its own data fetching
  };

  // useEffect((
  //   getVacanciesWithFilters()
  // ),[]);
  useEffect(() => {
    get_record();
  }, []);

  const jwt = localStorage.getItem("jwt");

  // console.log("cardValues:", cardValues);

  // hireCardList.map((data) => {
  //   console.log("data", data)
  // })

  return (
    <div className="flex flex-col py-6 px-3 sm:px-4 gap-6 min-h-screen bg-background w-full max-w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight font-Urbanist">Hire Management</h1>
          <p className="text-sm text-gray-500">Manage vacancies, applicants, and the hiring pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="bg-[#8bc9f8] capitalize px-4 py-2.5 font-medium shadow-sm h-10 min-w-[140px] text-white"
            onClick={() => setCareerSettingsOpen(true)}
          >
            Career Page Settings
          </Button>
          <CustomButton
            className="bg-[#8bc9f8] capitalize px-4 py-2.5 font-medium justify-center shadow-sm h-10 min-w-[140px]"
            onClick={createVacancy}
            title="Announce new Vacancy"
          />
          <Link to={`https://hiring.veevotech.com/company/${org_id}/veevo-tech`} target="_blank">
            <Button className="bg-[#8bc9f8] capitalize px-4 py-2.5 font-medium shadow-sm h-10 min-w-[140px] text-white cursor-pointer">
              Career Page
            </Button>
          </Link>
        </div>
      </div>

      <HireCareerSettingsModal
        openDialog={careerSettingsOpen}
        onClose={() => setCareerSettingsOpen(false)}
      />

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {hireCountsLoading ? (
          <HireDashboardCardsSkeleton />
        ) : (
          hireCardList.map((item, idx) => (
            <NavLink
              key={item.id}
              to={item.link || "#"}
              className="block w-full min-w-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              onClick={(e) => handleHireNavClickCards(e, item.link, item.id)}
            >
              <CustomCard
                image={item.imgSrc}
                title={item.title}
                backgroundColor={item.legendBg}
                count={item.count}
              />
            </NavLink>
          ))
        )}
      </div>

      {/* Sub Navigation */}
      <div className="flex flex-col gap-2 pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-5 px-3 py-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            {hireMenu.map((ele) => (
              <NavLink
                key={ele.id}
                className={`${
                  location.pathname === ele.link
                    ? "text-white"
                    : "hover:text-[#474747]/60 text-[#474747]"
                } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                style={{ WebkitTapHighlightColor: "transparent" }}
                onClick={(e) => handleHireNavClick(e, ele.link, ele.id)}
              >
                {location.pathname === ele.link && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 z-10 bg-[#8bc9f8]"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative cursor-pointer text-[14px] z-20">
                  {ele.title}
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Hire;
