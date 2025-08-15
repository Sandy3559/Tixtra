import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CheckAuth from './components/check-auth.jsx'
import Tickets from './pages/tickets.jsx'
import TicketDetailsPage from './pages/ticket.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import Admin from './pages/admin.jsx'
import Navbar from './components/navbar.jsx'
import ErrorBoundary from './components/error-boundary.jsx'
import NotFound from './pages/not-found.jsx'

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
  // You could show a toast notification here
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <div className="min-h-screen bg-base-200">
          <Navbar />
          <ToastContainer />
          <main className="pb-4">
            <Routes>
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
              
              <Route
                path='/admin'
                element={
                  <CheckAuth protected={true}>
                    <Admin />
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
  </StrictMode>,
)