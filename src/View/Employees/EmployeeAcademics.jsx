import React, { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { showToast } from '../../Components/Toaster/Toaster';
import useStore from '../../Store/store';
import TailwindSelect from '../../Components/CustomSelect/TailwindSelect';

const EmployeeAcademics = ({
    employeeData,
    employeeId,
    openAcademicsDrawer,
    setOpenAcademicsDrawer,
    isUpdating,
    setIsUpdating,
    setEmployeeData,
    editingRecord,
    setEditingRecord,
    onDeleteAcademic
}) => {
    const addEmployeeEducation = useStore((state) => state.addEmployeeEducation);
    const gettingEmployeeProfile = useStore((state) => state.gettingEmployeeProfile);
    const degrees = useStore((state) => state.degrees);
    const isLoadingDegrees = useStore((state) => state.isLoadingDegrees);
    const getDegrees = useStore((state) => state.getDegrees);
    
    const [academicsForm, setAcademicsForm] = useState({
        degree: '',
        degreeTitle: '',
        studyType: 'Regular',
        obtainedMarks: '',
        grade: '',
        boardUniversity: '',
        passingYear: '',
        totalMarks: '',
        division: '',
        remarks: ''
    });

    // Transform degrees from API to select options format
    const degreeOptions = degrees.map(degree => ({
        value: String(degree.id),
        label: degree.program_name
    }));

    // Grade options - matching the form
    const gradeOptions = [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
        { value: 'E', label: 'E' },
        { value: 'F', label: 'F' }
    ];

    // Division options - matching the form (values 1, 2, 3)
    const divisionOptions = [
        { value: '1', label: '1st division' },
        { value: '2', label: '2nd division' },
        { value: '3', label: '3rd division' }
    ];

    // Fetch degrees when drawer opens
    useEffect(() => {
        if (openAcademicsDrawer && degrees.length === 0) {
            getDegrees();
        }
    }, [openAcademicsDrawer, degrees.length, getDegrees]);

    // Reset form when drawer closes or populate when editing
    useEffect(() => {
        if (!openAcademicsDrawer) {
            setAcademicsForm({
                degree: '',
                degreeTitle: '',
                studyType: 'Regular',
                obtainedMarks: '',
                grade: '',
                boardUniversity: '',
                passingYear: '',
                totalMarks: '',
                division: '',
                remarks: ''
            });
            setEditingRecord(null);
        } else if (editingRecord) {
            // Populate form with editing record data
            setAcademicsForm({
                degree: editingRecord.degree_id ? String(editingRecord.degree_id) : '',
                degreeTitle: editingRecord.major_subject || editingRecord.degree_title || '',
                studyType: editingRecord.study_type === '1' || editingRecord.study_type === 'regular' ? 'Regular' : 'Private',
                obtainedMarks: editingRecord.obtained_marks || editingRecord.obtained_marks_gpa || '',
                grade: editingRecord.grade || '',
                boardUniversity: editingRecord.board_univ || editingRecord.board_university || '',
                passingYear: editingRecord.passing_year || '',
                totalMarks: editingRecord.total_marks || editingRecord.total_marks_gpa || '',
                division: editingRecord.division ? String(editingRecord.division) : '',
                remarks: editingRecord.remarks || ''
            });
        }
    }, [openAcademicsDrawer, editingRecord]);

    const handleAcademicsChange = (field, value) => {
        setAcademicsForm(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const handleAcademicsSubmit = async () => {
        try {
            setIsUpdating(true);

            // Validate degree is selected
            if (!academicsForm.degree || !String(academicsForm.degree).trim()) {
                showToast('Degree is required', 'error');
                return;
            }

            // Form validation
            if (!academicsForm.degreeTitle || !String(academicsForm.degreeTitle).trim()) {
                showToast('Degree Title is required', 'error');
                return;
            }
            if (!academicsForm.obtainedMarks || !String(academicsForm.obtainedMarks).trim()) {
                showToast('Obtained Marks is required', 'error');
                return;
            }
            if (!academicsForm.totalMarks || !String(academicsForm.totalMarks).trim()) {
                showToast('Total Marks is required', 'error');
                return;
            }

            // Validate marks are numbers
            const obtainedMarksNumber = parseInt(academicsForm.obtainedMarks);
            const totalMarksNumber = parseInt(academicsForm.totalMarks);
            
            if (isNaN(obtainedMarksNumber) || obtainedMarksNumber < 0) {
                showToast('Obtained Marks must be a valid positive number', 'error');
                return;
            }
            if (isNaN(totalMarksNumber) || totalMarksNumber < 0) {
                showToast('Total Marks must be a valid positive number', 'error');
                return;
            }
            if (obtainedMarksNumber > totalMarksNumber) {
                showToast('Obtained Marks cannot be greater than Total Marks', 'error');
                return;
            }
            if (!academicsForm.grade || !String(academicsForm.grade).trim()) {
                showToast('Grade is required', 'error');
                return;
            }
            if (!academicsForm.boardUniversity || !String(academicsForm.boardUniversity).trim()) {
                showToast('Board/University is required', 'error');
                return;
            }
            if (!academicsForm.passingYear || !String(academicsForm.passingYear).trim()) {
                showToast('Passing Year is required', 'error');
                return;
            }

            // Validate passing year is a valid year
            const currentYear = new Date().getFullYear();
            const passingYear = parseInt(academicsForm.passingYear);
            
            if (isNaN(passingYear) || passingYear < 1950 || passingYear > currentYear + 5) {
                showToast('Passing Year must be a valid year between 1950 and ' + (currentYear + 5), 'error');
                return;
            }

            // Find the selected degree name from degrees array (from API)
            const selectedDegree = degrees.find(deg => String(deg.id) === academicsForm.degree);
            const degreeName = selectedDegree ? selectedDegree.program_name : '';

            // Prepare payload for add/update academic API
            // Backend requires degree_title (which is the major_subject/degreeTitle field)
            const payload = {
                degree_id: parseInt(academicsForm.degree), // Degree ID as number
                degree_name: degreeName, // Degree name (e.g., "B.Tech (Pass)")
                degree_title: academicsForm.degreeTitle, // Required by backend - this is the major subject
                passing_year: academicsForm.passingYear,
                major_subject: academicsForm.degreeTitle, // Also include major_subject for compatibility
                study_type: academicsForm.studyType.toLowerCase() === 'regular' ? '1' : '0', // Backend expects "1" for regular, "0" for private
                obtained_marks: obtainedMarksNumber,
                total_marks: totalMarksNumber,
                grade: academicsForm.grade,
                division: academicsForm.division ? parseInt(academicsForm.division) : null, // Division as number (1, 2, or 3)
                board_univ: academicsForm.boardUniversity || '', // Ensure it's not undefined
                remarks: academicsForm.remarks || ''
            };

            // Add operation and id for update
            if (editingRecord) {
                payload.operation = "update_academics";
                payload.id = editingRecord.id;
            }

            console.log('Submitting payload:', payload); // Debug log

            // Call the actual API
            const result = await addEmployeeEducation(employeeId, payload);

            console.log('API Response:', result); // Debug log

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast(editingRecord ? 'Academic record updated successfully' : 'Academic record added successfully', 'success');
                
                // Refresh employee profile data and update parent state
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        // console.log('Employee profile refreshed successfully');
                        
                        // Update the parent component's employeeData state
                        setEmployeeData(prevData => ({
                            ...prevData,
                            ...refreshedData.DB_DATA
                        }));
                    }
                } catch (refreshError) {
                    console.error('Error refreshing employee profile:', refreshError);
                    // Don't show error to user as the main operation was successful
                }
                
                setOpenAcademicsDrawer(false);
                
                // Reset form
                setAcademicsForm({
                    degree: '',
                    degreeTitle: '',
                    studyType: 'Regular',
                    obtainedMarks: '',
                    grade: '',
                    boardUniversity: '',
                    passingYear: '',
                    totalMarks: '',
                    division: '',
                    remarks: ''
                });
            } else {
                // Show specific error message from API
                const errorMessage = result?.ERROR_DESCRIPTION || result?.MESSAGE || 'Failed to add academic record';
                console.error('Error adding academic record:', result);
                showToast(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error adding academic record:', error);
            showToast('Failed to add academic record', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <PortalDrawer
            open={openAcademicsDrawer}
            closeDrawer={() => setOpenAcademicsDrawer(false)}
            title={editingRecord ? "Edit Academic Record" : "Add Employee Academics"}
            widthSize={1000}
            compo={
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Degree */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Degree <span className="text-red-500">*</span>
                                </label>
                                {isLoadingDegrees ? (
                                    <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                                        Loading degrees...
                                    </div>
                                ) : (
                                    <TailwindSelect
                                        value={academicsForm.degree || ""}
                                        options={degreeOptions}
                                        onChange={(selectedValue) => {
                                            handleAcademicsChange('degree', selectedValue);
                                        }}
                                        placeholder="Select Degree"
                                    />
                                )}
                            </div>

                            {/* Degree Title/Major Subjects */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Degree Title/Major Subjects <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={academicsForm.degreeTitle}
                                    onChange={(e) => handleAcademicsChange('degreeTitle', e.target.value)}
                                    placeholder="Enter degree title or major subjects"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>

                            {/* Study Type */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Study Type
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="studyType"
                                            value="Regular"
                                            checked={academicsForm.studyType === 'Regular'}
                                            onChange={(e) => handleAcademicsChange('studyType', e.target.value)}
                                            className="mr-2"
                                        />
                                        Regular
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="studyType"
                                            value="Private"
                                            checked={academicsForm.studyType === 'Private'}
                                            onChange={(e) => handleAcademicsChange('studyType', e.target.value)}
                                            className="mr-2"
                                        />
                                        Private
                                    </label>
                                </div>
                            </div>

                            {/* Obtained Marks/CGPA */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Obtained Marks/CGPA <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={academicsForm.obtainedMarks}
                                    onChange={(e) => handleAcademicsChange('obtainedMarks', e.target.value)}
                                    placeholder="Enter obtained marks (e.g., 850)"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>

                            {/* Grade */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Grade <span className="text-red-500">*</span>
                                </label>
                                <TailwindSelect
                                    value={academicsForm.grade || ""}
                                    options={gradeOptions}
                                    onChange={(selectedValue) => {
                                        handleAcademicsChange('grade', selectedValue);
                                    }}
                                    placeholder="Select Grade"
                                />
                            </div>

                            {/* Board/University */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Board/University <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={academicsForm.boardUniversity}
                                    onChange={(e) => handleAcademicsChange('boardUniversity', e.target.value)}
                                    placeholder="Enter board or university name"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Passing Year */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Passing Year <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1950"
                                    max={new Date().getFullYear() + 5}
                                    value={academicsForm.passingYear}
                                    onChange={(e) => handleAcademicsChange('passingYear', e.target.value)}
                                    placeholder="Enter passing year (e.g., 2022)"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>

                            {/* Total Marks/GPA */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Total Marks/GPA <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={academicsForm.totalMarks}
                                    onChange={(e) => handleAcademicsChange('totalMarks', e.target.value)}
                                    placeholder="Enter total marks (e.g., 1000)"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>

                            {/* Division */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Division
                                </label>
                                <TailwindSelect
                                    value={academicsForm.division || ""}
                                    options={divisionOptions}
                                    onChange={(selectedValue) => {
                                        handleAcademicsChange('division', selectedValue);
                                    }}
                                    placeholder="Select Division"
                                />
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Remarks
                                </label>
                                <textarea
                                    value={academicsForm.remarks}
                                    onChange={(e) => handleAcademicsChange('remarks', e.target.value)}
                                    placeholder="Enter any additional remarks"
                                    rows={4}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            color="gray"
                            variant="outlined"
                            onClick={() => setOpenAcademicsDrawer(false)}
                            disabled={isUpdating}
                            className="px-6 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            color="blue"
                            onClick={handleAcademicsSubmit}
                            disabled={isUpdating}
                            className="px-6 py-2"
                        >
                            {isUpdating ? (editingRecord ? 'Updating...' : 'Adding...') : (editingRecord ? 'Update Academic' : 'Add Academic')}
                        </Button>
                    </div>
                </div>
            }
        />
    );
};

export default EmployeeAcademics;
