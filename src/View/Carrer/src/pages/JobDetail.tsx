import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Briefcase,
  MapPin,
  GraduationCap,
  Clock,
  FileText,
} from "lucide-react";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import JobApplicationModal from "../components/JobApplicationModal";
import { useAuth } from "../contexts/AuthContext";
import useVacancy from "../viewModel/VacancyViewModel/VacancyService";

interface JobDetailProps {
  jobTitle: string;
  onBackClick: () => void;
  data: object;
  vacancyId: string;
}

const JobDetail = ({ jobTitle, onBackClick, data, vacancyId }: JobDetailProps) => {
  let job_data = data?.DB_DATA;

  // console.log("datadatata", job_data);
  const { isAuthenticated } = useAuth();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  
  const { get_apply_data, apply_data } = useVacancy();

  // Handle apply button click
  const handleApplyClick = async () => {
    if (isAuthenticated) {
      try {
        await get_apply_data(vacancyId);
        setShowApplicationModal(true);
      } catch (error) {
        console.error('Error fetching apply data:', error);
      }
    } else {
      setShowLoginMessage(true);
    }
  };

  // console.log(
  //   "job_data?.location",
  //   job_data?.locations.map((data) => {
  //     console.log(data?.city?.city_name);
  //   })
  // );

  const infoCards = [
    {
      icon: Users,
      label: "Gender",
      value: job_data?.req_gender == 1 ? "Male" : "Female",
      color: "text-primary",
    },
    {
      icon: Clock,
      label: "Age Limit",
      value: `${job_data?.age_from} -${job_data?.age_upto}`,
      color: "text-secondary",
    },
    {
      icon: Briefcase,
      label: "Job Type",
      value: job_data?.vacancy_type == 0 ? "Office job" : "Remote job",
      color: "text-accent",
    },
    {
      icon: Users,
      label: "Total Seats",
      value: job_data?.total_seats,
      color: "text-primary",
    },
    {
      icon: Calendar,
      label: "Deadline Date",
      value: job_data?.end_date,
      color: "text-secondary",
    },
    {
      icon: Clock,
      label: "Experience",
      value: job_data?.req_experience,
      color: "text-accent",
    },
    {
      icon: MapPin,
      label: "Location",
      value: job_data?.locations?.map((data) => {
        return data?.city?.city_name;
      }),
      color: "text-primary",
    },
    {
      icon: GraduationCap,
      label: "Required Education",
      value: job_data?.min_qualification,
      color: "text-secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton onBackClick={onBackClick} />

      {/* Login Message Modal */}
      {showLoginMessage && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowLoginMessage(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-card border border-border rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 animate-slide-down">
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              {/* Message */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Login Required
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please login first to apply for this position.
                </p>
              </div>
              
              {/* OK Button */}
              <Button
                onClick={() => setShowLoginMessage(false)}
                className="neon-button w-full"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Job Title Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-5xl font-bold text-gradient glow-text">
              {jobTitle}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
          </div>

          {/* Job Info Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {infoCards.map((card, index) => (
              <div
                key={card.label}
                className="cyber-card p-6 text-center space-y-3 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`inline-flex p-3 rounded-full bg-card border border-border ${card.color}`}
                >
                  <card.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {card.label}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Job Description */}
          <div
            className="cyber-card p-8 space-y-6 animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Description
              </h2>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="text-muted-foreground leading-relaxed space-y-4">
                {job_data?.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-sm leading-7">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div
            className="text-center animate-fade-in"
            style={{ animationDelay: "600ms" }}
          >
            <Button
              className="neon-button text-lg px-12 py-4"
              onClick={handleApplyClick}
            >
              {isAuthenticated ? "Apply Now" : "Login to Apply"}
            </Button>
          </div>

          {/* Job Application Modal */}
          <JobApplicationModal
            isOpen={showApplicationModal}
            onClose={() => setShowApplicationModal(false)}
            jobTitle={jobTitle}
            vacancyId={vacancyId}
            applyData={apply_data}
          />
        </div>
      </main>
    </div>
  );
};

export default JobDetail;
