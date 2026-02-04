import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  ArrowLeft,
  Upload,
  File,
} from "lucide-react";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import useVacancy from "../viewModel/VacancyViewModel/VacancyService";
import { useState } from "react";

interface EditProfileProps {
  onBackClick: () => void;
}

interface ProfileForm {
  name: string;
  father_name: string;
  email: string;
  phone: string;
  gender: number;
  nic: string;
  dob: string;
  marital_status: string;
  postal_address: string;
  permanent_address: string;
  city_id: number;
  state: string;
  country_id: number;
  photo: File | null;
  cv_name: File | null;
}

// Static city data with IDs
const CITIES = [
  { id: 242475, name: "Lahore" },
  { id: 242476, name: "Karachi" },
  { id: 242477, name: "Islamabad" },
  { id: 242478, name: "Rawalpindi" },
  { id: 242479, name: "Faisalabad" },
  { id: 242480, name: "Multan" },
  { id: 242481, name: "Peshawar" },
  { id: 242482, name: "Quetta" },
  { id: 242483, name: "Sialkot" },
  { id: 242484, name: "Gujranwala" },
];

// Static country data with IDs
const COUNTRIES = [
  { id: 1234, name: "Pakistan" },
  { id: 1235, name: "India" },
  { id: 1236, name: "USA" },
  { id: 1237, name: "UK" },
  { id: 1238, name: "Canada" },
  { id: 1239, name: "Australia" },
  { id: 1240, name: "Germany" },
  { id: 1241, name: "France" },
  { id: 1242, name: "China" },
  { id: 1243, name: "Japan" },
];

