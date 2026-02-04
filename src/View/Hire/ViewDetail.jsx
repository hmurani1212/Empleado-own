import React, { useEffect } from "react";
import PersonalInfo from "./PersonalInfo";
import ApplicationInfo from "./ApplicationInfo";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import EducationalInfo from "./EducationalInfo";
import ExperienceInfo from "./ExperienceInfo";
import ApplicationReview from "./ApplicationReview";
import InterviewScore from "./InterviewScore";
import ApplyHistory from "./ApplyHistory";
import CustomDetailCard from "../../Components/CustomDetailCard/CustomDetailCard";

const ViewDetail = (props) => {
  // console.log("propsprops", props);
  const { name, number, cvLink, emailId, image } = props;



  const { handleClose, viewPending, gettingViewPending } = useHire();

  // Removed getViewDataPending call from useEffect to prevent duplicate API calls
  // Data is already fetched in handleNavigateView function
  //console.log("ViewDetail viewPending:", viewPending);
  useEffect(() =>{
    gettingViewPending()
  }, [])
  const steps = [
    {
      id: "ApplicationInfo",
      title: "Application Info",
      component: <ApplicationInfo viewPending={viewPending} />,
    },
    {
      id: "PersonalInfo",
      title: "Personal Info",
      component: <PersonalInfo viewPending={viewPending} />,
    },
    {
      id: "EducationInfo",
      title: "Education Info",
      component: <EducationalInfo />,
    },
    {
      id: "ExperienceInfo",
      title: "Experience Info",
      component: <ExperienceInfo />,
    },
    {
      id: "ApplicationReview",
      title: "Application Review",
      component: <ApplicationReview viewPending={viewPending} />,
    },
    {
      id: "InterviewScore",
      title: "Interview Score",
      component: <InterviewScore />,
    },
    {
      id: "ApplyHistory",
      title: "Apply History",
      component: <ApplyHistory viewPending={viewPending} />,
    },
  ];

  // Tooba
  // Shortlist, Reject, Talent Pool in Application Detail of Candidates
  const actions = [
    { label: "Shortlist", onClick: () => console.log("Shortlist") },
    { label: "Reject", onClick: () => console.log("Reject") },
    { label: "Talent Pool", onClick: () => console.log("Talent Pool") },
  ];

  // Extract candidate data from the new API response structure
  const candidateData = viewPending?.candidate || {};
  
  return (
    <CustomDetailCard
      name={candidateData.name || "N/A"}
      number={candidateData.cellnum || "N/A"}
      cvLink={candidateData.cv_file_path || candidateData.cv_name || "#"}
      emailId={candidateData.email || "N/A"}
      image={candidateData.photo || ""}
      handleClose={handleClose}
      viewPending={viewPending}
      steps={steps}
      buttonText={"shortlist"}
      actions={actions}
    />
  );
};

export default ViewDetail;
