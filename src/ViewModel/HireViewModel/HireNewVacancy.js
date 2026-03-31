import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { IoMdCloseCircleOutline, IoMdAdd } from "react-icons/io";
import { Button } from '@material-tailwind/react';
import hireApi from '../../Model/Data/Hire/Hire';
import { format } from 'date-fns';
import useStore from '../../Store/store';
import { toast } from 'react-toastify';

const useHireNewVacancy = () => {
  const gettingAllLocations = useStore((state) => state.gettingAllLocations)
  const allCities = useStore((state) => state.allCities)


  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

const [newQuestion, setNewQuestion] = useState({
  question: '',
  qType: '',
  options: []
});

const [currentOptionInput, setCurrentOptionInput] = useState('');

  const [newVacValues, setNewVacValues] = useState({
    title:'',
    vacancy_type:'',
    age_from:'',
    age_upto:'',
    req_gender: '2',
    apply_from: getCurrentDate(),
    last_date: getCurrentDate(),
    seats:'',
    experience:'',
    required_qualification:'',
    description:'',
    locations:[],
    qType:'',
    // question:'',
    new_rounds:'',
    interview_rounds:'',
    id:'',
    questionnaire: [{question: '', qType: '', options: [""]}],
    interviews: [],
  })

  

  const createNewVacancy = async(e) => {
    e.preventDefault()
    // const formattedQuestionnaire = newVacValues.questionnaire.map((item) => ({
    //   question: item.question,
    //   qType: item.qType,
    //   options: item.options || [], 
    // }));

    const newVacancyData = {
      title:newVacValues.title,
      vacancy_type:newVacValues.vacancy_type,
      age_from:newVacValues.age_from,
      req_gender:newVacValues.req_gender,
      age_upto:newVacValues.age_upto,
      apply_from:newVacValues.apply_from,
      last_date:newVacValues.last_date,
      seats:newVacValues.seats,
      experience:newVacValues.experience,
      required_qualification:newVacValues.required_qualification,
      description:newVacValues.description,
      locations:newVacValues.locations,
      qType:newVacValues.qType,
      question:newVacValues.question,
      new_rounds:newVacValues.new_rounds,
      id:newVacValues.id,
      questionnaire: newVacValues.questionnaire,
    }

    // console.log('newVacancyData', newVacancyData)

    // try{
    //   const response = await hireApi.newVacancy(newVacancyData)
    //   const data = response.data
    //   console.log(data)

    //   if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
    //     setNewVacValues({
    //       title:'',
    //       vacancy_type:'',
    //       age_from:'',
    //       age_upto:'',
    //       req_gender:'',
    //       apply_from:'',
    //       last_date:'',
    //       seats:'',
    //       experience:'',
    //       required_qualification:'',
    //       description:'',
    //       locations:[],
    //       qType:'',
    //       question:'',
    //       new_rounds:'',
    //       interview_rounds:'',
    //       questionnaire: [{"question": '', "qType": '', "options": [""]}],
    //       id:'',
    //     })

    //   }

    // } catch(error) {
    //   console.log(error)
    // }   
  }

 

  const handleQuestionChange = (index, value) => {
    setNewVacValues((prevState) => {
      const updatedQuestionnaire = [...prevState.questionnaire];
      if (!updatedQuestionnaire[index]) {
        updatedQuestionnaire[index] = { question: '', qType: '', options: [""] };
      }
      updatedQuestionnaire[index].question = value;
      return {
        ...prevState,
        questionnaire: updatedQuestionnaire
      };
    });
  };
  
  
  

  const handleQuestionnaireChange = (field, value) => {
    setNewVacValues({
      ...newVacValues,
      questionnaire: {
        ...newVacValues.questionnaire,
        [field]: value,
      },
    });
  };
  

  


    // <-- Create New Vacancy -->
  const navigate = useNavigate()

  const createVacancy = () => {
    navigate(`/hire/create_vacancy`)
    gettingAllLocations()
  }

  const [activeStep, setActiveStep] = useState(0);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLastStep, setIsLastStep] = useState(false);

  const handleStepActive = (step)=>{
    setActiveStep(step)
}
  const handlePrev = () => {
    if (activeStep > 0) {
        setActiveStep(activeStep - 1);
    }
};

