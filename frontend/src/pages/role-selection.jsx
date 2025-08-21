import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UserIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  const roles = [
    {
      id: "user",
      title: "User",
      description: "Submit and track support tickets",
      icon: UserIcon,
      features: [
        "Create support tickets",
        "Track ticket status",
        "Receive solution notifications",
        "Rate moderator solutions",
        "View ticket history"
      ],
      color: "info",
      bgGradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "moderator",
      title: "Moderator",
      description: "Solve tickets based on your expertise",
      icon: CogIcon,
      features: [
        "Receive skill-matched tickets",
        "Provide solutions to users",
        "Communicate with ticket creators",
        "Track resolution metrics",
        "Build expertise profile"
      ],
      color: "warning",
      bgGradient: "from-orange-500 to-yellow-500"
    },
    {
      id: "admin",
      title: "Admin",
      description: "Manage the entire ticketing system",
      icon: ShieldCheckIcon,
      features: [
        "Oversee all tickets and users",
        "Manage moderator assignments",
        "View system analytics",
        "Configure system settings",
        "Monitor performance metrics"
      ],
      color: "error",
      bgGradient: "from-red-500 to-pink-500",
      note: "Admin access requires approval"
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleProceed = () => {
    if (selectedRole) {
      navigate(`/signup?role=${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-300 to-base-200">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-primary-content font-bold text-3xl">T</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Join Tixtra
          </h1>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Choose your role to get started with our AI-powered ticketing system
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <div
                key={role.id}
                className={`card bg-base-100 shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isSelected ? 'ring-4 ring-primary ring-opacity-60' : ''
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="card-body p-6">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${role.bgGradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">{role.title}</h3>
                    <p className="text-base-content/70">{role.description}</p>
                    {role.note && (
                      <div className="badge badge-warning badge-sm mt-2">{role.note}</div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircleIcon className={`w-5 h-5 text-${role.color}`} />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Selection Indicator */}
                  <div className="card-actions justify-center mt-6">
                    <div className={`btn ${isSelected ? `btn-${role.color}` : 'btn-outline'} btn-sm`}>
                      {isSelected ? 'Selected' : 'Select Role'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/login')}
            className="btn btn-ghost gap-2"
          >
            Already have an account? Sign In
          </button>
          
          <button
            onClick={handleProceed}
            disabled={!selectedRole}
            className="btn btn-primary btn-lg gap-2"
          >
            Continue with {selectedRole ? roles.find(r => r.id === selectedRole)?.title : 'Selection'}
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Tixtra?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-content font-bold">AI</span>
              </div>
              <h3 className="font-bold text-lg mb-2">AI-Powered Analysis</h3>
              <p className="text-base-content/70 text-sm">
                Automatic ticket categorization and intelligent assignment
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-secondary-content font-bold">⚡</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Fast Resolution</h3>
              <p className="text-base-content/70 text-sm">
                Quick ticket resolution with skill-based matching
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-accent-content font-bold">📧</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Smart Notifications</h3>
              <p className="text-base-content/70 text-sm">
                Stay updated with real-time email notifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}