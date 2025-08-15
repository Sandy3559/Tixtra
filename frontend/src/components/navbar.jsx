import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  HomeIcon,
  UserCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    try {
      // Call logout endpoint
      await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <ShieldCheckIcon className="w-4 h-4" />;
      case 'moderator': return <CogIcon className="w-4 h-4" />;
      default: return <UserCircleIcon className="w-4 h-4" />;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-error';
      case 'moderator': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-lg border-b border-base-200">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16"></path>
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {token && (
              <>
                <li>
                  <Link to="/" className={isActiveRoute("/") ? "active" : ""}>
                    <HomeIcon className="w-4 h-4" />
                    Dashboard
                  </Link>
                </li>
                {user && user?.role === "admin" && (
                  <li>
                    <Link to="/admin" className={isActiveRoute("/admin") ? "active" : ""}>
                      <ShieldCheckIcon className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-content font-bold text-sm">T</span>
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tixtra
            </span>
          </div>
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        {token && (
          <ul className="menu menu-horizontal px-1 gap-1">
            <li>
              <Link 
                to="/" 
                className={`gap-2 ${isActiveRoute("/") ? "bg-primary text-primary-content" : ""}`}
              >
                <HomeIcon className="w-4 h-4" />
                Dashboard
              </Link>
            </li>
            {user && user?.role === "admin" && (
              <li>
                <Link 
                  to="/admin" 
                  className={`gap-2 ${isActiveRoute("/admin") ? "bg-primary text-primary-content" : ""}`}
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
      
      <div className="navbar-end gap-2">
        {!token ? (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm">
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              <UserCircleIcon className="w-4 h-4" />
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Notifications (placeholder for future) */}
            <div className="indicator">
              <button className="btn btn-ghost btn-circle btn-sm">
                <BellIcon className="w-5 h-5" />
              </button>
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>

            {/* Profile Dropdown */}
            <div className="dropdown dropdown-end">
              <div 
                tabIndex={0} 
                role="button" 
                className="btn btn-ghost flex items-center gap-2 pr-2"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-8">
                    <span className="text-xs font-bold">
                      {user?.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user?.email}</div>
                  <div className={`badge ${getRoleBadgeClass(user?.role)} badge-xs gap-1`}>
                    {getRoleIcon(user?.role)}
                    {user?.role}
                  </div>
                </div>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64 mt-2">
                <li className="menu-title">
                  <span className="text-base-content/70">Account</span>
                </li>
                <li>
                  <div className="flex flex-col items-start p-3 bg-base-200 rounded-lg mb-2">
                    <span className="font-medium">{user?.email}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${getRoleBadgeClass(user?.role)} badge-sm gap-1`}>
                        {getRoleIcon(user?.role)}
                        {user?.role}
                      </span>
                      {user?.skills && user.skills.length > 0 && (
                        <span className="text-xs text-base-content/60">
                          {user.skills.length} skill{user.skills.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <a className="gap-2">
                    <UserCircleIcon className="w-4 h-4" />
                    Profile Settings
                    <span className="badge badge-sm">Soon</span>
                  </a>
                </li>
                <li>
                  <a className="gap-2">
                    <CogIcon className="w-4 h-4" />
                    Preferences
                    <span className="badge badge-sm">Soon</span>
                  </a>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <button onClick={logout} className="gap-2 text-error hover:bg-error hover:text-error-content">
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}