import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeftIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function ModeratorTicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user.role !== "moderator" && user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchTicket();
  }, [id, user.role, navigate]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);
      } else {
        alert(data.message || "Failed to fetch ticket");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (newStatus) => {
    setUpdateLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        setTicket({ ...ticket, status: newStatus });
      } else {
        alert("Failed to update ticket status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "TODO":
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
      case "IN_PROGRESS":
        return <ArrowPathIcon className="w-5 h-5 text-blue-500" />;
      case "COMPLETED":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "TODO":
        return "badge-warning";
      case "IN_PROGRESS":
        return "badge-info";
      case "COMPLETED":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case "medium":
        return <BoltIcon className="w-5 h-5 text-yellow-500" />;
      case "low":
        return <ArrowPathIcon className="w-5 h-5 text-green-500" />;
      default:
        return <BoltIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "badge-error";
      case "medium":
        return "badge-warning";
      case "low":
        return "badge-success";
      default:
        return "badge-ghost";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-lg">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-error mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ticket not found</h2>
          <p className="text-base-content/70 mb-6">
            The ticket you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <button
            onClick={() => navigate("/moderator-dashboard")}
            className="btn btn-primary gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/moderator-dashboard")}
            className="btn btn-ghost gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(ticket.status)}
              <h1 className="text-2xl sm:text-3xl font-bold">{ticket.title}</h1>
            </div>
            <p className="text-base-content/70">Ticket ID: {ticket._id}</p>
          </div>
          {ticket.status !== "COMPLETED" && (
            <Link
              to={`/moderator/tickets/${id}/solution`}
              className="btn btn-success gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Solution
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <DocumentTextIcon className="w-5 h-5 text-primary" />
                  <h2 className="card-title">Description</h2>
                </div>
                <p className="text-base-content/80 leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>

            {/* AI Analysis */}
            {ticket.helpfulNotes && (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-4">
                    <BoltIcon className="w-5 h-5 text-secondary" />
                    <h2 className="card-title">
                      AI Analysis & Recommendations
                    </h2>
                    <div className="badge badge-secondary badge-sm">
                      AI Generated
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section (Placeholder for future enhancement) */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-4">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-info" />
                  <h2 className="card-title">Comments</h2>
                </div>
                <div className="text-center py-8 text-base-content/50">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Comments feature coming soon!</p>
                  <p className="text-sm">
                    Stay tuned for real-time communication.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Ticket Status</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Current Status:</span>
                    <span
                      className={`badge ${getStatusBadgeClass(
                        ticket.status
                      )} gap-2`}
                    >
                      {getStatusIcon(ticket.status)}
                      {ticket.status?.replace("_", " ")}
                    </span>
                  </div>

                  {/* Status Update Buttons (for moderators/admins) */}
                  {user.role !== "user" && (
                    <div className="divider">Update Status</div>
                  )}
                  {user.role !== "user" && (
                    <div className="flex flex-col gap-2">
                      {ticket.status !== "TODO" && (
                        <button
                          onClick={() => updateTicketStatus("TODO")}
                          className="btn btn-outline btn-warning btn-sm gap-2"
                          disabled={updateLoading}
                        >
                          <ClockIcon className="w-4 h-4" />
                          Mark as Pending
                        </button>
                      )}
                      {ticket.status !== "IN_PROGRESS" && (
                        <button
                          onClick={() => updateTicketStatus("IN_PROGRESS")}
                          className="btn btn-outline btn-info btn-sm gap-2"
                          disabled={updateLoading}
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                          Mark In Progress
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Ticket Information</h3>

                <div className="space-y-4">
                  {/* Priority */}
                  {ticket.priority && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center gap-2">
                        {getPriorityIcon(ticket.priority)}
                        Priority:
                      </span>
                      <span
                        className={`badge ${getPriorityBadgeClass(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Created:</span>
                    <span className="text-sm">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Assigned To */}
                  {ticket.assignedTo && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Assigned to:
                      </span>
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          {ticket.assignedTo.email}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills Required */}
                  {ticket.relatedSkills?.length > 0 && (
                    <div>
                      <span className="font-medium flex items-center gap-2 mb-2">
                        <TagIcon className="w-4 h-4" />
                        Required Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ticket.relatedSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="badge badge-outline badge-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}