import React, { useState, useEffect } from "react";
import { formatTimestamp } from "../Branches/utils";

const statusConfig = {
  0: { label: "Rejected",    cls: "bg-red-50 text-red-600 border border-red-200" },
  1: { label: "Shortlisted", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  2: { label: "Interviewed", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  3: { label: "Accepted",    cls: "bg-green-50 text-green-700 border border-green-200" },
  4: { label: "Pending",     cls: "bg-gray-100 text-gray-600 border border-gray-200" },
  5: { label: "Starred",     cls: "bg-purple-50 text-purple-700 border border-purple-200" },
};

const InfoRow = ({ label, children }) => (
  <div className="flex items-start gap-2">
    <span className="font-semibold text-[#3da5f4] text-[12px] font-Urbanist whitespace-nowrap min-w-[120px]">
      {label}
    </span>
    <span className="text-gray-700 text-[12px] font-Urbanist">{children}</span>
  </div>
);

const ApplicationInfo = ({ viewPending }) => {
  const [candidateData, setCandidateData] = useState(null);

  useEffect(() => {
    if (viewPending?.candidate) {
      setCandidateData(viewPending.candidate);
    } else if (viewPending?.id) {
      setCandidateData(viewPending);
    }
  }, [viewPending]);

  if (!candidateData) {
    return (
      <div className="p-6 text-center text-gray-400 text-[13px] font-Urbanist">
        No candidate data available
      </div>
    );
  }

  const status = viewPending?.status;
  const statusInfo = statusConfig[status] ?? { label: "Unknown", cls: "bg-gray-100 text-gray-500 border border-gray-200" };

  const questionnaire = viewPending?.vacancy?.questionnaire ?? [];
  const answers = viewPending?.answers ?? [];

  return (
    <div className="p-5 space-y-4">

      {/* Application overview card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Left column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#3da5f4] text-[12px] font-Urbanist whitespace-nowrap min-w-[120px]">
                Application status:
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-Urbanist capitalize ${statusInfo.cls}`}
              >
                {statusInfo.label}
              </span>
            </div>

            <InfoRow label="Apply Date:">
              {formatTimestamp(viewPending?.timestamp) || "N/A"}
            </InfoRow>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <InfoRow label="Apply for:">
              {viewPending?.vacancy?.title || "N/A"}
            </InfoRow>
          </div>

        </div>
      </div>

      {/* Questionnaire card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-[13px] font-bold text-gray-800 font-Urbanist mb-4 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#3da5f4] inline-block" />
          Questionnaire
        </h3>

        {questionnaire.length > 0 ? (
          <div className="space-y-4">
            {questionnaire.map((question, index) => {
              const correspondingAnswer = answers.find(
                (a) => a.question_id === question.id
              );
              return (
                <div
                  key={question.id}
                  className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="mb-1.5">
                    <span className="font-semibold text-[#3da5f4] text-[11px] font-Urbanist">
                      Q{index + 1}:&nbsp;
                    </span>
                    <span className="text-gray-700 text-[12px] font-Urbanist">
                      {question.question || "N/A"}
                    </span>
                  </div>
                  <div className="pl-5">
                    <span className="font-semibold text-gray-500 text-[11px] font-Urbanist">
                      Answer:&nbsp;
                    </span>
                    <span className="text-gray-600 text-[12px] font-Urbanist">
                      {correspondingAnswer?.answer || "No answer provided"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400 text-[12px] font-Urbanist">
            No questionnaire available for this application
          </div>
        )}
      </div>

    </div>
  );
};

export default ApplicationInfo;
