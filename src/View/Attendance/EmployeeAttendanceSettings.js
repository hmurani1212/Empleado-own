import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button, Table, Spinner, Alert } from 'reactstrap';
import { FaClock, FaUserClock, FaCalendarAlt } from 'react-icons/fa';
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices';

const EmployeeAttendanceSettings = ({ empId, empName }) => {
    const { 
        employeeRecentRecords, 
        loadingRecentRecords, 
        getEmployeeRecentRecords 
    } = useAttendance();

    const [selectedEmpId, setSelectedEmpId] = useState(empId || '');

    useEffect(() => {
        if (selectedEmpId) {
            getEmployeeRecentRecords(selectedEmpId);
        }
    }, [selectedEmpId]);

    // Helper function to convert timestamp to readable date/time
    const formatTimestamp = (timestamp) => {
        if (!timestamp || timestamp === 0) return 'N/A';
        
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Helper function to calculate duration
    const calculateDuration = (inTime, outTime) => {
        if (!inTime || !outTime || inTime === 0 || outTime === 0) return 'N/A';
        
        const durationMs = (outTime - inTime) * 1000;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    };

    // Helper function to get attendance status
    const getAttendanceStatus = (record) => {
        if (record.out_1 === 0) return 'Present (No Out Time)';
        if (record.in_1 > 0 && record.out_1 > 0) return 'Present';
        return 'Absent';
    };

    const handleRefresh = () => {
        if (selectedEmpId) {
            getEmployeeRecentRecords(selectedEmpId);
        }
    };

    return (
        <div className="employee-attendance-settings">
            <Card>
                <CardHeader className="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0">
                            <FaUserClock className="me-2" />
                            Employee Attendance Settings
                        </h5>
                        {empName && (
                            <small className="text-muted">Employee: {empName}</small>
                        )}
                    </div>
                    <div className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Employee ID"
                            value={selectedEmpId}
                            onChange={(e) => setSelectedEmpId(e.target.value)}
                            style={{ width: '200px' }}
                        />
                        <Button 
                            color="primary" 
                            onClick={handleRefresh}
                            disabled={loadingRecentRecords || !selectedEmpId}
                        >
                            {loadingRecentRecords ? <Spinner size="sm" /> : 'Refresh'}
                        </Button>
                    </div>
                </CardHeader>
                
                <CardBody>
                    {loadingRecentRecords ? (
                        <div className="text-center py-4">
                            <Spinner color="primary" />
                            <p className="mt-2">Loading attendance records...</p>
                        </div>
                    ) : employeeRecentRecords.length === 0 ? (
                        <Alert color="info">
                            <FaCalendarAlt className="me-2" />
                            No attendance records found for the selected employee.
                        </Alert>
                    ) : (
                        <div>
                            <div className="mb-3">
                                <h6>
                                    <FaClock className="me-2" />
                                    Last 10 Days Attendance Records
                                </h6>
                                <small className="text-muted">
                                    Total Records: {employeeRecentRecords.length}
                                </small>
                            </div>
                            
                            <div className="table-responsive">
                                <Table striped hover className="mb-0">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>#</th>
                                            <th>Date</th>
                                            <th>In Time</th>
                                            <th>Out Time</th>
                                            <th>Duration</th>
                                            <th>Status</th>
                                            <th>In 2</th>
                                            <th>Out 2</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employeeRecentRecords.map((record, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    {formatTimestamp(record.in_1).split(' ')[0]} {/* Date only */}
                                                </td>
                                                <td>
                                                    <span className={`badge ${record.in_1 > 0 ? 'bg-success' : 'bg-secondary'}`}>
                                                        {formatTimestamp(record.in_1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${record.out_1 > 0 ? 'bg-info' : 'bg-secondary'}`}>
                                                        {formatTimestamp(record.out_1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-muted">
                                                        {calculateDuration(record.in_1, record.out_1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        getAttendanceStatus(record) === 'Present' ? 'bg-success' : 
                                                        getAttendanceStatus(record) === 'Present (No Out Time)' ? 'bg-warning' : 'bg-danger'
                                                    }`}>
                                                        {getAttendanceStatus(record)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${record.in_2 > 0 ? 'bg-success' : 'bg-secondary'}`}>
                                                        {formatTimestamp(record.in_2)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${record.out_2 > 0 ? 'bg-info' : 'bg-secondary'}`}>
                                                        {formatTimestamp(record.out_2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default EmployeeAttendanceSettings;
