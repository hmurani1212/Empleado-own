import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    Typography,
    Button,
    Card,
    CardBody,
    Avatar,
    Badge,
    Tabs,
    TabsHeader,
    Tab,
    Input,
    Select,
    Option,
    Textarea,
    Radio,
    Spinner,
} from "@material-tailwind/react";
import {
    FaArrowLeft,
    FaTrophy,
    FaUser,
    FaMobile,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaCalendar,
    FaIdCard,
    FaBuilding,
    FaUsers,
    FaBriefcase,
    FaFileAlt,
    FaShieldAlt,
    FaClock,
    FaListUl,
    FaUserShield,
    FaTasks,
    FaRocket,
    FaPen,
    FaEdit,
    FaPassport,
    FaHeart,
    FaCity,
    FaUserTie,
    FaFileContract,
    FaTrash,
    FaTimes,
    FaChevronDown,
    FaChevronUp,
    FaLaptop,
    FaChartLine,
    FaEye,
} from "react-icons/fa";
// import FaTimes from "react-icons/fa";
import { BsPersonGear } from "react-icons/bs";
import { CiBank } from "react-icons/ci";
import { FcDepartment } from "react-icons/fc";
import { FaHeartCrack } from "react-icons/fa6";
import { MdBarChart } from "react-icons/md";
import { PiLockBold } from "react-icons/pi";
import { CgCalendarDates } from "react-icons/cg";
import { BsCardText } from "react-icons/bs";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { FaCodeBranch } from "react-icons/fa";
import { FaMoneyBills } from "react-icons/fa6";
import { FaPersonHalfDress } from "react-icons/fa6";
import { IoTimerOutline } from "react-icons/io5";
import { MdFileOpen } from "react-icons/md";
import { LuFingerprint } from "react-icons/lu";
import { MdWatchLater } from "react-icons/md";
import { BsPersonCircle } from "react-icons/bs";
import { FaRegPenToSquare } from "react-icons/fa6";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { showToast } from "../../Components/Toaster/Toaster";
import useStore from "../../Store/store";
import { formatTimestampToDate } from "../../services/__dateTimeServices";
import { format, parse, isValid } from "date-fns";
import { convertToYMD } from "../../services/EmpServices";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";
import useDashboard from "../../ViewModel/DashboardViewModel/DashboardServices";
import useAttendance from "../../ViewModel/AttendanceViewModel/AttendanceServices";
import useLocations from '../../ViewModel/LocationsViewModel/LocationsServices';
import trainingApi from "../../Model/Data/TrainigPages/Training";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import staticCountryList from "../../View/country/country_list";
import EmployeeOfficialInfo from "./EmployeeOfficialInfo";
import ChangeReportingManager from "./ChangeReportingManager";
import EmployeeAcademics from "./EmployeeAcademics";
import EmployeeExperience from "./EmployeeExperience";
import EmployeeDependent from "./EmployeeDependent";
import EmployeeLicense from "./EmployeeLicense";
import EmployeeReference from "./EmployeeReference";
import EmployeeDocuments from "./EmployeeDocuments";
import EmployeeDuties from "./EmployeeDuties";
import AddingPrivileges from "../../View/Dashoboard/AddingPrivileges";
import usePriviligesService from "../../ViewModel/EmployeeViewModel/PreviligesService";
import employeesApi from "../../Model/Data/Employees/Employees";
import { Link } from "react-router-dom";

