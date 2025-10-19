import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheckIcon,
  CpuChipIcon,
  BoltIcon,
  ChatBubbleBottomCenterTextIcon,
  TicketIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (token) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "moderator") {
        navigate("/moderator-dashboard");
      } else {
        navigate("/tickets");
      }
    }
  }, [token, user.role, navigate]);

  if (token) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <div className="hero bg-base-200 text-base-content py-20 md:py-28">
        <div className="hero-content text-center flex-col">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-4">
              Welcome to Tixtra
            </h1>
            
            {/* --- ADDED TAGLINE --- */}
            <p className="mt-2 text-xl md:text-2xl font-medium text-base-content/80">
              Where Tickets Meet a Quicker Resolution.
            </p>

            {/* --- MODIFIED: Changed py-6 to pt-8 for better spacing --- */}
            <p className="pt-8 text-lg md:text-xl text-base-content/80">
              The smart, modern ticket management system that uses AI to
              automatically categorize, prioritize, and assign support tickets.
            </p>
            <Link to="/role-selection" className="btn btn-primary btn-lg mt-6">
              Get Started
            </Link>
          </div>

          <div className="mt-16 px-4 w-full">
            <img
              src="/tixtra-banner.png"
              alt="Tixtra Banner"
              className="w-full max-w-10xl mx-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-base-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Why Choose Tixtra?</h2>
            <p className="text-lg text-base-content/70 mt-4">
              Tixtra is designed to streamline your support workflow and improve
              your team's efficiency.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <CpuChipIcon className="w-12 h-12 text-primary mb-4" />
                <h3 className="card-title">AI-Powered</h3>
                <p>
                  Automatic categorization and priority assignment using Google
                  Gemini AI.
                </p>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <BoltIcon className="w-12 h-12 text-secondary mb-4" />
                <h3 className="card-title">Fast Resolution</h3>
                <p>
                  Quick ticket resolution with skill-based matching and
                  automated workflows.
                </p>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body items-center text-center">
                <ShieldCheckIcon className="w-12 h-12 text-accent mb-4" />
                <h3 className="card-title">Secure & Reliable</h3>
                <p>Secure authentication with JWT and robust infrastructure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 bg-base-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">How It Works</h2>
          </div>
          <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
            <li>
              <div className="timeline-middle">
                <TicketIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="timeline-start md:text-end mb-10">
                <time className="font-mono italic">Step 1</time>
                <div className="text-lg font-black">Submit a Ticket</div>
                Users can easily submit new tickets with all the necessary
                details.
              </div>
              <hr />
            </li>
            <li>
              <hr />
              <div className="timeline-middle">
                <CpuChipIcon className="w-6 h-6 text-secondary" />
              </div>
              <div className="timeline-end mb-10">
                <time className="font-mono italic">Step 2</time>
                <div className="text-lg font-black">AI Analysis</div>
                Our AI analyzes, categorizes, and assigns the ticket to the
                best-suited moderator.
              </div>
              <hr />
            </li>
            <li>
              <hr />
              <div className="timeline-middle">
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-accent" />
              </div>
              <div className="timeline-start md:text-end mb-10">
                <time className="font-mono italic">Step 3</time>
                <div className="text-lg font-black">Resolve & Collaborate</div>
                Moderators work on the ticket and collaborate with users for a
                quick resolution.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-base-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">What Our Users Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <p>
                  "Tixtra has revolutionized our support system. The AI-powered
                  ticket assignment is a game-changer!"
                </p>
                <div className="card-actions justify-end mt-4">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src="https://i.pravatar.cc/150?img=1"
                        alt="user"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold">John Doe</p>
                    <p className="text-sm text-base-content/70">
                      CTO, TechCorp
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <p>
                  "The best ticket management system I've ever used. It's fast,
                  intuitive, and incredibly smart."
                </p>
                <div className="card-actions justify-end mt-4">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src="https://i.pravatar.cc/150?img=2"
                        alt="user"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold">Jane Smith</p>
                    <p className="text-sm text-base-content/70">
                      Support Lead, Innovate Inc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-base-200">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg text-base-content/70 mt-4 mb-8">
            Join Tixtra today and experience the future of ticket management.
          </p>
          <Link to="/role-selection" className="btn btn-primary btn-lg">
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}