import { Link, useNavigate } from "react-router-dom";
import { 
  HomeIcon, 
  ArrowLeftIcon,
  MagnifyingGlassIcon 
} from "@heroicons/react/24/outline";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-300 to-base-200 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="mb-8">
          {/* 404 Illustration */}
          <div className="relative mb-6">
            <div className="text-9xl font-bold text-primary/20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MagnifyingGlassIcon className="w-20 h-20 text-primary/40" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Page Not Found
          </h1>
          
          <p className="text-lg text-base-content/70 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, let's get you back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to="/" className="btn btn-primary gap-2">
            <HomeIcon className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-base-100 rounded-lg p-6 shadow-lg">
          <h3 className="font-bold text-lg mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link 
              to="/" 
              className="btn btn-ghost btn-sm justify-start"
            >
              📋 View Tickets
            </Link>
            <Link 
              to="/admin" 
              className="btn btn-ghost btn-sm justify-start"
            >
              ⚙️ Admin Panel
            </Link>
            <a 
              href="#" 
              className="btn btn-ghost btn-sm justify-start"
            >
              📚 Documentation
            </a>
            <a 
              href="mailto:support@tixtra.com" 
              className="btn btn-ghost btn-sm justify-start"
            >
              💬 Contact Support
            </a>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="mt-8 text-sm text-base-content/50">
          <p>💡 Did you know? This 404 page is powered by our AI system too!</p>
        </div>
      </div>
    </div>
  );
}