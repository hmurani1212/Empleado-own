import { useState, useEffect } from "react";
import Header from "../components/Header";
import JobCard from "../components/JobCard";
import heroImage from "../assets/hero-illustration.jpg";
import useVacancy from "../viewModel/VacancyViewModel/VacancyService";
const jobs = [
  "Business Development Associate",
  "Assistant Manager Finance",
  "Videographer",
  "Support Engineer",
  "Software Architect",
  "AM People & Culture",
  "Sales Manager - SaaS Segment",
  "Digital Marketing Specialist",
  "Associate Product Manager (APM)",
  "Sr. Web Engineer (PHP/NodeJS)",
];

interface JobListingProps {
  onJobSelect: (jobId: string, jobTitle: string) => void;
  onProfileClick?: () => void;
}

const JobListing = ({ onJobSelect, onProfileClick }: JobListingProps) => {
  const {
    gettingAllVacanciesList,
    allVacanciesList,
    get_job_by_idfn,
    job_details,
  } = useVacancy();
  useEffect(() => {
    gettingAllVacanciesList();
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={onProfileClick} />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start lg:items-center">
          {/* Left Side - Job Listings */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient glow-text">
                Available Vacancies at Veevo Tech Official
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                In case of any issues, please email us at{" "}
                <a
                  href="mailto:HR@veovotech.com"
                  className="text-primary hover:text-primary-glow transition-colors"
                >
                  HR@veovotech.com
                </a>
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto">
              {allVacanciesList?.vacancies?.map((job, index) => (
                <JobCard
                  key={job.id}
                  title={job.title}
                  onClick={() => onJobSelect(job.id, job.title)}
                  get_job_by_idfn
                  delay={index * 100}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="relative animate-float order-first lg:order-last">
            <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl aspect-square lg:aspect-auto lg:h-[500px]">
              <img
                src={heroImage}
                alt="Futuristic hiring illustration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
            </div>

            {/* Floating Elements - Hidden on mobile */}
            <div className="hidden sm:block absolute -top-4 -right-4 w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-accent to-secondary animate-glow-pulse opacity-60" />
            <div className="hidden sm:block absolute -bottom-6 -left-6 w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-primary to-accent animate-glow-pulse opacity-40" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobListing;
