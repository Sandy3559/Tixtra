// frontend/src/main.jsx (UPDATED)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CheckAuth from './components/check-auth.jsx'
import Tickets from './pages/tickets.jsx'
import TicketDetailsPage from './pages/ticket.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import RoleSelection from './pages/role-selection.jsx'
import Admin from './pages/admin.jsx'
import ModeratorDashboard from './pages/moderator-dashboard.jsx'
import Navbar from './components/navbar.jsx'
import ErrorBoundary from './components/error-boundary.jsx'
import NotFound from './pages/not-found.jsx'

// Additional pages for solution management
import ModeratorTicketDetails from './pages/moderator-ticket-details.jsx'
import SolutionPage from './pages/solution-page.jsx'
import RatingPage from './pages/rating-page.jsx'

// Toast notification component
function ToastContainer() {
  return (
    <div className="toast-container">
      <div id="toast" className="toast toast-top toast-end hidden">
        <div className="alert alert-info">
          <span id="toast-message">Message</span>
        </div>
      </div>
    </div>
  );
}

// Global error handler for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Helper function to show toast messages
window.showToast = (message, type = 'info') => {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  if (toast && toastMessage) {
    const alert = toast.querySelector('.alert');
    alert.className = `alert alert-${type}`;
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <div className="min-h-screen bg-base-200">
          <Navbar />
          <ToastContainer />
          <main className="pb-4">
            <Routes>
              {/* Role Selection */}
              <Route path="/role-selection" element={<RoleSelection />} />

              {/* User Routes */}
              <Route
                path="/"
                element={
                  <CheckAuth protected={true}>
                    <Tickets />
                  </CheckAuth>
                }
              />

              <Route
                path="/tickets/:id"
                element={
                  <CheckAuth protected={true}>
                    <TicketDetailsPage />
                  </CheckAuth>
                }
              />

              <Route
                path="/tickets/:id/solution"
                element={
                  <CheckAuth protected={true}>
                    <SolutionPage />
                  </CheckAuth>
                }
              />

              <Route
                path="/tickets/:id/rate"
                element={
                  <CheckAuth protected={true}>
                    <RatingPage />
                  </CheckAuth>
                }
              />

              {/* Moderator Routes */}
              <Route
                path="/moderator-dashboard"
                element={
                  <CheckAuth protected={true}>
                    <ModeratorDashboard />
                  </CheckAuth>
                }
              />

              <Route
                path="/moderator/tickets/:id"
                element={
                  <CheckAuth protected={true}>
                    <ModeratorTicketDetails />
                  </CheckAuth>
                }
              />

              <Route
                path="/moderator/tickets/:id/solution"
                element={
                  <CheckAuth protected={true}>
                    <SolutionPage />
                  </CheckAuth>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <CheckAuth protected={true}>
                    <Admin />
                  </CheckAuth>
                }
              />

              {/* Auth Routes */}
              <Route
                path='/login'
                element={
                  <CheckAuth protected={false}>
                    <Login />
                  </CheckAuth>
                }
              />

              <Route
                path='/signup'
                element={
                  <CheckAuth protected={false}>
                    <Signup />
                  </CheckAuth>
                }
              />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-auto">
            <div>
              <p>
                © 2024 <span className="font-bold text-primary">Tixtra</span> - 
                AI-Powered Ticket Management System
              </p>
              <div className="flex gap-4 text-sm opacity-70">
                <a href="#" className="hover:text-primary">Privacy Policy</a>
                <a href="#" className="hover:text-primary">Terms of Service</a>
                <a href="#" className="hover:text-primary">Support</a>
              </div>
            </div>
          </footer>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)