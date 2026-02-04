import { useState } from "react";
import JobListing from "./JobListing";
import JobDetail from "./JobDetail";
import EditProfile from "./EditProfile";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import useVacancy from "../viewModel/VacancyViewModel/VacancyService";
const Index = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<
    "listing" | "detail" | "profile"
  >("listing");
  const {
    // gettingAllVacanciesList,
    // allVacanciesList,
    get_job_by_idfn,
    job_details,
  } = useVacancy();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleJobSelect = (jobId: string, jobTitle: string) => {
    get_job_by_idfn(jobId); // pass job ID to API
    setSelectedJob(jobTitle); // store selected job title
    setSelectedJobId(jobId); // store selected job ID
    setCurrentPage("detail"); // trigger page change
  };

  const handleBackToListing = () => {
    setSelectedJob(null);
    setSelectedJobId(null);
    setCurrentPage("listing");
  };

  const handleProfileClick = () => {
    setCurrentPage("profile");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "detail":
        return (
          <JobDetail
            data={job_details}
            jobTitle={selectedJob!}
            vacancyId={selectedJobId!}
            onBackClick={handleBackToListing}
          />
        );
      case "profile":
        return <EditProfile onBackClick={handleBackToListing} />;
      default:
        return (
          <JobListing
            onJobSelect={handleJobSelect}
            onProfileClick={handleProfileClick}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>{renderPage()}</AuthProvider>
    </ThemeProvider>
  );
};

export default Index;