import { Stepper, Step } from "@material-tailwind/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import {formatTimestampToDate}  from "../../services/__dateTimeServices"
const AdminEmployeeProfile = ({ employeeData: propEmployeeData }) => {
    const { employeeId } = useParams();
    ////console.log('Employee ID from URL params:', employeeId);
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);

    // Always fetch fresh data from API; do not use router or prop state
    const routerEmployeeData = null;
    const initialEmployeeData = null;

    /////console.log('propEmployeeData', initialEmployeeData)

    const [employeeData, setEmployeeData] = useState(initialEmployeeData);
    ///console.log("what is the employee data", employeeData)

    //// console.log('what is the data at this point', employeeData?.module_privileges)

    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        officialInfo: true,
        reportingManager: false,
        jobDescription: false,
        employeeStatus: false,
        transferHistory: false,
        salaryTemplate: true,
        bankAccountInfo: false,
        netSalary: false,
        allowancesDeductions: false,
        // joiningHistory: false,
        // officialInfoHistory: false,
    });
    const [expandedDocSections, setExpandedDocSections] = useState({
        academics: false,
        experience: false,
        dependents: false,
        license: false,
        references: false,
        documents: false,
    });
    const [privilegesForm, setPrivilegesForm] = useState({
        privilege: "1",
        ipFilter: "",
    });
    const [userRoles, setUserRoles] = useState([]);
    // setUserRoles(employeeData?.module_privileges)
    // console.log('1111111111111111', userRoles)

    const [repetitiveDuties, setRepetitiveDuties] = useState([]);
    const [openBasicInfoDrawer, setOpenBasicInfoDrawer] = useState(false);
    const [openEmergencyContactDrawer, setOpenEmergencyContactDrawer] =
        useState(false);
    const [openAttendanceSettingDrawer, setOpenAttendanceSettingDrawer] =
        useState(false);
    const [openAttendanceToggleDrawer, setOpenAttendanceToggleDrawer] =
        useState(false);
    const [attendanceToggleType, setAttendanceToggleType] = useState(null); // 'mobile', 'premises', or 'web'
    const [attendanceToggleForm, setAttendanceToggleForm] = useState({
        mobileAttendance: "",
        attendancePremises: "",
        webAttendance: "",
    });
    const [openOfficialInfoDrawer, setOpenOfficialInfoDrawer] = useState(false);
    const [
        openChangeReportingManagerDrawer,
        setOpenChangeReportingManagerDrawer,
    ] = useState(false);
    const [openAcademicsDrawer, setOpenAcademicsDrawer] = useState(false);
    const [openExperienceDrawer, setOpenExperienceDrawer] = useState(false);
    const [openDependentDrawer, setOpenDependentDrawer] = useState(false);
    const [openLicenseDrawer, setOpenLicenseDrawer] = useState(false);
    const [openReferenceDrawer, setOpenReferenceDrawer] = useState(false);
    const [openDocumentsDrawer, setOpenDocumentsDrawer] = useState(false);
    const [openDutiesDrawer, setOpenDutiesDrawer] = useState(false);
    const [openAssetDrawer, setOpenAssetDrawer] = useState(false);
    const [openSalarySettingsDrawer, setOpenSalarySettingsDrawer] =
        useState(false);
    const [openBankAccountDrawer, setOpenBankAccountDrawer] = useState(false);
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState(null);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [dutyToDelete, setDutyToDelete] = useState(null);
    const [isDeletingRole, setIsDeletingRole] = useState(false);
    const [openEmployeePrivilegesDrawer, setOpenEmployeePrivilegesDrawer] =
        useState(false);
    const [currentEmployeePrivileges, setCurrentEmployeePrivileges] =
        useState(null);
    const [editingAcademicRecord, setEditingAcademicRecord] = useState(null);
    const [editingExperienceRecord, setEditingExperienceRecord] = useState(null);
    const [editingDependentRecord, setEditingDependentRecord] = useState(null);
    const [editingLicenseRecord, setEditingLicenseRecord] = useState(null);
    const [editingReferenceRecord, setEditingReferenceRecord] = useState(null);
    const [editingDocumentRecord, setEditingDocumentRecord] = useState(null);
    const [editingDutyRecord, setEditingDutyRecord] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [domicileFile, setDomicileFile] = useState(null);
    const [domicileFileUrl, setDomicileFileUrl] = useState("");
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [emergencyContactForm, setEmergencyContactForm] = useState({
        contactType: "Contact Number", // Set default value
        contactTitle: "",
        countryCode: "",
        mobileNumber: "",
        network: "",
        email: "",
        address: "",
    });
    const [attendanceSettingsForm, setAttendanceSettingsForm] = useState({
        hrPolicy: "",
        bioId: "",
        hrPolicyId: null,
    });
    const [basicInfoForm, setBasicInfoForm] = useState({
        name: "",
        fatherName: "",
        gender: 1, // 1 for Male, 0 for Female
        dateOfBirth: "",
        bloodGroup: "NOT APPLICABLE",
        religion: "",
        disability: "",
        maritalStatus: "Single",
        nicPassport: "",
        domicile: "",
        nationality: "Pakistan",
        city: "",
        ntn: "",
    });
    const [countrySearch, setCountrySearch] = useState("");
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [dateOfBirthFocused, setDateOfBirthFocused] = useState(false);
    const [countryFocused, setCountryFocused] = useState(false);
    const countrySelectRef = useRef(null);
    const [assetForm, setAssetForm] = useState({
        assetName: "",
        handoverDate: null,
        assetDetail: "",
        returnable: "No", // 'Yes' or 'No'
    });

    // Salary Settings Form State (includes bank account info)
    const [salarySettingsForm, setSalarySettingsForm] = useState({
        salaryTemplate: "",
        gratuity: "NO",
        exGratiaOnOvertime: "NO",
        amount: "",
        salaryPaymentMode: "",
        // Bank Account Fields
        bankName: "",
        bankBranchInfo: "",
        bankBranchCode: "",
        bankAccountType: "",
        accountTitle: "",
        accountNo: "",
        newAccountType: "", // For custom account type
    });

    // Bank Account Form State
    const [bankAccountForm, setBankAccountForm] = useState({
        bankName: "",
        bankBranchInfo: "",
        bankBranchCode: "",
        bankAccountType: "",
        customAccountType: "", // For "Other" option
        accountTitle: "",
        accountNo: "",
    });
    // Get employee data from store or API
    const {
        gettingEmployeeById,
        gettingEmployeeProfile,
        hrPolicyDropdown,
        fetchHrPolicyDropdown,
        hrPolicyDropdownLoading,
        addEmployeeEducation,
        addEmployeeExperience,
        addEmployeeDependent,
        addEmployeeLicense,
        addEmployeeReference,
        addEmployeeDocument,
        addEmployeeDuty,
        updateEmployeeDuty,
        deleteEmployeeDuty,
        privilegesData,
        settingPrivilegesData,
        updateAccountDetail,
        updateSalary,
    } = useStore();
    const {
        get_bank_type_fn,
        get_bank_type,
        updateEmployee,
        addEmployeeContact,
        deleteEmployeeContact,
        handleDOB,
        policies,
        assignEmployeePrivilege,
        saveEmployeeAsset,
        deleteEmployeeAsset,
        salaryTemplate,
        gettingSalayTemplate,
        updateAttendanceSettings,
        sendProfileUpdateInvite,
    } = useEmployees();

    const { handleAddPrivilegesClose } = usePriviligesService();
    const { accelerateData, getAllAccelerate } = useDashboard();
    const {
        employeeRecentRecords,
        loadingRecentRecords,
        getEmployeeRecentRecords,
    } = useAttendance();
    const { countries, getAllCountries } = useLocations();

    // Ref to track if attendance records have been fetched for current drawer session
    const attendanceRecordsFetched = useRef(false);

    // Cleanup any leftover drawer overlay elements on component mount
    useEffect(() => {
        // Remove any orphaned overlay/backdrop elements that might be left in the DOM
        const cleanupOrphanedOverlays = () => {
            // Check for Material Tailwind Drawer overlay elements
            const overlaySelectors = [
                'div[class*="overlay"]',
                'div[class*="backdrop"]',
                'div[style*="position: fixed"][style*="inset"]',
            ];

            overlaySelectors.forEach((selector) => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((element) => {
                        // Check if element is an overlay (fixed position, full screen, black background)
                        const style = window.getComputedStyle(element);
                        const isOverlay =
                            style.position === "fixed" &&
                            (style.top === "0px" || style.inset === "0px") &&
                            (style.backgroundColor.includes("black") ||
                                style.backgroundColor.includes("rgba(0") ||
                                element.classList.toString().includes("overlay") ||
                                element.classList.toString().includes("backdrop"));

                        // Only remove if it's not part of an open drawer
                        const isPartOfOpenDrawer = element.closest(
                            '[role="dialog"][aria-modal="true"]'
                        );
                        if (
                            isOverlay &&
                            !isPartOfOpenDrawer &&
                            element.parentElement === document.body
                        ) {
                            element.remove();
                        }
                    });
                } catch (e) {
                    // Ignore selector errors
                }
            });
        };

        // Run cleanup on mount and after a short delay to catch any delayed renders
        cleanupOrphanedOverlays();
        const timeoutId = setTimeout(cleanupOrphanedOverlays, 500);

        return () => clearTimeout(timeoutId);
    }, []); // Only run on mount

    // console.log('type of this functions', typeof gettingEmployeeById)

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                setLoading(true);

                // Fetch employee profile data by user ID
                if (gettingEmployeeProfile) {
                    const response = await gettingEmployeeProfile(employeeId);
                    ///  console.log('Employee Profile Response:', response?.DB_DATA)
                    if (response && response?.DB_DATA) {
                        setEmployeeData(response.DB_DATA);
                        setLoading(false);
                    } else {
                        setLoading(false);
                        showToast("Failed to load employee data", "error");
                    }
                } else if (gettingEmployeeById) {
                    const response = await gettingEmployeeById(employeeId);
                    // console.log('response.data this easy data', response?.DB_DATA)
                    if (response && response?.DB_DATA) {
                        setEmployeeData(response.DB_DATA);
                        setLoading(false);
                    } else {
                        setLoading(false);
                        showToast("Failed to load employee data", "error");
                    }
                } else {
                    // Mock data for demonstration
                    setEmployeeData({
                        id: employeeId,
                        name: "John Doe",
                        email: "john.doe@company.com",
                        phone: "+1 234 567 8900",
                        position: "Software Engineer",
                        department: "Engineering",
                        branch: "Main Office",
                        employee_id: "EMP001",
                        bio_id: "BIO001",
                        joining_date: "2023-01-15",
                        status: "Active",
                        avatar: null,
                        address: "123 Main St, City, State 12345",
                        emergency_contact: {
                            name: "Jane Doe",
                            relationship: "Spouse",
                            phone: "+1 234 567 8901",
                        },
                        academic: [
                            {
                                id: 1,
                                degree: "Bachelor of Science",
                                field: "Computer Science",
                                institution: "University of Technology",
                                year: "2020",
                                gpa: "3.8",
                            },
                        ],
                        experience: [
                            {
                                id: 1,
                                company: "Tech Corp",
                                position: "Junior Developer",
                                duration: "2020-2022",
                                description:
                                    "Developed web applications using React and Node.js",
                            },
                        ],
                        documents: [
                            {
                                id: 1,
                                name: "Resume",
                                type: "PDF",
                                upload_date: "2023-01-15",
                                status: "Verified",
                            },
                        ],
                        licenses: [
                            {
                                id: 1,
                                name: "AWS Certified Developer",
                                issuing_authority: "Amazon Web Services",
                                issue_date: "2022-06-15",
                                expiry_date: "2025-06-15",
                                status: "Active",
                            },
                        ],
                        bank_account: {
                            account_number: "****1234",
                            bank_name: "National Bank",
                            account_type: "Savings",
                            routing_number: "123456789",
                        },
                    });
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching employee data:", error);
                showToast("Failed to load employee data", "error");
                setLoading(false);
            }
        };

        if (employeeId || propEmployeeData || routerEmployeeData) {
            fetchEmployeeData();
        } else {
            setLoading(false);
        }
    }, [
        employeeId,
        gettingEmployeeById,
        gettingEmployeeProfile,
        propEmployeeData,
        routerEmployeeData,
    ]);

    // Fetch accelerate performance data when Accelerate Performance tab is clicked
    useEffect(() => {
        if (activeTab === 9 && employeeId) {
            // Accelerate Performance is tab index 9
            // console.log('Fetching accelerate performance data for employee:', employeeId);
            getAllAccelerate(employeeId);
        }
    }, [activeTab, employeeId, getAllAccelerate]);

    const getMaritalStatusLabel = (status) => {
        // Handle null, undefined, or empty values
        if (status === null || status === undefined || status === "") {
            return "N/A";
        }

        // Convert to number for comparison (handles both string "0" and number 0)
        const statusNum = Number(status);

        // Map numeric values to text labels
        if (statusNum === 0) return "Single";
        if (statusNum === 2) return "Married";
        if (statusNum === 3) return "Other";

        // If it's already a valid string label, return as is
        if (typeof status === "string" && isNaN(statusNum)) {
            return status;
        }

        // For any other numeric value or invalid input, return "N/A"
        return "N/A";
    };
    // Ref to track if HR policies have been fetched for this drawer session
    const hrPoliciesFetched = useRef(false);

    // Load HR policies when attendance settings drawer opens
    useEffect(() => {
        if (openAttendanceSettingDrawer) {
            // Load HR policies using the new dropdown endpoint only if not already fetched in this session
            if (!hrPoliciesFetched.current) {
                fetchHrPolicyDropdown();
                hrPoliciesFetched.current = true;
            }

            // Fetch employee recent attendance records only once per drawer session
            if (employeeId && !attendanceRecordsFetched.current) {
                // console.log('Fetching attendance records for employee:', employeeId);
                getEmployeeRecentRecords(employeeId);
                attendanceRecordsFetched.current = true;
            }
        } else {
            // Reset the flags when drawer closes
            attendanceRecordsFetched.current = false;
            hrPoliciesFetched.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openAttendanceSettingDrawer, employeeId]);

    // Populate attendance settings form when employee data changes
    useEffect(() => {
        if (openAttendanceSettingDrawer && employeeData) {
            const existingPolicyName =
                employeeData?.attendence?.policyData?.policy_name ||
                employeeData?.employee?.hr_policy ||
                "";
            const existingPolicyIdRaw =
                employeeData?.attendence?.policyData?.id ??
                employeeData?.employee?.hr_policy_id ??
                null;
            const normalizedPolicyId =
                existingPolicyIdRaw !== null &&
                    existingPolicyIdRaw !== undefined &&
                    existingPolicyIdRaw !== ""
                    ? Number(existingPolicyIdRaw)
                    : null;

            setAttendanceSettingsForm({
                hrPolicy: existingPolicyName,
                bioId:
                    employeeData?.attendence?.bioRegistration ||
                    employeeData?.employee?.bio_id ||
                    "",
                hrPolicyId: isNaN(normalizedPolicyId) ? null : normalizedPolicyId,
            });
        }
    }, [employeeData, openAttendanceSettingDrawer]);

    // Fetch bank account types when bank account drawer opens
    useEffect(() => {
        if (
            openBankAccountDrawer &&
            (!Array.isArray(get_bank_type) || get_bank_type.length === 0)
        ) {
            get_bank_type_fn();
        }
    }, [openBankAccountDrawer, get_bank_type, get_bank_type_fn]);

    ////console.log('employeeData data is exist in this place', employeeData)

    // Populate form when employee data is available
    useEffect(() => {
        if (employeeData) {
            // Get nationality from basic_information first, then from employeeData
            const basicInfo = employeeData?.basic_information || {};
            const nationalityValue =
                basicInfo?.nationality ||
                basicInfo?.country ||
                employeeData?.nationality ||
                employeeData?.employee?.nationality;
            let nationalityName = "Pakistan"; // default

            if (nationalityValue) {
                // Check if it's a number (country ID)
                const countryId =
                    typeof nationalityValue === "string" && !isNaN(nationalityValue)
                        ? parseInt(nationalityValue)
                        : typeof nationalityValue === "number"
                            ? nationalityValue
                            : null;

                if (countryId !== null) {
                    // Use API countries if available, otherwise fall back to static list
                    const countryList =
                        countries.length > 0 ? countries : staticCountryList;
                    const foundCountry = countryList.find(
                        (c) => c.id === countryId || c.id === String(countryId)
                    );
                    nationalityName = foundCountry
                        ? foundCountry.country_name
                        : "Pakistan";
                } else if (typeof nationalityValue === "string") {
                    // If it's already a country name, use it
                    nationalityName = nationalityValue;
                }
            }

            // Get date of birth from API - check all possible paths
            const dobFromAPI =
                basicInfo?.dob ||
                employeeData?.dob ||
                employeeData?.employee?.dob ||
                employeeData?.basic_information?.dob ||
                "";

            setBasicInfoForm({
                name:
                    basicInfo?.name ||
                    basicInfo?.emp_name ||
                    employeeData?.name ||
                    employeeData?.employee?.name ||
                    "",
                fatherName:
                    basicInfo?.f_name ||
                    employeeData?.f_name ||
                    employeeData?.employee?.f_name ||
                    "",
                gender:
                    basicInfo?.gender !== undefined
                        ? parseInt(basicInfo?.gender)
                        : employeeData?.gender !== undefined
                            ? parseInt(employeeData?.gender)
                            : employeeData?.employee?.gender !== undefined
                                ? parseInt(employeeData?.employee?.gender)
                                : 1,
                dateOfBirth: dobFromAPI,
                bloodGroup:
                    basicInfo?.blood_group ||
                    employeeData?.blood_group ||
                    employeeData?.employee?.blood_group ||
                    "NOT APPLICABLE",
                religion:
                    basicInfo?.religion ||
                    employeeData?.religion ||
                    employeeData?.employee?.religion ||
                    "",
                disability:
                    basicInfo?.disability ||
                    employeeData?.disability ||
                    employeeData?.employee?.disability ||
                    "",
                maritalStatus:
                    basicInfo?.marital_status ||
                    employeeData?.marital_status ||
                    employeeData?.employee?.marital_status ||
                    "Single",
                nicPassport:
                    basicInfo?.nic ||
                    basicInfo?.passport_no ||
                    employeeData?.nic ||
                    employeeData?.employee?.nic ||
                    employeeData?.passport ||
                    employeeData?.employee?.passport ||
                    "",
                domicile:
                    basicInfo?.domicile ||
                    employeeData?.domicile ||
                    employeeData?.employee?.domicile ||
                    "",
                nationality: nationalityName,
                city:
                    basicInfo?.city ||
                    employeeData?.city ||
                    employeeData?.employee?.city ||
                    "",
                ntn:
                    basicInfo?.ntn_no ||
                    employeeData?.ntn ||
                    employeeData?.employee?.ntn ||
                    "",
            });

            // Set domicile file URL if it exists
            if (
                basicInfo?.domicile ||
                employeeData?.domicile ||
                employeeData?.employee?.domicile
            ) {
                setDomicileFileUrl(
                    basicInfo?.domicile ||
                    employeeData?.domicile ||
                    employeeData?.employee?.domicile
                );
            }
        }
    }, [employeeData, countries]);

    // Refresh form data when drawer opens to ensure latest data is shown
    useEffect(() => {
        if (openBasicInfoDrawer && employeeData) {
            // Get nationality from basic_information first, then from employeeData
            const basicInfo = employeeData?.basic_information || {};
            const nationalityValue =
                basicInfo?.nationality ||
                basicInfo?.country ||
                employeeData?.nationality ||
                employeeData?.employee?.nationality;
            let nationalityName = "Pakistan"; // default

            if (nationalityValue) {
                // Check if it's a number (country ID)
                const countryId =
                    typeof nationalityValue === "string" && !isNaN(nationalityValue)
                        ? parseInt(nationalityValue)
                        : typeof nationalityValue === "number"
                            ? nationalityValue
                            : null;

                if (countryId !== null) {
                    // Use API countries if available, otherwise fall back to static list
                    const countryList =
                        countries.length > 0 ? countries : staticCountryList;
                    const foundCountry = countryList.find(
                        (c) => c.id === countryId || c.id === String(countryId)
                    );
                    nationalityName = foundCountry
                        ? foundCountry.country_name
                        : "Pakistan";
                } else if (typeof nationalityValue === "string") {
                    // If it's already a country name, use it
                    nationalityName = nationalityValue;
                }
            }

            // Get date of birth from API - check all possible paths
            const dobFromAPI =
                basicInfo?.dob ||
                employeeData?.dob ||
                employeeData?.employee?.dob ||
                employeeData?.basic_information?.dob ||
                "";

            setBasicInfoForm({
                name:
                    basicInfo?.name ||
                    basicInfo?.emp_name ||
                    employeeData?.name ||
                    employeeData?.employee?.name ||
                    "",
                fatherName:
                    basicInfo?.f_name ||
                    employeeData?.f_name ||
                    employeeData?.employee?.f_name ||
                    "",
                gender:
                    basicInfo?.gender !== undefined
                        ? parseInt(basicInfo?.gender)
                        : employeeData?.gender !== undefined
                            ? parseInt(employeeData?.gender)
                            : employeeData?.employee?.gender !== undefined
                                ? parseInt(employeeData?.employee?.gender)
                                : 1,
                dateOfBirth: dobFromAPI,
                bloodGroup:
                    basicInfo?.blood_group ||
                    employeeData?.blood_group ||
                    employeeData?.employee?.blood_group ||
                    "NOT APPLICABLE",
                religion:
                    basicInfo?.religion ||
                    employeeData?.religion ||
                    employeeData?.employee?.religion ||
                    "",
                disability:
                    basicInfo?.disability ||
                    employeeData?.disability ||
                    employeeData?.employee?.disability ||
                    "",
                maritalStatus:
                    basicInfo?.marital_status ||
                    employeeData?.marital_status ||
                    employeeData?.employee?.marital_status ||
                    "Single",
                nicPassport:
                    basicInfo?.nic ||
                    basicInfo?.passport_no ||
                    employeeData?.nic ||
                    employeeData?.employee?.nic ||
                    employeeData?.passport ||
                    employeeData?.employee?.passport ||
                    "",
                domicile:
                    basicInfo?.domicile ||
                    employeeData?.domicile ||
                    employeeData?.employee?.domicile ||
                    "",
                nationality: nationalityName,
                city:
                    basicInfo?.city ||
                    employeeData?.city ||
                    employeeData?.employee?.city ||
                    "",
                ntn:
                    basicInfo?.ntn_no ||
                    employeeData?.ntn ||
                    employeeData?.employee?.ntn ||
                    "",
            });

            // Set domicile file URL if it exists
            if (
                basicInfo?.domicile ||
                employeeData?.domicile ||
                employeeData?.employee?.domicile
            ) {
                setDomicileFileUrl(
                    basicInfo?.domicile ||
                    employeeData?.domicile ||
                    employeeData?.employee?.domicile
                );
            }
        }
    }, [openBasicInfoDrawer, employeeData, countries]);

    // Fetch countries and refresh employee data when basic info drawer opens
    useEffect(() => {
        if (openBasicInfoDrawer) {
            getAllCountries();

            // Refresh employee data to ensure we have the latest information
            const refreshEmployeeData = async () => {
                try {
                    if (gettingEmployeeProfile && employeeId) {
                        const response = await gettingEmployeeProfile(employeeId);
                        if (response && response?.DB_DATA) {
                            setEmployeeData(response.DB_DATA);
                        }
                    } else if (gettingEmployeeById && employeeId) {
                        const response = await gettingEmployeeById(employeeId);
                        if (response && response?.DB_DATA) {
                            setEmployeeData(response.DB_DATA);
                        }
                    }
                } catch (error) {
                    console.error("Error refreshing employee data:", error);
                }
            };

            refreshEmployeeData();
        }
    }, [
        openBasicInfoDrawer,
        employeeId,
        gettingEmployeeProfile,
        gettingEmployeeById,
    ]);

    // Filter countries based on search
    useEffect(() => {
        if (countries.length > 0) {
            if (countrySearch.trim() === "") {
                setFilteredCountries(countries);
            } else {
                const filtered = countries.filter((country) =>
                    country.country_name
                        .toLowerCase()
                        .includes(countrySearch.toLowerCase())
                );
                setFilteredCountries(filtered);
            }
        }
    }, [countrySearch, countries]);

    // Handle CustomSelect focus detection
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                countrySelectRef.current &&
                !countrySelectRef.current.contains(event.target)
            ) {
                // Check if click is on react-select menu
                const reactSelectMenu = document.querySelector(
                    '.country-select-wrapper [class*="menu"]'
                );
                if (!reactSelectMenu || !reactSelectMenu.contains(event.target)) {
                    setCountryFocused(false);
                }
            }
        };

        const handleFocus = (event) => {
            if (
                countrySelectRef.current &&
                countrySelectRef.current.contains(event.target)
            ) {
                setCountryFocused(true);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("focusin", handleFocus);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("focusin", handleFocus);
        };
    }, []);

    const handleBack = () => {
        navigate("/employees/all_employess");
    };

    const handleBasicInfoChange = (field, value) => {
        setBasicInfoForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Salary Settings Form Handler
    const handleSalarySettingsChange = (field, value) => {
        setSalarySettingsForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSalarySettingsSubmit = async (e) => {
        e.preventDefault();

        if (!employeeId) {
            showToast("Employee ID is missing", "error");
            return;
        }

        setIsUpdating(true);

        try {
            // Find salary template ID from the selected template name
            const selectedTemplate = salaryTemplate?.find(
                (template) => template.name === salarySettingsForm.salaryTemplate
            );

            if (!selectedTemplate) {
                showToast("Please select a valid salary template", "error");
                setIsUpdating(false);
                return;
            }

            // Prepare salary update payload according to API requirements
            // Ex_Gratia: If user clicks "Yes" on "Ex-Gratia on overtime", send the amount, otherwise send 0
            const exGratiaAmount =
                salarySettingsForm.exGratiaOnOvertime === "Yes"
                    ? parseFloat(salarySettingsForm.amount) || 0
                    : 0;

            const salaryPayload = {
                employeeid: parseInt(employeeId),
                template_id: selectedTemplate.id,
                salary: parseFloat(salarySettingsForm.amount) || 0,
                gratuity: salarySettingsForm.gratuity === "Yes" ? "1" : "0",
                Ex_Gratia: exGratiaAmount,
                Payment_mode: salarySettingsForm.salaryPaymentMode || "cash",
            };

            console.log("Salary Update Payload:", salaryPayload);

            // Call the update_salary endpoint
            const response = await updateSalary(salaryPayload);

            if (response && response.STATUS === "SUCCESSFUL") {
                showToast("Salary Settings Updated Successfully", "success");

                // Refresh employee data to show updated information
                if (gettingEmployeeProfile) {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData?.DB_DATA) {
                        setEmployeeData(refreshedData.DB_DATA);
                    }
                }

                setOpenSalarySettingsDrawer(false);
            } else {
                const errorMessage =
                    response?.ERROR_DESCRIPTION || "Failed to update salary settings";
                showToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error updating salary settings:", error);
            showToast("An error occurred while updating salary settings", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    // Bank Account Form Handler
    const handleBankAccountChange = (field, value) => {
        setBankAccountForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleBankAccountSubmit = async (e) => {
        e.preventDefault();

        if (!employeeId) {
            showToast("Employee ID is missing", "error");
            return;
        }

        // Validation checks
        if (!bankAccountForm.bankName || !bankAccountForm.bankName.trim()) {
            showToast("Bank Name is required", "error");
            return;
        }

        if (
            !bankAccountForm.bankBranchInfo ||
            !bankAccountForm.bankBranchInfo.trim()
        ) {
            showToast("Bank Branch Info is required", "error");
            return;
        }

        if (
            !bankAccountForm.bankBranchCode ||
            !bankAccountForm.bankBranchCode.trim()
        ) {
            showToast("Provide bank branch code.", "error");
            return;
        }

        if (!bankAccountForm.accountTitle || !bankAccountForm.accountTitle.trim()) {
            showToast("Provide bank account title.", "error");
            return;
        }

        if (!bankAccountForm.accountNo || !bankAccountForm.accountNo.trim()) {
            showToast("Account No is required", "error");
            return;
        }

        // Validate custom account type if "Other" is selected
        if (bankAccountForm.bankAccountType === "Other") {
            if (
                !bankAccountForm.customAccountType ||
                !bankAccountForm.customAccountType.trim()
            ) {
                showToast("Please enter custom account type", "error");
                return;
            }
        }

        setIsUpdating(true);

        try {
            // Determine account type:
            // - If "Other" is selected, use the custom text value (NOT an ID)
            // - Otherwise, use the selected account type text value
            let finalAccountType = "";
            let accountTypeNew = "";

            if (bankAccountForm.bankAccountType === "Other") {
                // When "Other" is selected, send the text value entered by user (not an ID)
                finalAccountType = bankAccountForm.customAccountType.trim();
                accountTypeNew = bankAccountForm.customAccountType.trim();
            } else {
                // When a regular option is selected, use the account type text value
                finalAccountType = bankAccountForm.bankAccountType || "";
                accountTypeNew = "";
            }

            // Prepare bank account payload
            const bankPayload = {
                emp_id: parseInt(employeeId),
                account_no: bankAccountForm.accountNo.trim(),
                account_title: bankAccountForm.accountTitle.trim(),
                account_type_new: accountTypeNew, // Custom type text when "Other" is selected
                account_type: finalAccountType, // Account type text (never send ID when "Other" is selected)
                branch_code: bankAccountForm.bankBranchCode.trim(),
                branch_name: bankAccountForm.bankBranchInfo.trim(),
                bank_name: bankAccountForm.bankName.trim(),
            };

            ////console.log('Bank Account Payload for update_account_detail:', bankPayload);

            // Call the update_account_detail endpoint
            const response = await updateAccountDetail(bankPayload);

            if (response && response.STATUS === "SUCCESSFUL") {
                showToast("Bank Account Info Updated Successfully", "success");

                // Refresh employee data to show updated information
                if (gettingEmployeeProfile) {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData?.DB_DATA) {
                        setEmployeeData(refreshedData.DB_DATA);
                    }
                }

                setOpenBankAccountDrawer(false);
            } else {
                const errorMessage =
                    response?.ERROR_DESCRIPTION ||
                    "Failed to update bank account details";
                showToast(errorMessage, "error");
            }
        } catch (error) {
            console.error("Error updating bank account:", error);
            showToast(
                "An error occurred while updating bank account details",
                "error"
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAssetFormChange = (field, value) => {
        setAssetForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddAsset = async () => {
        try {
            setIsUpdating(true);

            // Form validation
            if (!assetForm.assetName.trim()) {
                showToast("Asset Name is required", "error");
                setIsUpdating(false);
                return;
            }
            if (!assetForm.handoverDate) {
                showToast("Handover Date is required", "error");
                setIsUpdating(false);
                return;
            }

            // Format handover date to yyyy-MM-dd format for API
            const formattedDate = assetForm.handoverDate
                ? format(assetForm.handoverDate, "yyyy-MM-dd")
                : null;

            // Prepare payload for API
            const payload = {
                asset_name: assetForm.assetName.trim(),
                emp_id: parseInt(employeeId),
                asset_detail: assetForm.assetDetail.trim() || null,
                returnable: assetForm.returnable === "Yes" ? "1" : "0",
                returned: "0", // Default to not returned
                handover_date: formattedDate,
            };

            // Call API to add asset
            const result = await saveEmployeeAsset(employeeId, payload);

            if (result && result.success) {
                // Reset form
                setAssetForm({
                    assetName: "",
                    handoverDate: null,
                    assetDetail: "",
                    returnable: "No",
                });

                // Close drawer
                setOpenAssetDrawer(false);

                // Refresh employee data to show new asset
                if (gettingEmployeeProfile && employeeId) {
                    try {
                        const refreshedData = await gettingEmployeeProfile(employeeId);
                        if (refreshedData && refreshedData?.DB_DATA) {
                            setEmployeeData(refreshedData.DB_DATA);
                        }
                    } catch (refreshError) {
                        console.error("Error refreshing employee data:", refreshError);
                    }
                }
            }
        } catch (error) {
            console.error("Error adding asset:", error);
            showToast("Failed to add asset", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAsset = (assetId) => {
        if (!assetId) {
            showToast("Asset ID is missing", "error");
            return;
        }

        // Store asset ID and open confirmation dialog
        setAssetToDelete(assetId);
        setOpenDeleteConfirmDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!assetToDelete) {
            showToast("Asset ID is missing", "error");
            setOpenDeleteConfirmDialog(false);
            return;
        }

        try {
            setIsUpdating(true);

            // Call API to delete asset
            const result = await deleteEmployeeAsset(assetToDelete);

            if (result && result.success) {
                // Close dialog
                setOpenDeleteConfirmDialog(false);
                setAssetToDelete(null);

                // Refresh employee data to remove deleted asset
                if (gettingEmployeeProfile && employeeId) {
                    try {
                        const refreshedData = await gettingEmployeeProfile(employeeId);
                        if (refreshedData && refreshedData?.DB_DATA) {
                            setEmployeeData(refreshedData.DB_DATA);
                        }
                    } catch (refreshError) {
                        console.error("Error refreshing employee data:", refreshError);
                    }
                }
            }
        } catch (error) {
            console.error("Error deleting asset:", error);
            showToast("Failed to delete asset", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteConfirmDialog(false);
        setAssetToDelete(null);
    };

    const handleEmergencyContactChange = (field, value) => {
        //// console.log('Emergency Contact Change:', field, value);
        setEmergencyContactForm((prev) => {
            const newForm = {
                ...prev,
                [field]: value,
            };

            // Clear network field if country is not Pakistan
            if (field === "countryCode" && value !== "+92") {
                newForm.network = "";
            }

            return newForm;
        });
    };

    const handleEditContact = (contact) => {
        // Set editing contact
        setEditingContact(contact);

        // Populate form with existing contact data
        setEmergencyContactForm({
            contactType: contact.contact_type,
            contactTitle: contact.contact_title,
            countryCode: "", // Will be populated based on contact type
            mobileNumber:
                contact.contact_type === "Mobile" ||
                    contact.contact_type === "Mobile Number" ||
                    contact.contact_type === "Phone Number"
                    ? contact.contact
                    : "",
            network: contact.mobile_network || "",
            email: contact.contact_type === "Email" ? contact.contact : "",
            address: contact.contact_type === "Address" ? contact.contact : "",
        });
        setOpenEmergencyContactDrawer(true);
    };

    const handleDeleteContact = async (contactId) => {
        try {
            const payload = {
                operations: "delete_contact",
            };

            // console.log('Deleting contact:', contactId, payload);
            const result = await deleteEmployeeContact(contactId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                // Remove the contact from local state immediately
                setEmployeeData((prevData) => {
                    if (!prevData) return prevData;

                    const updatedData = { ...prevData };

                    // Ensure Official_Info exists
                    if (!updatedData.Official_Info) {
                        updatedData.Official_Info = {};
                    }

                    // Ensure contacts array exists and filter it
                    if (updatedData.Official_Info.contacts && Array.isArray(updatedData.Official_Info.contacts)) {
                        updatedData.Official_Info = {
                            ...updatedData.Official_Info,
                            contacts: updatedData.Official_Info.contacts.filter(
                                (contact) => contact.id !== contactId
                            ),
                        };
                    }

                    return updatedData;
                });
                // Toast is already shown by the API service
            }
            // Toast for errors is already shown by the API service
        } catch (error) {
            console.error("Error deleting contact:", error);
            // Toast for errors is already shown by the API service
        }
    };

    const handleAttendanceSettingsChange = (field, value) => {
        setAttendanceSettingsForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleHrPolicyChange = (e) => {
        const selectedPolicyId = e.target.value;
        if (!selectedPolicyId) {
            setAttendanceSettingsForm((prev) => ({
                ...prev,
                hrPolicy: "",
                hrPolicyId: null,
            }));
            return;
        }

        const numericPolicyId = Number(selectedPolicyId);
        const selectedPolicy = hrPolicyDropdown?.find(
            (policy) => Number(policy.id) === numericPolicyId
        );
        const normalizedPolicyId =
            selectedPolicy?.id !== undefined && selectedPolicy?.id !== null
                ? Number(selectedPolicy.id)
                : null;

        setAttendanceSettingsForm((prev) => ({
            ...prev,
            hrPolicy: selectedPolicy?.name || "",
            hrPolicyId:
                normalizedPolicyId !== null && !isNaN(normalizedPolicyId)
                    ? normalizedPolicyId
                    : null,
        }));
    };

    const handleAttendanceSettingsSubmit = async () => {
        try {
            setIsUpdating(true);

            // Form validation
            if (!attendanceSettingsForm.hrPolicy.trim()) {
                showToast("HR Policy is required", "error");
                return;
            }

            // Prepare payload for API
            const payload = {
                hr_policy: attendanceSettingsForm.hrPolicy,
                bio_id: attendanceSettingsForm.bioId || null,
                hr_policy_id: attendanceSettingsForm.hrPolicyId || null,
                emp_id: employeeId,
            };

            ////oo  console.log('Updating attendance settings with payload:', payload);

            // Call update API
            const result = await updateEmployee(employeeId, payload);

            if (result) {
                // showToast('Attendance settings updated successfully', 'success');

                // Refresh employee profile data to update the UI in real-time
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        setEmployeeData((prevData) => ({
                            ...prevData,
                            ...refreshedData.DB_DATA,
                        }));
                    }
                } catch (error) {
                    console.error("Error refreshing employee data:", error);
                }

                setOpenAttendanceSettingDrawer(false);
            }
        } catch (error) {
            console.error("Error updating attendance settings:", error);
            showToast("Failed to update attendance settings", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAttendanceToggleSubmit = async () => {
        try {
            setIsUpdating(true);

            // Prepare payload for API
            const payload = {
                emp_id: parseInt(employeeId),
            };

            // Add attendance field if mobile attendance is being updated
            if (
                attendanceToggleType === "mobile" &&
                attendanceToggleForm.mobileAttendance !== ""
            ) {
                payload.attendance = parseInt(attendanceToggleForm.mobileAttendance);
            }

            // Add Premises field if attendance premises is being updated
            if (
                attendanceToggleType === "premises" &&
                attendanceToggleForm.attendancePremises !== ""
            ) {
                payload.Premises = parseInt(attendanceToggleForm.attendancePremises);
            }

            // Add web_attendance field if web attendance is being updated
            if (
                attendanceToggleType === "web" &&
                attendanceToggleForm.webAttendance !== ""
            ) {
                payload.web_attendance = parseInt(attendanceToggleForm.webAttendance);
            }

            console.log("Updating attendance toggle with payload:", payload);

            // Call update API
            const result = await updateAttendanceSettings(payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                // Refresh employee profile data to update the UI in real-time
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        setEmployeeData((prevData) => ({
                            ...prevData,
                            ...refreshedData.DB_DATA,
                        }));
                    }
                } catch (error) {
                    console.error("Error refreshing employee data:", error);
                }

                setOpenAttendanceToggleDrawer(false);
                setAttendanceToggleType(null);
            }
        } catch (error) {
            console.error("Error updating attendance toggle:", error);
            showToast("Failed to update attendance settings", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleEmergencyContactSubmit = async () => {
        try {
            setIsUpdating(true);

            // Form validation based on contact type
            if (!emergencyContactForm.contactType.trim()) {
                showToast("Contact Type is required", "error");
                return;
            }
            if (!emergencyContactForm.contactTitle.trim()) {
                showToast("Contact Title is required", "error");
                return;
            }

            // Dynamic validation based on contact type
            if (
                emergencyContactForm.contactType === "Phone Number" ||
                emergencyContactForm.contactType === "Mobile Number"
            ) {
                // Only require country code if Pakistan (+92) is selected
                if (
                    emergencyContactForm.countryCode === "+92" &&
                    !emergencyContactForm.countryCode.trim()
                ) {
                    showToast("Country Code is required for Pakistan", "error");
                    return;
                }
                if (!emergencyContactForm.mobileNumber.trim()) {
                    showToast("Mobile Number is required", "error");
                    return;
                }
                // Only require network if Pakistan (+92) is selected
                if (
                    emergencyContactForm.countryCode === "+92" &&
                    !emergencyContactForm.network
                ) {
                    showToast("Network is required for Pakistan", "error");
                    return;
                }
            } else if (emergencyContactForm.contactType === "Email") {
                if (!emergencyContactForm.email.trim()) {
                    showToast("Email Address is required", "error");
                    return;
                }
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emergencyContactForm.email.trim())) {
                    showToast("Please enter a valid email address", "error");
                    return;
                }
            } else if (emergencyContactForm.contactType === "Address") {
                if (!emergencyContactForm.address.trim()) {
                    showToast("Address is required", "error");
                    return;
                }
            }

            // Prepare payload for API based on contact type
            let contact = "";
            let mobile_network = "";

            if (emergencyContactForm.contactType === "Contact Number") {
                contact = emergencyContactForm.mobileNumber.trim();
                mobile_network = emergencyContactForm.network;
            } else if (emergencyContactForm.contactType === "Email") {
                contact = emergencyContactForm.email.trim();
            } else if (emergencyContactForm.contactType === "Address") {
                contact = emergencyContactForm.address.trim();
            }

            const payload = {
                operations: editingContact ? "Update_contact" : "Add_contact",
                contact_id: editingContact ? editingContact.id : undefined,
                contact_type: emergencyContactForm.contactType,
                contact_title: emergencyContactForm.contactTitle.trim(),
                contact: contact,
                mobile_network: mobile_network,
            };

            // console.log('Adding emergency contact with payload:', payload);

            // Call add contact API
            const result = await addEmployeeContact(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                // Toast is already shown by the API service
                setOpenEmergencyContactDrawer(false);
                setEditingContact(null);

                // Reset form
                setEmergencyContactForm({
                    contactType: "Contact Number",
                    contactTitle: "",
                    countryCode: "",
                    mobileNumber: "",
                    network: "",
                    email: "",
                    address: "",
                });

                // Update local state immediately
                if (editingContact) {
                    // Update existing contact
                    let updatedContact = "";
                    let updatedMobileNetwork = "";

                    if (
                        emergencyContactForm.contactType === "Mobile Number" ||
                        emergencyContactForm.contactType === "Phone Number"
                    ) {
                        updatedContact = emergencyContactForm.mobileNumber.trim();
                        updatedMobileNetwork = emergencyContactForm.network;
                    } else if (emergencyContactForm.contactType === "Email") {
                        updatedContact = emergencyContactForm.email.trim();
                    } else if (emergencyContactForm.contactType === "Address") {
                        updatedContact = emergencyContactForm.address.trim();
                    }

                    setEmployeeData((prevData) => {
                        if (!prevData) return prevData;

                        const updatedData = { ...prevData };

                        // Ensure Official_Info exists
                        if (!updatedData.Official_Info) {
                            updatedData.Official_Info = {};
                        }

                        // Ensure contacts array exists and update it
                        if (updatedData.Official_Info.contacts && Array.isArray(updatedData.Official_Info.contacts)) {
                            updatedData.Official_Info = {
                                ...updatedData.Official_Info,
                                contacts: updatedData.Official_Info.contacts.map((contact) =>
                                    contact.id === editingContact.id
                                        ? {
                                            ...contact,
                                            contact_type: emergencyContactForm.contactType,
                                            contact_title: emergencyContactForm.contactTitle.trim(),
                                            contact: updatedContact,
                                            mobile_network: updatedMobileNetwork,
                                        }
                                        : contact
                                ),
                            };
                        }

                        return updatedData;
                    });
                } else {
                    // Add new contact
                    const newContact = {
                        id: result.DB_DATA.id,
                        emp_id: result.DB_DATA.emp_id,
                        contact_type: result.DB_DATA.contact_type,
                        contact_title: result.DB_DATA.contact_title,
                        contact: result.DB_DATA.contact,
                        mobile_network: result.DB_DATA.mobile_network,
                    };

                    setEmployeeData((prevData) => {
                        if (!prevData) return prevData;

                        const updatedData = { ...prevData };

                        // Ensure Official_Info exists
                        if (!updatedData.Official_Info) {
                            updatedData.Official_Info = {};
                        }

                        // Ensure contacts array exists and add new contact
                        if (!updatedData.Official_Info.contacts) {
                            updatedData.Official_Info.contacts = [];
                        }

                        updatedData.Official_Info = {
                            ...updatedData.Official_Info,
                            contacts: [...updatedData.Official_Info.contacts, newContact],
                        };

                        return updatedData;
                    });
                }
            }
            // Toast for errors is already shown by the API service
        } catch (error) {
            console.error("Error adding emergency contact:", error);
            // Toast for errors is already shown by the API service
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDomicileFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type (optional - you can add more validation)
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf",
        ];
        if (!allowedTypes.includes(file.type)) {
            showToast("Please upload a valid file (JPEG, PNG, or PDF)", "error");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast("File size should be less than 5MB", "error");
            return;
        }

        try {
            setIsUploadingFile(true);
            setDomicileFile(file);

            const formData = new FormData();
            formData.append("file", file);

            const response = await trainingApi.uploadFileToElephant(formData);
            const responseData = response.data;

            if (responseData.STATUS === "SUCCESSFUL") {
                setDomicileFileUrl(responseData.FILE_URL);
                showToast("File uploaded successfully", "success");
            } else {
                showToast("Failed to upload file", "error");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            showToast("Failed to upload file", "error");
        } finally {
            setIsUploadingFile(false);
        }
    };

    // Map role name to privilege number
    const getPrivilegeNumber = (roleName) => {
        const roleMapping = {
            Employee: 0,
            Admin: 1,
            Branch_Admin: 2,
            Department_Admin: 3,
        };
        return roleMapping[roleName] !== undefined ? roleMapping[roleName] : null;
    };

    // Handle delete role click
    const handleDeleteRole = (role) => {
        setRoleToDelete(role);
        setOpenDeleteConfirmDialog(true);
    };

    // Handle confirmed role delete
    const handleConfirmDeleteRole = async () => {
        if (!roleToDelete || !employeeId) {
            return;
        }

        setIsDeletingRole(true);
        try {
            const privilegeNumber = getPrivilegeNumber(roleToDelete.role_name);

            if (privilegeNumber === null) {
                showToast("Invalid role name", "error");
                return;
            }

            const response = await employeesApi.removeEmployeePrivilege(
                employeeId,
                privilegeNumber
            );
            const responseData = response.data;

            if (responseData.STATUS === "SUCCESSFUL") {
                showToast(
                    `Role ${roleToDelete.role_name} removed successfully`,
                    "success"
                );

                // Refresh employee profile data
                const refreshedData = await gettingEmployeeProfile(employeeId);
                if (refreshedData && refreshedData.DB_DATA) {
                    setEmployeeData(refreshedData.DB_DATA);
                }

                setOpenDeleteConfirmDialog(false);
                setRoleToDelete(null);
            } else {
                showToast(
                    responseData.ERROR_DESCRIPTION || "Failed to remove role",
                    "error"
                );
            }
        } catch (error) {
            console.error("Error removing role:", error);
            showToast(error?.response?.data?.ERROR_DESCRIPTION, "error");
        } finally {
            setIsDeletingRole(false);
        }
    };

    const handleGrantRole = async () => {
        try {
            if (!employeeId) {
                showToast("Employee ID is missing", "error");
                return;
            }

            // Check if user already has the selected privilege level
            const selectedPrivilege = privilegesForm.privilege;
            // if (employeeData?.module_privileges && employeeData.module_privileges.length > 0) {
            //     const hasExistingPrivilege = employeeData.module_privileges.some(
            //         (priv) => priv.privileges === selectedPrivilege
            //     );

            //     if (hasExistingPrivilege) {
            //         const privilegeName =
            //             selectedPrivilege === "0" ? "Employee" :
            //                 selectedPrivilege === "1" ? "Super Admin" :
            //                     selectedPrivilege === "2" ? "Branch Admin" :
            //                         selectedPrivilege === "3" ? "Department Admin" : "this role";

            //         showToast(`User is already granted ${privilegeName} role`, 'error');
            //         return;
            //     }
            // }

            // Mock data structure for modules (this defines the UI structure)
            const mockPrivilegesData = {
                1: { id: "1", nice_name: "Employees", parent_id: "0" },
                2: { id: "2", nice_name: "Departments", parent_id: "0" },
                3: { id: "3", nice_name: "HR policies", parent_id: "0" },
                4: { id: "4", nice_name: "Payroll", parent_id: "0" },
                5: { id: "5", nice_name: "Salary Templates", parent_id: "4" },
                6: { id: "6", nice_name: "Employees salary", parent_id: "4" },
                7: { id: "7", nice_name: "Payslips Management", parent_id: "4" },
                8: { id: "8", nice_name: "Reports Export", parent_id: "4" },
                9: { id: "9", nice_name: "Notices", parent_id: "0" },
                10: { id: "10", nice_name: "Tasks", parent_id: "0" },
                11: { id: "11", nice_name: "Attendance", parent_id: "0" },
                12: { id: "12", nice_name: "Attendance Data", parent_id: "11" },
                13: { id: "13", nice_name: "Attendance export", parent_id: "11" },
                14: { id: "14", nice_name: "Branch wise attendance", parent_id: "11" },
                15: { id: "15", nice_name: "Attendance raw logs", parent_id: "11" },
                16: { id: "16", nice_name: "Shift planner", parent_id: "0" },
                17: { id: "17", nice_name: "Applications", parent_id: "0" },
                18: { id: "18", nice_name: "Leave planner", parent_id: "0" },
                19: { id: "19", nice_name: "Hire 2.0", parent_id: "0" },
                20: { id: "20", nice_name: "Forms and Approval", parent_id: "0" },
            };

            // Fetch current privileges from API
            const response = await employeesApi.getEmployeePrivileges(employeeId);
            const responseData = response.data;

            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                // Set module structure in store
                settingPrivilegesData(mockPrivilegesData);

                // Set current privileges from API response
                const currentPrivileges = responseData.DB_DATA?.privileges || {};
                setCurrentEmployeePrivileges(currentPrivileges);

                // Open drawer
                setOpenEmployeePrivilegesDrawer(true);
            } else {
                // If API fails, still open drawer with default values
                settingPrivilegesData(mockPrivilegesData);
                setCurrentEmployeePrivileges(null);
                setOpenEmployeePrivilegesDrawer(true);
                showToast(
                    "Failed to load current privileges. Using default values.",
                    "warning"
                );
            }
        } catch (error) {
            console.error("Error fetching privileges:", error);
            // Still open drawer with mock data structure
            const mockPrivilegesData = {
                1: { id: "1", nice_name: "Employees", parent_id: "0" },
                2: { id: "2", nice_name: "Departments", parent_id: "0" },
                3: { id: "3", nice_name: "HR policies", parent_id: "0" },
                4: { id: "4", nice_name: "Payroll", parent_id: "0" },
                5: { id: "5", nice_name: "Salary Templates", parent_id: "4" },
                6: { id: "6", nice_name: "Employees salary", parent_id: "4" },
                7: { id: "7", nice_name: "Payslips Management", parent_id: "4" },
                8: { id: "8", nice_name: "Reports Export", parent_id: "4" },
                9: { id: "9", nice_name: "Notices", parent_id: "0" },
                10: { id: "10", nice_name: "Tasks", parent_id: "0" },
                11: { id: "11", nice_name: "Attendance", parent_id: "0" },
                12: { id: "12", nice_name: "Attendance Data", parent_id: "11" },
                13: { id: "13", nice_name: "Attendance export", parent_id: "11" },
                14: { id: "14", nice_name: "Branch wise attendance", parent_id: "11" },
                15: { id: "15", nice_name: "Attendance raw logs", parent_id: "11" },
                16: { id: "16", nice_name: "Shift planner", parent_id: "0" },
                17: { id: "17", nice_name: "Applications", parent_id: "0" },
                18: { id: "18", nice_name: "Leave planner", parent_id: "0" },
                19: { id: "19", nice_name: "Hire 2.0", parent_id: "0" },
                20: { id: "20", nice_name: "Forms and Approval", parent_id: "0" },
            };
            settingPrivilegesData(mockPrivilegesData);
            setCurrentEmployeePrivileges(null);
            setOpenEmployeePrivilegesDrawer(true);
            showToast("Failed to load privileges", "error");
        }
    };

    const handleRefreshEmployeeData = async () => {
        try {
            if (gettingEmployeeProfile && employeeId) {
                const refreshedData = await gettingEmployeeProfile(employeeId);
                if (refreshedData && refreshedData?.DB_DATA) {
                    setEmployeeData(refreshedData.DB_DATA);
                }
            }
        } catch (error) {
            console.error("Error refreshing employee data:", error);
        }
    };

    const handleCloseEmployeePrivilegesDrawer = () => {
        setOpenEmployeePrivilegesDrawer(false);
        setCurrentEmployeePrivileges(null);
        handleAddPrivilegesClose();
    };

    const handleDeleteExperience = async (experienceId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete experience API
            const payload = {
                operation: "delete_experience",
                id: experienceId,
            };

            // console.log('Deleting experience record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeExperience(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast("Experience record deleted successfully", "success");

                // Refresh employee profile data and update parent state
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        // console.log('Employee profile refreshed successfully');

                        // Update the parent component's employeeData state
                        setEmployeeData((prevData) => ({
                            ...prevData,
                            ...refreshedData.DB_DATA,
                        }));
                    }
                } catch (refreshError) {
                    console.error("Error refreshing employee profile:", refreshError);
                    // Don't show error to user as the main operation was successful
                }
            } else {
                showToast("Failed to delete experience record", "error");
            }
        } catch (error) {
            console.error("Error deleting experience record:", error);
            showToast("Failed to delete experience record", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteDependent = async (dependentId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete dependent API
            const payload = {
                operation: "delete_dependents",
                id: dependentId,
            };

            // console.log('Deleting dependent record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeDependent(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast("Dependent record deleted successfully", "success");

                // Refresh employee profile data and update parent state
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        // console.log('Employee profile refreshed successfully');

                        // Update the parent component's employeeData state
                        setEmployeeData((prevData) => ({
                            ...prevData,
                            ...refreshedData.DB_DATA,
                        }));
                    }
                } catch (refreshError) {
                    console.error("Error refreshing employee profile:", refreshError);
                    // Don't show error to user as the main operation was successful
                }
            } else {
                showToast("Failed to delete dependent record", "error");
            }
        } catch (error) {
            console.error("Error deleting dependent record:", error);
            showToast("Failed to delete dependent record", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteLicense = async (licenseId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete license API
            const payload = {
                operation: "delete_license",
                id: licenseId,
            };

            // console.log('Deleting license record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeLicense(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast("License record deleted successfully", "success");

                // Refresh employee profile data and update parent state
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        // console.log('Employee profile refreshed successfully');

                        // Update the parent component's employeeData state
                        setEmployeeData((prevData) => ({
                            ...prevData,
                            ...refreshedData.DB_DATA,
                        }));
                    }
                } catch (refreshError) {
                    console.error("Error refreshing employee profile:", refreshError);
                    // Don't show error to user as the main operation was successful
                }
            } else {
                showToast("Failed to delete license record", "error");
            }
        } catch (error) {
            console.error("Error deleting license record:", error);
            showToast("Failed to delete license record", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteReference = async (referenceId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete reference API
            const payload = {
                operation: "delete_references",
                id: referenceId,
            };

            // console.log('Deleting reference record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeReference(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast("Reference record deleted successfully", "success");

                // Refresh employee profile data and update parent state
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        // console.log('Employee profile refreshed successfully');

                        // Update the parent component's employeeData state
                        setEmployeeData((prevData) => ({
                            ...prevData,
                            ...refreshedData.DB_DATA,
                        }));
                    }
                } catch (refreshError) {
                    console.error("Error refreshing employee profile:", refreshError);
                    // Don't show error to user as the main operation was successful
                }
            } else {
                showToast("Failed to delete reference record", "error");
            }
        } catch (error) {
            console.error("Error deleting reference record:", error);
            showToast("Failed to delete reference record", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete document API
            const payload = {
                operation: "delete_documents",
                id: documentId,
            };

            // console.log('Deleting document record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeDocument(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast("Document record deleted successfully", "success");

                // Refresh employee profile data and update parent state
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        // console.log('Employee profile refreshed successfully');

                        // Update the parent component's employeeData state
                        setEmployeeData((prevData) => ({
                            ...prevData,
                            ...refreshedData.DB_DATA,
                        }));
                    }
                } catch (refreshError) {
                    console.error("Error refreshing employee profile:", refreshError);
                    // Don't show error to user as the main operation was successful
                }
            } else {
                showToast("Failed to delete document record", "error");
            }
        } catch (error) {
            console.error("Error deleting document record:", error);
            showToast("Failed to delete document record", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAcademic = async (academicId) => {
        try {
            setIsUpdating(true);

            // Prepare payload for delete academic API
            const payload = {
                operation: "delete_academic",
                id: academicId,
            };

            // console.log('Deleting academic record with payload:', payload);

            // Call the actual API
            const result = await addEmployeeEducation(employeeId, payload);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast("Academic record deleted successfully", "success");

                // Refresh employee profile data and update parent state
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        // console.log('Employee profile refreshed successfully');

                        // Update the parent component's employeeData state
                        setEmployeeData((prevData) => ({
                            ...prevData,
                            ...refreshedData.DB_DATA,
                        }));
                    }
                } catch (error) {
                    console.error("Error refreshing employee data:", error);
                }
            } else {
                showToast("Failed to delete academic record", "error");
            }
        } catch (error) {
            console.error("Error deleting academic record:", error);
            showToast("Failed to delete academic record", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteDuty = (dutyId) => {
        if (!dutyId) {
            showToast("Duty ID is missing", "error");
            return;
        }

        // Store duty ID and open confirmation dialog
        setDutyToDelete(dutyId);
        setOpenDeleteConfirmDialog(true);
    };

    const handleConfirmDeleteDuty = async () => {
        if (!dutyToDelete) {
            showToast("Duty ID is missing", "error");
            setOpenDeleteConfirmDialog(false);
            return;
        }

        try {
            setIsUpdating(true);

            // Call API to delete duty
            const result = await deleteEmployeeDuty(dutyToDelete);

            if (result && result.STATUS === "SUCCESSFUL") {
                showToast("Duty deleted successfully", "success");

                // Close dialog
                setOpenDeleteConfirmDialog(false);
                setDutyToDelete(null);

                // Refresh employee data to remove deleted duty
                if (gettingEmployeeProfile && employeeId) {
                    try {
                        const refreshedData = await gettingEmployeeProfile(employeeId);
                        if (refreshedData && refreshedData.DB_DATA) {
                            setEmployeeData((prevData) => ({
                                ...prevData,
                                ...refreshedData.DB_DATA,
                            }));
                        }
                    } catch (error) {
                        console.error("Error refreshing employee data:", error);
                    }
                }
            } else {
                showToast("Failed to delete duty", "error");
            }
        } catch (error) {
            console.error("Error deleting duty:", error);
            showToast("Failed to delete duty", "error");
        } finally {
            setIsUpdating(false);
            setOpenDeleteConfirmDialog(false);
            setDutyToDelete(null);
        }
    };

    const handleBasicInfoSubmit = async () => {
        try {
            setIsUpdating(true);

            // Form validation - only require Name, Father Name, Gender, and DOB
            if (!basicInfoForm.name.trim()) {
                showToast("Name is required", "error");
                return;
            }
            if (!basicInfoForm.fatherName.trim()) {
                showToast("Father Name is required", "error");
                return;
            }

            // Validate name: should not contain underscore
            if (basicInfoForm.name.includes("_")) {
                showToast("Employee name is not valid.", "error");
                return;
            }

            // Validate father name: should not contain underscore
            if (basicInfoForm.fatherName.includes("_")) {
                showToast("Employee father name is not valid.", "error");
                return;
            }

            if (!basicInfoForm.dateOfBirth) {
                showToast("Date of Birth is required", "error");
                return;
            }

            // Find country ID from countries API
            const selectedCountry = countries.find(
                (c) => c.country_name === basicInfoForm.nationality
            );
            const countryId = selectedCountry ? selectedCountry.id : null;

            // Prepare payload for API
            // Convert date from "dd/MM/yyyy" format to "2025-09-06" format for API
            let dobFormatted = null;
            if (basicInfoForm.dateOfBirth) {
                try {
                    // Try parsing as "dd/MM/yyyy" format first (new format)
                    let parsedDate = null;
                    try {
                        parsedDate = parse(
                            basicInfoForm.dateOfBirth,
                            "dd/MM/yyyy",
                            new Date()
                        );
                    } catch (e) {
                        // Fallback to old format "MMMM do, yyyy"
                        try {
                            parsedDate = parse(
                                basicInfoForm.dateOfBirth,
                                "MMMM do, yyyy",
                                new Date()
                            );
                        } catch (e2) {
                            // Try ISO format
                            parsedDate = new Date(basicInfoForm.dateOfBirth);
                        }
                    }
                    if (isValid(parsedDate)) {
                        dobFormatted = format(parsedDate, "yyyy-MM-dd");
                    } else {
                        dobFormatted = basicInfoForm.dateOfBirth;
                    }
                } catch (error) {
                    dobFormatted = basicInfoForm.dateOfBirth;
                }
            }

            const payload = {
                name: basicInfoForm.name.trim(),
                f_name: basicInfoForm.fatherName.trim(),
                gender: basicInfoForm.gender.toString(), // Convert to string as API expects
                dob: dobFormatted,
                blood_group: basicInfoForm.bloodGroup || null,
                religion: basicInfoForm.religion.trim() || null,
                disability: basicInfoForm.disability.trim() || null,
                marital_status: basicInfoForm.maritalStatus || null,
                nic: basicInfoForm.nicPassport.trim() || null,
                passport: basicInfoForm.nicPassport.trim() || null,
                domicile: domicileFileUrl || null, // Use file URL instead of text
                nationality: countryId, // Send country ID instead of name
                city: basicInfoForm.city.trim() || null,
                ntn: basicInfoForm.ntn.trim() || null,
            };

            // console.log('Updating employee with payload:', payload);

            // Call update API
            const result = await updateEmployee(employeeId, payload);

            if (result) {
                ////showToast('Basic information updated successfully', 'success');

                // Refresh employee profile data from API to ensure real-time update
                try {
                    const refreshedData = await gettingEmployeeProfile(employeeId);
                    if (refreshedData && refreshedData.DB_DATA) {
                        // Update the employeeData state with fresh data from API
                        setEmployeeData((prevData) => ({
                            ...prevData,
                            ...refreshedData.DB_DATA,
                        }));
                    }
                } catch (refreshError) {
                    console.error("Error refreshing employee profile:", refreshError);
                    // Still update local state as fallback
                    setEmployeeData((prevData) => ({
                        ...prevData,
                        basic_information: {
                            ...prevData.basic_information,
                            emp_name: basicInfoForm.name.trim(),
                            name: basicInfoForm.name.trim(),
                            f_name: basicInfoForm.fatherName.trim(),
                            gender: basicInfoForm.gender,
                            dob: dobFormatted,
                            blood_group: basicInfoForm.bloodGroup,
                            religion: basicInfoForm.religion,
                            disability: basicInfoForm.disability,
                            marital_status: basicInfoForm.maritalStatus,
                            nic: basicInfoForm.nicPassport,
                            passport: basicInfoForm.nicPassport,
                            domicile: domicileFileUrl,
                            nationality: countryId,
                            city: basicInfoForm.city,
                            ntn: basicInfoForm.ntn,
                        },
                    }));
                }

                setOpenBasicInfoDrawer(false);
            }
        } catch (error) {
            console.error("Error updating employee:", error);
            showToast("Failed to update employee information", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const toggleDocSection = (section) => {
        setExpandedDocSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const tabs = [
        {
            label: "Overview",
            value: "overview",
            icon: <FaUser className="w-4 h-4" />,
        },
        {
            label: "Attendance Setting",
            value: "academic",
            icon: <FaClock className="w-4 h-4" />,
        },
        {
            label: "Official Info",
            value: "experience",
            icon: <FaBriefcase className="w-4 h-4" />,
        },
        {
            label: "Documents",
            value: "documents",
            icon: <FaFileAlt className="w-4 h-4" />,
        },
        {
            label: "Salary Settings",
            value: "licenses",
            icon: <FaShieldAlt className="w-4 h-4" />,
        },
        {
            label: "Leave Balance",
            value: "bank",
            icon: <FaListUl className="w-4 h-4" />,
        },
        {
            label: "Checklist",
            value: "checklist",
            icon: <FaTasks className="w-4 h-4" />,
        },
        {
            label: "Account Privileges",
            value: "privileges",
            icon: <FaUserShield className="w-4 h-4" />,
        },
        {
            label: "Repetitive Duties",
            value: "duties",
            icon: <FaRocket className="w-4 h-4" />,
        },
        {
            label: "Accelerate Performance",
            value: "performance",
            icon: <FaRocket className="w-4 h-4" />,
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Spinner className="h-10 w-10 text-blue-500" />
                <Typography variant="h6" color="gray" className="font-normal">
                    Loading employee profile...
                </Typography>
                <Typography variant="small" color="gray" className="font-normal">
                    Please wait while we fetch the data
                </Typography>
            </div>
        );
    }

    // if (!employeeData) {
    //     return (
    //         <div className="flex items-center justify-center h-64">
    //             <Typography variant="h6" color="gray" className="font-normal">
    //                 Employee not found
    //             </Typography>
    //         </div>
    //     );
    // }

    ////console.log('what is the session', section)

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Basic Information */}

            {/* Basic Information Card */}
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                {/* Blue Header */}
                <div className="px-3 sm:px-4 py-3 sm:py-3.5 flex justify-between items-center" style={{ backgroundColor: '#E3F2FD', borderRadius: '8px 8px 0 0' }}>
                    <Typography
                        variant="h6"
                        className="font-semibold text-sm sm:text-[15px]"
                        style={{ color: '#42A5F5' }}
                    >
                        Basic Information
                    </Typography>
                    <Button
                        variant="text"
                        size="sm"
                        className="p-1.5 sm:p-2 text-green-500 rounded-full"
                        onClick={() => setOpenBasicInfoDrawer(true)}
                    >
                        <FaRegPenToSquare size={18} />
                    </Button>
                </div>

                {/* Content Area */}
                <div className="px-3 sm:px-4 py-4 sm:py-6">
                    {/* First Row: Date of Birth, Father Name, Gender */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaCalendar className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Date of Birth
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-sm sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {employeeData?.basic_information?.dob ||
                                        employeeData?.dob ||
                                        "N/A"}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaUsers className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Father Name
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {employeeData?.basic_information?.f_name ||
                                        employeeData?.f_name ||
                                        "N/A"}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaUsers className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Gender
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {(() => {
                                        const gender =
                                            employeeData?.basic_information?.gender ||
                                            employeeData?.gender;
                                        return gender === "1"
                                            ? "Male"
                                            : gender === "0"
                                                ? "Female"
                                                : employeeData?.gender || "N/A";
                                    })()}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t border-dashed border-gray-300 my-3 sm:my-4"></div>

                    {/* Second Row: Nationality, City, Domicile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaMapMarkerAlt className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Nationality
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {(() => {
                                        // Get nationality value from basic_information or employeeData
                                        const basicInfo = employeeData?.basic_information || {};
                                        const nationalityValue =
                                            basicInfo?.nationality ||
                                            basicInfo?.country ||
                                            employeeData?.nationality ||
                                            employeeData?.employee?.nationality;

                                        // Check if it's a number (country ID)
                                        if (nationalityValue) {
                                            const countryId =
                                                typeof nationalityValue === "string" &&
                                                    !isNaN(nationalityValue)
                                                    ? parseInt(nationalityValue)
                                                    : typeof nationalityValue === "number"
                                                        ? nationalityValue
                                                        : null;

                                            if (countryId !== null) {
                                                // Use API countries if available, otherwise fall back to static list
                                                const countryList =
                                                    countries.length > 0 ? countries : staticCountryList;
                                                const foundCountry = countryList.find(
                                                    (c) =>
                                                        c.id === countryId || c.id === String(countryId)
                                                );
                                                return foundCountry ? foundCountry.country_name : "N/A";
                                            }
                                        }

                                        // Return as is if already a country name
                                        return nationalityValue || "N/A";
                                    })()}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaCity className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    City
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {employeeData?.basic_information?.city ||
                                        employeeData?.city ||
                                        "N/A"}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaFileContract className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Domicile
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {(() => {
                                        const domicile =
                                            employeeData?.basic_information?.domicile ||
                                            employeeData?.domicile;
                                        return domicile != null ? (
                                            <Link
                                                to={domicile}
                                                target="_blank"
                                                className="underline decoration-sky-500"
                                            >
                                                View
                                            </Link>
                                        ) : (
                                            "N/A"
                                        );
                                    })()}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t border-dashed border-gray-300 my-3 sm:my-4"></div>

                    {/* Third Row: Religion, Marital Status, Blood Group */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaShieldAlt className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Religion
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanisttext-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {employeeData?.basic_information?.religion ||
                                        employeeData?.religion ||
                                        "N/A"}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaHeart className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Marital Status
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold text-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {getMaritalStatusLabel(
                                        employeeData?.basic_information?.marital_status ??
                                        employeeData?.marital_status ??
                                        null
                                    )}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaHeart className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Blood Group
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold text-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {employeeData?.basic_information?.blood_group ||
                                        employeeData?.blood_group ||
                                        "N/A"}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t border-dashed border-gray-300 my-3 sm:my-4"></div>

                    {/* Fourth Row: Disability, Passport/NIC #, NTN # */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaUserShield className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Disability
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold text-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {employeeData?.basic_information?.disability ||
                                        employeeData?.disability ||
                                        "N/A"}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaPassport className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Passport/NIC #
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold text-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {employeeData?.basic_information?.passport_no ||
                                        employeeData?.passport_no ||
                                        employeeData?.nic ||
                                        "N/A"}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaIdCard className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    NTN #
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold text-xs sm:text-sm text-gray-900 mt-1 break-words"
                                >
                                    {employeeData?.basic_information?.ntn_no ||
                                        employeeData?.ntn ||
                                        "N/A"}
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status and Emergency Contact - Emergency Contacts table scrolls when overflow */}
            <Card>
                <CardBody className="p-3 sm:p-4">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-4">
                        {/* Status Section - fixed width (static data) */}
                        <div className="flex items-start gap-3 w-full md:w-[200px] md:flex-shrink-0">
                            <div className="bg-green-100 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <svg
                                    className="w-5 h-5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs mb-1"
                                >
                                    Status
                                </Typography>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-2 h-2 rounded-full ${employeeData?.basic_information?.status === "1"
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                            }`}
                                    />
                                    <Typography
                                        variant="small"
                                        className={`font-semibold text-sm ${employeeData?.basic_information?.status === "1"
                                            ? "text-gray-600"
                                            : "text-gray-600"
                                            }`}
                                    >
                                        {employeeData?.basic_information?.status === "1"
                                            ? "Active"
                                            : "InActive"}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block border-l border-gray-300"></div>

                        {/* Emergency Contact Section - takes remaining space */}
                        <div className="flex items-start gap-3 flex-1 min-w-0 overflow-hidden md:min-w-[200px]">
                            <div className="bg-orange-100 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <FaPhone className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-center gap-2 mb-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Emergency Contacts
                                    </Typography>
                                    <Button
                                        variant="text"
                                        size="lg"
                                        className="p-1 text-green-500 rounded-full"
                                        onClick={() => {
                                            setEditingContact(null);
                                            setEmergencyContactForm({
                                                contactType: "Contact Number",
                                                contactTitle: "",
                                                countryCode: "",
                                                mobileNumber: "",
                                                network: "",
                                                email: "",
                                                address: "",
                                            });
                                            setOpenEmergencyContactDrawer(true);
                                        }}
                                    >
                                        <FaRegPenToSquare size={14} />
                                    </Button>
                                </div>
                                {employeeData?.Official_Info && employeeData?.Official_Info?.contacts && employeeData?.Official_Info?.contacts.length > 0 ? (
                                    <div className="w-full min-w-0 overflow-auto max-h-[280px] rounded border border-gray-100">
                                        <table className="w-full table-fixed border-collapse min-w-[400px]">
                                            <thead>
                                                <tr className="border-b border-gray-300">
                                                    <th className="px-2 sm:px-3 py-2 text-left w-[20%] min-w-0">
                                                        <Typography
                                                            variant="small"
                                                            className="font-semibold font-Urbanist text-sm text-gray-700 break-words"
                                                        >
                                                            Type
                                                        </Typography>
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 text-left w-[18%] min-w-0">
                                                        <Typography
                                                            variant="small"
                                                            className="font-semibold text-sm text-gray-700 break-words"
                                                        >
                                                            Title
                                                        </Typography>
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 text-left min-w-0 break-words" style={{ width: '42%' }}>
                                                        <Typography
                                                            variant="small"
                                                            className="font-semibold text-sm text-gray-700 break-words"
                                                        >
                                                            Detail
                                                        </Typography>
                                                    </th>
                                                    <th className="px-2 sm:px-3 py-2 text-left w-[20%] min-w-0">
                                                        <Typography
                                                            variant="small"
                                                            className="font-semibold text-sm text-gray-700"
                                                        >
                                                            Action
                                                        </Typography>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employeeData.Official_Info.contacts.map((contact, index) => (
                                                    <tr key={contact.id || `contact-${index}`} className="border-b border-gray-100 last:border-b-0">
                                                        <td className="px-2 sm:px-3 py-2 align-top min-w-0">
                                                            <Typography
                                                                variant="small"
                                                                className="font-normal text-sm text-gray-900 break-words"
                                                            >
                                                                {contact.contact_type || "N/A"}
                                                            </Typography>
                                                        </td>
                                                        <td className="px-2 sm:px-3 py-2 align-top min-w-0">
                                                            <Typography
                                                                variant="small"
                                                                className="font-normal text-sm text-gray-900 break-words"
                                                            >
                                                                {contact.contact_title || contact.contact_type || "N/A"}
                                                            </Typography>
                                                        </td>
                                                        <td className="px-2 sm:px-3 py-2 align-top min-w-0" style={{ wordBreak: 'break-word' }}>
                                                            <Typography
                                                                variant="small"
                                                                className="font-normal text-sm text-gray-900 break-words"
                                                            >
                                                                {contact.contact || "N/A"}
                                                            </Typography>
                                                        </td>
                                                        <td className="px-2 sm:px-3 py-2 align-top min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleEditContact(contact)}
                                                                    className="text-green-500 hover:text-green-600 transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <FaRegPenToSquare size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteContact(contact.id)}
                                                                    className="text-red-500 hover:text-red-600 transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <FaTimes size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-Urbanist text-sm text-gray-900 break-words"
                                    >
                                        No contact information available
                                    </Typography>
                                )}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const renderAttendanceSetting = () => (
        <div className="space-y-6">
            {/* Attendance Setting Card */}
            <div className="bg-white rounded-t-lg overflow-hidden border border-gray-200">
                {/* Blue Header */}
                <div className="bg-blue-50 rounded-t-lg px-4 py-3 flex justify-between items-center">
                    <Typography
                        variant="h6"
                        className="font-semibold text-sm sm:text-[15px]"
                        style={{ color: '#42A5F5' }}
                    >
                        Attendance Setting
                    </Typography>
                    <Button
                        variant="text"
                        size="sm"
                        className="p-2 text-green-500 rounded-full"
                        onClick={() => setOpenAttendanceSettingDrawer(true)}
                    >
                        <FaRegPenToSquare size={18} />
                        {/* <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg> */}
                    </Button>
                </div>

                {/* Content Area */}
                <div className="px-4 py-6">
                    {/* First Row: HR Policy, Bio ID, Policy ID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <BsPersonGear className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    HR Policy
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-sm text-gray-900 mt-1"
                                >
                                    {employeeData?.attendence?.policyData?.policy_name ||
                                        employeeData?.employee?.hr_policy ||
                                        "-"}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <LuFingerprint className="w-5 h-5 font-bold text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Bio ID
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-sm text-gray-900 mt-1"
                                >
                                    {employeeData?.attendence?.bioRegistration ||
                                        employeeData?.employee?.bio_id ||
                                        "-"}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <FaUsers className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Policy ID
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-sm text-gray-900 mt-1"
                                >
                                    {employeeData?.attendence?.policyData?.id ||
                                        employeeData?.employee?.hr_policy ||
                                        "-"}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t border-dashed border-gray-300 my-4"></div>

                    {/* Second Row: Team, Working Shift Name, Planner Name */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <FaUsers className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Team
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-sm text-gray-900 mt-1"
                                >
                                    {employeeData?.attendence?.team?.name || "-"}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <MdWatchLater className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Working Shift Name
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-sm text-gray-900 mt-1"
                                >
                                    {employeeData?.attendence?.Working_shift_name || "-"}
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <MdFileOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex flex-col">
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-normal text-xs"
                                >
                                    Planner Name
                                </Typography>
                                <Typography
                                    variant="small"
                                    className="font-semibold font-Urbanist text-sm text-gray-900 mt-1"
                                >
                                    {employeeData?.attendence?.planner_name || "-"}
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t border-dashed border-gray-300 my-4"></div>

                    {/* Third Row: Web Attendance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <FaLaptop className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-semibold text-gray-900 text-xs"
                                >
                                    Web Attendance
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center justify-start md:justify-end md:-ml-12 min-w-0">
                            <span
                                className={`cursor-pointer font-medium text-xs rounded-[7px] w-[110px] min-w-[110px] inline-flex items-center justify-center px-4 py-1 transition-colors ${employeeData?.attendence?.Web_Attendance === "Enable" ||
                                    employeeData?.attendence?.Web_Attendance === 1 ||
                                    employeeData?.attendence?.Web_Attendance === "1"
                                    ? "bg-[#DBFFF5] text-[#0ACF97] "
                                    : "bg-[#FFF0F4] text-[#FF4979]"
                                    }`}
                                onClick={() => {
                                    setAttendanceToggleType("web");
                                    const webValue = employeeData?.attendence?.Web_Attendance;
                                    setAttendanceToggleForm({
                                        mobileAttendance: "",
                                        attendancePremises: "",
                                        webAttendance:
                                            webValue === "Enable" ||
                                                webValue === 1 ||
                                                webValue === "1"
                                                ? "1"
                                                : "0",
                                    });
                                    setOpenAttendanceToggleDrawer(true);
                                }}
                            >
                                {employeeData?.attendence?.Web_Attendance === "Enable" ||
                                    employeeData?.attendence?.Web_Attendance === 1 ||
                                    employeeData?.attendence?.Web_Attendance === "1"
                                    ? "Enable"
                                    : "Disabled"}
                            </span>
                        </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t border-dashed border-gray-300 my-4"></div>

                    {/* Fourth Row: Mobile Attendance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <FaMobile className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-semibold text-gray-900 text-xs"
                                >
                                    Mobile Attendance
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center justify-start md:justify-end md:-ml-12 min-w-0">
                            <span
                                className={`cursor-pointer font-medium text-xs rounded-[7px] w-[110px] min-w-[110px] inline-flex items-center justify-center px-4 py-1 transition-colors ${employeeData?.attendence?.Mobile_Attendance === "Enable" ||
                                    employeeData?.attendence?.Mobile_Attendance === 1 ||
                                    employeeData?.attendence?.Mobile_Attendance === "1"
                                    ? "bg-[#DBFFF5] text-[#0ACF97] "
                                    : "bg-[#FFF0F4] text-[#FF4979]"
                                    }`}
                                onClick={() => {
                                    setAttendanceToggleType("mobile");
                                    const mobileValue =
                                        employeeData?.attendence?.Mobile_Attendance;
                                    setAttendanceToggleForm({
                                        mobileAttendance:
                                            mobileValue === "Enable" ||
                                                mobileValue === 1 ||
                                                mobileValue === "1"
                                                ? "1"
                                                : "0",
                                        attendancePremises: "",
                                    });
                                    setOpenAttendanceToggleDrawer(true);
                                }}
                            >
                                {employeeData?.attendence?.Mobile_Attendance === "Enable" ||
                                    employeeData?.attendence?.Mobile_Attendance === 1 ||
                                    employeeData?.attendence?.Mobile_Attendance === "1"
                                    ? "Enable"
                                    : "Disabled"}
                            </span>
                        </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t border-dashed border-gray-300 my-4"></div>

                    {/* Fifth Row: Attendance Premises */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                                <FaUsers className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="font-semibold text-gray-900 text-xs"
                                >
                                    Attendance Premises
                                </Typography>
                            </div>
                        </div>
                        <div className="flex items-center justify-start md:justify-end md:-ml-12 min-w-0">
                            <span
                                className={`cursor-pointer font-medium text-xs rounded-[7px] w-[110px] min-w-[110px] inline-flex items-center justify-center px-4 py-1 transition-colors ${employeeData?.attendence?.Attendance_Premises ===
                                    "Enable" ||
                                    employeeData?.attendence?.Attendance_Premises === 1 ||
                                    employeeData?.attendence?.Attendance_Premises === "1"
                                    ? "bg-[#DBFFF5] text-[#0ACF97]"
                                    : "bg-[#FFF0F4] text-[#FF4979]"
                                    }`}
                                onClick={() => {
                                    setAttendanceToggleType("premises");
                                    const premisesValue =
                                        employeeData?.attendence?.Attendance_Premises;
                                    setAttendanceToggleForm({
                                        mobileAttendance: "",
                                        attendancePremises:
                                            premisesValue === "Enable" ||
                                                premisesValue === 1 ||
                                                premisesValue === "1"
                                                ? "1"
                                                : "0",
                                    });
                                    setOpenAttendanceToggleDrawer(true);
                                }}
                            >
                                {employeeData?.attendence?.Attendance_Premises === "Enable" ||
                                    employeeData?.attendence?.Attendance_Premises === 1 ||
                                    employeeData?.attendence?.Attendance_Premises === "1"
                                    ? "Enable"
                                    : "Disabled"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // console.log('ttttttttt', employeeData?.Official_Info?.tage[0].tag_name)

    const renderOfficialInfo = () => {
        const accordionSections = [
            {
                id: "officialInfo",
                title: "Official Info",
                content: (
                    <div className="space-y-4 py-3">
                        {/* Row 1: Employee Id, Employee Status, Tag */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaPersonHalfDress className="text-blue-500 font-bold w-5 h-5" size={14} />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Employee Id
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-Urbanist text-sm leading-none text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.emp_id ||
                                            employeeData?.emp_id?.id ||
                                            "N/A"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <IoTimerOutline className="text-blue-500 w-5 font-bold h-5" size={14} />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Employee Status
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold font-Urbanist text-sm leading-none text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.employment_status ||
                                            "Permanent"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaUsers className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Tag
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-Urbanist text-sm text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.tage?.[0]?.tag_name || "N/A"}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {/* Dashed Separator */}
                        <div className="border-t border-dashed border-gray-300"></div>

                        {/* Row 2: EOBI, Provident Fund, Social Security */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaMoneyBills className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        EOBI
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className={`font-semibold font-urbanist text-sm mt-1 ${employeeData?.Official_Info?.eobi === "1"
                                            ? "text-green-500"
                                            : "text-red-500"
                                            }`}
                                    >
                                        {employeeData?.Official_Info?.eobi === "1" ? "Yes" : "No"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaMoneyBills className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Provident Fund
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className={`font-semibold font-Urbanist text-sm mt-1 ${employeeData?.Official_Info?.provident_fund === "1"
                                            ? "text-green-500"
                                            : "text-red-500"
                                            }`}
                                    >
                                        {employeeData?.Official_Info?.provident_fund === "1"
                                            ? "Available"
                                            : "Not Available"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <AiFillSafetyCertificate className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Social Security
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className={`font-semibold font-Urbanist text-sm mt-1 ${employeeData?.Official_Info?.social_security > 0
                                            ? "text-green-500"
                                            : "text-red-500"
                                            }`}
                                    >
                                        {employeeData?.Official_Info?.social_security > 0
                                            ? "Yes"
                                            : "No"}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {/* Dashed Separator */}
                        <div className="border-t border-dashed border-gray-300"></div>

                        {/* Row 3: Insurance Status, Health Benefit, Designation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <BsCardText className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Insurance Status
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className={`font-semibold font-Urbanist text-sm mt-1 ${employeeData?.Official_Info?.insurance === "1"
                                            ? "text-green-500"
                                            : "text-red-500"
                                            }`}
                                    >
                                        {employeeData?.Official_Info?.insurance === "1"
                                            ? "Yes"
                                            : "No"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaHeartCrack className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Health Benefit
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className={`font-semibold font-Urbanist text-sm mt-1 ${employeeData?.Official_Info?.health_benefits === "1"
                                            ? "text-green-500"
                                            : "text-red-500"
                                            }`}
                                    >
                                        {employeeData?.Official_Info?.health_benefits === "1"
                                            ? "Yes"
                                            : "No"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <PiLockBold className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Designation
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-Urbanist text-sm text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.designation ||
                                            employeeData?.designationObj?.title ||
                                            employeeData?.Official_Info?.designationObj?.title ||
                                            employeeData?.employee?.designationObj?.title ||
                                            "N/A"}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {/* Dashed Separator */}
                        <div className="border-t border-dashed border-gray-300"></div>

                        {/* Row 4: Branch, Department, Join Date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaCodeBranch className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Branch
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-urbanist text-sm text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.branch?.branch_name ||
                                            employeeData?.employee?.branch?.branch_name ||
                                            "N/A"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaBuilding className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Department
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-Urbanist  text-sm text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.department?.name ||
                                            employeeData?.employee?.department?.name ||
                                            "N/A"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <CgCalendarDates className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Join Date
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-Urbanist text-sm text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.join_date
                                            ? formatTimestampToDate(
                                                employeeData.Official_Info.join_date
                                            )
                                            : "N/A"}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        {/* Dashed Separator */}
                        <div className="border-t border-dashed border-gray-300"></div>

                        {/* Row 5: Date Of Retirement, Date Of Exit */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaChartLine className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Date Of Retirement
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-Urbanist text-sm text-gray-900 mt-1"
                                    >
                                        Not Defined
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaChartLine className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Date Of Exit
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className={`font-semibold font-Urbanist text-sm mt-1 ${employeeData?.Official_Info?.job_exit_date === 0 ||
                                            !employeeData?.Official_Info?.job_exit_date
                                            ? "text-gray-900"
                                            : "text-red-500"
                                            }`}
                                    >
                                        {employeeData?.Official_Info?.job_exit_date === 0 ||
                                            !employeeData?.Official_Info?.job_exit_date
                                            ? "In service"
                                            : formatTimestampToDate(
                                                employeeData?.Official_Info?.job_exit_date
                                            )}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: "reportingManager",
                title: "Reporting Manager",
                content: (
                    <div className="pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-row gap-3 items-center">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaUsers className="text-blue-500 w-4 h-4" />
                                </div>
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-medium"
                                >
                                    {employeeData?.Official_Info?.find_reporting_manager?.name ||
                                        "No reporting manager information available"}
                                </Typography>
                            </div>
                            <button
                                onClick={() => setOpenChangeReportingManagerDrawer(true)}
                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                title="Change Reporting Manager"
                            >
                                <FaRegPenToSquare className="text-green-500" size={20} />
                            </button>
                        </div>
                    </div>
                ),
            },
            {
                id: "jobDescription",
                title: "Job Description",
                content: (
                    <div className="pt-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <FaUsers className="text-blue-500 w-4 h-4" />
                            </div>
                            <div className="flex-1 mt-2">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-medium"
                                >
                                    {employeeData?.Official_Info?.job_description ||
                                        "No job description available"}
                                </Typography>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: "employeeStatus",
                title: "Employee Current Status",
                content: (
                    <div className="py-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="flex items-center  gap-3">
                                <div className="w-10 h-10 rounded-lg mt-4  bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaCodeBranch className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal mt-4 text-xs"
                                    >
                                        Branch
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-urbanist text-sm text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.branch?.branch_name ||
                                            employeeData?.employee?.branch?.branch_name ||
                                            "N/A"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start mt-4 gap-3">
                                <div className="w-10 h-10 rounded-lg  bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaBuilding className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Department
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-urbanist text-sm text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.department?.name ||
                                            employeeData?.employee?.department?.name ||
                                            "N/A"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start mt-4 gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaUsers className="text-blue-500 w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Designation
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-urbanist text-sm text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.designationObj?.title ||
                                            employeeData?.employee?.designationObj?.title ||
                                            "N/A"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex items-start mt-4 gap-3">
                                <div className="w-10 h-10 rounded-lg  bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaCalendar className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-normal text-xs"
                                    >
                                        Joining Date
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        className="font-semibold font-urbanist text-sm text-gray-900 mt-1"
                                    >
                                        {employeeData?.Official_Info?.join_date
                                            ? formatTimestampToDate(
                                                employeeData.Official_Info.join_date
                                            )
                                            : formatTimestampToDate(
                                                employeeData?.employee?.join_date
                                            ) || "N/A"}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: "transferHistory",
                title: "Transfer/ Promotion History",
                content: (
                    <div className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                            <div className="flex flex-row gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaUsers className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>

                                <div className="min-w-0">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-medium mb-1"
                                    >
                                        Branch
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold text-sm break-words"
                                    >
                                        {employeeData?.Official_Info?.branch?.branch_name ||
                                            employeeData?.employee?.branch?.branch_name ||
                                            "N/A"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaBuilding className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-medium mb-1"
                                    >
                                        Department
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold text-sm break-words"
                                    >
                                        {employeeData?.Official_Info?.department?.name ||
                                            employeeData?.employee?.department?.name ||
                                            "N/A"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaUserTie className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-medium mb-1"
                                    >
                                        Designation
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold text-sm break-words"
                                    >
                                        {employeeData?.Official_Info?.designationObj?.title ||
                                            employeeData?.employee?.designationObj?.title ||
                                            "N/A"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaCalendar className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-medium mb-1"
                                    >
                                        Joining Date
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold text-sm break-words"
                                    >
                                        {employeeData?.Official_Info?.join_date
                                            ? formatTimestampToDate(
                                                employeeData.Official_Info.join_date
                                            )
                                            : formatTimestampToDate(
                                                employeeData?.employee?.join_date
                                            ) || "N/A"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaClock className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-medium mb-1"
                                    >
                                        Entry Date
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold text-sm break-words"
                                    >
                                        {employeeData?.Official_Info?.join_date
                                            ? formatTimestampToDate(
                                                employeeData.Official_Info.join_date
                                            )
                                            : formatTimestampToDate(
                                                employeeData?.employee?.join_date
                                            ) || "N/A"}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: "joiningHistory",
                title: "Employee Joining/ Left History",
                content: (
                    <div className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            <div className="flex flex-row gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaUsers className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-medium mb-1"
                                    >
                                        Emp status
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold text-sm break-words"
                                    >
                                        {employeeData?.Official_Info?.employment_status || "Join"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaCalendar className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-medium mb-1"
                                    >
                                        Join date
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold text-sm break-words"
                                    >
                                        {employeeData?.Official_Info?.join_date
                                            ? formatTimestampToDate(
                                                employeeData.Official_Info.join_date
                                            )
                                            : formatTimestampToDate(
                                                employeeData?.employee?.join_date
                                            ) || "2025-09-18"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaCalendar className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-medium mb-1"
                                    >
                                        Entry Date
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold text-sm break-words"
                                    >
                                        {employeeData?.Official_Info?.join_date
                                            ? formatTimestampToDate(
                                                employeeData.Official_Info.join_date,
                                                "MMM-dd-yyyy"
                                            )
                                            : formatTimestampToDate(
                                                employeeData?.employee?.join_date,
                                                "MMM-dd-yyyy"
                                            ) || "Sep-21-2025"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <FaShieldAlt className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="min-w-0">
                                    <Typography
                                        variant="small"
                                        color="gray"
                                        className="font-medium mb-1"
                                    >
                                        Permanent date
                                    </Typography>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-semibold text-sm break-words"
                                    >
                                        --
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: "officialInfoHistory",
                title: "Official Info History",
                content: (
                    <div className="flex flex-row gap-2 items-center">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 mt-2 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <FaUsers className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="pt-4">
                            <Typography variant="small" color="gray" className="font-semibold text-sm front-urbanist text-gray-900">
                                No official info history available
                            </Typography>
                        </div>
                    </div>
                ),
            },
        ];

        return (
            <div className="space-y-4">
                {accordionSections.map((section) => (
                    <div
                        key={section.id}
                        className="border border-gray-200 rounded-lg bg-white shadow-sm"
                    >
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer transition-colors"
                            onClick={() => toggleSection(section.id)}
                            style={{ backgroundColor: '#E3F2FD', borderRadius: '8px 8px 0 0' }}
                        >
                            <Typography
                                variant="h6"
                                className="font-semibold text-[15px]"
                                style={{ color: '#42A5F5' }}
                            >
                                {section.title}
                            </Typography>
                            <div style={{ color: '#42A5F5' }}>
                                <FaChevronDown
                                    size={18}
                                    className={`transition-transform duration-500 ease-in-out ${expandedSections[section.id] ? 'rotate-0' : 'rotate-180'
                                        }`}
                                />
                            </div>
                        </div>
                        <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections[section.id]
                                ? 'max-h-[5000px] opacity-100'
                                : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="px-4 pb-4">
                                {section.id === "officialInfo" && (
                                    <div className="flex justify-end mb-4">
                                        <Button
                                            variant="text"
                                            size="sm"
                                            className="p-2 hover:bg-gray-200 rounded-full"
                                            onClick={() => setOpenOfficialInfoDrawer(true)}
                                        >
                                            {/* <svg
                                                className="w-5 h-5 text-gray-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg> */}
                                        </Button>
                                    </div>
                                )}
                                {section.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Helper function to render grid item with icon
    const renderGridItem = (label, value) => {
        return (
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FaUsers className="text-blue-500 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <Typography
                        variant="small"
                        color="gray"
                        className="font-normal text-xs mb-1"
                    >
                        {label}
                    </Typography>
                    <Typography
                        variant="small"
                        className="font-semibold text-sm text-gray-900 break-words"
                    >
                        {value || "--"}
                    </Typography>
                </div>
            </div>
        );
    };

    const renderDocuments = () => {
        const documentSections = [
            { id: "academics", title: "Academics" },
            { id: "experience", title: "Experience" },
            { id: "dependents", title: "Dependents" },
            { id: "license", title: "License" },
            { id: "references", title: "References" },
            { id: "documents", title: "Documents" },
        ];

        return (
            <div className="space-y-4">
                {/* <Typography variant="h5" color="blue-gray" className="mb-4 text-[16px]">
                    Employee Documents
                </Typography> */}
                {documentSections.map((section) => (
                    <div
                        key={section.id}
                        className="border border-gray-200 rounded-lg bg-white shadow-sm"
                    >
                        <div
                            className="flex justify-between items-center p-4 cursor-pointer transition-colors"
                            onClick={() => toggleDocSection(section.id)}
                            style={{ backgroundColor: '#E3F2FD', borderRadius: '8px 8px 0 0' }}
                        >
                            <Typography
                                variant="h6"
                                className="font-semibold text-[15px]"
                                style={{ color: '#42A5F5' }}
                            >
                                {section.title}
                            </Typography>
                            <div className="flex items-center gap-2">
                                {expandedDocSections[section.id] && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (section.id === "academics") {
                                                setEditingAcademicRecord(null);
                                                setOpenAcademicsDrawer(true);
                                            } else if (section.id === "experience") {
                                                setOpenExperienceDrawer(true);
                                            } else if (section.id === "dependents") {
                                                setOpenDependentDrawer(true);
                                            } else if (section.id === "license") {
                                                setOpenLicenseDrawer(true);
                                            } else if (section.id === "references") {
                                                setOpenReferenceDrawer(true);
                                            } else if (section.id === "documents") {
                                                setOpenDocumentsDrawer(true);
                                            }
                                        }}
                                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200"
                                        title={`Edit ${section.title}`}
                                    >

                                        <FaRegPenToSquare size={18} className="text-green-500" />
                                        {/* <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg> */}
                                    </button>
                                )}
                                <div style={{ color: '#42A5F5' }}>
                                    <FaChevronDown
                                        size={18}
                                        className={`transition-transform duration-500 ease-in-out ${expandedDocSections[section.id] ? 'rotate-0' : 'rotate-180'
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                        <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedDocSections[section.id]
                                ? 'max-h-[5000px] opacity-100'
                                : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="px-4 pb-4">
                                {/* Academics Grid Layout */}
                                {section.id === "academics" && (
                                    <div className="space-y-4">
                                        {employeeData?.employee_documents?.employee_documents
                                            ?.length > 0 ? (
                                            employeeData.employee_documents.employee_documents.map(
                                                (doc, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white hover:shadow-md transition-shadow duration-200"
                                                    >
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                                            {renderGridItem(
                                                                "Degree/ Certificate",
                                                                doc.degree_title
                                                            )}
                                                            {renderGridItem(
                                                                "Obtained Marks",
                                                                doc.obtained_marks_gpa
                                                            )}
                                                            {renderGridItem(
                                                                "Total Marks",
                                                                doc.total_marks_gpa
                                                            )}
                                                            {renderGridItem("Grade", doc.grade)}
                                                            {renderGridItem(
                                                                "Board/Uni",
                                                                doc.board_univ
                                                            )}
                                                            {renderGridItem("Remarks", doc.remarks)}
                                                        </div>
                                                        {/* <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingAcademicRecord(doc);
                                                                    setOpenAcademicsDrawer(true);
                                                                }}
                                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                                                title="Edit record"
                                                            >
                                                                <FaEdit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteAcademic(doc.id)
                                                                }
                                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                                                                title="Delete record"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </div> */}
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <div className="py-8 text-center">
                                                <Typography variant="small" color="gray" className="text-sm">
                                                    No academic records found
                                                </Typography>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Other sections - keep table layout */}
                                {section.id !== "academics" && (
                                    <div className="overflow-x-auto">
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="border-b-2 border-gray-200 bg-gray-50">

                                                        {/* Experience table headers */}
                                                        {section.id === "experience" && (
                                                            <>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold  text-xs uppercase tracking-wide"
                                                                    >
                                                                        Org/Institute
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Designation
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Duration
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Salary
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Leaving reason
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-center py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Action
                                                                    </Typography>
                                                                </th>
                                                            </>
                                                        )}

                                                        {/* Dependents table headers */}
                                                        {section.id === "dependents" && (
                                                            <>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Name
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Gender
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Relation
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Date of Birth
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Contact
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-center py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Action
                                                                    </Typography>
                                                                </th>
                                                            </>
                                                        )}

                                                        {/* License table headers */}
                                                        {section.id === "license" && (
                                                            <>
                                                                <th className="text-left py-3 px-4 w-1/7">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        License Type
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/7">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Title
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/7">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        License#
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/7">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Issuing Authority
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/7">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Issue Date
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/7">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Expiry Date
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-center py-3 px-4 w-1/7">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Action
                                                                    </Typography>
                                                                </th>
                                                            </>
                                                        )}

                                                        {/* References table headers */}
                                                        {section.id === "references" && (
                                                            <>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Name
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Source
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Relation
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Contact
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-left py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Address
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-center py-3 px-4 w-1/6">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Action
                                                                    </Typography>
                                                                </th>
                                                            </>
                                                        )}

                                                        {/* Documents table headers */}
                                                        {section.id === "documents" && (
                                                            <>
                                                                <th className="text-left py-3 px-4 w-1/4">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Title
                                                                    </Typography>
                                                                </th>
                                                                <th className="text-center py-3 px-4 w-1/2">
                                                                    <Typography
                                                                        variant="small"
                                                                        color="gray"
                                                                        className="font-semibold text-xs uppercase tracking-wide"
                                                                    >
                                                                        Actions
                                                                    </Typography>
                                                                </th>
                                                            </>
                                                        )}

                                                        {section.id !== "academics" &&
                                                            section.id !== "experience" &&
                                                            section.id !== "dependents" &&
                                                            section.id !== "license" &&
                                                            section.id !== "references" &&
                                                            section.id !== "documents" &&
                                                            section.id !== "leave_balance" && (
                                                                <>
                                                                    <th className="text-left py-3 px-4 w-1/3">
                                                                        <Typography
                                                                            variant="small"
                                                                            color="gray"
                                                                            className="font-semibold text-xs uppercase tracking-wide"
                                                                        >
                                                                            Name
                                                                        </Typography>
                                                                    </th>
                                                                    <th className="text-left py-3 px-4 w-1/3">
                                                                        <Typography
                                                                            variant="small"
                                                                            color="gray"
                                                                            className="font-semibold text-xs uppercase tracking-wide"
                                                                        >
                                                                            Details
                                                                        </Typography>
                                                                    </th>
                                                                    <th className="text-center py-3 px-4 w-1/3">
                                                                        <Typography
                                                                            variant="small"
                                                                            color="gray"
                                                                            className="font-semibold text-xs uppercase tracking-wide"
                                                                        >
                                                                            Action
                                                                        </Typography>
                                                                    </th>
                                                                </>
                                                            )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {/* Experience table data */}
                                                    {section.id === "experience" &&
                                                        (employeeData?.employee_documents?.employee_experience
                                                            ?.length > 0 ? (
                                                            employeeData.employee_documents.employee_experience.map(
                                                                (exp, index) => (
                                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography
                                                                                variant="small"
                                                                                color="blue-gray"
                                                                                className="font-semibold text-sm"
                                                                            >
                                                                                {exp.org_name || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="font-semibold text-sm">
                                                                                {exp.designation || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="font-semibold text-sm">
                                                                                {exp.from_date && exp.to_date
                                                                                    ? `${new Date(
                                                                                        exp.from_date
                                                                                    ).toLocaleDateString()} - ${new Date(
                                                                                        exp.to_date
                                                                                    ).toLocaleDateString()}`
                                                                                    : "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm font-semibold">
                                                                                {exp.salary
                                                                                    ? `$${parseFloat(
                                                                                        exp.salary
                                                                                    ).toLocaleString()}`
                                                                                    : "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm font-semibold">
                                                                                {exp.leave_reason || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100 text-center">
                                                                            <div className="flex  justify-center">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingExperienceRecord(exp);
                                                                                        setOpenExperienceDrawer(true);
                                                                                    }}
                                                                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                                                                    title="Edit record"
                                                                                >
                                                                                    <FaEdit size={14} className="text-green-500" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleDeleteExperience(exp.id)
                                                                                    }
                                                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                                                                                    title="Delete record"
                                                                                >
                                                                                    <FaTrash size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6" className="py-8 text-center border-b border-gray-100">
                                                                    <Typography variant="small" color="gray" className="text-sm">
                                                                        No experience records found
                                                                    </Typography>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                    {/* Dependents table data */}
                                                    {section.id === "dependents" &&
                                                        (employeeData?.employee_documents?.depanedent?.length >
                                                            0 ? (
                                                            employeeData.employee_documents.depanedent.map(
                                                                (dep, index) => (
                                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography
                                                                                variant="small"
                                                                                color="blue-gray"
                                                                                className="font-medium text-sm"
                                                                            >
                                                                                {dep.name || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {dep.gender === "0"
                                                                                    ? "Male"
                                                                                    : dep.gender === "1"
                                                                                        ? "Female"
                                                                                        : "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {dep.relationship || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {dep.dob
                                                                                    ? new Date(dep.dob).toLocaleDateString()
                                                                                    : "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {dep.contact || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100 text-center">
                                                                            <div className="flex gap-2 justify-center">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingDependentRecord(dep);
                                                                                        setOpenDependentDrawer(true);
                                                                                    }}
                                                                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                                                                    title="Edit record"
                                                                                >
                                                                                    <FaEdit size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleDeleteDependent(dep.id)
                                                                                    }
                                                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                                                                                    title="Delete record"
                                                                                >
                                                                                    <FaTrash size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6" className="py-8 text-center border-b border-gray-100">
                                                                    <Typography variant="small" color="gray" className="text-sm">
                                                                        No dependent records found
                                                                    </Typography>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                    {/* License table data */}
                                                    {section.id === "license" &&
                                                        (employeeData?.employee_documents?.employee_License
                                                            ?.length > 0 ? (
                                                            employeeData.employee_documents.employee_License.map(
                                                                (license, index) => (
                                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography
                                                                                variant="small"
                                                                                color="blue-gray"
                                                                                className="font-medium text-sm"
                                                                            >
                                                                                {license.license_type === 1
                                                                                    ? "Driving License"
                                                                                    : license.license_type === 2
                                                                                        ? "Professional License"
                                                                                        : license.license_type === 3
                                                                                            ? "Medical License"
                                                                                            : license.license_type === 4
                                                                                                ? "Teaching License"
                                                                                                : license.license_type === 5
                                                                                                    ? "Engineering License"
                                                                                                    : license.license_type === 6
                                                                                                        ? "Legal License"
                                                                                                        : license.license_type === 7
                                                                                                            ? "Other"
                                                                                                            : "Unknown"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {license.license_title || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {license.license_number || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {license.issuing_authority || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {license.issue_date
                                                                                    ? new Date(
                                                                                        license.issue_date
                                                                                    ).toLocaleDateString()
                                                                                    : "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {license.expiry_date
                                                                                    ? new Date(
                                                                                        license.expiry_date
                                                                                    ).toLocaleDateString()
                                                                                    : "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100 text-center">
                                                                            <div className="flex gap-2 justify-center">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingLicenseRecord(license);
                                                                                        setOpenLicenseDrawer(true);
                                                                                    }}
                                                                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                                                                    title="Edit record"
                                                                                >
                                                                                    <FaEdit size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleDeleteLicense(license.id)
                                                                                    }
                                                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                                                                                    title="Delete record"
                                                                                >
                                                                                    <FaTrash size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="7" className="py-8 text-center border-b border-gray-100">
                                                                    <Typography variant="small" color="gray" className="text-sm">
                                                                        No license records found
                                                                    </Typography>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                    {/* References table data */}
                                                    {section.id === "references" &&
                                                        (employeeData?.employee_documents?.employee_refcence
                                                            ?.length > 0 ? (
                                                            employeeData.employee_documents.employee_refcence.map(
                                                                (ref, index) => (
                                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography
                                                                                variant="small"
                                                                                color="blue-gray"
                                                                                className="font-medium text-sm"
                                                                            >
                                                                                {ref.ref_name || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {ref.ref_source === 1
                                                                                    ? "External"
                                                                                    : ref.ref_source === 2
                                                                                        ? "Internal"
                                                                                        : ref.ref_source === 3
                                                                                            ? "Professional"
                                                                                            : ref.ref_source === 4
                                                                                                ? "Personal"
                                                                                                : "Unknown"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {ref.ref_relation || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {ref.ref_contact || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography variant="small" color="blue-gray" className="text-sm">
                                                                                {ref.ref_address || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100 text-center">
                                                                            <div className="flex gap-2 justify-center">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingReferenceRecord(ref);
                                                                                        setOpenReferenceDrawer(true);
                                                                                    }}
                                                                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                                                                    title="Edit record"
                                                                                >
                                                                                    <FaEdit size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleDeleteReference(ref.id)
                                                                                    }
                                                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                                                                                    title="Delete record"
                                                                                >
                                                                                    <FaTrash size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6" className="py-8 text-center border-b border-gray-100">
                                                                    <Typography variant="small" color="gray" className="text-sm">
                                                                        No reference records found
                                                                    </Typography>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                    {/* Documents table data */}
                                                    {section.id === "documents" &&
                                                        (employeeData?.employee_documents?.employee_document
                                                            ?.length > 0 ? (
                                                            employeeData.employee_documents.employee_document.map(
                                                                (doc, index) => (
                                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                        <td className="py-4 px-4 border-b border-gray-100">
                                                                            <Typography
                                                                                variant="small"
                                                                                color="blue-gray"
                                                                                className="font-medium text-sm"
                                                                            >
                                                                                {doc.doc_title || "--"}
                                                                            </Typography>
                                                                        </td>
                                                                        <td className="py-4 px-4 border-b border-gray-100 text-center">
                                                                            <div className="flex gap-2 justify-center">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (doc.doc_name) {
                                                                                            window.open(doc.doc_name, "_blank");
                                                                                        }
                                                                                    }}
                                                                                    className="px-4 py-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                                                                                    title="View Document"
                                                                                >
                                                                                    <FaEye size={14} className="inline mr-2" />
                                                                                    View
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setEditingDocumentRecord(doc);
                                                                                        setOpenDocumentsDrawer(true);
                                                                                    }}
                                                                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
                                                                                    title="Edit record"
                                                                                >
                                                                                    <FaEdit size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleDeleteDocument(doc.id)
                                                                                    }
                                                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                                                                                    title="Delete record"
                                                                                >
                                                                                    <FaTrash size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="2" className="py-8 text-center border-b border-gray-100">
                                                                    <Typography variant="small" color="gray" className="text-sm">
                                                                        No document records found
                                                                    </Typography>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                    {/* Default data for other sections */}
                                                    {section.id !== "academics" &&
                                                        section.id !== "experience" &&
                                                        section.id !== "dependents" &&
                                                        section.id !== "license" &&
                                                        section.id !== "references" &&
                                                        section.id !== "documents" &&
                                                        section.id !== "leave_balance" && (
                                                            <tr className="hover:bg-gray-50 transition-colors">
                                                                <td className="py-4 px-4 border-b border-gray-100">
                                                                    <Typography variant="small" color="gray" className="text-sm">
                                                                        --
                                                                    </Typography>
                                                                </td>
                                                                <td className="py-4 px-4 border-b border-gray-100">
                                                                    <Typography variant="small" color="gray" className="text-sm">
                                                                        --
                                                                    </Typography>
                                                                </td>
                                                                <td className="py-4 px-4 border-b border-gray-100 text-center">
                                                                    <Typography variant="small" color="gray" className="text-sm">
                                                                        --
                                                                    </Typography>
                                                                </td>
                                                            </tr>
                                                        )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderSalarySettings = () => {
        const salarySettings = employeeData?.Salary_Settings;
        const bankInfo = salarySettings?.["Bank account info"] || {};
        const netSalary = salarySettings?.["Net Salary"] || {};
        const fullSalaryData = salarySettings?.full_salary_data || {};
        const incentives = fullSalaryData?.incentives?.incentive_details || [];
        const deductions = fullSalaryData?.deductions?.deduction_details || [];

        // Format number with commas
        const formatNumber = (num) => {
            if (num === null || num === undefined) return "0";
            return parseFloat(num).toLocaleString("en-US");
        };

        // Format date from timestamp
        const formatDateFromTimestamp = (timestamp) => {
            if (!timestamp || timestamp === 0) return "N/A";
            return formatTimestampToDate(timestamp);
        };

        return (
            <div className="space-y-6">
                {/* Salary Template Name Section */}
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div
                        className="flex justify-between items-center p-4 cursor-pointer transition-colors"
                        onClick={() => toggleSection("salaryTemplate")}
                        style={{ backgroundColor: '#E3F2FD', borderRadius: '8px 8px 0 0' }}
                    >
                        <Typography
                            variant="h6"
                            className="font-semibold text-[15px]"
                            style={{ color: '#42A5F5' }}
                        >
                            {salarySettings?.["Salary Template Name"] ||
                                "Salary Template Name"}
                        </Typography>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Populate form with current data
                                    const salaryData = employeeData?.Salary_Settings;
                                    const branchId = employeeData?.Official_Info?.branch?.id;

                                    // Fetch salary templates if branch ID is available
                                    if (branchId && gettingSalayTemplate) {
                                        gettingSalayTemplate(branchId);
                                    }

                                    setSalarySettingsForm({
                                        salaryTemplate: salaryData?.["Salary Template Name"] || "",
                                        gratuity: salaryData?.["Gratuity"] === "Yes" ? "Yes" : "NO",
                                        exGratiaOnOvertime:
                                            salaryData?.["Ex-Gratia on overtime"] === "Yes"
                                                ? "Yes"
                                                : "NO",
                                        amount: salaryData?.["Basic Pay"] || "",
                                        salaryPaymentMode: salaryData?.["Mode of payment"] || "",
                                        // Bank Account Fields
                                        bankName: bankInfo?.Bank || "",
                                        bankBranchInfo: bankInfo?.Branch || "",
                                        bankBranchCode: bankInfo?.["Branch Code"] || "",
                                        bankAccountType: bankInfo?.["Account Type"] || "",
                                        accountTitle: bankInfo?.["Account Title"] || "",
                                        accountNo: bankInfo?.["Account No"] || "",
                                        newAccountType: "",
                                    });
                                    setOpenSalarySettingsDrawer(true);
                                }}
                                className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors duration-200"
                                title="Edit Salary Settings"
                            >
                                <FaRegPenToSquare size={18} className="text-green-500" />
                            </button>
                            <div style={{ color: '#42A5F5' }}>
                                <FaChevronDown
                                    size={18}
                                    className={`transition-transform duration-500 ease-in-out ${expandedSections.salaryTemplate ? 'rotate-0' : 'rotate-180'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.salaryTemplate
                            ? 'max-h-[5000px] opacity-100'
                            : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="px-4 pb-4 bg-white">
                            {/* Top Row: Basic Pay, Overtime Rate, Mode of payment */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaCodeBranch className="text-blue-500 w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Basic Pay
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {formatNumber(salarySettings?.["Basic Pay"])}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <MdBarChart className="text-blue-500 w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Overtime Rate
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {salarySettings?.["Overtime Rate"] || "0/hour"}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaMoneyBills className="text-blue-500 w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Mode of payment
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-base text-gray-900 mt-1"
                                        >
                                            {salarySettings?.["Mode of payment"] || "N/A"}
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            {/* Dashed Separator */}
                            <div className="border-t border-dashed border-gray-300 my-4"></div>

                            {/* Bottom Row: Ex-Gratia on overtime, Gratuity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Ex-Gratia on overtime
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className={`font-semibold text-base mt-1 ${salarySettings?.["Ex-Gratia on overtime"] === "Yes"
                                                ? "text-green-500"
                                                : "text-red-500"
                                                }`}
                                        >
                                            {salarySettings?.["Ex-Gratia on overtime"] || "No"}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaTrophy className="text-blue-500 w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Gratuity
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className={`font-semibold text-base mt-1 ${salarySettings?.["Gratuity"] === "Yes"
                                                ? "text-green-500"
                                                : "text-red-500"
                                                }`}
                                        >
                                            {salarySettings?.["Gratuity"] || "No"}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bank Account Info Section */}
                <div className="border border-gray-200 rounded-lg bg-blue-50">
                    <div
                        className="flex justify-between items-center p-4 cursor-pointer transition-colors"
                        onClick={() => toggleSection("bankAccountInfo")}
                    >
                        <Typography
                            variant="h6"
                            color="blue-gray"
                            className="font-medium text-blue-500"
                        >
                            Bank account info
                        </Typography>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    get_bank_type_fn(); /// console.log('Bank account button clicked');
                                    // Populate form with current data
                                    const bankData =
                                        employeeData?.Salary_Settings?.["Bank account info"] || {};
                                    ///console.log('Bank data:', bankData);

                                    // Get existing account type - could be text or ID (number)
                                    const existingAccountType = bankData?.["Account Type"] || "";
                                    const existingAccountTypeNum =
                                        typeof existingAccountType === "number"
                                            ? existingAccountType
                                            : typeof existingAccountType === "string" &&
                                                !isNaN(existingAccountType)
                                                ? parseInt(existingAccountType)
                                                : null;

                                    // Check if account type exists in API data
                                    let matchedAccountType = null;
                                    let isCustomType = false;

                                    if (
                                        existingAccountType &&
                                        Array.isArray(get_bank_type) &&
                                        get_bank_type.length > 0
                                    ) {
                                        // Check if it matches by ID or by account_type text
                                        const found = get_bank_type.find((item) => {
                                            if (typeof item === "object" && item) {
                                                const itemId = item.id;
                                                const accountType =
                                                    item.account_type ??
                                                    item.value ??
                                                    item.account_type_name ??
                                                    item.name ??
                                                    item.label;
                                                // Match by ID if existingAccountType is a number
                                                if (
                                                    existingAccountTypeNum !== null &&
                                                    itemId === existingAccountTypeNum
                                                ) {
                                                    return true;
                                                }
                                                // Match by text
                                                if (
                                                    accountType &&
                                                    String(accountType) === String(existingAccountType)
                                                ) {
                                                    return true;
                                                }
                                            }
                                            return false;
                                        });

                                        if (found) {
                                            // Found a match - use the account_type text value
                                            matchedAccountType =
                                                typeof found === "object" && found
                                                    ? found.account_type ??
                                                    found.value ??
                                                    found.account_type_name ??
                                                    found.name ??
                                                    found.label
                                                    : found;
                                        } else {
                                            // Not found in API data - treat as custom type
                                            isCustomType = true;
                                        }
                                    } else if (
                                        existingAccountType &&
                                        (!Array.isArray(get_bank_type) ||
                                            get_bank_type.length === 0)
                                    ) {
                                        // No API data available yet, but we have existing type - check if it's a number (ID)
                                        isCustomType = existingAccountTypeNum !== null;
                                    }

                                    setBankAccountForm({
                                        bankName: bankData?.Bank || "",
                                        bankBranchInfo: bankData?.Branch || "",
                                        bankBranchCode: bankData?.["Branch Code"] || "",
                                        bankAccountType: isCustomType
                                            ? "Other"
                                            : matchedAccountType || existingAccountType || "",
                                        customAccountType: isCustomType
                                            ? existingAccountTypeNum !== null
                                                ? String(existingAccountTypeNum)
                                                : existingAccountType
                                            : "",
                                        accountTitle: bankData?.["Account Title"] || "",
                                        accountNo: bankData?.["Account No"] || "",
                                    });
                                    ////console.log('Setting drawer to open');
                                    setOpenBankAccountDrawer(true);
                                }}
                                className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors duration-200 cursor-pointer"
                                title="Edit Bank Account Info"
                            >
                                <FaRegPenToSquare size={18} className="text-green-500" />
                            </button>
                            <div style={{ color: '#42A5F5' }}>
                                <FaChevronDown
                                    size={18}
                                    className={`transition-transform duration-500 ease-in-out ${expandedSections.bankAccountInfo ? 'rotate-0' : 'rotate-180'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.bankAccountInfo
                            ? 'max-h-[5000px] opacity-100'
                            : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="px-4 pb-4 bg-white">
                            {/* Top Row: Bank, Branch, Branch Code */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <CiBank className="text-blue-500 w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Bank
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {bankInfo?.Bank || "-"}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Branch
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {bankInfo?.Branch || "-"}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Branch Code
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {bankInfo?.["Branch Code"] || "-"}
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            {/* Dashed Separator */}
                            <div className="border-t border-dashed border-gray-300 my-4"></div>

                            {/* Bottom Row: Account Type, Account Title, Account No */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs "
                                        >
                                            Account Type
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {bankInfo?.["Account Type"] === 0 ||
                                                !bankInfo?.["Account Type"]
                                                ? "-"
                                                : bankInfo?.["Account Type"]}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Account Title
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {bankInfo?.["Account Title"] || "-"}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Account No
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {bankInfo?.["Account No"] || "0"}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Salary Section */}
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div
                        className="flex justify-between items-center p-4 cursor-pointer transition-colors"
                        onClick={() => toggleSection("netSalary")}
                        style={{ backgroundColor: '#E3F2FD', borderRadius: '8px 8px 0 0' }}
                    >
                        <Typography
                            variant="h6"
                            className="font-semibold text-[15px]"
                            style={{ color: '#42A5F5' }}
                        >
                            Net Salary
                        </Typography>
                        <div style={{ color: '#42A5F5' }}>
                            <FaChevronDown
                                size={18}
                                className={`transition-transform duration-500 ease-in-out ${expandedSections.netSalary ? 'rotate-0' : 'rotate-180'
                                    }`}
                            />
                        </div>
                    </div>
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.netSalary
                            ? 'max-h-[5000px] opacity-100'
                            : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="px-4 pb-4 bg-white">
                            {/* Top Row: Increments, Incentives, Deductions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Increments
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {formatNumber(netSalary?.Increments)}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Incentives
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {formatNumber(netSalary?.Incentives)}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Deductions
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {formatNumber(netSalary?.Deductions)}
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            {/* Dashed Separator */}
                            <div className="border-t border-dashed border-gray-300 my-4"></div>

                            {/* Bottom Row: EOBI, Provident Fund, Net Salary Total */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            EOBI
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-sm text-gray-900 mt-1"
                                        >
                                            {netSalary?.EOBI === "No" || !netSalary?.EOBI
                                                ? "0"
                                                : netSalary?.EOBI}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Provident Fund
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className={`font-semibold text-sm mt-1 ${netSalary?.["Provident Fund"] === "0" ||
                                                netSalary?.["Provident Fund"] === "No"
                                                ? "text-red-500"
                                                : "text-green-500"
                                                }`}
                                        >
                                            {netSalary?.["Provident Fund"] === "0" ||
                                                !netSalary?.["Provident Fund"]
                                                ? "No"
                                                : netSalary?.["Provident Fund"]}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="text-blue-500 w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Net Salary Excluding Attendance deduction
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-bold text-sm text-green-600 mt-1"
                                        >
                                            {formatNumber(
                                                netSalary?.["Net Salary Excluding Attendance deduction"]
                                            )}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Allowances/Deductions Section */}
                <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div
                        className="flex justify-between items-center p-4 cursor-pointer transition-colors"
                        onClick={() => toggleSection("allowancesDeductions")}
                        style={{ backgroundColor: '#E3F2FD', borderRadius: '8px 8px 0 0' }}
                    >
                        <Typography
                            variant="h6"
                            className="font-semibold text-[15px]"
                            style={{ color: '#42A5F5' }}
                        >
                            Allowances/Deductions
                        </Typography>
                        <div style={{ color: '#42A5F5' }}>
                            <FaChevronDown
                                size={18}
                                className={`transition-transform duration-500 ease-in-out ${expandedSections.allowancesDeductions ? 'rotate-0' : 'rotate-180'
                                    }`}
                            />
                        </div>
                    </div>
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.allowancesDeductions
                            ? 'max-h-[5000px] opacity-100'
                            : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="px-4 pb-4 bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full table-fixed">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-2 w-1/5">
                                                <Typography
                                                    variant="small"
                                                    color="gray"
                                                    className="font-medium"
                                                >
                                                    Title
                                                </Typography>
                                            </th>
                                            <th className="text-left py-2 w-1/5">
                                                <Typography
                                                    variant="small"
                                                    color="gray"
                                                    className="font-medium"
                                                >
                                                    Type
                                                </Typography>
                                            </th>
                                            <th className="text-left py-2 w-1/5">
                                                <Typography
                                                    variant="small"
                                                    color="gray"
                                                    className="font-medium"
                                                >
                                                    Amount
                                                </Typography>
                                            </th>
                                            <th className="text-left py-2 w-1/5">
                                                <Typography
                                                    variant="small"
                                                    color="gray"
                                                    className="font-medium"
                                                >
                                                    Recurring
                                                </Typography>
                                            </th>
                                            <th className="text-left py-2 w-1/5">
                                                <Typography
                                                    variant="small"
                                                    color="gray"
                                                    className="font-medium"
                                                >
                                                    Date/Duration
                                                </Typography>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {incentives.length > 0 || deductions.length > 0 ? (
                                            <>
                                                {/* Incentives */}
                                                {incentives.map((item, index) => (
                                                    <tr
                                                        key={`incentive-${index}`}
                                                        className="border-b border-gray-100"
                                                    >
                                                        <td className="py-2 pr-2">
                                                            <Typography
                                                                variant="small"
                                                                color="blue-gray"
                                                                className="font-medium break-words"
                                                            >
                                                                {item.title || "N/A"}
                                                            </Typography>
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <Typography
                                                                variant="small"
                                                                color="green"
                                                                className="font-medium"
                                                            >
                                                                Incentive
                                                            </Typography>
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <Typography
                                                                variant="small"
                                                                color="blue-gray"
                                                                className="font-medium"
                                                            >
                                                                {formatNumber(item.amount)}
                                                            </Typography>
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <Typography
                                                                variant="small"
                                                                color="blue-gray"
                                                                className="font-medium"
                                                            >
                                                                {item.re_occuring || "N/A"}
                                                            </Typography>
                                                        </td>
                                                        <td className="py-2">
                                                            <Typography variant="small" color="gray" className="break-words">
                                                                {item.start_date_formatted
                                                                    ? `${item.start_date_formatted}${item.end_date_formatted
                                                                        ? ` - ${item.end_date_formatted}`
                                                                        : ""
                                                                    }`
                                                                    : "N/A"}
                                                            </Typography>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Deductions */}
                                                {deductions.map((item, index) => (
                                                    <tr
                                                        key={`deduction-${index}`}
                                                        className="border-b border-gray-100"
                                                    >
                                                        <td className="py-2 pr-2">
                                                            <Typography
                                                                variant="small"
                                                                color="blue-gray"
                                                                className="font-medium break-words"
                                                            >
                                                                {item.title || "N/A"}
                                                            </Typography>
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <Typography
                                                                variant="small"
                                                                color="red"
                                                                className="font-medium"
                                                            >
                                                                Deduction
                                                            </Typography>
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <Typography
                                                                variant="small"
                                                                color="blue-gray"
                                                                className="font-medium"
                                                            >
                                                                {formatNumber(item.amount)}
                                                            </Typography>
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <Typography
                                                                variant="small"
                                                                color="blue-gray"
                                                                className="font-medium"
                                                            >
                                                                {item.re_occuring || "N/A"}
                                                            </Typography>
                                                        </td>
                                                        <td className="py-2">
                                                            <Typography variant="small" color="gray" className="break-words">
                                                                {item.start_date_formatted
                                                                    ? `${item.start_date_formatted}${item.end_date_formatted
                                                                        ? ` - ${item.end_date_formatted}`
                                                                        : ""
                                                                    }`
                                                                    : "N/A"}
                                                            </Typography>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-8">
                                                    <Typography variant="small" color="gray">
                                                        No allowances or deductions available
                                                    </Typography>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderLeaveBalance = () => (
        <div className='bg-white rounded-[10px] p-4 drop-shadow-md z-20'>
            <Typography variant="h5" color="blue-gray" className="mb-4 text-[16px]">
                Leave Balance
            </Typography>
            <div className=''>
                <div className="customScroll overflow-auto">
                    <table className="w-full text-center">
                        <thead className="sticky top-0 z-20 bg-[#F8F9FA] rounded-[8px]">
                            <tr>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Leave
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Total
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Availed
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Carry Forward
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        From
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        To
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Expiry
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Last Updated
                                    </Typography>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeData?.leave_balanace?.length > 0 ? (
                                employeeData.leave_balanace.map((leave, index) => {
                                    const isLast = index === employeeData.leave_balanace.length - 1;
                                    const classes = isLast
                                        ? "p-4 text-center"
                                        : "p-4 border-b border-[#F2F2F9] text-center";

                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                                                >
                                                    {leave?.Leave || "--"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                                                >
                                                    {leave?.Total || "--"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                                                >
                                                    {leave?.Availed || "--"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                                                >
                                                    {leave?.Carry_Forward || "--"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                                                >
                                                    {leave?.From || "--"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                                                >
                                                    {leave?.To || "--"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                                                >
                                                    {leave?.Expiry || "--"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                                                >
                                                    {leave?.Last_Updated || "--"}
                                                </Typography>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-4">
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                            <span className="text-[#292929] font-medium text-[16px]">
                                                No leave balance records found!
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderChecklist = () => (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Checklist Section */}
            <div className="px-4 py-4">
                <div className="bg-blue-50 mb-6 rounded-lg px-4 py-3 w-full flex justify-between items-center">
                    <Typography
                        variant="h6"
                        className="font-semibold text-sm sm:text-[15px]"
                        style={{ color: '#42A5F5' }}
                    >
                        Checklist
                    </Typography>
                </div>

                <div className="text-center py-8">
                    <Typography variant="small" color="gray" className="font-normal">
                        No checklist defined yet
                    </Typography>
                </div>
            </div>

            {/* Dashed Separator */}
            <div className="border-t border-dashed border-gray-300"></div>

            {/* Company/Organization Allotted Assets Section */}
            <div className="px-4 py-6">
                <div className="flex justify-between items-center mb-4">
                    <Typography
                        variant="h6"
                        className="text-blue-700 font-semibold text-base"
                    >
                        Company/Organization allotted asset
                    </Typography>
                    <div className="flex items-center gap-2">
                        <Typography
                            variant="small"
                            color="gray"
                            className="font-normal text-sm"
                        >
                            Provide new asset
                        </Typography>
                        <Button
                            variant="text"
                            size="sm"
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                            onClick={() => setOpenAssetDrawer(true)}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </Button>
                    </div>
                </div>

                {/* Assets Table */}
                {employeeData?.emp_checklist &&
                    employeeData.emp_checklist.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold text-gray-700 text-xs"
                                    >
                                        Asset Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold text-gray-700 text-xs"
                                    >
                                        Asset Detail
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold text-gray-700 text-xs"
                                    >
                                        Returnable
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold text-gray-700 text-xs"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold text-gray-700 text-xs"
                                    >
                                        Issue date
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold text-gray-700 text-xs"
                                    >
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeeData.emp_checklist.map((asset, index) => (
                                    <tr
                                        key={asset.id || index}
                                        className="bg-gray-50 border-b border-gray-100"
                                    >
                                        <td className="px-4 py-3 text-gray-900">
                                            {asset["Asset Name"] || asset.asset_name || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {asset["Asset Detail"] || asset.asset_detail || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {asset["Returnable"] === "1" || asset.returnable === "1"
                                                ? "Yes"
                                                : "No"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {asset["Status"] === "1" || asset.status === "1"
                                                ? "Returned"
                                                : "Not returned"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {asset["Issue date"] ||
                                                asset.issue_date ||
                                                asset.handover_date ||
                                                "N/A"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() =>
                                                    handleDeleteAsset(
                                                        asset.id || asset.asset_id || asset["id"]
                                                    )
                                                }
                                                className="w-6 h-6 flex justify-center items-center rounded-full border-2 border-red-500 hover:bg-red-50 transition-colors"
                                                title="Delete"
                                                disabled={isUpdating}
                                            >
                                                <FaTimes className="text-red-500" size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Typography variant="small" color="gray" className="font-normal">
                            No assets assigned yet
                        </Typography>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAccountPrivileges = () => (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Account & Privileges Section */}
            <div className="px-4 py-6 mb-4">
                <div className="bg-blue-50 mb-6 rounded-lg px-4 py-3 w-full flex justify-between items-center">
                    <Typography
                        variant="h6"
                        className="font-semibold text-sm sm:text-[15px]"
                        style={{ color: '#42A5F5' }}
                    >
                        Account & Privileges
                    </Typography>
                </div>

                {/* Privileges Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <Typography
                            variant="small"
                            color="gray"
                            className="mb-2 font-normal text-xs"
                        >
                            Privileges
                        </Typography>
                        <Select
                            value={privilegesForm.privilege}
                            onChange={(val) =>
                                setPrivilegesForm((prev) => ({ ...prev, privilege: val }))
                            }
                        // className="border-gray-200"
                        >
                            <Option value="0">Employee</Option>
                            <Option value="1">Super Admin</Option>
                            <Option value="2">Branch Admin</Option>
                            <Option value="3">Department Admin</Option>
                        </Select>
                    </div>
                    <div>
                        <Typography
                            variant="small"
                            color="gray"
                            className="mb-2 font-normal text-xs"
                        >
                            IP Filter
                        </Typography>
                        <Select
                            value={privilegesForm.ipFilter || "Employee"}
                            onChange={(val) =>
                                setPrivilegesForm((prev) => ({ ...prev, ipFilter: val }))
                            }
                        // className=" border  border-gray-200"
                        >
                            <Option value="Employee">Employee</Option>
                            <Option value="Admin">Admin</Option>
                        </Select>
                    </div>
                </div>
                <Button
                    color="blue"
                    size="sm"
                    onClick={handleGrantRole}
                    disabled={isUpdating}
                    className="bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                    {isUpdating ? "Granting..." : "Grant Role"}
                </Button>
            </div>

            {/* Dashed Separator */}
            <div className="border-t border-dashed border-gray-300"></div>

            {/* User Roles Section */}
            <div className="px-4 py-6">
                <div className="flex justify-between items-center mb-4">
                    <Typography
                        variant="h6"
                        className="text-blue-700 font-semibold text-base"
                    >
                        User Roles
                    </Typography>
                    {/* <div className="flex items-center gap-2">
                        <Typography
                            variant="small"
                            color="gray"
                            className="font-normal text-sm"
                        >
                            Provide new asset
                        </Typography>
                        <Button
                            variant="text"
                            size="sm"
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                            onClick={() => {
                                // Add functionality to provide new asset if needed
                            }}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </Button>
                    </div> */}
                </div>

                {/* User Roles Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-semibold text-gray-700 text-xs"
                                >
                                    Role
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-semibold text-gray-700 text-xs"
                                >
                                    Description
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 font-semibold text-gray-700 text-xs"
                                >
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeData?.user_roles &&
                                employeeData.user_roles.length > 0 ? (
                                employeeData.user_roles.map((role, index) => (
                                    <tr key={index} className="bg-white border-b border-gray-100">
                                        <td className="px-4 py-3 text-gray-900">
                                            {role.role_name || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {role.description || "N/A"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {/* <button
                                                onClick={() => handleDeleteRole(role)}
                                                className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                                                title="Delete role"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button> */}

                                            <button
                                                onClick={() => handleDeleteRole(role)}
                                                className="w-6 h-6 flex justify-center items-center rounded-full border-2 border-red-500 hover:bg-red-50 transition-colors"
                                                title="Close">
                                                <FaTimes className="text-red-500" size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-4 py-4 text-center">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal"
                                        >
                                            No user roles assigned
                                        </Typography>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderRepetitiveDuties = () => (
        <div className='bg-white rounded-[10px] p-4 drop-shadow-md z-20'>
            <div className="flex justify-between items-center mb-4">
                <div className="bg-blue-50 rounded-lg px-4 py-3 w-full flex gap-2 items-center">
                    <Typography
                        variant="h6"
                        className="font-semibold text-sm sm:text-[15px]"
                        style={{ color: '#42A5F5' }}
                    >
                        Repetitive Duties
                    </Typography>
                    <button
                        onClick={() => {
                            setEditingDutyRecord(null);
                            setOpenDutiesDrawer(true);
                        }}
                        className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors duration-200"
                        title="Add new duty"
                    >
                        <FaRegPenToSquare size={14} />
                    </button>
                </div>
            </div>
            <div className=''>
                <div className="customScroll overflow-auto">
                    <table className="w-full text-center">
                        <thead className="sticky top-0 z-20 bg-[#F8F9FA] rounded-[8px]">
                            <tr>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Job Title
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Repetition Unit
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Duration
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Effective From
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Enforced Till
                                    </Typography>
                                </th>
                                <th className="bg-[#F8F9FA] p-4 text-center">
                                    <Typography
                                        className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                                    >
                                        Action
                                    </Typography>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeData?.Repetitive_Duties &&
                                employeeData.Repetitive_Duties.length > 0 ? (
                                employeeData.Repetitive_Duties.map((duty, index) => {
                                    const isLast = index === employeeData.Repetitive_Duties.length - 1;
                                    const classes = isLast
                                        ? "p-4 text-center"
                                        : "p-4 border-b border-[#F2F2F9] text-center";

                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-semibold text-sm"
                                                >
                                                    {duty.title || "N/A"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-Urbanist font-semibold text-sm"
                                                >
                                                    {duty.repetition_unit || "N/A"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-Urbanist font-semibold text-sm"
                                                >
                                                    {duty.repetition_duration || "N/A"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-Urbanist font-semibold text-sm"
                                                >
                                                    {duty.effective_from
                                                        ? new Date(
                                                            duty.effective_from * 1000
                                                        ).toLocaleDateString()
                                                        : "N/A"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <Typography
                                                    className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-Urbanist font-semibold text-sm"
                                                >
                                                    {duty.enforce_till && duty.enforce_till !== 0
                                                        ? new Date(
                                                            duty.enforce_till * 1000
                                                        ).toLocaleDateString()
                                                        : "Permanent"}
                                                </Typography>
                                            </td>
                                            <td className={classes}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingDutyRecord(duty);
                                                            setOpenDutiesDrawer(true);
                                                        }}
                                                        className="text-green-500 hover:text-green-600 transition-colors"
                                                        title="Edit duty"
                                                    >
                                                        <FaRegPenToSquare size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDuty(duty.id)}
                                                        className="text-red-500 hover:text-red-600 transition-colors"
                                                        title="Delete duty"
                                                    >
                                                        <FaTimes size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-4">
                                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                                            <span className="text-[#292929] font-medium text-[16px]">
                                                No repetitive duties found!
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAcceleratePerformance = () => {
        // Debug: Log the accelerate data
        // console.log('Accelerate Performance Data:', accelerateData);

        // Use real data from API only
        const performanceData =
            accelerateData && accelerateData.length > 0 ? accelerateData : [];

        const headers = [
            "Dept Name",
            "Total Milestone",
            "Completed",
            "Completed & Rated",
            "Assigned",
            "Picked",
            "Rating Avg (out of 5)",
        ];

        return (
            <div className="space-y-4">
                <Typography variant="h5" color="blue-gray" className="mb-4 text-[16px]">
                    Employee Accelerate Performance
                </Typography>

                {/* Report Type Filter Card */}
                <Card className="border border-gray-200">
                    <CardBody className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="block text-[#698592] text-[12px] mb-2">
                                    Report Type
                                </label>
                                <select className="w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none bg-white">
                                    <option value="">Select Report Type</option>
                                    <option value="1">Monthly Report</option>
                                    <option value="2">Date Range Report</option>
                                    <option value="3">Yearly Report</option>
                                </select>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Table Card */}
                <Card className="border border-gray-200 overflow-hidden">
                    <CardBody className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr>
                                        {headers?.map((head, i) => (
                                            <th
                                                key={i}
                                                className="border-b border-blue-gray-100 bg-blue-gray-50 px-2 py-3 text-center"
                                            >
                                                <Typography
                                                    color="blue-gray"
                                                    className="font-normal leading-none opacity-70 capitalize text-xs"
                                                    style={{ fontSize: "11px" }}
                                                >
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {performanceData && performanceData.length > 0 ? (
                                        performanceData.map((data, i) => {
                                            const isLast = i === performanceData.length - 1;
                                            const classes = isLast
                                                ? "px-2 py-2 text-center"
                                                : "px-2 py-2 border-b border-blue-gray-50 text-center";
                                            return (
                                                <tr key={i}>
                                                    <td className={classes}>
                                                        <Typography
                                                            color="blue-gray"
                                                            className="text-xs"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            {data.emp_data?.dept_name || "N/A"}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            color="blue-gray"
                                                            className="text-xs"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            {data.total || 0}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            color="blue-gray"
                                                            className="text-xs"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            {data.completed || 0}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            color="blue-gray"
                                                            className="text-xs"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            {data.closed_completed || 0}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            color="blue-gray"
                                                            className="text-xs"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            {data.pending || 0}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            color="blue-gray"
                                                            className="text-xs"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            {data.picked || 0}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            color="blue-gray"
                                                            className="text-xs"
                                                            style={{ fontSize: "12px" }}
                                                        >
                                                            {data.rating_avg || 0}
                                                        </Typography>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-6 text-center">
                                                <Typography
                                                    color="blue-gray"
                                                    className="text-sm font-medium"
                                                    style={{ fontSize: "13px" }}
                                                >
                                                    No data found
                                                </Typography>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return renderOverview();
            case 1:
                return renderAttendanceSetting();
            case 2:
                return renderOfficialInfo();
            case 3:
                return renderDocuments();
            case 4:
                return renderSalarySettings();
            case 5:
                return renderLeaveBalance();
            case 6:
                return renderChecklist();
            case 7:
                return renderAccountPrivileges();
            case 8:
                return renderRepetitiveDuties();
            case 9:
                return renderAcceleratePerformance();
            default:
                return renderOverview();
        }
    };

    return (
        <div className="flex flex-col min-w-0 w-full max-w-full gap-2 py-2 pb-1 pl-2 sm:pl-4 pr-2 sm:pr-3 overflow-x-hidden box-border">
            {/* Header */}
            <div className="min-w-0 max-w-full">
                <span className="text-base sm:text-lg md:text-[20px] break-words">Employees Management</span>
            </div>

            {console.log("EmplopyeeData", employeeData)}
            {/* Employee Avatar and Basic Info */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm min-w-0 max-w-full">
                <div className="flex flex-col md:flex-row min-w-0">
                    {/* Left Section - Profile Picture */}
                    <div className="w-full md:w-40 lg:w-48 flex-shrink-0 h-40 sm:h-48 md:h-48 relative overflow-hidden min-w-0">
                        {employeeData?.Official_Info
                            ?.dp ? (
                            <Avatar
                                src={employeeData.Official_Info
                                    .dp}
                                alt={employeeData?.employee?.name || "Profile"}
                                variant="rounded"
                                className="!w-full !h-full !rounded-none md:!rounded-l-lg"
                                style={{
                                    borderRadius: 0
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded-none md:rounded-l-lg">
                                <FaUser className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-900" />
                            </div>
                        )}
                    </div>

                    {/* Right Section - Employee Information */}
                    <div className="flex-1 flex flex-col py-4 px-4 sm:px-6 min-w-0 overflow-hidden">
                        {/* Header with Name and Buttons */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                            <Typography
                                variant="h4"
                                className="font-bold text-black text-xl sm:text-2xl"
                            >
                                {employeeData?.basic_information?.emp_name ||
                                    employeeData?.employee?.name ||
                                    "N/A"}
                            </Typography>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <Button
                                    color="blue"
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md font-medium normal-case text-xs sm:text-sm w-full sm:w-auto"
                                    onClick={async () => {
                                        if (!employeeId) {
                                            showToast("Employee ID is missing", "error");
                                            return;
                                        }
                                        try {
                                            const result = await sendProfileUpdateInvite(employeeId);
                                            if (result.success) {
                                                showToast(
                                                    result.message ||
                                                    "Invitation to update the profile has been sent successfully!",
                                                    "success"
                                                );
                                            } else {
                                                showToast(
                                                    result.error ||
                                                    "Failed to send profile update invitation",
                                                    "error"
                                                );
                                            }
                                        } catch (error) {
                                            console.error(
                                                "Error sending profile update invite:",
                                                error
                                            );
                                            showToast(
                                                "Failed to send profile update invitation",
                                                "error"
                                            );
                                        }
                                    }}
                                >
                                    <span className="hidden sm:inline">Profile Update Invite</span>
                                    <span className="sm:hidden">Update Invite</span>
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    className="border-blue-500 text-blue-500 hover:bg-blue-50 px-3 sm:px-4 py-2 rounded-md font-medium normal-case text-xs sm:text-sm w-full sm:w-auto"
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            </div>
                        </div>

                        {/* Information Grid - Aligned to Left */}
                        <div className="space-y-3 min-w-0">
                            {/* First Row: Designation and Department */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                                <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                                    <div className="bg-blue-500 rounded-full h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center flex-shrink-0">
                                        <FaUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Designation
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-xs sm:text-sm text-gray-900 mt-0.5 break-words"
                                        >
                                            {employeeData?.Official_Info?.designation ||
                                                employeeData?.designationObj?.title ||
                                                employeeData?.Official_Info?.designationObj?.title ||
                                                employeeData?.employee?.designationObj?.title ||
                                                "N/A"}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3 min-w-0 sm:ml-0">
                                    <div className="bg-blue-500 rounded-full h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center flex-shrink-0">
                                        <FaBuilding className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Department
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-xs sm:text-sm text-gray-900 mt-0.5 break-words"
                                        >
                                            {employeeData?.department?.name ||
                                                employeeData?.Official_Info?.department?.name ||
                                                employeeData?.employee?.department?.name ||
                                                "N/A"}
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            {/* Dashed Separator */}
                            <div className="border-t border-dashed border-gray-300"></div>

                            {/* Second Row: Contact and Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                                <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                                    <div className="bg-blue-500 rounded-full h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center flex-shrink-0">
                                        <FaPhone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Contact no.
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-xs sm:text-sm text-gray-900 mt-0.5 break-words"
                                        >
                                            {employeeData?.Official_Info?.contacts &&
                                                employeeData.Official_Info.contacts.length > 0
                                                ? employeeData.Official_Info.contacts[
                                                    employeeData.Official_Info.contacts.length - 1
                                                ].contact
                                                : "N/A"}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3 min-w-0 sm:ml-0">
                                    <div className="bg-blue-500 rounded-full h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center flex-shrink-0">
                                        <FaEnvelope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                        <Typography
                                            variant="small"
                                            color="gray"
                                            className="font-normal text-xs"
                                        >
                                            Email
                                        </Typography>
                                        <Typography
                                            variant="small"
                                            className="font-semibold text-xs sm:text-sm text-gray-900 mt-0.5 break-words"
                                        >
                                            {employeeData?.basic_information?.email || "N/A"}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Navigation - responsive: stack on small screens, side-by-side on lg; reduced gap */}
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-3 w-full min-w-0 max-w-full items-stretch">
                {/* Left Side - Sidebar: full width on small, 1/4 on lg+; never overflow */}
                <Card className="w-full min-w-0 max-w-full lg:w-1/4 lg:min-w-[200px] xl:min-w-[250px] flex-shrink-0 lg:flex-shrink-0">
                    <CardBody className="p-3 sm:p-4 min-w-0 overflow-hidden">
                        <div className="flex flex-wrap lg:flex-nowrap lg:flex-col gap-1 lg:space-y-1 lg:space-x-0 max-w-full">
                            {tabs.map(({ label, value, icon }, index) => (
                                <motion.div
                                    key={value}
                                    onClick={() => setActiveTab(index)}
                                    whileHover={{ scale: 1.02 }}
                                    className={`group relative flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-2 sm:px-3 cursor-pointer transition-all duration-200 rounded-lg min-w-0 ${activeTab === index
                                        ? "bg-[#E7F0FF] text-[#2F80ED] font-medium"
                                        : "text-[#5D6470] hover:bg-gray-50 rounded-lg"
                                        }`}
                                >
                                    <div
                                        className={`flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${activeTab === index
                                            ? "text-[#2F80ED]"
                                            : "text-[#CECED0] group-hover:text-[#5D6470]"
                                            }`}
                                    >
                                        {icon}
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium transition-colors duration-200 break-words min-w-0">{label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Right Side - Content: full width, reduced right padding */}
                <Card className="w-full min-w-0 flex-1 max-w-full bg-transparent shadow-none lg:-mt-4">
                    <CardBody className="pt-3 sm:pt-4 pb-3 sm:pb-4 pl-3 sm:pl-4 pr-2 sm:pr-3 min-w-0 overflow-x-hidden">
                        {renderTabContent()}
                    </CardBody>
                </Card>
            </div>

            {/* Basic Information Update Drawer */}
            <PortalDrawer
                open={openBasicInfoDrawer}
                closeDrawer={() => setOpenBasicInfoDrawer(false)}
                title="Update Basic Information"
                widthSize={"45vw"}
                compo={
                    <div className="py-6 space-y-6">
                        {/* Name and Father Name */}
                        <div className="flex justify-between">
                            <div className="w-[47%]">
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="Name"
                                    value={basicInfoForm.name}
                                    onChange={(e) =>
                                        handleBasicInfoChange("name", e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="w-[47%]">
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="Father Name"
                                    value={basicInfoForm.fatherName}
                                    onChange={(e) =>
                                        handleBasicInfoChange("fatherName", e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="flex justify-between">
                            <div className="w-[47%]">
                                <Select
                                    color="blue"
                                    label="Gender"
                                    value={
                                        basicInfoForm.gender === 1
                                            ? "Male"
                                            : basicInfoForm.gender === 2
                                                ? "Other"
                                                : "Female"
                                    }
                                    onChange={(val) =>
                                        handleBasicInfoChange(
                                            "gender",
                                            val === "Male" ? 1 : val === "Other" ? 2 : 0
                                        )
                                    }
                                >
                                    <Option value="Male">Male</Option>
                                    <Option value="Female">Female</Option>
                                    <Option value="Other">Other</Option>
                                </Select>
                            </div>
                            <div className="w-[47%]">
                                <Select
                                    color="blue"
                                    label="Blood Group"
                                    value={basicInfoForm.bloodGroup}
                                    onChange={(val) => handleBasicInfoChange("bloodGroup", val)}
                                >
                                    {/* <Option value="Please Select Blood Group">Please Select Blood Group</Option> */}
                                    <Option value="A+">A+</Option>
                                    <Option value="A-">A-</Option>
                                    <Option value="B+">B+</Option>
                                    <Option value="B-">B-</Option>
                                    <Option value="AB+">AB+</Option>
                                    <Option value="AB-">AB-</Option>
                                    <Option value="O+">O+</Option>
                                    <Option value="O-">O-</Option>
                                </Select>
                            </div>
                        </div>

                        {/* Date of Birth and Religion */}
                        <div className="flex justify-between">
                            <div className="w-[47%]">
                                <div className="relative">
                                    <DatePicker
                                        selected={(() => {
                                            if (basicInfoForm.dateOfBirth) {
                                                try {
                                                    let parsedDate = null;
                                                    if (
                                                        /^\d{4}-\d{2}-\d{2}/.test(basicInfoForm.dateOfBirth)
                                                    ) {
                                                        parsedDate = parse(
                                                            basicInfoForm.dateOfBirth,
                                                            "yyyy-MM-dd",
                                                            new Date()
                                                        );
                                                        if (isValid(parsedDate)) return parsedDate;
                                                    }
                                                    parsedDate = new Date(basicInfoForm.dateOfBirth);
                                                    if (
                                                        isValid(parsedDate) &&
                                                        !isNaN(parsedDate.getTime())
                                                    )
                                                        return parsedDate;

                                                    try {
                                                        parsedDate = parse(
                                                            basicInfoForm.dateOfBirth,
                                                            "dd/MM/yyyy",
                                                            new Date()
                                                        );
                                                        if (isValid(parsedDate)) return parsedDate;
                                                    } catch { }

                                                    try {
                                                        parsedDate = parse(
                                                            basicInfoForm.dateOfBirth,
                                                            "MMMM do, yyyy",
                                                            new Date()
                                                        );
                                                        if (isValid(parsedDate)) return parsedDate;
                                                    } catch { }

                                                    return null;
                                                } catch (e) {
                                                    console.error("Error parsing date:", e);
                                                    return null;
                                                }
                                            }
                                            return null;
                                        })()}
                                        onChange={(selectedDate) => {
                                            if (selectedDate) {
                                                handleBasicInfoChange(
                                                    "dateOfBirth",
                                                    format(selectedDate, "dd/MM/yyyy")
                                                );
                                            } else {
                                                handleBasicInfoChange("dateOfBirth", "");
                                            }
                                        }}
                                        onFocus={() => setDateOfBirthFocused(true)}
                                        onBlur={() => setDateOfBirthFocused(false)}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText=" "
                                        className={`w-full border rounded-md px-3 !h-11 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${dateOfBirthFocused
                                            ? "border-blue-500"
                                            : "border-blue-gray-200"
                                            }`}
                                        wrapperClassName="w-full"
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                    />
                                    <label
                                        className={`absolute left-3 -top-2.5 text-xs bg-white px-1 pointer-events-none z-10 ${dateOfBirthFocused ? "text-blue-500" : "text-gray-500"
                                            }`}
                                    >
                                        Date of Birth
                                    </label>
                                </div>
                            </div>
                            <div className="w-[47%]">
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="Religion"
                                    value={basicInfoForm.religion}
                                    onChange={(e) =>
                                        handleBasicInfoChange("religion", e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Disability */}
                        <div className="w-full">
                            <Textarea
                                color="blue"
                                label="Disability (If any)"
                                value={basicInfoForm.disability}
                                onChange={(e) =>
                                    handleBasicInfoChange("disability", e.target.value)
                                }
                            />
                        </div>

                        {/* Marital Status and NIC/Passport */}
                        <div className="flex justify-between">
                            <div className="w-[47%]">
                                <Select
                                    color="blue"
                                    label="Marital Status"
                                    value={basicInfoForm.maritalStatus}
                                    onChange={(val) =>
                                        handleBasicInfoChange("maritalStatus", val)
                                    }
                                >
                                    <Option value="Single">Single</Option>
                                    <Option value="Married">Married</Option>
                                    <Option value="Divorced">Divorced</Option>
                                    <Option value="Widowed">Widowed</Option>
                                </Select>
                            </div>
                            <div className="w-[47%]">
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="NIC/Passport"
                                    value={basicInfoForm.nicPassport}
                                    onChange={(e) =>
                                        handleBasicInfoChange("nicPassport", e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Domicile File Upload and Nationality */}
                        <div className="flex justify-between">
                            <div className="w-[47%]">
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    type="file"
                                    label="Domicile Document"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleDomicileFileUpload}
                                    disabled={isUploadingFile}
                                />
                                {isUploadingFile && (
                                    <small className="text-blue-600 text-xs mt-1">
                                        Uploading file...
                                    </small>
                                )}
                            </div>
                            <div className="w-[47%]">
                                <div
                                    ref={countrySelectRef}
                                    className={`relative country-select-wrapper ${countryFocused ? "country-select-focused" : ""
                                        }`}
                                    onClick={() => setCountryFocused(true)}
                                >
                                    <CustomSelect
                                        placeHolderTitle="Select nationality"
                                        value={
                                            countries.find(
                                                (c) => c.country_name === basicInfoForm.nationality
                                            )
                                                ? {
                                                    value: basicInfoForm.nationality,
                                                    label: basicInfoForm.nationality,
                                                }
                                                : null
                                        }
                                        options={filteredCountries.map((country) => ({
                                            value: country.country_name,
                                            label: country.country_name,
                                        }))}
                                        onChangeHandler={(selectedOption) => {
                                            handleBasicInfoChange(
                                                "nationality",
                                                selectedOption ? selectedOption.value : ""
                                            );
                                            setCountrySearch("");
                                        }}
                                        onHandleSelectSearch={(inputValue) => {
                                            setCountrySearch(inputValue);
                                        }}
                                        isSearchable={true}
                                        isClearable={false}
                                        disabled={false}
                                    />
                                    <label
                                        className={`absolute left-3 -top-2.5 text-xs bg-white px-1 pointer-events-none z-10 transition-colors ${countryFocused ? "text-blue-500" : "text-gray-500"
                                            }`}
                                    >
                                        Country
                                    </label>
                                    <style>{`
                                        .country-select-wrapper > div > div > div {
                                            transition: border-color 0.2s, box-shadow 0.2s;
                                        }
                                        .country-select-focused > div > div > div {
                                            border-color: #3b82f6 !important;
                                            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                                        }
                                        .country-select-wrapper > div > div:focus-within > div {
                                            border-color: #3b82f6 !important;
                                            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                                        }
                                    `}</style>
                                </div>
                            </div>
                        </div>

                        {/* City and NTN */}
                        <div className="flex justify-between">
                            <div className="w-[47%]">
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="City"
                                    value={basicInfoForm.city}
                                    onChange={(e) =>
                                        handleBasicInfoChange("city", e.target.value)
                                    }
                                />
                            </div>
                            <div className="w-[47%]">
                                <Input
                                    className="!h-11 !rounded-6"
                                    color="blue"
                                    label="NTN# (If any)"
                                    value={basicInfoForm.ntn}
                                    onChange={(e) => handleBasicInfoChange("ntn", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <Button
                                color="blue"
                                onClick={handleBasicInfoSubmit}
                                disabled={isUpdating}
                            >
                                {isUpdating ? "Updating..." : "Update"}
                            </Button>
                        </div>
                    </div>
                }
            />

            {/* Add Company/Organization Asset Drawer */}
            <PortalDrawer
                open={openAssetDrawer}
                closeDrawer={() => setOpenAssetDrawer(false)}
                title="→ Add company/org asset record"
                widthSize={600}
                compo={
                    <div className="pt-4 px-[1.1vw]">
                        <div className="flex flex-col space-y-4">
                            {/* Asset Name */}
                            <div className="block">
                                <Input
                                    size="sm"
                                    label="Asset Name"
                                    color="blue"
                                    name="assetName"
                                    value={assetForm.assetName}
                                    onChange={(e) =>
                                        handleAssetFormChange("assetName", e.target.value)
                                    }
                                    placeholder="Enter asset name"
                                    required
                                />
                            </div>

                            {/* Handover Date */}
                            <div className="block">
                                <label className="text-[#698592] text-sm block mb-2">
                                    Handover Date
                                </label>
                                <DatePicker
                                    selected={assetForm.handoverDate}
                                    onChange={(selectedDate) => {
                                        handleAssetFormChange("handoverDate", selectedDate);
                                    }}
                                    dateFormat="MM/dd/yyyy"
                                    placeholderText="mm/dd/yyyy"
                                    className="peer w-full h-full bg-transparent text-blue-gray-700 outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] border-blue-gray-200 focus:border-gray-900"
                                    wrapperClassName="w-full"
                                    showYearDropdown
                                    showMonthDropdown
                                    dropdownMode="select"
                                    onClickOutside={(e) => {
                                        e.stopPropagation();
                                    }}
                                    onSelect={(date) => {
                                        if (date) {
                                            handleAssetFormChange("handoverDate", date);
                                        }
                                    }}
                                />
                            </div>

                            {/* Asset Detail */}
                            <div className="block">
                                <Textarea
                                    size="sm"
                                    color="blue"
                                    label="Asset Detail"
                                    value={assetForm.assetDetail}
                                    onChange={(e) =>
                                        handleAssetFormChange("assetDetail", e.target.value)
                                    }
                                    ///placeholder="Enter asset details"
                                    rows={4}
                                />
                            </div>

                            {/* Returnable Radio Buttons */}
                            <div className="flex flex-col">
                                <label className="text-[#698592] text-sm block mb-2">
                                    Returnable
                                </label>
                                <div className="flex gap-6">
                                    <Radio
                                        size="sm"
                                        label="Yes"
                                        name="returnable"
                                        value="Yes"
                                        checked={assetForm.returnable === "Yes"}
                                        onChange={() => handleAssetFormChange("returnable", "Yes")}
                                        color="blue"
                                    />
                                    <Radio
                                        size="sm"
                                        label="No"
                                        name="returnable"
                                        value="No"
                                        checked={assetForm.returnable === "No"}
                                        onChange={() => handleAssetFormChange("returnable", "No")}
                                        color="blue"
                                    />
                                </div>
                            </div>

                            {/* Add Asset Button */}
                            <div className="flex justify-start pt-4">
                                <Button
                                    color="blue"
                                    onClick={handleAddAsset}
                                    disabled={isUpdating}
                                    className="capitalize"
                                >
                                    {isUpdating ? "Adding..." : "Add Asset"}
                                </Button>
                            </div>
                        </div>
                    </div>
                }
            />

            {/* Attendance Toggle Drawer */}
            <PortalDrawer
                open={openAttendanceToggleDrawer}
                closeDrawer={() => {
                    setOpenAttendanceToggleDrawer(false);
                    setAttendanceToggleType(null);
                }}
                title={`Update ${attendanceToggleType === "mobile"
                    ? "Mobile Attendance"
                    : attendanceToggleType === "premises"
                        ? "Attendance Premises"
                        : "Web Attendance"
                    }`}
                widthSize={600}
                compo={
                    <div className="p-6 space-y-6">
                        {/* Mobile Attendance Dropdown - Only show if mobile was clicked */}
                        {attendanceToggleType === "mobile" && (
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Mobile Attendance <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={attendanceToggleForm.mobileAttendance}
                                    onChange={(e) =>
                                        setAttendanceToggleForm((prev) => ({
                                            ...prev,
                                            mobileAttendance: e.target.value,
                                        }))
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    <option value="">Select status</option>
                                    <option value="1" >Enable</option>
                                    <option value="0">Disable</option>
                                </select>
                            </div>
                        )}

                        {/* Attendance Premises Dropdown - Only show if premises was clicked */}
                        {attendanceToggleType === "premises" && (
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Attendance Premises <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={attendanceToggleForm.attendancePremises}
                                    onChange={(e) =>
                                        setAttendanceToggleForm((prev) => ({
                                            ...prev,
                                            attendancePremises: e.target.value,
                                        }))
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    <option value="">Select status</option>
                                    <option value="1">Enable</option>
                                    <option value="0">Disable</option>
                                </select>
                            </div>
                        )}

                        {/* Web Attendance Dropdown - Only show if web was clicked */}
                        {attendanceToggleType === "web" && (
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Web Attendance <span className="text-red-500 ">*</span>
                                </label>
                                <select
                                    value={attendanceToggleForm.webAttendance}
                                    onChange={(e) =>
                                        setAttendanceToggleForm((prev) => ({
                                            ...prev,
                                            webAttendance: e.target.value,
                                        }))
                                    }
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    <option value="">Select status</option>
                                    <option value="1">Enable</option>
                                    <option value="0">Disable</option>
                                </select>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-start pt-4">
                            <Button
                                color="blue"
                                onClick={handleAttendanceToggleSubmit}
                                disabled={
                                    isUpdating ||
                                    (attendanceToggleType === "mobile" &&
                                        !attendanceToggleForm.mobileAttendance) ||
                                    (attendanceToggleType === "premises" &&
                                        !attendanceToggleForm.attendancePremises) ||
                                    (attendanceToggleType === "web" &&
                                        !attendanceToggleForm.webAttendance)
                                }
                                className="px-6 py-2"
                            >
                                {isUpdating ? "Updating..." : "Update"}
                            </Button>
                        </div>
                    </div>
                }
            />

            {/* Attendance Settings Drawer */}
            <PortalDrawer
                open={openAttendanceSettingDrawer}
                closeDrawer={() => setOpenAttendanceSettingDrawer(false)}
                title="Employee attendance settings"
                widthSize={800}
                compo={
                    <div className="py-6 space-y-6">
                        {/* HR Policy */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                HR Policy <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={attendanceSettingsForm.hrPolicyId ?? ""}
                                onChange={handleHrPolicyChange}
                                disabled={hrPolicyDropdownLoading}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                                <option value="">
                                    {hrPolicyDropdownLoading
                                        ? "Loading policies..."
                                        : "Choose a policy"}
                                </option>
                                {hrPolicyDropdown &&
                                    hrPolicyDropdown.map((policy) => (
                                        <option key={policy.id} value={policy.id}>
                                            {policy.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Bio ID */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Bio ID
                            </label>
                            <input
                                type="text"
                                value={attendanceSettingsForm.bioId}
                                placeholder="Bio ID will be displayed here"
                                disabled
                                className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Last 10 days attendance table */}
                        <div>
                            <Typography variant="h6" color="blue-gray" className="mb-4">
                                Last 10 days attendance
                            </Typography>
                            <div className="overflow-x-auto">
                                {loadingRecentRecords ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-gray-500">
                                            Loading attendance records...
                                        </p>
                                    </div>
                                ) : employeeRecentRecords.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No attendance records found</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 normal-case">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 normal-case">
                                                    In Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 normal-case">
                                                    Out Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 normal-case">
                                                    Duration
                                                </th>
                                                <th scope="col" className="px-6 py-3 normal-case">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employeeRecentRecords.map((record, index) => {
                                                // Helper function to format timestamp
                                                const formatTimestamp = (timestamp) => {
                                                    if (!timestamp || timestamp === 0) return "-";
                                                    const date = new Date(timestamp * 1000);
                                                    return date.toLocaleString("en-US", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    });
                                                };

                                                // Helper function to format date
                                                const formatDate = (timestamp) => {
                                                    if (!timestamp || timestamp === 0) return "-";
                                                    const date = new Date(timestamp * 1000);
                                                    return date.toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    });
                                                };

                                                // Helper function to calculate duration
                                                const calculateDuration = (inTime, outTime) => {
                                                    if (
                                                        !inTime ||
                                                        !outTime ||
                                                        inTime === 0 ||
                                                        outTime === 0
                                                    )
                                                        return "-";
                                                    const durationMs = (outTime - inTime) * 1000;
                                                    const hours = Math.floor(
                                                        durationMs / (1000 * 60 * 60)
                                                    );
                                                    const minutes = Math.floor(
                                                        (durationMs % (1000 * 60 * 60)) / (1000 * 60)
                                                    );
                                                    return `${hours}h ${minutes}m`;
                                                };

                                                // Helper function to get status
                                                const getStatus = (record) => {
                                                    if (record.out_1 === 0) return "Present (No Out)";
                                                    if (record.in_1 > 0 && record.out_1 > 0)
                                                        return "Present";
                                                    return "Absent";
                                                };

                                                return (
                                                    <tr
                                                        key={index}
                                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                                    >
                                                        <td className="px-6 py-4">
                                                            {formatDate(record.in_1)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`px-2 py-1 text-xs rounded-full ${record.in_1 > 0
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                                    }`}
                                                            >
                                                                {formatTimestamp(record.in_1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`px-2 py-1 text-xs rounded-full ${record.out_1 > 0
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                                    }`}
                                                            >
                                                                {formatTimestamp(record.out_1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {calculateDuration(record.in_1, record.out_1)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`px-2 py-1 text-xs rounded-full ${getStatus(record) === "Present"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : getStatus(record) === "Present (No Out)"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-red-100 text-red-800"
                                                                    }`}
                                                            >
                                                                {getStatus(record)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-start pt-4">
                            <Button
                                color="blue"
                                onClick={handleAttendanceSettingsSubmit}
                                disabled={isUpdating}
                                className="px-6 py-2"
                            >
                                {isUpdating ? "Updating..." : "Update"}
                            </Button>
                        </div>
                    </div>
                }
            />

            {/* Official Info Drawer */}
            <EmployeeOfficialInfo
                employeeData={employeeData}
                employeeId={employeeId}
                openOfficialInfoDrawer={openOfficialInfoDrawer}
                setOpenOfficialInfoDrawer={setOpenOfficialInfoDrawer}
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating}
                setEmployeeData={setEmployeeData}
            />

            <ChangeReportingManager
                employeeData={employeeData}
                employeeId={employeeId}
                openChangeReportingManagerDrawer={openChangeReportingManagerDrawer}
                setOpenChangeReportingManagerDrawer={
                    setOpenChangeReportingManagerDrawer
                }
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating}
                setEmployeeData={setEmployeeData}
            />

            <EmployeeAcademics
                employeeData={employeeData}
                employeeId={employeeId}
                openAcademicsDrawer={openAcademicsDrawer}
                setOpenAcademicsDrawer={setOpenAcademicsDrawer}
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating}
                setEmployeeData={setEmployeeData}
                editingRecord={editingAcademicRecord}
                setEditingRecord={setEditingAcademicRecord}
                onDeleteAcademic={handleDeleteAcademic}
            />

            <EmployeeExperience
                employeeData={employeeData}
                employeeId={employeeId}
                openExperienceDrawer={openExperienceDrawer}
                setOpenExperienceDrawer={setOpenExperienceDrawer}
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating}
                setEmployeeData={setEmployeeData}
                editingRecord={editingExperienceRecord}
                setEditingRecord={setEditingExperienceRecord}
                onDeleteExperience={handleDeleteExperience}
            />

            <EmployeeDependent
                employeeData={employeeData}
                employeeId={employeeId}
                openDependentDrawer={openDependentDrawer}
                setOpenDependentDrawer={setOpenDependentDrawer}
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating}
                setEmployeeData={setEmployeeData}
                editingRecord={editingDependentRecord}
                setEditingRecord={setEditingDependentRecord}
                onDeleteDependent={handleDeleteDependent}
            />

            <EmployeeLicense
                employeeData={employeeData}
                employeeId={employeeId}
                openLicenseDrawer={openLicenseDrawer}
                setOpenLicenseDrawer={setOpenLicenseDrawer}
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating}
                setEmployeeData={setEmployeeData}
                editingRecord={editingLicenseRecord}
                setEditingRecord={setEditingLicenseRecord}
                onDeleteLicense={handleDeleteLicense}
            />

            <EmployeeReference
                employeeData={employeeData}
                employeeId={employeeId}
                openReferenceDrawer={openReferenceDrawer}
                setOpenReferenceDrawer={setOpenReferenceDrawer}
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating}
                setEmployeeData={setEmployeeData}
                editingRecord={editingReferenceRecord}
                setEditingRecord={setEditingReferenceRecord}
                onDeleteReference={handleDeleteReference}
            />

            <EmployeeDocuments
                employeeData={employeeData}
                employeeId={employeeId}
                openDocumentsDrawer={openDocumentsDrawer}
                setOpenDocumentsDrawer={setOpenDocumentsDrawer}
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating}
                setEmployeeData={setEmployeeData}
                editingRecord={editingDocumentRecord}
                setEditingRecord={setEditingDocumentRecord}
                onDeleteDocument={handleDeleteDocument}
            />

            {/* Emergency Contact Update Drawer */}
            <PortalDrawer
                open={openEmergencyContactDrawer}
                closeDrawer={() => setOpenEmergencyContactDrawer(false)}
                title={
                    editingContact ? "Update Emergency Contact" : "Add Emergency Contact"
                }
                widthSize={800}
                compo={
                    <div className="p-6 space-y-6">
                        {/* Contact Type */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Contact Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={emergencyContactForm.contactType}
                                onChange={(e) =>
                                    handleEmergencyContactChange("contactType", e.target.value)
                                }
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                                <option value="Contact Number">Contact Number</option>
                                <option value="Email">Email</option>
                                <option value="Address">Address</option>
                            </select>
                        </div>

                        {/* Contact Title - Always shown */}
                        <div>
                            <Typography variant="small" color="gray" className="mb-2">
                                Contact Title <span className="text-red-500">*</span>
                            </Typography>
                            <input
                                value={emergencyContactForm.contactTitle}
                                onChange={(e) =>
                                    handleEmergencyContactChange("contactTitle", e.target.value)
                                }
                                placeholder="Enter contact title"
                                class="bg-gray-50 border  border-black text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                        </div>

                        {/* Contact Number Fields - Only shown when Contact Type is "Contact Number" */}
                        {emergencyContactForm.contactType === "Contact Number" && (
                            <>
                                {/* Country Code */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Country Code{" "}
                                        {emergencyContactForm.countryCode === "+92" ? (
                                            <span className="text-red-500">*</span>
                                        ) : (
                                            ""
                                        )}
                                    </label>
                                    <select
                                        value={emergencyContactForm.countryCode}
                                        onChange={(e) =>
                                            handleEmergencyContactChange(
                                                "countryCode",
                                                e.target.value
                                            )
                                        }
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                        <option value="">Choose a country code</option>
                                        {countries.map((countryItem) => (
                                            <option
                                                key={countryItem.id}
                                                value={countryItem.phonecode}
                                            >
                                                {countryItem.country_name} ({countryItem.phonecode})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <Typography variant="small" color="gray" className="mb-2">
                                        Contact Number <span className="text-red-500">*</span>
                                    </Typography>
                                    <input
                                        value={emergencyContactForm.mobileNumber}
                                        onChange={(e) =>
                                            handleEmergencyContactChange(
                                                "mobileNumber",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter contact number"
                                        class="bg-gray-50 border  border-black text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                </div>

                                {/* Network */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Network{" "}
                                        {emergencyContactForm.countryCode === "+92" ? (
                                            <span className="text-red-500">*</span>
                                        ) : (
                                            ""
                                        )}
                                    </label>
                                    <select
                                        value={emergencyContactForm.network}
                                        onChange={(e) =>
                                            handleEmergencyContactChange("network", e.target.value)
                                        }
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                        <option value="">Choose a network</option>
                                        <option value="Jazz">Jazz</option>
                                        <option value="Telenor">Telenor</option>
                                        <option value="Ufone">Ufone</option>
                                        <option value="Zong">Zong</option>
                                        <option value="Warid">Warid</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Email Field - Only shown when Contact Type is "Email" */}
                        {emergencyContactForm.contactType === "Email" && (
                            <div>
                                <Typography variant="small" color="gray" className="mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </Typography>
                                <Input
                                    type="email"
                                    value={emergencyContactForm.email}
                                    onChange={(e) =>
                                        handleEmergencyContactChange("email", e.target.value)
                                    }
                                    placeholder="Enter email address"
                                    className="!border-gray-300 focus:!border-blue-500"
                                />
                            </div>
                        )}

                        {/* Address Field - Only shown when Contact Type is "Address" */}
                        {emergencyContactForm.contactType === "Address" && (
                            <div>
                                <Typography variant="small" color="gray" className="mb-2">
                                    Address <span className="text-red-500">*</span>
                                </Typography>
                                <textarea
                                    value={emergencyContactForm.address}
                                    onChange={(e) =>
                                        handleEmergencyContactChange("address", e.target.value)
                                    }
                                    placeholder="Enter address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
                                    rows={4}
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-start pt-4">
                            <Button
                                color="blue"
                                onClick={handleEmergencyContactSubmit}
                                disabled={isUpdating}
                                className="px-6 py-2"
                            >
                                {isUpdating
                                    ? editingContact
                                        ? "Updating..."
                                        : "Adding..."
                                    : editingContact
                                        ? "Update"
                                        : "Add"}
                            </Button>
                        </div>
                    </div>
                }
            />

            <EmployeeDuties
                employeeData={employeeData}
                employeeId={employeeId}
                openDutiesDrawer={openDutiesDrawer}
                setOpenDutiesDrawer={setOpenDutiesDrawer}
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating}
                setEmployeeData={setEmployeeData}
                editingRecord={editingDutyRecord}
                setEditingRecord={setEditingDutyRecord}
            />

            {/* Delete Asset Confirmation Dialog */}
            <ConfirmationDialog
                openDialog={openDeleteConfirmDialog && assetToDelete}
                handleOpen={() => {
                    setOpenDeleteConfirmDialog(false);
                    setAssetToDelete(null);
                }}
                title="Delete Asset"
                message="Are you sure you want to delete this asset?"
                handleConfirm={handleConfirmDelete}
                loading={isUpdating}
            />

            {/* Delete Role Confirmation Dialog */}
            <ConfirmationDialog
                openDialog={openDeleteConfirmDialog && roleToDelete}
                handleOpen={() => {
                    setOpenDeleteConfirmDialog(false);
                    setRoleToDelete(null);
                }}
                title="Delete Role"
                message={`Are you sure you want to remove the role "${roleToDelete?.role_name}"? This action cannot be undone.`}
                handleConfirm={handleConfirmDeleteRole}
                loading={isDeletingRole}
            />

            {/* Delete Duty Confirmation Dialog */}
            <ConfirmationDialog
                openDialog={openDeleteConfirmDialog && dutyToDelete}
                handleOpen={() => {
                    setOpenDeleteConfirmDialog(false);
                    setDutyToDelete(null);
                }}
                title="Delete Duty"
                message="Are you sure you want to delete this duty? This action cannot be undone."
                handleConfirm={handleConfirmDeleteDuty}
                loading={isUpdating}
            />

            {/* Employee Privileges Drawer */}
            <PortalDrawer
                open={openEmployeePrivilegesDrawer}
                closeDrawer={handleCloseEmployeePrivilegesDrawer}
                title="Employee Privileges"
                widthSize={600}
                compo={
                    <div className="p-6">
                        {privilegesData && Object.keys(privilegesData).length > 0 ? (
                            <AddingPrivileges
                                privilegesData={privilegesData}
                                handleAddPrivilegesClose={handleCloseEmployeePrivilegesDrawer}
                                empId={employeeId}
                                currentPrivileges={currentEmployeePrivileges}
                                onUpdateSuccess={handleRefreshEmployeeData}
                                privilegeLevel={privilegesForm.privilege}
                                ipFilter={privilegesForm.ipFilter}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-64">
                                <Typography variant="h6" color="gray" className="font-normal">
                                    No privileges data available
                                </Typography>
                            </div>
                        )}
                    </div>
                }
            />

            {/* Salary Settings Drawer */}
            <PortalDrawer
                open={openSalarySettingsDrawer}
                closeDrawer={() => setOpenSalarySettingsDrawer(false)}
                title="Salary Settings"
                widthSize={600}
                compo={
                    <form
                        onSubmit={handleSalarySettingsSubmit}
                        className="pt-4 px-[1.1vw]"
                    >
                        <div className="flex flex-col space-y-4">
                            {/* Salary Template */}
                            <div className="w-full">
                                <label className="text-[#698592] text-sm">
                                    Salary Template
                                </label>
                                <CustomSelect
                                    placeHolderTitle="Salary Template"
                                    value={
                                        salaryTemplate?.find(
                                            (template) =>
                                                template.name === salarySettingsForm.salaryTemplate
                                        )
                                            ? {
                                                value: salaryTemplate.find(
                                                    (template) =>
                                                        template.name ===
                                                        salarySettingsForm.salaryTemplate
                                                ).id,
                                                label: salarySettingsForm.salaryTemplate,
                                            }
                                            : salarySettingsForm.salaryTemplate
                                    }
                                    options={
                                        salaryTemplate?.map((ele) => ({
                                            value: ele.id,
                                            label: ele.name,
                                        })) || []
                                    }
                                    onChangeHandler={(selectedOption) => {
                                        // Update salary template name
                                        handleSalarySettingsChange(
                                            "salaryTemplate",
                                            selectedOption?.label || ""
                                        );

                                        // Auto-populate amount field with salary_amount from selected template
                                        if (
                                            selectedOption?.value &&
                                            salaryTemplate &&
                                            Array.isArray(salaryTemplate)
                                        ) {
                                            const selectedTemplate = salaryTemplate.find(
                                                (template) =>
                                                    String(template.id) ===
                                                    String(selectedOption.value) ||
                                                    template.id === selectedOption.value
                                            );
                                            if (
                                                selectedTemplate &&
                                                selectedTemplate.salary_amount !== undefined &&
                                                selectedTemplate.salary_amount !== null
                                            ) {
                                                // Convert salary_amount to string for the form field
                                                handleSalarySettingsChange(
                                                    "amount",
                                                    String(selectedTemplate.salary_amount)
                                                );
                                            }
                                        }
                                    }}
                                    cStyle={true}
                                    customStyles={{
                                        control: (base) => ({
                                            ...base,
                                            fontSize: "0.175rem",
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            fontSize: "0.175rem",
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            fontSize: "0.175rem",
                                        }),
                                        option: (base) => ({
                                            ...base,
                                            fontSize: "0.14rem",
                                            padding: "1px 3px",
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            fontSize: "0.14rem",
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            fontSize: "0.14rem",
                                        }),
                                    }}
                                />
                            </div>

                            {/* Gratuity */}
                            <div className="flex flex-col w-full">
                                <label className="text-[#698592] text-[0.90vw]">Gratuity</label>
                                <div className="flex gap-6">
                                    <Radio
                                        className="text-[0.90vw]"
                                        label="NO"
                                        name="gratuity"
                                        value="NO"
                                        checked={salarySettingsForm.gratuity === "NO"}
                                        onChange={(e) =>
                                            handleSalarySettingsChange("gratuity", "NO")
                                        }
                                        color="blue"
                                    />
                                    <Radio
                                        className="text-[0.90vw]"
                                        label="Yes"
                                        name="gratuity"
                                        value="Yes"
                                        checked={salarySettingsForm.gratuity === "Yes"}
                                        onChange={(e) =>
                                            handleSalarySettingsChange("gratuity", "Yes")
                                        }
                                        color="blue"
                                    />
                                </div>
                            </div>

                            {/* Ex-Gratia on Overtime */}
                            <div className="flex flex-col w-full">
                                <label className="text-[#698592] text-[0.90vw]">
                                    Ex-Gratia on overtime
                                </label>
                                <div className="flex gap-6">
                                    <Radio
                                        className="text-[0.90vw]"
                                        label="NO"
                                        name="exGratiaOnOvertime"
                                        value="NO"
                                        checked={salarySettingsForm.exGratiaOnOvertime === "NO"}
                                        onChange={(e) =>
                                            handleSalarySettingsChange("exGratiaOnOvertime", "NO")
                                        }
                                        color="blue"
                                    />
                                    <Radio
                                        className="text-[0.90vw]"
                                        label="Yes"
                                        name="exGratiaOnOvertime"
                                        value="Yes"
                                        checked={salarySettingsForm.exGratiaOnOvertime === "Yes"}
                                        onChange={(e) =>
                                            handleSalarySettingsChange("exGratiaOnOvertime", "Yes")
                                        }
                                        color="blue"
                                    />
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="w-full">
                                <Input
                                    className="text-[0.90vw]"
                                    label="Amount"
                                    type="number"
                                    step="0.01"
                                    value={salarySettingsForm.amount}
                                    onChange={(e) =>
                                        handleSalarySettingsChange("amount", e.target.value)
                                    }
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Salary Payment Mode */}
                            <div className="w-full">
                                <label className="text-[#698592] text-sm">
                                    Salary Payment mode
                                </label>
                                <CustomSelect
                                    placeHolderTitle="Salary Payment mode"
                                    value={
                                        salarySettingsForm.salaryPaymentMode
                                            ? {
                                                value: salarySettingsForm.salaryPaymentMode,
                                                label:
                                                    salarySettingsForm.salaryPaymentMode
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    salarySettingsForm.salaryPaymentMode.slice(1),
                                            }
                                            : null
                                    }
                                    options={[
                                        { value: "cash", label: "Cash" },
                                        { value: "bank", label: "Bank" },
                                    ]}
                                    onChangeHandler={(selectedOption) =>
                                        handleSalarySettingsChange(
                                            "salaryPaymentMode",
                                            selectedOption?.value || ""
                                        )
                                    }
                                    cStyle={true}
                                    customStyles={{
                                        control: (base) => ({
                                            ...base,
                                            fontSize: "0.175rem",
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            fontSize: "0.175rem",
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            fontSize: "0.175rem",
                                        }),
                                        option: (base) => ({
                                            ...base,
                                            fontSize: "0.14rem",
                                            padding: "1px 3px",
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            fontSize: "0.14rem",
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            fontSize: "0.14rem",
                                        }),
                                    }}
                                />
                            </div>
                            <div className="flex justify-start pt-4">
                                <Button
                                    type="submit"
                                    color="blue"
                                    className="capitalize"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? "Updating..." : "Update"}
                                </Button>
                            </div>
                        </div>
                    </form>
                }
            />

            {/* Bank Account Info Drawer */}
            <PortalDrawer
                open={openBankAccountDrawer}
                closeDrawer={() => setOpenBankAccountDrawer(false)}
                title="Employee bank account info"
                widthSize={600}
                compo={
                    <form onSubmit={handleBankAccountSubmit} className="pt-4 px-[1.1vw]">
                        <div className="flex flex-col space-y-4">
                            {/* Bank Name */}
                            <div className="w-full">
                                <Input
                                    className="text-[0.90vw]"
                                    label="Bank Name"
                                    value={bankAccountForm.bankName}
                                    onChange={(e) =>
                                        handleBankAccountChange("bankName", e.target.value)
                                    }
                                />
                            </div>

                            {/* Bank Branch Info */}
                            <div className="w-full">
                                <Input
                                    className="text-[0.90vw]"
                                    label="Bank Branch Info"
                                    value={bankAccountForm.bankBranchInfo}
                                    onChange={(e) =>
                                        handleBankAccountChange("bankBranchInfo", e.target.value)
                                    }
                                />
                            </div>

                            {/* Bank Branch Code */}
                            <div className="w-full">
                                <Input
                                    className="text-[0.90vw]"
                                    label="Bank Branch Code"
                                    value={bankAccountForm.bankBranchCode}
                                    onChange={(e) =>
                                        handleBankAccountChange("bankBranchCode", e.target.value)
                                    }
                                />
                            </div>

                            {/* Bank Account Type */}
                            <div className="w-full">
                                <label className="text-[#698592] text-sm">
                                    Bank Account Type
                                </label>
                                <CustomSelect
                                    placeHolderTitle="Select account type"
                                    value={
                                        bankAccountForm.bankAccountType
                                            ? {
                                                value: bankAccountForm.bankAccountType,
                                                label: bankAccountForm.bankAccountType,
                                            }
                                            : null
                                    }
                                    options={[
                                        ...(Array.isArray(get_bank_type)
                                            ? get_bank_type
                                                .map((item) => {
                                                    if (typeof item === "string") {
                                                        return { value: item, label: item };
                                                    } else if (typeof item === "object" && item) {
                                                        const accountType =
                                                            item.account_type ??
                                                            item.value ??
                                                            item.account_type_name ??
                                                            item.name ??
                                                            item.label;
                                                        return {
                                                            value: accountType || String(item.id || ""),
                                                            label: accountType || String(item.id || ""),
                                                        };
                                                    }
                                                    return null;
                                                })
                                                .filter(Boolean)
                                            : []),
                                        { value: "Other", label: "Other" },
                                    ]}
                                    onChangeHandler={(selectedOption) => {
                                        const selectedValue = selectedOption?.value || "";
                                        handleBankAccountChange("bankAccountType", selectedValue);
                                        // Clear custom account type if switching away from "Other"
                                        if (selectedValue !== "Other") {
                                            handleBankAccountChange("customAccountType", "");
                                        }
                                    }}
                                    cStyle={true}
                                    customStyles={{
                                        control: (base) => ({
                                            ...base,
                                            fontSize: "0.175rem",
                                        }),
                                        singleValue: (base) => ({
                                            ...base,
                                            fontSize: "0.175rem",
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            fontSize: "0.175rem",
                                        }),
                                        option: (base) => ({
                                            ...base,
                                            fontSize: "0.14rem",
                                            padding: "1px 3px",
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            fontSize: "0.14rem",
                                        }),
                                        menuList: (base) => ({
                                            ...base,
                                            fontSize: "0.14rem",
                                        }),
                                    }}
                                />
                            </div>

                            {/* Custom Account Type Input - Show when "Other" is selected */}
                            {bankAccountForm.bankAccountType === "Other" && (
                                <div className="w-full">
                                    <Input
                                        className="text-[0.90vw]"
                                        label="Enter Custom Account Type"
                                        value={bankAccountForm.customAccountType}
                                        onChange={(e) =>
                                            handleBankAccountChange(
                                                "customAccountType",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your account type"
                                        required
                                    />
                                </div>
                            )}

                            {/* Account Title */}
                            <div className="w-full">
                                <Input
                                    className="text-[0.90vw]"
                                    label="Account Title"
                                    value={bankAccountForm.accountTitle}
                                    onChange={(e) =>
                                        handleBankAccountChange("accountTitle", e.target.value)
                                    }
                                />
                            </div>

                            {/* Account No */}
                            <div className="w-full">
                                <Input
                                    className="text-[0.90vw]"
                                    label="Account No"
                                    value={bankAccountForm.accountNo}
                                    onChange={(e) =>
                                        handleBankAccountChange("accountNo", e.target.value)
                                    }
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="outlined"
                                    color="blue"
                                    onClick={() => setOpenBankAccountDrawer(false)}
                                    disabled={isUpdating}
                                    className="mr-2"
                                >
                                    Close
                                </Button>
                                <Button
                                    type="submit"
                                    color="blue"
                                    className="capitalize"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? "Updating..." : "Update"}
                                </Button>
                            </div>
                        </div>
                    </form>
                }
            />
        </div>
    );
};

export default AdminEmployeeProfile;