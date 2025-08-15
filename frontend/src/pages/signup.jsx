import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TagIcon
} from "@heroicons/react/24/outline";

export default function Signup() {
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "", 
    skills: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (error) setError("");

    // Check password strength
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One uppercase letter");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One lowercase letter");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("One number");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One special character");
    }

    return { score, feedback };
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return "progress-error";
    if (score <= 3) return "progress-warning";
    return "progress-success";
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return "Weak";
    if (score <= 3) return "Medium";
    return "Strong";
  };

  const validateForm = () => {
    if (!form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all required fields");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (passwordStrength.score < 3) {
      setError("Please choose a stronger password");
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const skillsArray = form.skills
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            skills: skillsArray
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.error || data.message || "Signup failed");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-300 to-base-200 py-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="card w-full max-w-md shadow-2xl bg-base-100 relative z-10">
        <div className="card-body p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlusIcon className="w-8 h-8 text-primary-content" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Join Tixtra
            </h1>
            <p className="text-base-content/70 mt-2">
              Create your account to get started
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
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address *</span>
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
                <span className="label-text font-semibold">Password *</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
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
              
              {/* Password Strength Indicator */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Password strength:</span>
                    <span className={
                      passwordStrength.score <= 2 ? "text-error" :
                      passwordStrength.score <= 3 ? "text-warning" : "text-success"
                    }>
                      {getPasswordStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <progress 
                    className={`progress w-full h-2 ${getPasswordStrengthColor(passwordStrength.score)}`} 
                    value={passwordStrength.score} 
                    max="5"
                  ></progress>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-base-content/60 mt-1 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <XCircleIcon className="w-3 h-3 text-error" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Confirm Password *</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className={`input input-bordered w-full pl-10 pr-10 input-lg ${
                    form.confirmPassword && form.password !== form.confirmPassword 
                      ? 'input-error' 
                      : form.confirmPassword && form.password === form.confirmPassword 
                      ? 'input-success' 
                      : ''
                  }`}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
              {form.confirmPassword && (
                <label className="label">
                  {form.password === form.confirmPassword ? (
                    <span className="label-text-alt text-success flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      Passwords match
                    </span>
                  ) : (
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <XCircleIcon className="w-4 h-4" />
                      Passwords do not match
                    </span>
                  )}
                </label>
              )}
            </div>

            {/* Skills Field (Optional) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Skills (Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TagIcon className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  name="skills"
                  placeholder="React, Node.js, Python (comma-separated)"
                  className="input input-bordered w-full pl-10 input-lg"
                  value={form.skills}
                  onChange={handleChange}
                />
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Add skills to help with ticket assignment (for moderators)
                </span>
              </label>
            </div>

            {/* Terms and Conditions */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" required className="checkbox checkbox-primary" />
                <span className="label-text">
                  I agree to the{" "}
                  <a href="#" className="link link-primary">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="link link-primary">Privacy Policy</a>
                </span>
              </label>
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
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <span className="text-base-content/70">Already have an account? </span>
            <Link to="/login" className="link link-primary font-semibold">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}