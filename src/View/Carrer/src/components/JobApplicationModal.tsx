import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MapPin, FileText, X, CheckSquare, Circle, ChevronDown, Type } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import useVacancy from "../viewModel/VacancyViewModel/VacancyService";

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  vacancyId: string;
  applyData: any;
}

interface ApplicationForm {
  location: string;
  [key: string]: any; // Dynamic form fields based on questionnaire
}

const JobApplicationModal = ({
  isOpen,
  onClose,
  jobTitle,
  vacancyId,
  applyData,
}: JobApplicationModalProps) => {
  const { toast } = useToast();
  const { submit_application } = useVacancy();
  const [defaultValues, setDefaultValues] = useState<ApplicationForm>({
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ApplicationForm>({
    defaultValues,
  });

  // Update form when applyData changes
  useEffect(() => {
    if (applyData?.DB_DATA) {
      const newDefaults: ApplicationForm = { location: "" };
      
      // Add dynamic fields for questionnaire
      if (applyData.DB_DATA.questionnaire) {
        applyData.DB_DATA.questionnaire.forEach((question: any) => {
          if (question.questionType === 1) { // checkbox
            newDefaults[`question_${question.id}`] = [];
          } else {
            newDefaults[`question_${question.id}`] = "";
          }
        });
      }
      
      setDefaultValues(newDefaults);
      form.reset(newDefaults);
    }
  }, [applyData, form]);

  const onSubmit = async (data: ApplicationForm) => {
    setIsLoading(true);
    try {
      console.log("Form data:", data);
      
      // Get candidate_id from localStorage
      const candidate_id = localStorage.getItem('id');
      if (!candidate_id) {
        throw new Error('Candidate ID not found. Please login again.');
      }

      // Get city_id from selected location
      const selectedLocation = applyData?.DB_DATA?.locations?.find(
        (loc: any) => loc.city.city_name === data.location
      );
      if (!selectedLocation) {
        throw new Error('Please select a valid location.');
      }

      // Prepare answers array
      const answers: any[] = [];
      
      // Process questionnaire answers
      if (applyData?.DB_DATA?.questionnaire) {
        applyData.DB_DATA.questionnaire.forEach((question: any) => {
          const fieldName = `question_${question.id}`;
          const answer = data[fieldName];
          
          if (answer !== undefined && answer !== null && answer !== '') {
            let answerData: any = {
              question_id: question.id,
              answer: answer
            };

            // For checkbox questions, join multiple selections
            if (question.questionType === 1 && Array.isArray(answer)) {
              answerData.answer = answer.join(', ');
            }

            // Add option_id for all question types
            if (question.options && question.options.length > 0) {
              if (question.questionType === 1) {
                // For checkbox, use the first selected option's id
                const firstSelectedOption = question.options.find((opt: any) => 
                  answer.includes(opt.option_text)
                );
                if (firstSelectedOption) {
                  answerData.option_id = firstSelectedOption.id;
                }
              } else if (question.questionType === 2 || question.questionType === 3) {
                // For radio/dropdown, find the selected option
                const selectedOption = question.options.find((opt: any) => opt.option_text === answer);
                if (selectedOption) {
                  answerData.option_id = selectedOption.id;
                }
              } else {
                // For textarea/input questions, use the first option's id if available
                answerData.option_id = question.options[0].id;
              }
            } else {
              // For questions without options (like textarea/input), we need to create a default option_id
              // Use the question_id as the option_id for text-based questions
              answerData.option_id = question.id;
            }

            answers.push(answerData);
          }
        });
      }

      // Create the application payload
      const applicationPayload = {
        vacancy_id: parseInt(vacancyId),
        city_id: selectedLocation.city_id,
        candidate_id: parseInt(candidate_id),
        answers: answers
      };

      console.log("Application payload:", applicationPayload);

      // Submit the application
      await submit_application(applicationPayload);
      
      toast({
        title: "Application Submitted!",
        description: "Your job application has been submitted successfully.",
      });
      onClose();
      form.reset();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      let errorTitle = "Application Failed";
      let errorDescription = "There was an error submitting your application. Please try again.";
      
      // Handle specific API error responses
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.STATUS === "ERROR") {
          switch (errorData.ERROR_CODE) {
            case "VTWE-143782184":
              errorTitle = "Already Applied";
              errorDescription = "You have already applied for this vacancy. You cannot apply again.";
              break;
            case "SPEXT":
              errorTitle = "Validation Error";
              errorDescription = errorData.ERROR_DESCRIPTION || "Please check your application details and try again.";
              break;
            default:
              errorTitle = "Application Error";
              errorDescription = errorData.ERROR_DESCRIPTION || "An error occurred while submitting your application.";
              break;
          }
        } else {
          errorDescription = errorData.message || errorDescription;
        }
      } else if (error.message) {
        errorDescription = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render different question types
  const renderQuestion = (question: any) => {
    const fieldName = `question_${question.id}`;
    
    switch (question.questionType) {
      case 0: // textarea
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={fieldName}
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {question.question}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your answer..."
                    className="min-h-[120px] bg-input border-border focus:ring-primary resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 1: // checkbox
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={fieldName}
            rules={{ required: "Please select at least one option" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {question.question}
                </FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {question.options?.map((option: any, index: number) => (
                      <div key={option.id || index} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value?.includes(option.option_text) || false}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, option.option_text]);
                            } else {
                              field.onChange(currentValues.filter((val: string) => val !== option.option_text));
                            }
                          }}
                        />
                        <label className="text-sm text-muted-foreground cursor-pointer">
                          {option.option_text}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 2: // radio
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={fieldName}
            rules={{ required: "Please select an option" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {question.question}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="space-y-3"
                  >
                    {question.options?.map((option: any, index: number) => (
                      <div key={option.id || index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.option_text} id={`${fieldName}_${option.id || index}`} />
                        <label
                          htmlFor={`${fieldName}_${option.id || index}`}
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          {option.option_text}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 3: // dropdown
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={fieldName}
            rules={{ required: "Please select an option" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {question.question}
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-input border-border focus:ring-primary">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option: any, index: number) => (
                        <SelectItem key={option.id || index} value={option.option_text}>
                          {option.option_text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 4: // input
        return (
          <FormField
            key={question.id}
            control={form.control}
            name={fieldName}
            rules={{ required: "This field is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {question.question}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your answer..."
                    className="bg-input border-border focus:ring-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            Job Application
          </DialogTitle>
        </DialogHeader>

        {!applyData?.DB_DATA ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading application form...</p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Selection */}
            <FormField
              control={form.control}
              name="location"
              rules={{ required: "Please select a location" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Select a location, where you want to apply
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-input border-border focus:ring-primary">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {applyData?.DB_DATA?.locations?.map((location: any) => (
                          <SelectItem 
                            key={location.id} 
                            value={location.city.city_name}
                          >
                            {location.city.city_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dynamic Questionnaire */}
            {applyData?.DB_DATA?.questionnaire && applyData.DB_DATA.questionnaire.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground">
                  Please fill the questionnaire below
                </p>
                
                {applyData.DB_DATA.questionnaire.map((question: any, index: number) => (
                  <div key={question.id} className="space-y-3">
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-6 border-border hover:bg-muted"
                disabled={isLoading}
              >
                Close
              </Button>
              <Button 
                type="submit" 
                className="neon-button px-8"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Apply"}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationModal;
