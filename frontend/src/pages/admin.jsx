import { useEffect, useState } from "react";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  UserPlusIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: "", skills: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    moderators: 0,
    admins: 0,
    totalTickets: 0,
    pendingTickets: 0
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
    fetchTickets();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        setFilteredUsers(data);
        setStatistics(prev => ({
          ...prev,
          totalUsers: data.length,
          moderators: data.filter(u => u.role === 'moderator').length,
          admins: data.filter(u => u.role === 'admin').length
        }));
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const ticketsArray = Array.isArray(data) ? data : [];
      setTickets(ticketsArray);
      setStatistics(prev => ({
        ...prev,
        totalTickets: ticketsArray.length,
        pendingTickets: ticketsArray.filter(t => t.status === 'TODO').length
      }));
    } catch (err) {
      console.error("Error fetching tickets", err);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.email);
    setFormData({
      role: user.role,
      skills: user.skills?.join(", ") || "",
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/update-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: editingUser,
            role: formData.role,
            skills: formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error(data.error || "Failed to update user");
        return;
      }

      setEditingUser(null);
      setFormData({ role: "", skills: "" });
      fetchUsers();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    filterUsers(query, roleFilter);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    filterUsers(searchQuery, role);
  };

  const filterUsers = (search, role) => {
    let filtered = users.filter((user) =>
      user.email.toLowerCase().includes(search)
    );
    
    if (role !== "all") {
      filtered = filtered.filter((user) => user.role === role);
    }
    
    setFilteredUsers(filtered);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-error';
      case 'moderator': return 'badge-warning';
      case 'user': return 'badge-info';
      default: return 'badge-ghost';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <ShieldCheckIcon className="w-4 h-4" />;
      case 'moderator': return <CogIcon className="w-4 h-4" />;
      case 'user': return <UsersIcon className="w-4 h-4" />;
      default: return <UsersIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheckIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-base-content/70">Manage users, roles, and system overview</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="stats shadow bg-gradient-to-r from-primary to-primary-focus text-primary-content">
            <div className="stat">
              <div className="stat-figure">
                <UsersIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-primary-content/80">Total Users</div>
              <div className="stat-value">{statistics.totalUsers}</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-r from-warning to-warning-focus text-warning-content">
            <div className="stat">
              <div className="stat-figure">
                <CogIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-warning-content/80">Moderators</div>
              <div className="stat-value">{statistics.moderators}</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-r from-error to-error-focus text-error-content">
            <div className="stat">
              <div className="stat-figure">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-error-content/80">Admins</div>
              <div className="stat-value">{statistics.admins}</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-r from-info to-info-focus text-info-content">
            <div className="stat">
              <div className="stat-figure">
                <ChartBarIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-info-content/80">Total Tickets</div>
              <div className="stat-value">{statistics.totalTickets}</div>
            </div>
          </div>
          
          <div className="stats shadow bg-gradient-to-r from-success to-success-focus text-success-content">
            <div className="stat">
              <div className="stat-figure">
                <ChartBarIcon className="w-8 h-8" />
              </div>
              <div className="stat-title text-success-content/80">Pending</div>
              <div className="stat-value">{statistics.pendingTickets}</div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="card-title text-2xl">User Management</h2>
              <div className="flex items-center gap-2">
                <UserPlusIcon className="w-5 h-5 text-primary" />
                <span className="text-sm text-base-content/70">
                  {filteredUsers.length} of {users.length} users
                </span>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="form-control flex-1">
                <div className="input-group">
                  <span className="bg-base-200">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by email..."
                    className="input input-bordered flex-1"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="form-control">
                <div className="btn-group">
                  {['all', 'user', 'moderator', 'admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleFilter(role)}
                      className={`btn btn-sm ${roleFilter === role ? 'btn-active' : 'btn-outline'}`}
                    >
                      {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Skills</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                              <span className="text-sm">
                                {user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{user.email}</div>
                            <div className="text-sm opacity-50">ID: {user._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {editingUser === user.email ? (
                          <select
                            className="select select-bordered select-sm"
                            value={formData.role}
                            onChange={(e) =>
                              setFormData({ ...formData, role: e.target.value })
                            }
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <div className={`badge ${getRoleBadgeClass(user.role)} gap-2`}>
                            {getRoleIcon(user.role)}
                            {user.role}
                          </div>
                        )}
                      </td>
                      <td>
                        {editingUser === user.email ? (
                          <input
                            type="text"
                            placeholder="React, Node.js, Python..."
                            className="input input-bordered input-sm w-full"
                            value={formData.skills}
                            onChange={(e) =>
                              setFormData({ ...formData, skills: e.target.value })
                            }
                          />
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {user.skills && user.skills.length > 0 ? (
                              user.skills.map((skill, index) => (
                                <span key={index} className="badge badge-outline badge-sm">
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-base-content/50 text-sm">No skills</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        {editingUser === user.email ? (
                          <div className="flex gap-2">
                            <button
                              className="btn btn-success btn-sm gap-1"
                              onClick={handleUpdate}
                            >
                              <CheckIcon className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              className="btn btn-ghost btn-sm gap-1"
                              onClick={() => setEditingUser(null)}
                            >
                              <XMarkIcon className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm gap-1"
                            onClick={() => handleEditClick(user)}
                          >
                            <PencilIcon className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                <h3 className="text-xl font-semibold text-base-content/70 mb-2">No users found</h3>
                <p className="text-base-content/50">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}