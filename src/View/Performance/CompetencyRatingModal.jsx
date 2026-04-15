import React, { useState, useEffect } from "react";
import { Typography, Button, IconButton } from "@material-tailwind/react";
import { FaStar } from "react-icons/fa";
import performanceApi from "../../Model/Data/Performance/Performance";
import { showToast } from "../../Components/Toaster/Toaster";

const CompetencyRatingModal = ({ open, onClose, competency, onRatingUpdate }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && competency) {
      setRating(competency.rating || 0);
    }
  }, [open, competency]);

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async () => {
    if (!rating || rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }

    if (!competency || !competency._id) {
      showToast("Competency information is missing", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const ratingData = {
        rating: rating,
        competency_id: competency._id
      };

      const response = await performanceApi.addRatingCompetency(ratingData);

      if (response.status === 200 && response.data.STATUS === "SUCCESSFUL") {
        showToast("Competency rating updated successfully", "success");

        // Call the parent callback
        if (onRatingUpdate) {
          onRatingUpdate({
            ...ratingData,
            competencyId: competency._id,
            timestamp: new Date().toISOString(),
          });
        }

        // Close modal
        onClose();
      } else {
        showToast(
          response.data?.ERROR_DESCRIPTION || "Failed to update competency rating",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating competency rating:", error);
      showToast("Failed to update competency rating. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => handleStarClick(star)}
        onMouseEnter={() => handleStarHover(star)}
        onMouseLeave={handleStarLeave}
        className="text-2xl transition-colors duration-200 focus:outline-none"
      >
        <FaStar
          className={`${
            star <= (hoverRating || rating)
              ? "text-yellow-400 fill-current"
              : "text-gray-300"
          } hover:text-yellow-400`}
        />
      </button>
    ));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white shadow-xl w-[400px] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Typography variant="h6" color="blue-gray" className="font-semibold">
            Rate Competency
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
              {competency?.name || competency?.competency || "Competency"}
            </Typography>
          </div>

          <div className="flex flex-col items-center gap-4 mb-6">
            <Typography variant="small" color="blue-gray" className="font-medium">
              Select Rating
            </Typography>
            <div className="flex items-center gap-2">
              {renderStars()}
            </div>
            {rating > 0 && (
              <Typography variant="small" color="blue-gray" className="text-center">
                You selected {rating} {rating === 1 ? 'star' : 'stars'}
              </Typography>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outlined"
              color="gray"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="px-4 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetencyRatingModal;

