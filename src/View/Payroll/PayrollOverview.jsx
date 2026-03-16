import { Card, CardBody, Typography } from "@material-tailwind/react";
import React, { useEffect, useRef } from "react";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";
import { PayrollOverviewSkeleton } from "./PayrollSkeletons";
import BarChart from "./BarChart";
import GrossSalaryChart from "./GrossSalaryChart";
import NetSalaryChart from "./NetSalaryChart";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllYears } from "../../services/__appServicesData";
import { FaSackDollar } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const PayrollOverview = () => {
  const {
    grossNetValues,
    getDashboardData,
    payrollChartValues,
    handleChangeYear,
    payrollOverviewLoading,
  } = usePayroll();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    const currentYear = new Date().getFullYear();
    getDashboardData(currentYear);
  }, [getDashboardData]);
  const years = getAllYears();

  if (payrollOverviewLoading) {
    return <PayrollOverviewSkeleton />;
  }

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="relative rounded-2xl shadow-card border border-gray-100 overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600">
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none z-0" aria-hidden />
            <CardBody className="relative z-10 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex justify-center items-center bg-white/95 rounded-xl p-3 h-12 w-12 shadow-sm backdrop-blur-sm">
                    <FaSackDollar className="text-2xl text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-emerald-50 font-semibold text-base font-poppins">
                      Gross Salary
                    </p>
                    <p className="text-white/80 text-sm font-poppins font-normal mt-0.5">
                      Previous Month
                    </p>
                    <p className="text-white font-bold text-xl mt-1 font-poppins tabular-nums">
                      {grossNetValues.gross ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="relative rounded-2xl shadow-card border border-gray-100 overflow-hidden bg-gradient-to-br from-[#3da5f4] to-blue-600">
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none z-0" aria-hidden />
            <CardBody className="relative z-10 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex justify-center items-center bg-white/95 rounded-xl p-3 h-12 w-12 shadow-sm backdrop-blur-sm">
                    <IoStatsChart className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-50 font-semibold text-base font-poppins">
                      Net Salary
                    </p>
                    <p className="text-white/80 text-sm font-poppins font-normal mt-0.5">
                      Previous Month
                    </p>
                    <p className="text-white font-bold text-xl mt-1 font-poppins tabular-nums">
                      {grossNetValues.net ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual Gross Salary - full height on left */}
        <motion.div variants={itemVariants} className="lg:row-span-2">
          <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden h-full bg-white">
            <CardBody className="p-5">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <Typography className="text-gray-800 font-semibold text-base font-poppins">
                  Annual Gross Salary
                </Typography>
                <CustomSelect
                  placeHolderTitle="Year"
                  value={
                    payrollChartValues?.annual_year || {
                      value: new Date().getFullYear(),
                      label: String(new Date().getFullYear()),
                    }
                  }
                  options={years.map((year) => ({
                    value: year,
                    label: String(year),
                  }))}
                  customStyles={false}
                  onChangeHandler={(selectedOption) =>
                    handleChangeYear(selectedOption, "annual_year")
                  }
                />
              </div>
              <div className="min-h-[320px] h-[380px]">
                <BarChart />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Gross Salary chart */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden bg-white">
            <CardBody className="p-5">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <Typography className="text-gray-800 font-semibold text-base font-poppins">
                  Gross Salary
                </Typography>
                <CustomSelect
                  placeHolderTitle="Year"
                  value={
                    payrollChartValues?.gross_salary ||
                    payrollChartValues?.annual_year || {
                      value: new Date().getFullYear(),
                      label: String(new Date().getFullYear()),
                    }
                  }
                  options={years.map((year) => ({
                    value: year,
                    label: String(year),
                  }))}
                  customStyles={false}
                  onChangeHandler={(selectedOption) =>
                    handleChangeYear(selectedOption, "gross_salary")
                  }
                />
              </div>
              <div className="min-h-[200px]">
                <GrossSalaryChart />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Net Salary chart */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden bg-white">
            <CardBody className="p-5">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <Typography className="text-gray-800 font-semibold text-base font-poppins">
                  Net Salary
                </Typography>
                <CustomSelect
                  placeHolderTitle="Year"
                  value={
                    payrollChartValues?.netSalary || {
                      value: new Date().getFullYear(),
                      label: String(new Date().getFullYear()),
                    }
                  }
                  options={years.map((year) => ({
                    value: year,
                    label: String(year),
                  }))}
                  customStyles={false}
                  onChangeHandler={(selectedOption) =>
                    handleChangeYear(selectedOption, "netSalary")
                  }
                />
              </div>
              <div className="min-h-[200px]">
                <NetSalaryChart />
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PayrollOverview;
