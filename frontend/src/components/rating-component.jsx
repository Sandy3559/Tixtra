// frontend/src/components/rating-component.jsx
import { useState } from "react";
import { 
  StarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

export default function RatingComponent({ 
  solution, 
  ticket,
  onSubmit, 
  onCancel, 
  loading = false,
  existingRating = null 
}) {
  const [form, setForm] = useState({
    rating: existingRating?.rating || 0,
    feedback: existingRating?.feedback || "",
    categories: {
      clarity: existingRating?.categories?.clarity || 0,
      helpfulness: existingRating?.categories?.helpfulness || 0,
      completeness: existingRating?.categories?.completeness || 0,
      timeliness: existingRating?.categories?.timeliness || 0,
    },
    wouldRecommend: existingRating?.wouldRecommend || false,
    improvementSuggestions: existingRating?.improvementSuggestions || "",
    isAnonymous: existingRating?.isAnonymous || false,
    wasHelpful: existingRating?.wasHelpful !== undefined ? existingRating.wasHelpful : null,
    issueResolved: existingRating?.issueResolved !== undefined ? existingRating.issueResolved : null,
    additionalHelpNeeded: existingRating?.additionalHelpNeeded || false,
    additionalHelpDescription: existingRating?.additionalHelpDescription || ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleCategoryChange = (category, value) => {
    setForm({
      ...form,
      categories: {
        ...form.categories,
        [category]: value
      }
    });
  };

  const handleStarClick = (rating) => {
    setForm({ ...form, rating });
  };

  const handleBooleanChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (form.rating === 0) {
      newErrors.rating = "Please provide an overall rating";
    }

    if (Object.values(form.categories).some(rating => rating === 0)) {
      newErrors.categories = "Please rate all categories";
    }

    if (form.wasHelpful === null) {
      newErrors.wasHelpful = "Please indicate if the solution was helpful";
    }

    if (form.issueResolved === null) {
      newErrors.issueResolved = "Please indicate if your issue was resolved";
    }

    if (form.additionalHelpNeeded && !form.additionalHelpDescription.trim()) {
      newErrors.additionalHelpDescription = "Please describe what additional help you need";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit(form);
  };

  const getRatingText = (rating) => {
    const texts = {
      1: "Very Poor",
      2: "Poor", 
      3: "Fair",
      4: "Good",
      5: "Excellent"
    };
    return texts[rating] || "Not Rated";
  };

  const getRatingColor = (rating) => {
    if (rating <= 2) return "text-error";
    if (rating === 3) return "text-warning";
    return "text-success";
  };

  const StarRating = ({ rating, onRatingChange, size = "w-8 h-8" }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="hover:scale-110 transition-transform"
        >
          {star <= rating ? (
            <StarSolidIcon className={`${size} text-yellow-400`} />
          ) : (
            <StarIcon className={`${size} text-gray-300 hover:text-yellow-400`} />
          )}
        </button>
      ))}
    </div>
  );

  // If rating already exists, show read-only view
  if (existingRating && !loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-xl mb-6">Your Rating</h3>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <StarRating rating={existingRating.rating} onRatingChange={() => {}} />
                </div>
                <p className={`text-lg font-semibold ${getRatingColor(existingRating.rating)}`}>
                  {getRatingText(existingRating.rating)}
                </p>
              </div>

              {existingRating.feedback && (
                <div>
                  <h4 className="font-semibold mb-2">Your Feedback</h4>
                  <p className="text-base-content/80">{existingRating.feedback}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-base-content/60">Was Helpful?</p>
                  <div className={`text-lg ${existingRating.wasHelpful ? 'text-success' : 'text-error'}`}>
                    {existingRating.wasHelpful ? (
                      <HandThumbUpIcon className="w-6 h-6 mx-auto" />
                    ) : (
                      <HandThumbDownIcon className="w-6 h-6 mx-auto" />
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-base-content/60">Issue Resolved?</p>
                  <div className={`text-lg ${existingRating.issueResolved ? 'text-success' : 'text-error'}`}>
                    {existingRating.issueResolved ? (
                      <CheckCircleIcon className="w-6 h-6 mx-auto" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 mx-auto" />
                    )}
                  </div>
                </div>
              </div>

              <div className="alert alert-success">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Thank you for your feedback! It helps improve our service.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rate This Solution</h1>
        <p className="text-base-content/70">
          Your feedback helps us improve and helps other users find quality solutions
        </p>
      </div>

      {/* Solution Summary */}
      <div className="card bg-base-100 shadow-sm border border-base-200 mb-6">
        <div className="card-body p-4">
          <h3 className="font-semibold mb-2">Solution by {solution.moderatorId.email}</h3>
          <p className="text-sm text-base-content/80 line-clamp-3">{solution.solution}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge badge-outline badge-sm">{solution.difficulty}</span>
            <span className="text-xs text-base-content/60">
              Submitted {new Date(solution.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Overall Rating *</h3>
            
            <div className="text-center">
              <StarRating 
                rating={form.rating} 
                onRatingChange={handleStarClick}
                size="w-12 h-12"
              />
              <p className={`mt-2 text-lg font-medium ${getRatingColor(form.rating)}`}>
                {getRatingText(form.rating)}
              </p>
              {errors.rating && (
                <p className="text-error text-sm mt-2">{errors.rating}</p>
              )}
            </div>
          </div>
        </div>

        {/* Category Ratings */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Detailed Ratings *</h3>
            
            {errors.categories && (
              <div className="alert alert-error mb-4">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>{errors.categories}</span>
              </div>
            )}

            <div className="space-y-4">
              {Object.entries({
                clarity: "How clear and easy to understand was the solution?",
                helpfulness: "How helpful was this solution for your problem?",
                completeness: "How complete and thorough was the solution?",
                timeliness: "How satisfied are you with the response time?"
              }).map(([category, description]) => (
                <div key={category} className="border-b border-base-200 pb-4 last:border-b-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">{category}</h4>
                      <p className="text-sm text-base-content/60">{description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating 
                        rating={form.categories[category]} 
                        onRatingChange={(rating) => handleCategoryChange(category, rating)}
                      />
                      <span className="text-sm text-base-content/60 min-w-[60px]">
                        {getRatingText(form.categories[category])}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Assessment */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">Quick Assessment *</h3>

            <div className="space-y-4">
              {/* Was Helpful */}
              <div>
                <p className="font-medium mb-2">Was this solution helpful? *</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wasHelpful"
                      checked={form.wasHelpful === true}
                      onChange={() => handleBooleanChange('wasHelpful', true)}
                      className="radio radio-success"
                    />
                    <HandThumbUpIcon className="w-5 h-5 text-success" />
                    <span>Yes, it helped</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="wasHelpful"
                      checked={form.wasHelpful === false}
                      onChange={() => handleBooleanChange('wasHelpful', false)}
                      className="radio radio-error"
                    />
                    <HandThumbDownIcon className="w-5 h-5 text-error" />
                    <span>No, it didn't help</span>
                  </label>
                </div>
                {errors.wasHelpful && (
                  <p className="text-error text-sm mt-1">{errors.wasHelpful}</p>
                )}
              </div>

              {/* Issue Resolved */}
              <div>
                <p className="font-medium mb-2">Did this solution resolve your issue? *</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="issueResolved"
                      checked={form.issueResolved === true}
                      onChange={() => handleBooleanChange('issueResolved', true)}
                      className="radio radio-success"
                    />
                    <CheckCircleIcon className="w-5 h-5 text-success" />
                    <span>Yes, completely resolved</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="issueResolved"
                      checked={form.issueResolved === false}
                      onChange={() => handleBooleanChange('issueResolved', false)}
                      className="radio radio-error"
                    />
                    <XCircleIcon className="w-5 h-5 text-error" />
                    <span>No, still having issues</span>
                  </label>
                </div>
                {errors.issueResolved && (
                  <p className="text-error text-sm mt-1">{errors.issueResolved}</p>
                )}
              </div>

              {/* Would Recommend */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    name="wouldRecommend"
                    checked={form.wouldRecommend}
                    onChange={handleChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">I would recommend this solution to others</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              Your Feedback
            </h3>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">General Comments</span>
                </label>
                <textarea
                  name="feedback"
                  value={form.feedback}
                  onChange={handleChange}
                  placeholder="Share your thoughts about this solution..."
                  className="textarea textarea-bordered h-24"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Suggestions for Improvement</span>
                </label>
                <textarea
                  name="improvementSuggestions"
                  value={form.improvementSuggestions}
                  onChange={handleChange}
                  placeholder="How could this solution be improved?"
                  className="textarea textarea-bordered h-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <LightBulbIcon className="w-5 h-5" />
              Need Additional Help?
            </h3>

            <div className="form-control mb-4">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="additionalHelpNeeded"
                  checked={form.additionalHelpNeeded}
                  onChange={handleChange}
                  className="checkbox checkbox-warning"
                />
                <span className="label-text">I need additional help with this issue</span>
              </label>
            </div>

            {form.additionalHelpNeeded && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">What additional help do you need? *</span>
                </label>
                <textarea
                  name="additionalHelpDescription"
                  value={form.additionalHelpDescription}
                  onChange={handleChange}
                  placeholder="Describe what additional help you need..."
                  className={`textarea textarea-bordered ${errors.additionalHelpDescription ? 'textarea-error' : ''}`}
                  rows="3"
                />
                {errors.additionalHelpDescription && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.additionalHelpDescription}</span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Privacy Option */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={form.isAnonymous}
                  onChange={handleChange}
                  className="checkbox"
                />
                <div>
                  <span className="label-text">Submit this rating anonymously</span>
                  <div className="label-text-alt text-base-content/60">
                    Your identity will not be shared with the moderator
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-primary gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Submitting Rating...
              </>
            ) : (
              <>
                <StarIcon className="w-5 h-5" />
                Submit Rating
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}