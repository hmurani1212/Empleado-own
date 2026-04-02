import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverHandler,
  Radio,
  Step,
  Stepper,
  Textarea,
  Accordion,
  AccordionBody,
  AccordionHeader,
  Select,
  Option,
} from "@material-tailwind/react";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { TbListDetails } from "react-icons/tb";
import { RiQuestionnaireLine } from "react-icons/ri";
import { GrUserSettings } from "react-icons/gr";
import Calendar from "react-calendar";
import useHireNewVacancy from "../../ViewModel/HireViewModel/HireNewVacancy";
import { IoMdCloseCircleOutline } from "react-icons/io";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getUserData } from "../../Authentication/jwt_decode";
///import {Link} from 'react-router-dom'
const CreateVacancy = () => {
  const [validationErrors, setValidationErrors] = useState({});

  // Helper functions
  const validateNumericField = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  /** Legacy question_type 4 (Input Field) removed; treat as text area (0). */
  const normalizeQuestionType = (selectedOption) => {
    const n = parseInt(selectedOption, 10);
    if (Number.isNaN(n)) return NaN;
    return n === 4 ? 0 : n;
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDate = (date) => {
    if (!date) return getCurrentDate();
    try {
      // If date is already in YYYY-MM-DD format, return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // If date is a Date object (from Calendar component)
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) {
        return getCurrentDate();
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return getCurrentDate();
    }
  };

  const {
    activeStep,
    handleStepActive,
    handlePrev,
    handleNext: originalHandleNext,
    removeAccordion,
    handleOpen,
    addAccordion,
    renderSelectedComponent,
    handleSelectChange,
    accordions,
    handleCalendar,
    handleLastStep,
    handleFirstStep,
    isFirstStep,
    isLastStep,
    newVacValues,
    handleChangeNewVac,
    allCities,
    handleQuestionChange,
    handleQuestionType,
    handleOpenInterviews,
    accordionsInterview,
    setAccordionsInterview,
    addAccordionInterview,
    handleInterviewChange,
    currentOptionInput,
    setCurrentOptionInput,
    addOptionToQuestion,
  } = useHireNewVacancy();

  const { create_vacancy, get_mark_def_data, get_mark_def } =
    useHire_2();
  useEffect(() => {
    get_mark_def();
  }, []);

  // console.log("get_mark_defget_mark_def", get_mark_def_data);
  const navigate = useNavigate();

  // State for selected cities
  const [selectedCityIds, setSelectedCityIds] = useState([]);

  // Initialize selectedCityIds when newVacValues.city_id changes
  useEffect(() => {
    if (newVacValues.city_id && Array.isArray(newVacValues.city_id)) {
      setSelectedCityIds(newVacValues.city_id.map(id => id.toString()));
    }
  }, [newVacValues.city_id]);

  const handleChangeCity = (selectedOptions) => {
    console.log('handleChangeCity called with:', selectedOptions);

    // Handle react-select format (array of objects with value and label)
    let cityIds = [];

    if (Array.isArray(selectedOptions)) {
      cityIds = selectedOptions.map(option => option.value.toString());
    } else if (selectedOptions === null || selectedOptions === undefined) {
      // Clear selection
      cityIds = [];
    }

    console.log('Processed cityIds:', cityIds);

    // Update the selected cities state
    setSelectedCityIds(cityIds);

    // Update newVacValues with the selected city IDs as numbers
    handleChangeNewVac({
      target: {
        name: "city_id",
        value: cityIds.map((id) => parseInt(id)),
      },
    });
  };

  // Get the selected cities data for display
  const selectedCities =
    allCities?.filter((city) => selectedCityIds.includes(city.id.toString())) ||
    [];

  // Add validation functions — silent=true skips toasts (for tab enablement + live completeness)
  const validateStep0 = async (silent = false) => {
    const fail = (msg) => {
      if (!silent) toast.error(msg);
      return false;
    };
    try {
      const step0Data = {
        title: newVacValues.title,
        vacancy_type: newVacValues.locations === "0" ? 1 : 2,
        locations:
          newVacValues.locations === "1"
            ? Array.isArray(newVacValues.city_id)
              ? newVacValues.city_id
              : []
            : [],
        age_from: validateNumericField(newVacValues.age_from),
        age_upto: validateNumericField(newVacValues.age_upto),
        req_gender: newVacValues.req_gender
          ? parseInt(newVacValues.req_gender)
          : 2,
        apply_from: newVacValues.apply_from,
        last_date: newVacValues.last_date,
        seats: validateNumericField(newVacValues.seats),
        experience: newVacValues.experience,
        required_qualification: newVacValues.required_qualification,
        description: newVacValues.description,
      };

      try {
        await Yup.string()
          .min(1, "Vacancy title is required")
          .max(150, "Vacancy title cannot exceed 150 characters")
          .required("Vacancy title is required")
          .validate(step0Data.title);
      } catch (error) {
        return fail(error.message);
      }

      if (step0Data.vacancy_type === 2) {
        try {
          await Yup.array()
            .min(1, "Please provide at least one location for office job")
            .required("Locations are required for office job")
            .validate(step0Data.locations);
        } catch (error) {
          return fail(error.message);
        }
      }

      try {
        await Yup.number()
          .integer("Minimum age must be a number")
          .min(14, "You cannot hire under 14 for a job")
          .required("Minimum age is required")
          .validate(step0Data.age_from);
      } catch (error) {
        return fail(error.message);
      }

      try {
        await Yup.number()
          .integer("Maximum age must be a number")
          .max(80, "Upper age limit cannot be more than 80 years")
          .required("Maximum age is required")
          .validate(step0Data.age_upto);
      } catch (error) {
        return fail(error.message);
      }

      if (step0Data.age_from >= step0Data.age_upto) {
        return fail("Age upper limit cannot be less than lower limit");
      }

      try {
        await Yup.number()
          .integer()
          .min(0, "Seats cannot be negative")
          .max(500, "Total seats cannot exceed 500")
          .required("Available seats are required")
          .validate(step0Data.seats);
      } catch (error) {
        return fail(error.message);
      }

      try {
        await Yup.number()
          .integer()
          .oneOf([0, 1, 2], "Please choose a valid gender requirement")
          .required("Gender requirement is required")
          .validate(step0Data.req_gender);
      } catch (error) {
        return fail(error.message);
      }

      try {
        await Yup.string()
          .required("Experience is required")
          .validate(step0Data.experience);
      } catch (error) {
        return fail(error.message);
      }

      try {
        await Yup.string()
          .required("Required qualification is required")
          .validate(step0Data.required_qualification);
      } catch (error) {
        return fail(error.message);
      }

      try {
        await Yup.string()
          .required("Job description is required")
          .validate(step0Data.description);
      } catch (error) {
        return fail(error.message);
      }

      try {
        await Yup.string()
          .matches(/^\d{4}-\d{2}-\d{2}$/, "Apply start date must be a valid date")
          .required("Apply start date is required")
          .validate(step0Data.apply_from);
      } catch (error) {
        return fail(error.message);
      }

      try {
        await Yup.string()
          .matches(/^\d{4}-\d{2}-\d{2}$/, "Apply end date must be a valid date")
          .required("Apply end date is required")
          .validate(step0Data.last_date);
      } catch (error) {
        return fail(error.message);
      }

      const lastDate = new Date(step0Data.last_date);
      const applyFrom = new Date(step0Data.apply_from);
      lastDate.setHours(0, 0, 0, 0);
      applyFrom.setHours(0, 0, 0, 0);
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (lastDate.getTime() - applyFrom.getTime() < oneDayMs) {
        return fail("End date must be at least one day after start date");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDateOnly = new Date(lastDate.getTime());
      lastDateOnly.setHours(0, 0, 0, 0);
      if (lastDateOnly < today) {
        return fail("Apply last date cannot be in the past");
      }

      setValidationErrors({});
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  const [vacancyDetailsComplete, setVacancyDetailsComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await validateStep0(true);
      if (!cancelled) setVacancyDetailsComplete(ok);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run when vacancy form values change
  }, [newVacValues]);

  const goToStepFromTab = (step) => {
    if (step > 0 && !vacancyDetailsComplete) {
      toast.info("Please complete all Vacancy Details before opening this step.");
      return;
    }
    handleStepActive(step);
  };

  const validateStep1 = async () => {
    try {
      if (accordions.length > 0) {
        for (let i = 0; i < accordions.length; i++) {
          const accordion = accordions[i];
          const question =
            newVacValues.questionnaire[accordion.id - 1]?.question;
          const questionType = normalizeQuestionType(accordion.selectedOption);

          try {
            await Yup.string()
              .min(1)
              .max(254, "Question too long")
              .required("Please enter question")
              .validate(question);
          } catch (error) {
            toast.error(error.message);
            return false;
          }

          try {
            await Yup.number()
              .oneOf([0, 1, 2, 3], "Invalid question type")
              .required("Please select question type")
              .validate(questionType);
          } catch (error) {
            toast.error(error.message);
            return false;
          }

          if ([1, 2, 3].includes(questionType)) {
            try {
              await Yup.array()
                .min(1, "Please add options")
                .required("Please add options")
                .validate(accordion.options);
            } catch (error) {
              toast.error(error.message);
              return false;
            }
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  const validateStep2 = async () => {
    try {
      // Validate interview rounds number first
      if (!newVacValues.interview_rounds || newVacValues.interview_rounds < 1) {
        toast.error("Interview rounds are required");
        return false;
      }

      // Validate maximum limit
      if (newVacValues.interview_rounds > 5) {
        toast.error("Maximum 5 interview rounds allowed");
        return false;
      }

      // Validate if number of rounds matches the accordions
      if (
        accordionsInterview.length !== parseInt(newVacValues.interview_rounds)
      ) {
        toast.error("Interview rounds are required");
        return false;
      }

      for (let i = 0; i < accordionsInterview.length; i++) {
        const interview = accordionsInterview[i];
        try {
          await Yup.string()
            .max(100, "Interview name too long")
            .required("Please enter interview name")
            .validate(interview.name);
        } catch (error) {
          toast.error(error.message);
          return false;
        }

        // Marks definition validation removed - optional field
        // If user selects marks definitions, they will be included in payload
        // If user doesn't select any, marks_def will remain empty in payload
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  };

  // Wrap the original handleNext with validation
  const wrappedHandleNext = async () => {
    let isValid = false;

    switch (activeStep) {
      case 0:
        isValid = await validateStep0();
        break;
      case 1:
        isValid = await validateStep1();
        break;
      case 2:
        isValid = await validateStep2();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      originalHandleNext();
    }
  };

  // Update the createNewVacancy function
  const createNewVacancy = async () => {
    try {
      const isValid = await validateStep2();
      if (!isValid) return;

      // Re-validate apply last date is not in the past (in case user changed it after step 0)
      const lastDate = new Date(newVacValues.last_date);
      const applyFrom = new Date(newVacValues.apply_from);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastDate.setHours(0, 0, 0, 0);
      applyFrom.setHours(0, 0, 0, 0);
      if (lastDate < today) {
        toast.error("Apply last date cannot be in the past");
        return;
      }
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (lastDate.getTime() - applyFrom.getTime() < oneDayMs) {
        toast.error("End date must be at least one day after start date");
        return;
      }

      // Format the data according to the API requirements
      const locationIds =
        newVacValues.locations === "1" && Array.isArray(newVacValues.city_id)
          ? newVacValues.city_id
          : [];
      const city_name = locationIds.map((id) => {
        const city = allCities?.find(
          (c) => c.id === id || c.id === Number(id)
        );
        return city?.name ?? city?.city_name ?? "";
      });

      const formattedData = {
        dept: 0,
        title: newVacValues.title,
        seats: validateNumericField(newVacValues.seats),
        vacancy_type: newVacValues.locations === "0" ? 1 : 2,
        locations: locationIds,
        city_name,
        experience: newVacValues.experience,
        required_qualification: newVacValues.required_qualification,
        age_from: validateNumericField(newVacValues.age_from),
        age_upto: validateNumericField(newVacValues.age_upto),
        req_gender: newVacValues.req_gender
          ? parseInt(newVacValues.req_gender)
          : 2,
        apply_from: formatDate(newVacValues.apply_from),
        last_date: formatDate(newVacValues.last_date),
        description: newVacValues.description,
        interview_rounds: accordionsInterview.length,
        interviews: accordionsInterview.map((interview) => {
          // Determine marks_def structure based on user input
          let marksDef = [];

          if (get_mark_def_data.length > 0 && interview.marks_def && interview.marks_def.length > 0) {
            // User selected Available Definitions - send only IDs as numbers
            const numbers = interview.marks_def.map(id => Number(id));
            marksDef = [numbers]; // Wrap in array as per validation schema
            console.log('Available Definitions selected, marksDef:', marksDef, 'Types:', marksDef[0].map(item => typeof item));
          } else if (interview.marks_title && interview.marks_title.trim()) {
            // User added custom marks - send marks_title only
            marksDef = [[{
              marks_title: interview.marks_title.trim()
            }]]; // Wrap in array as per validation schema
            console.log('Custom marks added, marksDef:', marksDef);
          } else {
            // If neither custom marks nor Available Definitions are provided, send empty array
            marksDef = [[]]; // Wrap in array as per validation schema
            console.log('No marks defined, marksDef:', marksDef);
          }

          // Debug log to see what's being sent
          console.log('Interview data being sent:', {
            name: interview.name,
            marks_title: interview.marks_title,
            total_marks: interview.total_marks,
            marks_def: marksDef,
            original_marks_def: interview.marks_def,
            marks_def_types: marksDef.map(item => typeof item)
          });

          // Final safety check - ensure marks_def contains only numbers for Available Definitions
          let finalMarksDef = marksDef;
          if (get_mark_def_data.length > 0 && interview.marks_def && interview.marks_def.length > 0) {
            // Double-check that all items in the inner array are numbers
            finalMarksDef = [marksDef[0].map(item => {
              const num = Number(item);
              if (isNaN(num)) {
                console.error('Invalid number in marks_def:', item);
                return 0; // fallback
              }
              return num;
            })];
          }

          // Determine what to send based on whether Available Definitions are selected
          let payload = {
            name: interview.name || "",
            marks_def: finalMarksDef,
          };

          // Only include marks_title if Available Definitions are NOT selected
          if (!(get_mark_def_data.length > 0 && interview.marks_def && interview.marks_def.length > 0)) {
            payload.marks_title = interview.marks_title || "";
          }

          return payload;
        }),
        questionnaire: accordions
          .map((accordion) => {
            const question =
              newVacValues.questionnaire[accordion.id - 1]?.question;
            const questionType = normalizeQuestionType(accordion.selectedOption);

            if (!question || Number.isNaN(questionType)) return null;

            const baseQuestion = {
              question,
              question_type: questionType,
            };

            if (
              [1, 2, 3].includes(questionType) &&
              accordion.options?.length > 0
            ) {
              return {
                ...baseQuestion,
                options: accordion.options,
              };
            }

            return baseQuestion;
          })
          .filter(Boolean),
      };

      // Debug: Log the exact payload being sent
      console.log('FINAL API PAYLOAD:', JSON.stringify(formattedData, null, 2));

      // Call the API
      const success = await create_vacancy(formattedData);
      if (success) {
        navigate("/hire/vacancies_list", { replace: true });
      }
    } catch (error) {
      console.error("Error creating vacancy:", error);
      toast.error("Unable to create vacancy. Please try again.");
    }
  };

  // Helper function to show field error
  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] ? (
      <div className="text-red-500 text-xs mt-1">
        {validationErrors[fieldName]}
      </div>
    ) : null;
  };

  const token_data = getUserData();
  // console.log('what is the testttt', token_data)

  let org_id;
  if (token_data !== undefined) {
    org_id = token_data?.org_id
  } else {
    org_id = 123
  }

  return (
    <>
      {/* Tooba */}
      {/* Create Vacancy Form */}
      <div className="pl-2 flex flex-col gap-3">
        <div className="flex justify-end mt-[40px] gap-4">
          <Button
            className="bg-bgBlue text-white font-medium capitalize rounded-lg px-4 py-2 shadow-sm hover:bg-[#2d94e0]"
            onClick={() => navigate("/hire/vacancies_list")}
          >
            Back
          </Button>
          {/* Career Page */}
          {/* <Link to={`http://172.18.0.44:8080/${org_id}`} target="_blank">
            <Button className="bg-[#0ACF97] capitalize p-2 font-medium">
              Career Page
            </Button>
          </Link> */}
        </div>

        <div className="gap-2 pb-3  bg-white rounded-lg drop-shadow mt-[20px]">
          <form>
            <div className="w-full flex flex-col gap-4  py-4 px-[40px]">
              <div>
                <Stepper
                  activeStep={activeStep}
                  isLastStep={(value) => handleLastStep(value)}
                  isFirstStep={(value) => handleFirstStep(value)}
                  lineClassName="bg-[#3DA5F4]"
                  activeLineClassName="bg-[#3DA5F4]"
                >
                  <Step
                    onClick={() => handleStepActive(0)}
                    activeClassName="bg-[#61ADFF]"
                    completedClassName="text-white"
                  >
                    <div className="flex items-center">
                      <TbListDetails className="h-4 w-4" />
                      <div className="absolute top-10 inset-x-0 w-full flex items-center justify-center">
                        <span className="text-[#818a90] text-[13px] text-center">
                          Vacancy Details
                        </span>
                      </div>
                    </div>
                  </Step>

                  <Step
                    role="button"
                    tabIndex={vacancyDetailsComplete ? 0 : -1}
                    aria-disabled={!vacancyDetailsComplete}
                    title={
                      vacancyDetailsComplete
                        ? undefined
                        : "Complete all Vacancy Details fields to open Questionnaire"
                    }
                    className={
                      vacancyDetailsComplete
                        ? ""
                        : "opacity-45 cursor-not-allowed"
                    }
                    onClick={() => goToStepFromTab(1)}
                    activeClassName="bg-[#61ADFF] relative"
                    completedClassName="text-white"
                  >
                    <div className="flex items-center">
                      <RiQuestionnaireLine className="h-4 w-4" />
                      <div className="absolute top-10 inset-x-0 w-full flex items-center justify-center">
                        <span className="text-[#818a90] text-[13px] text-center">
                          Questionnaire
                        </span>
                      </div>
                    </div>
                  </Step>

                  <Step
                    role="button"
                    tabIndex={vacancyDetailsComplete ? 0 : -1}
                    aria-disabled={!vacancyDetailsComplete}
                    title={
                      vacancyDetailsComplete
                        ? undefined
                        : "Complete all Vacancy Details fields to open Interview Settings"
                    }
                    className={
                      vacancyDetailsComplete
                        ? ""
                        : "opacity-45 cursor-not-allowed"
                    }
                    onClick={() => goToStepFromTab(2)}
                    activeClassName="bg-[#61ADFF]"
                    completedClassName="text-white"
                  >
                    <div className="flex items-center">
                      <GrUserSettings className="h-4 w-4" />
                      <div className="absolute top-10 inset-x-0 w-full flex items-center justify-center">
                        <span className="text-[#818a90] text-[13px] text-center">
                          Interview Settings
                        </span>
                      </div>
                    </div>
                  </Step>
                </Stepper>

                <div className="mt-10">
                  {activeStep === 0 ? (
                    <div className="grid grid-cols-2 gap-6 text-[12px] pt-[20px]">
                      <div className="flex flex-col gap-4">
                        <div className="">
                          <Input
                            label="Vacancy Title"
                            color={validationErrors.title ? "red" : "blue"}
                            name="title"
                            value={newVacValues.title}
                            onChange={handleChangeNewVac}
                          />
                          {getFieldError("title")}
                        </div>

                        <div className="flex items-center">
                          <label className="text-[#3da5f4] font-semibold">
                            Job Location
                          </label>
                          <div className="flex gap-10">
                            <Radio
                              name="locations"
                              color={
                                validationErrors.vacancy_type ? "red" : "blue"
                              }
                              label="Remote"
                              onChange={handleChangeNewVac}
                              value="0"
                              checked={newVacValues.locations === "0"}
                            />
                            <Radio
                              name="locations"
                              color={
                                validationErrors.vacancy_type ? "red" : "blue"
                              }
                              label="On-site"
                              onChange={handleChangeNewVac}
                              value="1"
                              checked={newVacValues.locations === "1"}
                            />
                          </div>
                          {getFieldError("vacancy_type")}
                        </div>
                        {newVacValues.locations === "1" && (
                          <div className="flex flex-col gap-2">
                            <CustomSelect
                              placeHolderTitle="Select Cities"
                              value={selectedCities.map(city => ({
                                value: city.id.toString(),
                                label: city.city_name ?? city.name
                              }))}
                              options={allCities?.map((city) => ({
                                value: city.id.toString(),
                                label: city.city_name ?? city.name
                              })) || []}
                              onChangeHandler={handleChangeCity}
                              isMulti={true}
                              isSearchable={true}
                              isClearable={true}
                              customStyles={false}
                            />
                            {getFieldError("locations")}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Input
                              label="Minimum Age Limit"
                              type="number"
                              color="blue"
                              name="age_from"
                              value={newVacValues.age_from}
                              onChange={handleChangeNewVac}
                            />
                          </div>
                          <div>
                            <Input
                              label="Maximum  Age Limit"
                              type="number"
                              color="blue"
                              name="age_upto"
                              value={newVacValues.age_upto}
                              onChange={handleChangeNewVac}
                            />
                          </div>
                        </div>
                        {getFieldError("age_from")}
                        {getFieldError("age_upto")}

                        <div className="">
                          <label className="text-[#3da5f4] font-semibold">
                            Required Gender
                          </label>
                          <div className="flex gap-10">
                            <Radio
                              name="req_gender"
                              color="blue"
                              label="Male"
                              value="1"
                              checked={newVacValues.req_gender === "1"}
                              onChange={handleChangeNewVac}
                            />
                            <Radio
                              name="req_gender"
                              color="blue"
                              label="Female"
                              value="0"
                              checked={newVacValues.req_gender === "0"}
                              onChange={handleChangeNewVac}
                            />
                            <Radio
                              name="req_gender"
                              color="blue"
                              label="Both"
                              value="2"
                              checked={newVacValues.req_gender === "2"}
                              onChange={handleChangeNewVac}
                            />
                          </div>
                          {getFieldError("req_gender")}
                        </div>

                        <div className="grid grid-cols-2 gap-4 ">
                          <div>
                            <Popover placement="bottom">
                              <PopoverHandler>
                                <Input
                                  label="Start Date"
                                  name="apply_from"
                                  value={newVacValues.apply_from}
                                />
                              </PopoverHandler>
                              <PopoverContent>
                                <Calendar
                                  onChange={(selected) =>
                                    handleCalendar(selected, "apply_from")
                                  }
                                  className="border-0"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          {getFieldError("apply_from")}

                          <div>
                            <Popover placement="bottom">
                              <PopoverHandler>
                                <Input
                                  label="Job End Date"
                                  name="last_date"
                                  value={newVacValues.last_date}
                                />
                              </PopoverHandler>
                              <PopoverContent>
                                <Calendar
                                  onChange={(selected) =>
                                    handleCalendar(selected, "last_date")
                                  }
                                  className="border-0"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          {getFieldError("last_date")}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="">
                          <Input
                            label="Available Seats"
                            color="blue"
                            type="number"
                            name="seats"
                            value={newVacValues.seats}
                            onChange={handleChangeNewVac}
                          />
                          {getFieldError("seats")}
                        </div>

                        <div className="">
                          <Input
                            label="Required Experience (Years)"
                            color="blue"
                            type="number"
                            name="experience"
                            value={newVacValues.experience}
                            onChange={handleChangeNewVac}
                          />
                          {getFieldError("experience")}
                        </div>

                        <div className="">
                          <Input
                            label="Required Education"
                            color="blue"
                            name="required_qualification"
                            value={newVacValues.required_qualification}
                            onChange={handleChangeNewVac}
                          />
                          {getFieldError("required_qualification")}
                        </div>

                        <div className="">
                          <Textarea
                            label="Job Description"
                            color="blue"
                            name="description"
                            value={newVacValues.description}
                            onChange={handleChangeNewVac}
                          />
                          {getFieldError("description")}
                        </div>
                      </div>
                    </div>
                  ) : activeStep === 1 ? (
                    <div className="py-4">
                      <div>
                        <div className="text-[14px] font-bold text-[#3da5f4]">
                          Questionnaire
                        </div>
                        <span className="text-[10px]">
                          Create questions, if you would like candidates to
                          answer to before applying to this vacancy
                        </span>
                      </div>

                      <div className="p-4 pr-[150px]">
                        {accordions.map((accordion, index) => (
                          <div className="flex">
                            <Accordion
                              key={accordion.id}
                              open={accordion.open}
                              className="mb-2 rounded-lg border border-blue-gray-100"
                            >
                              <AccordionHeader
                                onClick={() => handleOpen(accordion.id)}
                                className="text-[14px] rounded-lg border-b-0 bg-[#F8F9FF]"
                              >
                                <span className="ml-2">
                                  Question {index + 1}
                                </span>
                              </AccordionHeader>
                              <AccordionBody>
                                <div className="p-4 space-y-4">
                                  <div className="">
                                    <Textarea
                                      color="blue"
                                      label="Question"
                                      name="question"
                                      value={
                                        newVacValues.questionnaire[index]
                                          ?.question || ""
                                      }
                                      onChange={(e) =>
                                        handleQuestionChange(index, e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="">
                                    <span className="text-[14px] text-[#3da5f4] font-bold">
                                      Question Type
                                    </span>
                                    <select
                                      onChange={(e) =>
                                        handleSelectChange(
                                          accordion.id,
                                          e.target.value,
                                          index
                                        )
                                      }
                                      className="w-full p-2 border rounded mt-2"
                                      value={
                                        newVacValues.questionnaire[index]
                                          ?.qType === "4" ||
                                        newVacValues.questionnaire[index]
                                          ?.qType === 4
                                          ? "0"
                                          : newVacValues.questionnaire[index]
                                              ?.qType || ""
                                      }
                                    >
                                      <option value="">Select an option</option>
                                      <option value="0">Text Area</option>
                                      <option value="1">Check Boxes</option>
                                      <option value="2">Radio Button</option>
                                      <option value="3">Dropdown List</option>
                                    </select>
                                  </div>
                                  <div className="mt-4">
                                    {renderSelectedComponent(
                                      accordion.id,
                                      accordion.selectedOption,
                                      accordion.radioButtons,
                                      accordion.checkBoxes
                                    )}
                                  </div>
                                </div>
                              </AccordionBody>
                            </Accordion>
                            <div>
                              <button
                                onClick={(e) =>
                                  removeAccordion(e, accordion.id, index)
                                }
                                className=""
                              >
                                <IoMdCloseCircleOutline className="text-[20px] text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <Button
                          onClick={addAccordion}
                          className="mt-4 bg-bgBlue text-white capitalize p-2 font-medium rounded-lg shadow-sm hover:bg-[#2d94e0]"
                        >
                          Add More Questions
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-96">
                          <Input
                            label="Interview Rounds"
                            type="number"
                            color="blue"
                            required
                            min="1"
                            max="5"
                            value={newVacValues.interview_rounds}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!value || value < 1) {
                                toast.error("Interview rounds must be at least 1");
                                return;
                              }
                              if (value > 5) {
                                toast.error("Maximum 5 interview rounds allowed");
                                return;
                              }
                              handleChangeNewVac({
                                target: {
                                  name: "interview_rounds",
                                  value: value,
                                },
                              });
                              // The useEffect in the ViewModel will handle accordion adjustment
                            }}
                          />
                        </div>

                        <div className="w-96">
                          {accordionsInterview.map((accordion, index) => (
                            <Accordion
                              key={accordion.id}
                              open={accordion.open}
                              className="mb-2 rounded-lg border border-blue-gray-100"
                            >
                              <AccordionHeader
                                onClick={() =>
                                  handleOpenInterviews(accordion.id)
                                }
                                className="text-[14px] rounded-lg border-b-0 bg-[#F8F9FF]"
                              >
                                <span className="ml-2">
                                  Interview {index + 1}
                                </span>
                              </AccordionHeader>
                              <AccordionBody>
                                <div className="p-4 space-y-4">
                                  <div>
                                    <Input
                                      label="Interview Name"
                                      color="blue"
                                      placeholder="Enter Interview Name"
                                      value={accordion.name}
                                      onChange={(e) =>
                                        handleInterviewChange(
                                          accordion.id,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-[14px] text-[#3da5f4] font-semibold">
                                      Interview Marks Definition
                                    </span>
                                    <span className="text-[10px]">
                                      You may add marks definitions, for rating
                                      the candidates after conducting
                                      Test/Interview
                                    </span>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <div>
                                      <Input
                                        label="Enter Marks Title on this page"
                                        color="blue"
                                        placeholder="Behavior Marks"
                                        value={accordion.marks_title || ""}
                                        onChange={(e) =>
                                          handleInterviewChange(
                                            accordion.id,
                                            "marks_title",
                                            e.target.value
                                          )
                                        }
                                      />
                                      {get_mark_def_data && get_mark_def_data.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Marks title and total marks are optional when Available Definitions are selected
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <Input
                                        label="Total Marks"
                                        color="blue"
                                        placeholder="100"
                                        type="number"
                                        min="1"
                                        value={accordion.total_marks || ""}
                                        onChange={(e) =>
                                          handleInterviewChange(
                                            accordion.id,
                                            "total_marks",
                                            e.target.value
                                          )
                                        }
                                      />
                                      <p className="text-xs text-gray-500 mt-1">
                                        Total marks is for display purposes only
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-[14px] text-[#3da5f4] font-semibold">
                                      Available Definitions
                                    </span>
                                    <span className="text-[10px]">
                                      Select all the applicable definitions
                                    </span>
                                    {get_mark_def_data &&
                                      get_mark_def_data.length > 0 ? (
                                      get_mark_def_data.map((data) => (
                                        <div
                                          key={data.id}
                                          className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded"
                                        >
                                          <input
                                            type="checkbox"
                                            className="text-[#3da5f4]"
                                            onChange={(e) => {
                                              const updatedAccordions =
                                                accordionsInterview.map(
                                                  (acc) => {
                                                    if (
                                                      acc.id === accordion.id
                                                    ) {
                                                      return {
                                                        ...acc,
                                                        marks_def: e.target
                                                          .checked
                                                          ? [
                                                            ...(acc.marks_def ||
                                                              []),
                                                            parseInt(data.id),
                                                          ]
                                                          : (
                                                            acc.marks_def ||
                                                            []
                                                          ).filter(
                                                            (id) =>
                                                              id !== parseInt(data.id)
                                                          ),
                                                      };
                                                    }
                                                    return acc;
                                                  }
                                                );
                                              setAccordionsInterview(
                                                updatedAccordions
                                              );
                                            }}
                                            checked={(
                                              accordion.marks_def || []
                                            ).includes(parseInt(data.id))}
                                          />
                                          <span className="text-sm font-medium">
                                            {data.marks_title}
                                          </span>
                                          <span className="text-xs text-gray-500 ml-auto">
                                            ID: {data.id}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-sm text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                                        No mark definitions available. Add one
                                        above to get started.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </AccordionBody>
                            </Accordion>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-16 flex justify-between">
                  <div>
                    {!isFirstStep && (
                      <Button
                        onClick={handlePrev}
                        className="capitalize bg-bgBlue text-white rounded-lg shadow-sm hover:bg-[#2d94e0]"
                      >
                        Prev
                      </Button>
                    )}
                  </div>
                  <div>
                    <Button
                      onClick={isLastStep ? createNewVacancy : wrappedHandleNext}
                      className={`capitalize cursor-pointer rounded-lg shadow-sm text-white ${isLastStep ? "bg-[#0acf97] hover:bg-[#09b386]" : "bg-bgBlue hover:bg-[#2d94e0]"
                        }`}
                    >
                      {isLastStep ? "Submit" : "Next"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateVacancy;
