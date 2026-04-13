import { Button } from "@material-tailwind/react";
import React, { useEffect } from "react";
import CustomCard from "../../Components/CustomCard/CustomCard";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
//getVacanciesWithFilters
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useHireNewVacancy from "../../ViewModel/HireViewModel/HireNewVacancy";
import { Link } from "react-router-dom";
import { getUserData } from "../../Authentication/jwt_decode";
import CustomButton from "../../Components/CustomButton/CustomButton";
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
  const location = useLocation();
  const navigate = useNavigate();

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
    <>
      {/* Match Dashboard stat grid: fluid columns, consistent gap */}
      <div className="w-full py-2 pb-1 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {hireCardList.map((item, idx) => (
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
                count={item.count} // Properly mapped values for each card
              />
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center mt-8 sm:mt-10 gap-3 sm:gap-4 w-full">
        <CustomButton
          className="bg-[#8bc9f8] capitalize p-2 font-medium w-full sm:w-auto justify-center"
          onClick={createVacancy}
          title="Announce new Vacancy"
        >
          {/* Announce new Vacancy */}
        </CustomButton>

        {/* <Button
          className="bg-[#FF6B6B] capitalize p-2 font-medium"
          onClick={() => openHireEmployeeDrawer()}
        >
          Hire Employee
        </Button> */}

        {/* Tooba */}
        {/* Career Page */}
        {/* <Link to={`http://172.18.0.44:6180?token=${jwt}`} target="_blank" className="w-full sm:w-auto">
          <Button className="bg-[#0ACF97] capitalize p-2 font-medium w-full sm:w-auto">
            Career Page
          </Button>
        </Link> */}
        <Link to={`https://hiring.veevotech.com/company/${org_id}/veevo-tech`} target="_blank">
            <Button className="bg-[#0ACF97] capitalize p-3  font-medium">
              Career Page
            </Button>
          </Link>
      </div>

      <div className="flex flex-col gap-2 pb-3 mt-[20px]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-5 px-3 py-5">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            {hireMenu.map((ele) => (
              <NavLink
                key={ele.id}
                className={`${location.pathname === ele.link
                    ? "text-white"
                    : "hover:text-[#474747]/60 text-[#474747]"
                  } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
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
    </>
  );
};

export default Hire;
