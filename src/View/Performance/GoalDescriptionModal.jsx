import React from "react";
import { Typography, IconButton, Button } from "@material-tailwind/react";

const GoalDescriptionModal = ({ open, onClose, goal }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white shadow-xl w-[500px] max-w-[90vw] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Typography variant="h6" color="blue-gray" className="font-semibold">
            Goal Description
          </Typography>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <Typography variant="small" color="blue-gray" className="font-medium mb-2">
              {goal?.name || "Goal"}
            </Typography>
          </div>

          <div className="mb-6">
            <Typography variant="small" color="blue-gray" className="font-medium mb-2">
              Description:
            </Typography>
            <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <Typography variant="small" color="blue-gray" className="text-sm leading-relaxed whitespace-pre-wrap">
                {goal?.descriptions || goal?.description || "No description available"}
              </Typography>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outlined"
              color="gray"
              onClick={onClose}
              className="px-4"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDescriptionModal;
