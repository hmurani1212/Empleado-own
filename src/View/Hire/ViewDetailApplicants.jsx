import React, { useEffect } from "react";
import ViewDetail from "./ViewDetail";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import { useParams } from "react-router-dom";

const ViewDetailApplicants = () => {
  const { viewPending, gettingViewPending } = useHire();
  const params = useParams();
  
  // Get app ID from URL params
  const appIdFromParams = params.id;
  
  // Extract candidate data from the new API response structure
  const candidateData = viewPending?.candidate || {};
  
  // Call gettingViewPending with the app ID from params when component mounts (for page reload)
  useEffect(() => {
    if (appIdFromParams && !viewPending?.candidate) {
      // Only call API if we have params ID and no existing data (page reload scenario)
      gettingViewPending(null, null, appIdFromParams);
    }
  }, [appIdFromParams, gettingViewPending, viewPending?.candidate]);
  
  return (
    <div>
      <ViewDetail
        // image={candidateData.photo || ""}
        // name={candidateData.name || "N/A"}
        // number={candidateData.cellnum || "N/A"}
        // emailId={candidateData.email || "N/A"}
        // cvLink={candidateData.cv_file_path || candidateData.cv_name || "#"}
        // dob={candidateData.dob || "N/A"}
        // applyDate={viewPending?.applied_history?.map(item => item.timestamp)}
        // appliedFor = {viewPending?.applied_history?.map(item => item.title)}
      />
    </div>
  );
};

export default ViewDetailApplicants;
