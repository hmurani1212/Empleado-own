import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, CardBody, Badge, Select, Option } from '@material-tailwind/react';
import { FaArrowLeft, FaDownload, FaPrint, FaCalendar, FaMoneyBillWave, FaUser } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { showToast } from '../../Components/Toaster/Toaster';
import useStore from '../../Store/store';
import { formatTimestampToDate } from '../../services/__dateTimeServices';


const AdminEmployeePayslip = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState('');
    const [employeeData, setEmployeeData] = useState(null);
    const [payslipData, setPayslipData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get employee data from store
    const { gettingEmployeeById } = useStore();

    // Available months for payslip selection
    const availableMonths = [
        { value: '2024-01', label: 'January 2024' },
        { value: '2024-02', label: 'February 2024' },
        { value: '2024-03', label: 'March 2024' },
        { value: '2024-04', label: 'April 2024' },
        { value: '2024-05', label: 'May 2024' },
        { value: '2024-06', label: 'June 2024' },
        { value: '2024-07', label: 'July 2024' },
        { value: '2024-08', label: 'August 2024' },
        { value: '2024-09', label: 'September 2024' },
        { value: '2024-10', label: 'October 2024' },
        { value: '2024-11', label: 'November 2024' },
        { value: '2024-12', label: 'December 2024' },
    ];

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                setLoading(true);
                // Fetch employee data by ID
                if (gettingEmployeeById) {
                    const response = await gettingEmployeeById(employeeId);
                    if (response && response.data) {
                        setEmployeeData(response.data);
                    }
                } else {
                    // Mock data for demonstration
                    setEmployeeData({
                        id: employeeId,
                        name: "John Doe",
                        employee_id: "EMP001",
                        position: "Software Engineer",
                        department: "Engineering",
                        joining_date: "2023-01-15",
                        status: "Active"
                    });
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
                showToast('Failed to load employee data', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (employeeId) {
            fetchEmployeeData();
        }
    }, [employeeId, gettingEmployeeById]);

    useEffect(() => {
        if (selectedMonth) {
            fetchPayslipData();
        }
    }, [selectedMonth]);

    const fetchPayslipData = async () => {
        try {
            // Mock payslip data - replace with actual API call
            const mockPayslipData = {
                month: selectedMonth,
                employee_id: employeeData?.employee_id,
                basic_salary: 5000,
                allowances: {
                    housing: 1000,
                    transport: 500,
                    meal: 300,
                    other: 200
                },
                deductions: {
                    tax: 500,
                    insurance: 200,
                    pension: 300,
                    other: 100
                },
                overtime: 400,
                bonuses: 1000,
                net_salary: 7100,
                gross_salary: 8000,
                working_days: 22,
                total_days: 30,
                payment_date: "2024-01-31"
            };
            
            setPayslipData(mockPayslipData);
        } catch (error) {
            console.error('Error fetching payslip data:', error);
            showToast('Failed to load payslip data', 'error');
        }
    };

    const handleBack = () => {
        navigate('/employees/all_employess');
    };

    const handleDownload = () => {
        showToast('Download functionality coming soon', 'info');
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Typography variant="h6" color="gray" className="font-normal">
                    Loading employee data...
                </Typography>
            </div>
        );
    }

    if (!employeeData) {
        return (
            <div className="flex items-center justify-center h-64">
                <Typography variant="h6" color="gray" className="font-normal">
                    Employee not found
                </Typography>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 py-2 pb-1 pl-2 pr-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="text"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors p-2 cursor-pointer"
                        onClick={handleBack}
                    >
                        <FaArrowLeft className="text-sm" />
                        Back to Employees
                    </Button>
                    <div>
                        <Typography variant="h4" color="blue-gray" className="font-bold">
                            Employee Payslip
                        </Typography>
                        <Typography variant="small" color="gray">
                            Viewing payslip for {employeeData.name}
                        </Typography>
                    </div>
                </div>
            </div>

            {/* Employee Info Card */}
            <Card>
                <CardBody>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                                <FaUser className="text-white text-2xl" />
                            </div>
                            <div>
                                <Typography variant="h5" color="blue-gray" className="font-bold">
                                    {employeeData.name}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    {employeeData.position} • {employeeData.department}
                                </Typography>
                                <Typography variant="small" color="gray">
                                    Employee ID: {employeeData.employee_id}
                                </Typography>
                            </div>
                        </div>
                        <Badge 
                            color={employeeData.status === "Active" ? "green" : "red"}
                            className="w-fit"
                        >
                            {employeeData.status}
                        </Badge>
                    </div>
                </CardBody>
            </Card>

            {/* Month Selection */}
            <Card>
                <CardBody>
                    <div className="flex items-center gap-4">
                        <Typography variant="h6" color="blue-gray" className="font-medium">
                            Select Month:
                        </Typography>
                        <div className="w-64">
                            <Select
                                value={selectedMonth}
                                onChange={(value) => setSelectedMonth(value)}
                                label="Select Month"
                            >
                                {availableMonths.map((month) => (
                                    <Option key={month.value} value={month.value}>
                                        {month.label}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Payslip Details */}
            {payslipData && (
                <Card className="print:p-0">
                    <CardBody>
                        <div className="flex items-center justify-between mb-6">
                            <Typography variant="h4" color="blue-gray" className="font-bold">
                                Payslip - {payslipData.month}
                            </Typography>
                            <div className="flex gap-2 print:hidden">
                                <Button
                                    variant="outlined"
                                    className="flex items-center gap-2"
                                    onClick={handleDownload}
                                >
                                    <FaDownload className="text-sm" />
                                    Download
                                </Button>
                                <Button
                                    variant="outlined"
                                    className="flex items-center gap-2"
                                    onClick={handlePrint}
                                >
                                    <FaPrint className="text-sm" />
                                    Print
                                </Button>
                            </div>
                        </div>

                        {/* Payslip Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Earnings */}
                            <Card>
                                <CardBody>
                                    <Typography variant="h6" color="blue-gray" className="font-bold mb-4">
                                        Earnings
                                    </Typography>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Basic Salary
                                            </Typography>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                ${payslipData.basic_salary.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Housing Allowance
                                            </Typography>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                ${payslipData.allowances.housing.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Transport Allowance
                                            </Typography>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                ${payslipData.allowances.transport.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Meal Allowance
                                            </Typography>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                ${payslipData.allowances.meal.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Other Allowances
                                            </Typography>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                ${payslipData.allowances.other.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Overtime
                                            </Typography>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                ${payslipData.overtime.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Bonuses
                                            </Typography>
                                            <Typography variant="small" color="blue-gray" className="font-medium">
                                                ${payslipData.bonuses.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="flex justify-between">
                                            <Typography variant="h6" color="blue-gray" className="font-bold">
                                                Gross Salary
                                            </Typography>
                                            <Typography variant="h6" color="blue-gray" className="font-bold">
                                                ${payslipData.gross_salary.toLocaleString()}
                                            </Typography>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Deductions */}
                            <Card>
                                <CardBody>
                                    <Typography variant="h6" color="blue-gray" className="font-bold mb-4">
                                        Deductions
                                    </Typography>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Tax
                                            </Typography>
                                            <Typography variant="small" color="red" className="font-medium">
                                                -${payslipData.deductions.tax.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Insurance
                                            </Typography>
                                            <Typography variant="small" color="red" className="font-medium">
                                                -${payslipData.deductions.insurance.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Pension
                                            </Typography>
                                            <Typography variant="small" color="red" className="font-medium">
                                                -${payslipData.deductions.pension.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <div className="flex justify-between">
                                            <Typography variant="small" color="gray">
                                                Other Deductions
                                            </Typography>
                                            <Typography variant="small" color="red" className="font-medium">
                                                -${payslipData.deductions.other.toLocaleString()}
                                            </Typography>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="flex justify-between">
                                            <Typography variant="h6" color="red" className="font-bold">
                                                Total Deductions
                                            </Typography>
                                            <Typography variant="h6" color="red" className="font-bold">
                                                -${(payslipData.deductions.tax + payslipData.deductions.insurance + payslipData.deductions.pension + payslipData.deductions.other).toLocaleString()}
                                            </Typography>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Net Salary */}
                        <Card className="mt-6 bg-blue-50">
                            <CardBody>
                                <div className="flex justify-between items-center">
                                    <Typography variant="h5" color="blue-gray" className="font-bold">
                                        Net Salary
                                    </Typography>
                                    <Typography variant="h4" color="blue" className="font-bold">
                                        ${payslipData.net_salary.toLocaleString()}
                                    </Typography>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <Card>
                                <CardBody>
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCalendar className="text-blue-500" />
                                        <Typography variant="small" color="gray">
                                            Working Days
                                        </Typography>
                                    </div>
                                    <Typography variant="h6" color="blue-gray" className="font-bold">
                                        {payslipData.working_days} / {payslipData.total_days}
                                    </Typography>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaMoneyBillWave className="text-green-500" />
                                        <Typography variant="small" color="gray">
                                            Payment Date
                                        </Typography>
                                    </div>
                                    <Typography variant="h6" color="blue-gray" className="font-bold">
                                        {formatTimestampToDate(payslipData.payment_date)}
                                    </Typography>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaUser className="text-purple-500" />
                                        <Typography variant="small" color="gray">
                                            Employee ID
                                        </Typography>
                                    </div>
                                    <Typography variant="h6" color="blue-gray" className="font-bold">
                                        {payslipData.employee_id}
                                    </Typography>
                                </CardBody>
                            </Card>
                        </div>
                    </CardBody>
                </Card>
            )}

            {!payslipData && selectedMonth && (
                <Card>
                    <CardBody>
                        <div className="text-center py-8">
                            <Typography variant="h6" color="gray" className="font-normal">
                                No payslip data available for {selectedMonth}
                            </Typography>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default AdminEmployeePayslip;
