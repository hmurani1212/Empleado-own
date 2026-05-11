import { Card, CardBody, Typography } from "@material-tailwind/react";
import React, { useEffect, useRef } from "react";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";
import { PayrollOverviewSkeleton } from "./PayrollSkeletons";
import PayrollMetricChart from "./PayrollMetricChart";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllYears } from "../../services/__appServicesData";
import { FaHandHoldingDollar, FaMoneyBillTrendUp, FaWallet } from "react-icons/fa6";
import { IoStatsChart, IoShieldCheckmarkSharp } from "react-icons/io5";
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
    gross_label,
    gross_value,
    net_salary_label,
    net_salary_value,
    eobi_label,
    eobi_value,
    provident_fund_label,
    provident_fund_value,
    eobi_total,
    provident_fund_total,
  } = usePayroll();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    const currentYear = new Date().getFullYear();
    getDashboardData(currentYear);
  }, [getDashboardData]);
  const years = getAllYears();
  const selectedYear =
    payrollChartValues?.gross_salary || {
      value: new Date().getFullYear(),
      label: String(new Date().getFullYear()),
    };

  const statCardShell =
    "rounded-2xl shadow-card bg-white border border-gray-200 overflow-hidden";

  const cardStats = [
    {
      title: "Gross Salary",
      subtitle: "Yearly Total",
      value: grossNetValues?.gross,
      icon: <FaMoneyBillTrendUp className="text-2xl text-bgBlue" />,
    },
    {
      title: "Net Salary",
      subtitle: "Yearly Total",
      value: grossNetValues?.net,
      icon: <IoStatsChart className="text-2xl text-bgBlue" />,
    },
    {
      title: "EOBI",
      subtitle: "Yearly Total",
      value: eobi_total,
      icon: <IoShieldCheckmarkSharp className="text-2xl text-bgBlue" />,
    },
    {
      title: "Provident Fund",
      subtitle: "Yearly Total",
      value: provident_fund_total,
      icon: <FaHandHoldingDollar className="text-2xl text-bgBlue" />,
    },
  ];

  const chartCards = [
    {
      title: "Gross Salary Trend",
      keyName: "gross_salary",
      labels: gross_label,
      values: gross_value,
      borderColor: "#10b981",
      backgroundColor: "rgba(16,185,129,0.15)",
    },
    {
      title: "Net Salary Trend",
      keyName: "netSalary",
      labels: net_salary_label,
      values: net_salary_value,
      borderColor: "#2563eb",
      backgroundColor: "rgba(37,99,235,0.15)",
    },
    {
      title: "EOBI Trend",
      keyName: "eobiSalary",
      labels: eobi_label,
      values: eobi_value,
      borderColor: "#7c3aed",
      backgroundColor: "rgba(124,58,237,0.15)",
    },
    {
      title: "Provident Fund Trend",
      keyName: "providentFund",
      labels: provident_fund_label,
      values: provident_fund_value,
      borderColor: "#d97706",
      backgroundColor: "rgba(217,119,6,0.15)",
    },
  ];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cardStats.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <Card className={statCardShell}>
              <CardBody className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex justify-center items-center shrink-0 bg-blue-50 rounded-xl p-3 h-12 w-12 shadow-sm border border-blue-100">
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-semibold text-base font-poppins">
                      {card.title}
                    </p>
                    <p className="text-sm text-gray-500 font-poppins mt-0.5">
                      {card.subtitle}
                    </p>
                    <p className="text-gray-900 font-bold text-xl mt-1 font-poppins tabular-nums">
                      {typeof card.value === "number" ? card.value.toLocaleString() : "—"}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {chartCards.map((chart) => (
          <motion.div key={chart.title} variants={itemVariants}>
            <Card className="rounded-2xl shadow-card border border-gray-200 overflow-hidden bg-white">
              <CardBody className="p-5">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                  <Typography className="text-gray-800 font-semibold text-base font-poppins">
                    {chart.title}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <FaWallet className="text-slate-500 text-sm" />
                    <CustomSelect
                      placeHolderTitle="Year"
                      value={payrollChartValues?.[chart.keyName] || selectedYear}
                      options={years.map((year) => ({
                        value: year,
                        label: String(year),
                      }))}
                      customStyles={false}
                      onChangeHandler={(selectedOption) =>
                        handleChangeYear(selectedOption, chart.keyName)
                      }
                    />
                  </div>
                </div>
                <PayrollMetricChart
                  title={chart.title}
                  labels={chart.labels}
                  values={chart.values}
                  borderColor={chart.borderColor}
                  backgroundColor={chart.backgroundColor}
                />
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PayrollOverview;
