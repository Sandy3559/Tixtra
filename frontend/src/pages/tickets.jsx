import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchTickets = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      const data = await res.json();
      const ticketsArray = Array.isArray(data) ? data : [];
      setTickets(ticketsArray);
      
      // Calculate statistics
      setStatistics({
        total: ticketsArray.length,
        todo: ticketsArray.filter(t => t.status === 'TODO').length,
        inProgress: ticketsArray.filter(t => t.status === 'IN_PROGRESS').length,
        completed: ticketsArray.filter(t => t.status === 'COMPLETED').length
      });
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        setIsCreateModalOpen(false);
        fetchTickets();
        // Show success toast
        const toast = document.getElementById('success-toast');
        if (toast) {
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 3000);
        }
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'TODO': return <ClockIcon className="w-4 h-4 text-gray-500" />;
      case 'IN_PROGRESS': return <ArrowPathIcon className="w-4 h-4 text-blue-500" />;
      case 'COMPLETED': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'TODO': return 'badge-ghost';
      case 'IN_PROGRESS': return 'badge-info';
      case 'COMPLETED': return 'badge-success';
      default: return 'badge-ghost';
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Success Toast */}
      <div id="success-toast" className="toast toast-top toast-end hidden">
        <div className="alert alert-success">
          <CheckCircleIcon className="w-5 h-5" />
          <span>Ticket created successfully! AI is processing your request...</span>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content mb-2">Support Tickets</h1>
            <p className="text-base-content/70">Manage and track your support requests</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary gap-2 mt-4 sm:mt-0"
          >
            <PlusIcon className="w-5 h-5" />
            Create Ticket
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Total Tickets</div>
              <div className="stat-value text-primary">{statistics.total}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Pending</div>
              <div className="stat-value text-warning">{statistics.todo}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">In Progress</div>
              <div className="stat-value text-info">{statistics.inProgress}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Completed</div>
              <div className="stat-value text-success">{statistics.completed}</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-base-100 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="form-control flex-1">
              <div className="input-group">
                <span className="bg-base-200">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="input input-bordered flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="form-control">
              <select
                className="select select-bordered gap-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="TODO">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="form-control">
              <select
                className="select select-bordered"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {fetchLoading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-base-content/30" />
              </div>
              <h3 className="text-xl font-semibold text-base-content/70 mb-2">No tickets found</h3>
              <p className="text-base-content/50 mb-6">
                {tickets.length === 0 
                  ? "Create your first support ticket to get started"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {tickets.length === 0 && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn btn-primary gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create Your First Ticket
                </button>
              )}
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <Link
                key={ticket._id}
                to={`/tickets/${ticket._id}`}
                className="block"
              >
                <div className="card bg-base-100 shadow hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
                  <div className="card-body">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(ticket.status)}
                          <h3 className="card-title text-lg truncate">{ticket.title}</h3>
                        </div>
                        <p className="text-base-content/70 line-clamp-2 mb-3">
                          {ticket.description}
                        </p>
                        
                        {/* Skills and Assignment Info (for admin/moderator) */}
                        {user.role !== 'user' && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {ticket.relatedSkills?.map((skill, index) => (
                              <span key={index} className="badge badge-outline badge-sm">
                                {skill}
                              </span>
                            ))}
                            {ticket.assignedTo && (
                              <span className="badge badge-info badge-sm">
                                Assigned to: {ticket.assignedTo.email}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                            {ticket.status?.replace('_', ' ')}
                          </span>
                          {ticket.priority && (
                            <span className={`badge badge-outline ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-base-content/50">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Create Ticket Modal */}
        <dialog className={`modal ${isCreateModalOpen ? 'modal-open' : ''}`}>
          <div className="modal-box w-11/12 max-w-2xl">
            <form method="dialog">
              <button 
                type="button"
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ✕
              </button>
            </form>
            
            <h3 className="font-bold text-2xl mb-6">Create New Support Ticket</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Title *</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Brief description of your issue"
                  className="input input-bordered input-lg"
                  required
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description *</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Please provide detailed information about your issue, including steps to reproduce, expected behavior, and any error messages..."
                  className="textarea textarea-bordered h-32"
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-info">
                    💡 Tip: More details help our AI provide better assistance
                  </span>
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsCreateModalOpen(false)}
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      Create Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsCreateModalOpen(false)}>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}