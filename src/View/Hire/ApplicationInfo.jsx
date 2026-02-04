import React, { useState, useEffect } from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";

import { formatTimestamp } from "../Branches/utils";

const ApplicationInfo = (props) => {
  const { viewPending } = props;
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewPending && viewPending.candidate) {
      setCandidateData(viewPending.candidate);
    } else if (viewPending && viewPending.id) {
      // If the API returns the candidate data directly (not nested under candidate)
      setCandidateData(viewPending);
    }
  }, [viewPending]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Helper function to get gender text
  const getGenderText = (genderCode) => {
    return genderCode === 1 ? "Male" : genderCode === 2 ? "Female" : "Other";
  };

  // Helper function to get marital status
  const getMaritalStatus = (status) => {
    if (!status) return "N/A";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="p-[18px] flex justify-center">
        <Typography variant="h6" color="blue-gray">
          Loading candidate information...
        </Typography>
      </div>
    );
  }

  if (!candidateData) {
    return (
      <div className="p-[18px]">
        <Typography variant="h6" color="red">
          No candidate data available
        </Typography>
      </div>
    );
  }



  /////console.log('what is the result here', viewPending)



    
  return (
    <>
      <div className="p-[18px] space-y-6">
        <Card className="shadow-sm">
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#3da5f4] min-w-[120px]">
                    Application status:
                  </span>
                  {/* status 0 = rejected, 1 = short listed, 2 = interviewed, 3 = accepted, 4 = pending, 5 = starred	 */}
                  <span className="text-gray-700">
                    {{
                      0: "rejected",
                      1: "short listed",
                      2: "interviewed",
                      3: "accepted",
                      4: "pending",
                      5: "starred",
                    }[viewPending.status] || "undefined"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#3da5f4] min-w-[120px]">
                    Apply Date:
                  </span>
                  <span className="text-gray-700">
                    {formatTimestamp(viewPending.timestamp)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-[#3da5f4] min-w-[20px]">
                    Apply for:
                  </span>
                  <span className="text-gray-700">
                    {viewPending?.vacancy?.title || "N/A"}
            </span>
          </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="shadow-sm">
          <CardBody className="p-4">
            <Typography
              variant="h6"
              color="blue-gray"
              className="mb-4 flex items-center gap-2"
            >
              Questionnaire
            </Typography>

            <div className="space-y-4">
              {viewPending?.vacancy?.questionnaire?.map((question, index) => {
                // Find the corresponding answer for this question
                const correspondingAnswer = viewPending?.answers?.find(
                  answer => answer.question_id === question.id
                );
                
                return (
                  <div key={question.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="mb-2">
                      <span className="font-semibold text-[#3da5f4] text-sm">
                        Question {index + 1}:
                      </span>
                      <span className="text-gray-700 ml-2">
                        {question.question || "N/A"}
            </span>
          </div>
          <div>
                      <span className="font-semibold text-[#3da5f4] text-sm">
                        Answer:
                      </span>
                      <span className="text-gray-700 ml-2">
                        {correspondingAnswer?.answer || "No answer provided"}
                      </span>
          </div>
        </div>
                );
              })}
              
              {(!viewPending?.vacancy?.questionnaire || viewPending?.vacancy?.questionnaire.length === 0) && (
                <div className="text-gray-500 text-center py-4">
                  No questionnaire available for this application
                </div>
              )}
        </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default ApplicationInfo;