const handleNext = () => {
    setActiveStep(activeStep + 1);
};

  const handleLastStep = (value)=>{
  setIsLastStep(value)
}
  const handleFirstStep = (value)=>{
  setIsFirstStep(value)
}

// <-- Step 2 -->
   const [accordions, setAccordions] = useState([{ id: 1, open: true, selectedOption: "", radioButtons: [], checkBoxes: [] }]);

   const handleOpen = (id) => {
    setAccordions((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.id === id ? { ...accordion, open: !accordion.open } : accordion
      )
    );
  };

  const removeAccordion = (e, accordionId, index) => {
    e.preventDefault()
    setAccordions((prevAccordions) =>
      prevAccordions.filter((accordion) => accordion.id !== accordionId)
    );
    
    // Also remove the question from the questionnaire array
    setNewVacValues((prevState) => {
      const updatedQuestionnaire = [...prevState.questionnaire];
      updatedQuestionnaire.splice(index, 1);
      return {
        ...prevState,
        questionnaire: updatedQuestionnaire
      };
    });
  };

  const handleSelectChange = (id, value, index) => {
    console.log('***', id, value, index);
    setAccordions((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.id === id ? { ...accordion, selectedOption: value } : accordion
      )
    );
    
    // Update the specific question's type in the questionnaire array
    setNewVacValues((prevState) => {
      const updatedQuestionnaire = [...prevState.questionnaire];
      if (!updatedQuestionnaire[index]) {
        updatedQuestionnaire[index] = { question: '', qType: '', options: [""] };
      }
      updatedQuestionnaire[index].qType = value;
      return {
        ...prevState,
        questionnaire: updatedQuestionnaire
      };
    });

    // Clear the option input when question type changes
    setCurrentOptionInput('');
  };
  


  const addAccordion = () => {
    const newId = accordions.length ? accordions[accordions.length - 1].id + 1 : 1;
    setAccordions([...accordions, { id: newId, open: false, selectedOption: "", radioButtons: [] }]);
    
    // Also add a new question to the questionnaire array
    setNewVacValues((prevState) => ({
      ...prevState,
      questionnaire: [...prevState.questionnaire, { question: '', qType: '', options: [""] }]
    }));
  };

  const addRadioButton = (e, accordionId) => {
    e.preventDefault()
    setAccordions((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.id === accordionId
          ? { ...accordion, radioButtons: [...accordion.radioButtons, { id: Date.now(), label: "" }] }
          : accordion
      )
    );
  };

  const addCheckBoxButton = (e, accordionId) => {
    e.preventDefault()
    setAccordions((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.id === accordionId
          ? { ...accordion, checkBoxes: [...accordion.checkBoxes, { id: Date.now(), label: "" }] }
          : accordion
      )
    );
  };

  const removeRadioButton = (accordionId, radioButtonId) => {
    setAccordions((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.id === accordionId
          ? { ...accordion, radioButtons: accordion.radioButtons.filter(rb => rb.id !== radioButtonId) }
          : accordion
      )
    );
  };

  const removeCheckbox = (accordionId, checkboxId) => {
    setAccordions((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.id === accordionId
          ? { ...accordion, checkBoxes: accordion.checkBoxes.filter(cb => cb.id !== checkboxId) }
          : accordion
      )
    );
  };

  const handleRadioLabelChange = (accordionId, radioButtonId, label) => {
    setAccordions((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.id === accordionId
          ? {
              ...accordion,
              radioButtons: accordion.radioButtons.map((rb) =>
                rb.id === radioButtonId ? { ...rb, label } : rb
              ),
            }
          : accordion
      )
    );
  };

  const handleCheckboxLabelChange = (accordionId, checkboxId, label) => {
    setAccordions((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.id === accordionId
          ? {
              ...accordion,
              checkBoxes: accordion.checkBoxes.map((cb) =>
                cb.id === checkboxId ? { ...cb, label } : cb
              ),
            }
          : accordion
      )
    );
  };

  // Step 3
  const [accordionsInterview, setAccordionsInterview] = useState([{ 
    id: 1, 
    open: true, 
    name: '',
    marks_title: '',
    total_marks: '',
    marks_def: []
  }]);

  const handleInterviewChange = (id, field, value) => {
    setAccordionsInterview(prevAccordions =>
      prevAccordions.map(accordion =>
        accordion.id === id
          ? { ...accordion, [field]: value }
          : accordion
      )
    );
  };

   const handleOpenInterviews = (id) => {
    setAccordionsInterview((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.id === id ? { ...accordion, open: !accordion.open } : accordion
      )
    );
  };

  const addAccordionInterview = () => {
    const newId = accordionsInterview.length ? accordionsInterview[accordionsInterview.length - 1].id + 1 : 1;
    setAccordionsInterview([...accordionsInterview, { 
      id: newId, 
      open: false, 
      name: '', 
      marks_title: '',
      total_marks: '',
      marks_def: [] 
    }]);
  };

  // Initialize accordions based on interview_rounds value
  useEffect(() => {
    if (newVacValues.interview_rounds && parseInt(newVacValues.interview_rounds) > 0) {
      const rounds = parseInt(newVacValues.interview_rounds);
      const currentLength = accordionsInterview.length;
      
      // Enforce maximum limit of 5 rounds
      if (rounds > 5) {
        toast.error("Maximum 5 interview rounds allowed");
        return;
      }
      
      if (rounds !== currentLength) {
        if (rounds > currentLength) {
          // Add more accordions
          const newAccordions = [...accordionsInterview];
          for (let i = currentLength; i < rounds; i++) {
            newAccordions.push({
              id: i + 1,
              open: false,
              name: '',
              marks_title: '',
              total_marks: '',
              marks_def: []
            });
          }
          setAccordionsInterview(newAccordions);
        } else if (rounds < currentLength) {
          // Remove excess accordions
          const newAccordions = accordionsInterview.slice(0, rounds);
          setAccordionsInterview(newAccordions);
        }
      }
    }
  }, [newVacValues.interview_rounds]);

  const renderSelectedComponent = (accordionId, selectedOption, radioButtons, checkBoxes) => {
    switch (selectedOption) {
      case "0": // Textarea
      case "4": // legacy: same as text area (Input Field removed from UI)
        return (
          <div>
            <span className="text-[12px] text-gray-500">
              A text area will be displayed for user input
            </span>
          </div>
        );

      case "1": // Checkbox
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500">
                Add minimum 2 options for checkbox selection
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="p-2 border rounded"
                placeholder="Enter option"
                value={currentOptionInput}
                onChange={(e) => setCurrentOptionInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOptionToQuestion(accordionId);
                  }
                }}
              />
              <div className="flex flex-wrap gap-2">
                {accordions
                  .find((acc) => acc.id === accordionId)
                  ?.options?.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded"
                    >
                      <input type="checkbox" disabled />
                      <span className="text-[12px]">{option}</span>
                      <button
                        onClick={() => {
                          const updatedAccordions = accordions.map((acc) => {
                            if (acc.id === accordionId) {
                              return {
                                ...acc,
                                options: acc.options.filter((_, i) => i !== index),
                              };
                            }
                            return acc;
                          });
                          setAccordions(updatedAccordions);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
              <Button
                size="sm"
                className="bg-[#8bc9f8] w-fit"
                onClick={() => addOptionToQuestion(accordionId)}
              >
                Add Option
              </Button>
            </div>
          </div>
        );

      case "2": // Radio
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500">
                Add minimum 2 options for radio selection
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="p-2 border rounded"
                placeholder="Enter option"
                value={currentOptionInput}
                onChange={(e) => setCurrentOptionInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOptionToQuestion(accordionId);
                  }
                }}
              />
              <div className="flex flex-wrap gap-2">
                {accordions
                  .find((acc) => acc.id === accordionId)
                  ?.options?.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded"
                    >
                      <input type="radio" name={`radio-${accordionId}`} disabled />
                      <span className="text-[12px]">{option}</span>
                      <button
                        onClick={() => {
                          const updatedAccordions = accordions.map((acc) => {
                            if (acc.id === accordionId) {
                              return {
                                ...acc,
                                options: acc.options.filter((_, i) => i !== index),
                              };
                            }
                            return acc;
                          });
                          setAccordions(updatedAccordions);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
              <Button
                size="sm"
                className="bg-[#8bc9f8] w-fit"
                onClick={() => addOptionToQuestion(accordionId)}
              >
                Add Option
              </Button>
            </div>
          </div>
        );

      case "3": // Dropdown
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500">
                Add minimum 2 options for dropdown selection
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="p-2 border rounded"
                placeholder="Enter option"
                value={currentOptionInput}
                onChange={(e) => setCurrentOptionInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOptionToQuestion(accordionId);
                  }
                }}
              />
              <div className="flex flex-wrap gap-2">
                {accordions
                  .find((acc) => acc.id === accordionId)
                  ?.options?.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded"
                    >
                      <span className="text-[12px]">{option}</span>
                      <button
                        onClick={() => {
                          const updatedAccordions = accordions.map((acc) => {
                            if (acc.id === accordionId) {
                              return {
                                ...acc,
                                options: acc.options.filter((_, i) => i !== index),
                              };
                            }
                            return acc;
                          });
                          setAccordions(updatedAccordions);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
              <Button
                size="sm"
                className="bg-[#8bc9f8] w-fit"
                onClick={() => addOptionToQuestion(accordionId)}
              >
                Add Option
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleChangeNewVac = (e) => {
    const {name, value}  = e.target
    
    // const { name, value } = e.target;
    // if(name === 'question'){

    //   setNewVacValues((prevState) => {
    //     const updatedQuestionnaire = prevState.questionnaire.map((q, index) => {
    //       if (index === id) {
    //         return { ...q, [name]: value };
    //       }
    //       return q;
    //     });
    //     return { ...prevState, questionnaire: updatedQuestionnaire };
    //   });
    // }else{
      setNewVacValues((prevState) => ({
        ...prevState,
        [name] : value
      }))
    // }
  }



  const handleCalendar = (timeStamp, field) => {
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setNewVacValues(prev => ({
      ...prev,
      [field]: formatDate(timeStamp)
    }));
  };

  const handleChangeCity = (name, value) => {
    setNewVacValues((prevState)=>({
      ...prevState, 
      [name]: value
  }))

  }



  const handleQuestionType= (e, id)=>{
    const { name, value } = e.target;
    setNewVacValues((prevState) => {
      const updatedQuestionnaire = prevState.questionnaire.map((q, index) => {
        if (index === id) {
          return { ...q, [name]: value };
        }
        return q;
      });
      return { ...prevState, questionnaire: updatedQuestionnaire };
    });

  }

  const addOptionToQuestion = (accordionId) => {
    if (!currentOptionInput.trim()) {
      toast.error("Please enter an option");
      return;
    }
    const accordion = accordions.find((acc) => acc.id === accordionId);
    if (accordion) {
      const options = accordion.options || [];
      const updatedAccordions = accordions.map((acc) => {
        if (acc.id === accordionId) {
          return {
            ...acc,
            options: [...options, currentOptionInput.trim()],
          };
        }
        return acc;
      });
      setAccordions(updatedAccordions);
      setCurrentOptionInput("");
    }
  };



  return {
    createVacancy, 
    handleFirstStep, 
    activeStep, 
    removeAccordion, 
    handleLastStep, 
    handleNext, 
    handlePrev, 
    handleStepActive, 
    isFirstStep, 
    isLastStep,
    accordions, 
    setAccordions, 
    handleOpen, 
    handleSelectChange, 
    addAccordion, 
    addRadioButton, 
    removeRadioButton, 
    handleRadioLabelChange, 
    renderSelectedComponent, 
    createNewVacancy, 
    newVacValues,
    handleChangeNewVac, 
    handleCalendar, 
    allCities, 
    handleChangeCity, 
    handleQuestionChange, 
    newQuestion, 
    handleQuestionnaireChange,
    handleQuestionType, 
    accordionsInterview,
    setAccordionsInterview,
    handleOpenInterviews, 
    addAccordionInterview,
    handleInterviewChange,
    currentOptionInput,
    setCurrentOptionInput,
    addOptionToQuestion
  }
}

export default useHireNewVacancy