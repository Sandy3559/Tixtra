// frontend/src/components/solution-form.jsx
import { useState } from "react";
import { 
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CodeBracketIcon,
  LinkIcon,
  TagIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default function SolutionForm({ 
  ticket, 
  onSubmit, 
  onCancel, 
  loading = false 
}) {
  const [form, setForm] = useState({
    solution: "",
    stepByStepGuide: [],
    additionalResources: [],
    tags: "",
    difficulty: "medium",
    moderatorNotes: "",
    followUpRequired: false,
    followUpNotes: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const addStep = () => {
    setForm({
      ...form,
      stepByStepGuide: [
        ...form.stepByStepGuide,
        {
          stepNumber: form.stepByStepGuide.length + 1,
          description: "",
          codeExample: "",
          notes: ""
        }
      ]
    });
  };

  const removeStep = (index) => {
    const newSteps = form.stepByStepGuide.filter((_, i) => i !== index);
    // Renumber steps
    const renumberedSteps = newSteps.map((step, i) => ({
      ...step,
      stepNumber: i + 1
    }));
    setForm({
      ...form,
      stepByStepGuide: renumberedSteps
    });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...form.stepByStepGuide];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setForm({
      ...form,
      stepByStepGuide: newSteps
    });
  };

  const addResource = () => {
    setForm({
      ...form,
      additionalResources: [
        ...form.additionalResources,
        { title: "", url: "", description: "" }
      ]
    });
  };

  const removeResource = (index) => {
    setForm({
      ...form,
      additionalResources: form.additionalResources.filter((_, i) => i !== index)
    });
  };

  const updateResource = (index, field, value) => {
    const newResources = [...form.additionalResources];
    newResources[index] = { ...newResources[index], [field]: value };
    setForm({
      ...form,
      additionalResources: newResources
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.solution.trim()) {
      newErrors.solution = "Solution description is required";
    } else if (form.solution.trim().length < 10) {
      newErrors.solution = "Solution must be at least 10 characters";
    }

    if (form.stepByStepGuide.length === 0) {
      newErrors.stepByStepGuide = "At least one step is required";
    } else {
      const invalidSteps = form.stepByStepGuide.some(step => !step.description.trim());
      if (invalidSteps) {
        newErrors.stepByStepGuide = "All steps must have descriptions";
      }
    }

    if (form.followUpRequired && !form.followUpNotes.trim()) {
      newErrors.followUpNotes = "Follow-up notes are required when follow-up is needed";
    }

    // Validate resource URLs
    form.additionalResources.forEach((resource, index) => {
      if (resource.title && resource.url) {
        try {
          new URL(resource.url);
        } catch {
          newErrors[`resource_${index}`] = "Invalid URL format";
        }
      } else if (resource.title && !resource.url) {
        newErrors[`resource_${index}`] = "URL is required when title is provided";
      } else if (!resource.title && resource.url) {
        newErrors[`resource_${index}`] = "Title is required when URL is provided";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = {
      ...form,
      ticketId: ticket._id,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      additionalResources: form.additionalResources.filter(
        resource => resource.title.trim() && resource.url.trim()
      )
    };

    onSubmit(submitData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Solution</h1>
        <p className="text-base-content/70">
          Provide a comprehensive solution for: <strong>{ticket.title}</strong>
        </p>
      </div>

      {/* Ticket Summary Card */}
      <div className="card bg-base-100 shadow-sm border border-base-200 mb-6">
        <div className="card-body p-4">
          <h3 className="font-semibold mb-2">Ticket Details</h3>
          <p className="text-sm text-base-content/80 mb-2">{ticket.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`badge badge-${ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'success'} badge-sm`}>
              {ticket.priority} priority
            </span>
            {ticket.relatedSkills?.map((skill, index) => (
              <span key={index} className="badge badge-outline badge-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Solution */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <CheckCircleIcon className="w-5 h-5 text-success" />
              Solution Description *
            </h3>
            
            <div className="form-control">
              <textarea
                name="solution"
                value={form.solution}
                onChange={handleChange}
                placeholder="Provide a clear, comprehensive solution to the user's problem..."
                className={`textarea textarea-bordered h-32 ${errors.solution ? 'textarea-error' : ''}`}
                required
              />
              {errors.solution && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.solution}</span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt">
                  {form.solution.length}/5000 characters
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-lg">
                <InformationCircleIcon className="w-5 h-5 text-info" />
                Step-by-Step Guide *
              </h3>
              <button
                type="button"
                onClick={addStep}
                className="btn btn-primary btn-sm gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Step
              </button>
            </div>

            {errors.stepByStepGuide && (
              <div className="alert alert-error mb-4">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>{errors.stepByStepGuide}</span>
              </div>
            )}

            <div className="space-y-4">
              {form.stepByStepGuide.map((step, index) => (
                <div key={index} className="border border-base-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Step {step.stepNumber}</h4>
                    {form.stepByStepGuide.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="btn btn-ghost btn-sm text-error"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Description *</span>
                      </label>
                      <textarea
                        value={step.description}
                        onChange={(e) => updateStep(index, 'description', e.target.value)}
                        placeholder="Describe what the user needs to do in this step..."
                        className="textarea textarea-bordered"
                        rows="2"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Code Example (Optional)</span>
                      </label>
                      <textarea
                        value={step.codeExample}
                        onChange={(e) => updateStep(index, 'codeExample', e.target.value)}
                        placeholder="// Add code example if applicable..."
                        className="textarea textarea-bordered font-mono text-sm"
                        rows="3"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Additional Notes</span>
                      </label>
                      <input
                        type="text"
                        value={step.notes}
                        onChange={(e) => updateStep(index, 'notes', e.target.value)}
                        placeholder="Any additional notes or warnings..."
                        className="input input-bordered"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {form.stepByStepGuide.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-base-300 rounded-lg">
                  <InformationCircleIcon className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                  <p className="text-base-content/60 mb-3">No steps added yet</p>
                  <button
                    type="button"
                    onClick={addStep}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add First Step
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-lg">
                <LinkIcon className="w-5 h-5 text-secondary" />
                Additional Resources
              </h3>
              <button
                type="button"
                onClick={addResource}
                className="btn btn-secondary btn-sm gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Resource
              </button>
            </div>

            <div className="space-y-4">
              {form.additionalResources.map((resource, index) => (
                <div key={index} className="border border-base-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Resource {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Title</span>
                      </label>
                      <input
                        type="text"
                        value={resource.title}
                        onChange={(e) => updateResource(index, 'title', e.target.value)}
                        placeholder="Resource title..."
                        className="input input-bordered"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">URL</span>
                      </label>
                      <input
                        type="url"
                        value={resource.url}
                        onChange={(e) => updateResource(index, 'url', e.target.value)}
                        placeholder="https://example.com"
                        className={`input input-bordered ${errors[`resource_${index}`] ? 'input-error' : ''}`}
                      />
                      {errors[`resource_${index}`] && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors[`resource_${index}`]}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control md:col-span-2">
                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <input
                        type="text"
                        value={resource.description}
                        onChange={(e) => updateResource(index, 'description', e.target.value)}
                        placeholder="Brief description of this resource..."
                        className="input input-bordered"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {form.additionalResources.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-base-300 rounded-lg">
                  <LinkIcon className="w-10 h-10 mx-auto text-base-content/30 mb-2" />
                  <p className="text-base-content/60 text-sm">
                    Add helpful links, documentation, or references
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Solution Metadata */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <TagIcon className="w-5 h-5 text-accent" />
              Solution Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Difficulty Level</span>
                </label>
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  className="select select-bordered"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags (comma-separated)</span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="bug-fix, authentication, database..."
                  className="input input-bordered"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Moderator Notes</span>
                </label>
                <textarea
                  name="moderatorNotes"
                  value={form.moderatorNotes}
                  onChange={handleChange}
                  placeholder="Internal notes about this solution (not visible to user)..."
                  className="textarea textarea-bordered"
                  rows="3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up Options */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title text-lg mb-4">
              <ClockIcon className="w-5 h-5 text-warning" />
              Follow-up Options
            </h3>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  name="followUpRequired"
                  checked={form.followUpRequired}
                  onChange={handleChange}
                  className="checkbox checkbox-warning"
                />
                <div>
                  <span className="label-text font-medium">Follow-up Required</span>
                  <div className="label-text-alt text-base-content/60">
                    Check if this solution may need follow-up or verification
                  </div>
                </div>
              </label>
            </div>

            {form.followUpRequired && (
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Follow-up Notes *</span>
                </label>
                <textarea
                  name="followUpNotes"
                  value={form.followUpNotes}
                  onChange={handleChange}
                  placeholder="Describe what kind of follow-up might be needed..."
                  className={`textarea textarea-bordered ${errors.followUpNotes ? 'textarea-error' : ''}`}
                  rows="3"
                />
                {errors.followUpNotes && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.followUpNotes}</span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost gap-2"
            disabled={loading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn btn-success gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Submitting Solution...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Submit Solution
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="alert alert-info">
          <InformationCircleIcon className="w-5 h-5" />
          <div>
            <h4 className="font-semibold">Tips for Great Solutions</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Be clear and specific in your instructions</li>
              <li>• Include code examples when applicable</li>
              <li>• Test your solution before submitting</li>
              <li>• Consider different skill levels of users</li>
              <li>• Add helpful resources for further reading</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}