const EditProfile = ({ onBackClick }: EditProfileProps) => {
  const { toast } = useToast();
  const { update_candidate } = useVacancy();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  
  const form = useForm<ProfileForm>({
    defaultValues: {
      name: "Hassan Raza",
      father_name: "Masroor Hussain",
      email: "admin199234@gmail.com",
      phone: "03047949332",
      gender: 1,
      nic: "3220256474669",
      dob: "1995-06-10",
      marital_status: "SINGLE",
      country_id: 1234,
      city_id: 242475,
      state: "Punjab",
      postal_address: "",
      permanent_address: "",
      photo: null,
      cv_name: null,
    },
    mode: "onChange",
  });

  // Calculate minimum date (10 years ago from today)
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
    return minDate.toISOString().split('T')[0];
  };

  const onSubmit = async (data: ProfileForm) => {
    try {
      console.log("Form data:", data);
      console.log("Photo file:", photoFile);
      console.log("CV file:", cvFile);
      
      // Create the payload matching the required structure
      const payload = {
        name: data.name,
        father_name: data.father_name,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        nic: data.nic,
        dob: data.dob,
        marital_status: data.marital_status,
        postal_address: data.postal_address,
        permanent_address: data.permanent_address,
        city_id: data.city_id,
        state: data.state,
        country_id: data.country_id,
        photo: photoFile ? photoFile.name : "ali_khan.jpg",
        cv_name: cvFile ? cvFile.name : "AliKhan_Resume.pdf"
      };
      
      console.log("Final payload:", payload);
      
      // Call the update_candidate function from the store
      const response = await update_candidate(payload);
      
      // Check if the response indicates an error
      if (response && response.STATUS === "ERROR") {
        toast({
          title: `Error: ${response.ERROR_CODE || "Validation Error"}`,
          description: response.ERROR_DESCRIPTION || "Please check your input and try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Profile Updated!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      
      // Handle API error responses
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.STATUS === "ERROR") {
          toast({
            title: `Error: ${errorData.ERROR_CODE || "API Error"}`,
            description: errorData.ERROR_DESCRIPTION || "An error occurred while updating your profile.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Update Failed",
            description: errorData.message || "There was an error updating your profile. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Update Failed",
          description: "There was an error updating your profile. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      form.setValue("photo", file);
    }
  };

  const handleCvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
      form.setValue("cv_name", file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-fade-in">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackClick}
              className="flex items-center gap-2 border-border hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient">
              Edit Profile
            </h1>
          </div>

          {/* Profile Form */}
          <div
            className="cyber-card p-6 sm:p-8 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Full name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-input border-border focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Father's Name */}
                  <FormField
                    control={form.control}
                    name="father_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4 text-secondary" />
                          Father's Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-input border-border focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-accent" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="bg-input border-border focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phone"
                    rules={{ 
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{11}$/,
                        message: "Phone number must be 11 digits"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Select defaultValue="+92">
                              <SelectTrigger className="w-20 bg-input border-border rounded-r-none">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="+92">+92</SelectItem>
                                <SelectItem value="+1">+1</SelectItem>
                                <SelectItem value="+44">+44</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              {...field}
                              className="bg-input border-border border-l-0 rounded-l-none focus:ring-primary"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* NIC Number */}
                  <FormField
                    control={form.control}
                    name="nic"
                    rules={{ 
                      required: "NIC number is required",
                      pattern: {
                        value: /^[0-9]{13}$/,
                        message: "NIC number must be 13 digits"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-secondary" />
                          NIC Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-input border-border focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date of Birth */}
                  <FormField
                    control={form.control}
                    name="dob"
                    rules={{ 
                      required: "Date of birth is required",
                      validate: (value) => {
                        if (!value) return "Date of birth is required";
                        const selectedDate = new Date(value);
                        const minDate = new Date();
                        minDate.setFullYear(minDate.getFullYear() - 10);
                        if (selectedDate > minDate) {
                          return "Date of birth must be at least 10 years ago";
                        }
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent" />
                          Date of Birth
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            max={getMinDate()}
                            className="bg-input border-border focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gender */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Gender
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <SelectTrigger className="bg-input border-border focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Male</SelectItem>
                              <SelectItem value="2">Female</SelectItem>
                              <SelectItem value="3">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Marital Status */}
                  <FormField
                    control={form.control}
                    name="marital_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Marital Status
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-input border-border focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SINGLE">Single</SelectItem>
                              <SelectItem value="MARRIED">Married</SelectItem>
                              <SelectItem value="DIVORCED">Divorced</SelectItem>
                              <SelectItem value="UNKNOWN">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Country */}
                  <FormField
                    control={form.control}
                    name="country_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          Country
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <SelectTrigger className="bg-input border-border focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map((country) => (
                                <SelectItem key={country.id} value={country.id.toString()}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* City */}
                  <FormField
                    control={form.control}
                    name="city_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          City
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <SelectTrigger className="bg-input border-border focus:ring-primary">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {CITIES.map((city) => (
                                <SelectItem key={city.id} value={city.id.toString()}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* State */}
                  <FormField
                    control={form.control}
                    name="state"
                    rules={{ required: "State/Province is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          State/Province
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-input border-border focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="postal_address"
                    rules={{ required: "Postal address is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Postal Address
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter postal address..."
                            className="bg-input border-border focus:ring-primary resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permanent_address"
                    rules={{ required: "Permanent address is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Permanent Address
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter permanent address..."
                            className="bg-input border-border focus:ring-primary resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* File Upload Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Upload */}
                  <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Upload className="w-4 h-4 text-primary" />
                          Profile Photo
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="bg-input border-border focus:ring-primary"
                            />
                            {photoFile && (
                              <span className="text-sm text-muted-foreground">
                                {photoFile.name}
                              </span>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CV Upload */}
                  <FormField
                    control={form.control}
                    name="cv_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <File className="w-4 h-4 text-secondary" />
                          CV/Resume
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleCvChange}
                              className="bg-input border-border focus:ring-primary"
                            />
                            {cvFile && (
                              <span className="text-sm text-muted-foreground">
                                {cvFile.name}
                              </span>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button type="submit" className="neon-button px-8">
                    Update Profile
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
