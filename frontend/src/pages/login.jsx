import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.error || data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-300 to-base-200">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="card w-full max-w-md shadow-2xl bg-base-100 relative z-10">
        <div className="card-body p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-content font-bold text-2xl">T</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-base-content/70 mt-2">
              Sign in to your Tixtra account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-6">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="input input-bordered w-full pl-10 input-lg"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="input input-bordered w-full pl-10 pr-10 input-lg"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <label className="label cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-sm" />
                <span className="label-text ml-2">Remember me</span>
              </label>
              <a href="#" className="link link-primary text-sm">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">Or</div>

          {/* Demo Accounts */}
          <div className="bg-base-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-sm mb-3 text-center">Demo Accounts</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Admin:</span>
                <code className="bg-base-300 px-2 py-1 rounded">admin@demo.com</code>
              </div>
              <div className="flex justify-between">
                <span>Moderator:</span>
                <code className="bg-base-300 px-2 py-1 rounded">mod@demo.com</code>
              </div>
              <div className="flex justify-between">
                <span>User:</span>
                <code className="bg-base-300 px-2 py-1 rounded">user@demo.com</code>
              </div>
              <div className="text-center mt-2">
                <span className="text-base-content/60">Password: </span>
                <code className="bg-base-300 px-2 py-1 rounded">demo123</code>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-base-content/70">Don't have an account? </span>
            <Link to="/signup" className="link link-primary font-semibold">
              Create one here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}