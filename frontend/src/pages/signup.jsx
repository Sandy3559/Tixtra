// frontend/src/pages/signup.jsx (MODIFIED)
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TagIcon,
  UserIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

export default function Signup() {
  const [searchParams] = useSearchParams();
  const preSelectedRole = searchParams.get('role');
  
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "", 
    skills: "",
    role: preSelectedRole || "user",
    experience: "",
    specialization: "",
    adminCode: ""
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

  useEffect(() => {
    if (preSelectedRole && !['user', 'moderator', 'admin'].includes(preSelectedRole)) {
      navigate('/role-selection');
    }
  }, [preSelectedRole, navigate]);

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

    if (form.role === 'moderator' && !form.skills.trim()) {
      setError("Skills are required for moderator accounts");
      return false;
    }

    /*if (form.role === 'admin' && form.adminCode !== 'ADMIN2024') {
      setError("Invalid admin access code");
      return false;
    }*/

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

      const signupData = {
        email: form.email,
        password: form.password,
        role: form.role,
        skills: skillsArray
      };

      // Add role-specific data
      if (form.role === 'moderator') {
        signupData.experience = form.experience;
        signupData.specialization = form.specialization;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signupData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate("/admin");
        } else if (data.user.role === 'moderator') {
          navigate("/moderator-dashboard");
        } else {
          navigate("/");
        }
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <ShieldCheckIcon className="w-5 h-5" />;
      case 'moderator': return <CogIcon className="w-5 h-5" />;
      default: return <UserIcon className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'moderator': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 via-base-300 to-base-200 py-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="card w-full max-w-lg shadow-2xl bg-base-100 relative z-10">
        <div className="card-body p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {!preSelectedRole && (
                <button 
                  onClick={() => navigate('/role-selection')}
                  className="btn btn-ghost btn-sm"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                </button>
              )}
              <div className={`w-16 h-16 bg-${getRoleColor(form.role)} rounded-full flex items-center justify-center`}>
                {getRoleIcon(form.role)}
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Join as {form.role.charAt(0).toUpperCase() + form.role.slice(1)}
            </h1>
            <p className="text-base-content/70 mt-2">
              Create your {form.role} account
            </p>
            <div className={`badge badge-${getRoleColor(form.role)} mt-2`}>
              {form.role.toUpperCase()} REGISTRATION
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-6">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Change Option */}
          {!preSelectedRole && (
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-semibold">Account Type</span>
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="select select-bordered"
              >
                <option value="user">User - Submit & track tickets</option>
                <option value="moderator">Moderator - Solve tickets</option>
                <option value="admin">Admin - Manage system</option>
              </select>
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

            {/* Role-Specific Fields */}
            {form.role === 'moderator' && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Skills & Technologies *</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <TagIcon className="h-5 w-5 text-base-content/40" />
                    </div>
                    <input
                      type="text"
                      name="skills"
                      placeholder="React, Node.js, Python, Database, DevOps..."
                      className="input input-bordered w-full pl-10 input-lg"
                      value={form.skills}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <label className="label">
                    <span className="label-text-alt text-info">
                      💡 Add skills to receive relevant ticket assignments
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Experience Level</span>
                    </label>
                    <select
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      className="select select-bordered"
                    >
                      <option value="">Select level</option>
                      <option value="junior">Junior (0-2 years)</option>
                      <option value="mid">Mid-level (2-5 years)</option>
                      <option value="senior">Senior (5+ years)</option>
                      <option value="expert">Expert (10+ years)</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Specialization</span>
                    </label>
                    <select
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      className="select select-bordered"
                    >
                      <option value="">Select area</option>
                      <option value="frontend">Frontend Development</option>
                      <option value="backend">Backend Development</option>
                      <option value="fullstack">Full Stack Development</option>
                      <option value="mobile">Mobile Development</option>
                      <option value="devops">DevOps & Infrastructure</option>
                      <option value="data">Data Science & Analytics</option>
                      <option value="security">Security & Compliance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {form.role === 'admin' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Admin Access Code *</span>
                </label>
                <input
                  type="password"
                  name="adminCode"
                  placeholder="Enter admin access code"
                  className="input input-bordered input-lg"
                  value={form.adminCode}
                  onChange={handleChange}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-warning">
                    ⚠️ Contact system administrator for access code
                  </span>
                </label>
              </div>
            )}

            {form.role === 'user' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Areas of Interest (Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    name="skills"
                    placeholder="Web Development, Mobile Apps, Database..."
                    className="input input-bordered w-full pl-10 input-lg"
                    value={form.skills}
                    onChange={handleChange}
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Help us understand your technical interests
                  </span>
                </label>
              </div>
            )}

            {/* Password Fields */}
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
                </div>
              )}
            </div>

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
              className={`btn btn-${getRoleColor(form.role)} btn-lg w-full gap-2`}
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
                  Create {form.role.charAt(0).toUpperCase() + form.role.slice(1)} Account
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

          {/* Role Benefits */}
          {form.role === 'moderator' && (
            <div className="mt-6 p-4 bg-warning/10 rounded-lg">
              <h4 className="font-semibold text-warning mb-2">Moderator Benefits</h4>
              <ul className="text-sm space-y-1 text-base-content/80">
                <li>• Receive tickets matching your skills</li>
                <li>• Build your reputation and expertise</li>
                <li>• Direct communication with users</li>
                <li>• Performance tracking and analytics</li>
              </ul>
            </div>
          )}

          {form.role === 'admin' && (
            <div className="mt-6 p-4 bg-error/10 rounded-lg">
              <h4 className="font-semibold text-error mb-2">Admin Responsibilities</h4>
              <ul className="text-sm space-y-1 text-base-content/80">
                <li>• Oversee entire ticketing system</li>
                <li>• Manage users and moderators</li>
                <li>• Monitor system performance</li>
                <li>• Configure system settings</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}