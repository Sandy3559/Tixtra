import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UserIcon,
  TagIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  CalendarIcon,
  BoltIcon
} from "@heroicons/react/24/outline";

export default function ModeratorDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
    avgRating: 0,
    totalSolutions: 0
  });
  const [filter, setFilter] = useState("assigned");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  // Redirect if not moderator
  useEffect(() => {
    if (user.role !== 'moderator') {
      navigate('/');
      return;
    }
    fetchAssignedTickets();
  }, [user.role, navigate]);

  const fetchAssignedTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const ticketsArray = Array.isArray(data) ? data : [];
      setTickets(ticketsArray);
      
      // Calculate statistics
      setStatistics({
        assigned: ticketsArray.filter(t => t.status === 'TODO').length,
        inProgress: ticketsArray.filter(t => t.status === 'IN_PROGRESS').length,
        completed: ticketsArray.filter(t => t.status === 'COMPLETED').length,
        avgRating: 4.2, 
        totalSolutions: ticketsArray.filter(t => t.status === 'COMPLETED').length
      });
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'TODO': return <ClockIcon className="w-4 h-4 text-orange-500" />;
      case 'IN_PROGRESS': return <ArrowPathIcon className="w-4 h-4 text-blue-500" />;
      case 'COMPLETED': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'TODO': return 'badge-warning';
      case 'IN_PROGRESS': return 'badge-info';
      case 'COMPLETED': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'badge-error';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    switch (filter) {
      case 'assigned': return ticket.status === 'TODO';
      case 'inProgress': return ticket.status === 'IN_PROGRESS';
      case 'completed': return ticket.status === 'COMPLETED';
      default: return true;
    }
  });

  const startWorking = async (ticketId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets/${ticketId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "IN_PROGRESS" }),
        }
      );

      if (res.ok) {
        fetchAssignedTickets();
      } else {
        alert("Failed to update ticket status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="avatar placeholder">
              <div className="bg-warning text-warning-content rounded-full w-12">
                <span className="text-xl font-bold">
                  {user?.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.email}</h1>
              <p className="text-base-content/70">Moderator Dashboard</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="badge badge-warning">Moderator</div>
                {user?.skills?.length > 0 && (
                  <div className="badge badge-outline">
                    {user.skills.length} skill{user.skills.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Skills Display */}
          {user?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-base-content/70">Your Skills:</span>
              {user.skills.map((skill, index) => (
                <span key={index} className="badge badge-primary badge-sm">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="stats shadow bg-gradient-to-r from-warning to-orange-400 text-white">
            <div className="stat">
              <div className="stat-figure">
                <ClockIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-white/80">New Assignments</div>
              <div className="stat-value">{statistics.assigned}</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-r from-info to-blue-400 text-white">
            <div className="stat">
              <div className="stat-figure">
                <ArrowPathIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-white/80">In Progress</div>
              <div className="stat-value">{statistics.inProgress}</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-r from-success to-green-400 text-white">
            <div className="stat">
              <div className="stat-figure">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-white/80">Completed</div>
              <div className="stat-value">{statistics.completed}</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-r from-secondary to-purple-400 text-white">
            <div className="stat">
              <div className="stat-figure">
                <TrophyIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-white/80">Avg Rating</div>
              <div className="stat-value">{statistics.avgRating}⭐</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-r from-accent to-pink-400 text-white">
            <div className="stat">
              <div className="stat-figure">
                <ChartBarIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-white/80">Total Solutions</div>
              <div className="stat-value">{statistics.totalSolutions}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="btn-group">
            <button
              onClick={() => setFilter("assigned")}
              className={`btn btn-sm ${filter === "assigned" ? "btn-active" : "btn-outline"}`}
            >
              <ClockIcon className="w-4 h-4" />
              New Assignments ({statistics.assigned})
            </button>
            <button
              onClick={() => setFilter("inProgress")}
              className={`btn btn-sm ${filter === "inProgress" ? "btn-active" : "btn-outline"}`}
            >
              <ArrowPathIcon className="w-4 h-4" />
              In Progress ({statistics.inProgress})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`btn btn-sm ${filter === "completed" ? "btn-active" : "btn-outline"}`}
            >
              <CheckCircleIcon className="w-4 h-4" />
              Completed ({statistics.completed})
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              {filter === 'assigned' ? (
                <ClockIcon className="w-16 h-16 mx-auto text-base-content/30" />
              ) : filter === 'inProgress' ? (
                <ArrowPathIcon className="w-16 h-16 mx-auto text-base-content/30" />
              ) : (
                <CheckCircleIcon className="w-16 h-16 mx-auto text-base-content/30" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-base-content/70 mb-2">
              {filter === 'assigned' && "No new assignments"}
              {filter === 'inProgress' && "No tickets in progress"}
              {filter === 'completed' && "No completed tickets yet"}
            </h3>
            <p className="text-base-content/50 mb-6">
              {filter === 'assigned' && "New tickets matching your skills will appear here"}
              {filter === 'inProgress' && "Tickets you're working on will show here"}
              {filter === 'completed' && "Your completed solutions will be listed here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket._id}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="card-body">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span className={`badge ${getStatusBadgeClass(ticket.status)} badge-sm`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                    </div>
                    {ticket.priority && (
                      <span className={`badge ${getPriorityBadgeClass(ticket.priority)} badge-sm`}>
                        {ticket.priority}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="card-title text-lg mb-2">{ticket.title}</h3>

                  {/* Description */}
                  <p className="text-base-content/70 text-sm line-clamp-3 mb-3">
                    {ticket.description}
                  </p>

                  {/* User Info */}
                  {ticket.createdBy && (
                    <div className="flex items-center gap-2 mb-3">
                      <UserIcon className="w-4 h-4 text-base-content/60" />
                      <span className="text-sm text-base-content/60">
                        {ticket.createdBy.email}
                      </span>
                    </div>
                  )}

                  {/* Skills Required */}
                  {ticket.relatedSkills?.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TagIcon className="w-4 h-4 text-base-content/60" />
                        <span className="text-sm font-medium">Skills Required:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ticket.relatedSkills.map((skill, index) => (
                          <span key={index} className="badge badge-outline badge-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Preview */}
                  {ticket.helpfulNotes && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BoltIcon className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium">AI Analysis:</span>
                      </div>
                      <p className="text-xs text-base-content/60 line-clamp-2">
                        {ticket.helpfulNotes.substring(0, 100)}...
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-4 h-4 text-base-content/60" />
                    <span className="text-xs text-base-content/60">
                      Created: {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="card-actions justify-end gap-2">
                    <Link
                      to={`/moderator/tickets/${ticket._id}`}
                      className="btn btn-outline btn-sm gap-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </Link>
                    
                    {ticket.status === 'TODO' && (
                      <button
                        onClick={() => startWorking(ticket._id)}
                        className="btn btn-primary btn-sm gap-1"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                        Start Work
                      </button>
                    )}
                    
                    {ticket.status === 'IN_PROGRESS' && (
                      <Link
                        to={`/moderator/tickets/${ticket._id}/solution`}
                        className="btn btn-success btn-sm gap-1"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add Solution
                      </Link>
                    )}

                    {ticket.status === 'COMPLETED' && (
                      <Link
                        to={`/moderator/tickets/${ticket._id}`}
                        className="btn btn-info btn-sm gap-1"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        View Solution
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Tips for New Moderators */}
        {statistics.totalSolutions === 0 && (
          <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg mt-8">
            <div className="card-body">
              <h3 className="card-title text-primary mb-4">
                <TrophyIcon className="w-6 h-6" />
                Welcome to the Moderator Team!
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Getting Started:</h4>
                  <ul className="text-sm space-y-1 text-base-content/80">
                    <li>• Review assigned tickets based on your skills</li>
                    <li>• Start working on tickets to change status</li>
                    <li>• Provide detailed solutions to help users</li>
                    <li>• Communicate clearly and professionally</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Best Practices:</h4>
                  <ul className="text-sm space-y-1 text-base-content/80">
                    <li>• Read AI analysis for context</li>
                    <li>• Ask clarifying questions if needed</li>
                    <li>• Include step-by-step solutions</li>
                    <li>• Follow up on solution effectiveness</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}