import React, { useState, useEffect } from 'react';
import { Button, Typography, Card, CardBody } from '@material-tailwind/react';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import useStore from '../../Store/store';

const SalaryHistory = ({ employeeId, employeeData, isOpen, onClose }) => {
    const [salaryData, setSalaryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [increments, setIncrements] = useState([]);

    // Mock data for demonstration - replace with actual API call
    useEffect(() => {
        if (isOpen && employeeId) {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                setSalaryData({
                    startingSalary: 700000,
                    currentSalary: 700000
                });
                setIncrements([]); // Empty for now
                setLoading(false);
            }, 500);
        }
    }, [isOpen, employeeId]);

    const handleIncrement = () => {
        // Handle increment action
        // console.log('Increment clicked for employee:', employeeId);
    };

    const handleCancelIncrement = (incrementId) => {
        // Handle cancel increment action
        // console.log('Cancel increment:', incrementId);
    };

    return (
        <PortalDrawer
            open={isOpen}
            closeDrawer={onClose}
            title="Salary history"
            widthSize={800}
            compo={
                <div className="p-6 space-y-6">
                    {/* Salary Overview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <Typography variant="small" color="gray" className="mb-1">
                                Starting salary
                            </Typography>
                            <Typography variant="h6" color="blue-gray">
                                {loading ? 'Loading...' : (salaryData?.startingSalary || 0).toLocaleString()}
                            </Typography>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <Typography variant="small" color="gray" className="mb-1">
                                Current salary
                            </Typography>
                            <Typography variant="h6" color="blue-gray">
                                {loading ? 'Loading...' : (salaryData?.currentSalary || 0).toLocaleString()}
                            </Typography>
                        </div>
                    </div>

                    {/* Increment Button */}
                    <div className="flex justify-start">
                        <Button
                            color="blue"
                            onClick={handleIncrement}
                            disabled={loading}
                        >
                            Increment
                        </Button>
                    </div>

                    {/* Increments Table */}
                    <div>
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                            Salary Increments
                        </Typography>
                        
                        {loading ? (
                            <div className="text-center py-8">
                                <Typography color="gray">Loading salary history...</Typography>
                            </div>
                        ) : increments.length === 0 ? (
                            <div className="text-center py-8">
                                <Typography color="gray">No salary increments found</Typography>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-300 px-4 py-2 text-left">
                                                <Typography variant="small" color="gray">
                                                    Increment
                                                </Typography>
                                            </th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">
                                                <Typography variant="small" color="gray">
                                                    Salary
                                                </Typography>
                                            </th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">
                                                <Typography variant="small" color="gray">
                                                    Effective From
                                                </Typography>
                                            </th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">
                                                <Typography variant="small" color="gray">
                                                    Description
                                                </Typography>
                                            </th>
                                            <th className="border border-gray-300 px-4 py-2 text-left">
                                                <Typography variant="small" color="gray">
                                                    Cancel
                                                </Typography>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {increments.map((increment, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <Typography variant="small">
                                                        {increment.increment}
                                                    </Typography>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <Typography variant="small">
                                                        {increment.salary?.toLocaleString()}
                                                    </Typography>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <Typography variant="small">
                                                        {increment.effectiveFrom}
                                                    </Typography>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <Typography variant="small">
                                                        {increment.description}
                                                    </Typography>
                                                </td>
                                                <td className="border border-gray-300 px-4 py-2">
                                                    <Button
                                                        size="sm"
                                                        color="red"
                                                        variant="outlined"
                                                        onClick={() => handleCancelIncrement(increment.id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            }
        />
    );
};

export default SalaryHistory;
