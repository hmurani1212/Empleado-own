import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import React, { useEffect } from "react";
import { FaHistory, FaCalendarAlt } from "react-icons/fa";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";
import BarChart from "./BarChart";
import GrossSalaryChart from "./GrossSalaryChart";
import NetSalaryChart from "./NetSalaryChart";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllYears } from "../../services/__appServicesData";
import { FaSackDollar } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";

const PayrollOverview = () => {
  const {
    grossNetValues,
    getDashboardData,
    payrollChartValues,
    handleChangeYear,
  } = usePayroll();
  // console.log('grossNetValues', grossNetValues)

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    getDashboardData(currentYear);
  }, []);
  const years = getAllYears();

  return (
    <>
      <div className="p-2 flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row lg:flex-row gap-4">
          <div>
            <Card className="w-[250px] bg-[#0ACF97] rounded-[15px] drop-shadow-sm py-2 px-4 ">
              <CardBody className="px-0 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center bg-white rounded-full p-2 h-[45px] w-[45px]">
                    <FaSackDollar className="text-[25px] text-[#0ACF97]" />
                  </div>
                  <div className="col-span-2">
                    <div className="text-[12px] text-white">
                      <div>
                        <span className="text-[16px] font-medium text-white font-Poppins">
                          Gross Salary
                        </span>
                      </div>
                      <div>
                        <span className="text-[14px] text-white font-Poppins font-light">
                          Previous Month
                        </span>
                      </div>
                      <div>
                        <span>{grossNetValues.gross}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          <div>
            <Card className="w-[250px] bg-bgBlue rounded-[15px] drop-shadow-sm py-2 px-4 ">
              <CardBody className="px-0 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex justify-center items-center bg-white rounded-full p-2 h-[45px] w-[45px]">
                    <IoStatsChart className="text-[25px] text-bgBlue" />
                  </div>
                  <div className="col-span-2">
                    <div className="text-[12px]">
                      <div>
                        <span className="text-[16px] font-medium text-white font-Poppins">
                          Net Salary
                        </span>
                      </div>
                      <div>
                        <span className="text-[14px] text-white font-Poppins font-light">
                          Previous Month
                        </span>
                      </div>
                      <div>
                        <span>{grossNetValues.net}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 ">
          {/* Left: Annual Gross Salary - spans 2 rows */}
          <div className="lg:row-span-2">
            <Card className="bg-white rounded-[10px] drop-shadow-sm h-full">
              <CardBody>
                <div className="flex justify-between items-center">
                  <div>
                    <Typography variant="h6" color="#474747" className="mb-2">
                      <span className="text-[16px] font-medium font-Poppins">
                        Annual Gross Salary
                      </span>
                    </Typography>
                  </div>

                  <div>
                    <CustomSelect
                      placeHolderTitle="Year"
                      value={payrollChartValues?.annual_year || { value: new Date().getFullYear(), label: String(new Date().getFullYear()) }}
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
                </div>

                <div className="h-screen">
                  <BarChart />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right top: Gross Salary */}
          <div>
            <Card className="bg-white rounded-[10px] drop-shadow-sm">
              <CardBody>
                <div className="flex justify-between items-center">
                  <div>
                    <Typography variant="h6" color="#474747" className="mb-2">
                      <span className="text-[16px] font-medium font-Poppins">
                        Gross Salary
                      </span>
                    </Typography>
                  </div>

                  <div>
                    <CustomSelect
                      placeHolderTitle="Year"
                      value={payrollChartValues?.gross_salary || payrollChartValues?.annual_year || { value: new Date().getFullYear(), label: String(new Date().getFullYear()) }}
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
                </div>

                <div>
                  <GrossSalaryChart />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right bottom: Net Salary */}
          <div>
            <Card className="bg-white rounded-[10px] drop-shadow-sm">
              <CardBody>
                <div className="flex justify-between items-center">
                  <div>
                    <Typography variant="h6" color="#474747" className="mb-2">
                      <span className="text-[16px] font-medium font-Poppins">
                        Net Salary
                      </span>
                    </Typography>
                  </div>

                  <div>
                    <CustomSelect
                      placeHolderTitle="Year"
                      value={payrollChartValues?.netSalary || { value: new Date().getFullYear(), label: String(new Date().getFullYear()) }}
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
                </div>

                <div>
                  <NetSalaryChart />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayrollOverview;