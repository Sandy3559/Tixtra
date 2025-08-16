import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { 
  createTicket, 
  getTicket, 
  getTickets,
  updateTicketStatus,
  reassignTicket,
  updateTicketPriority,
  getTicketStats,
  getAssignedTickets,
  addTicketComment,
  getTicketComments,
  getModeratorStats,
  getAdminDashboardData
} from "../controllers/ticket.js";

const router = express.Router();

// Admin routes
router.get("/admin/dashboard", authenticate, getAdminDashboardData);

// Moderator routes
router.get("/moderator/stats", authenticate, getModeratorStats);
router.get("/assigned", authenticate, getAssignedTickets);

// Get all tickets for the user
router.get("/", authenticate, getTickets);

// Get ticket statistics
router.get("/stats", authenticate, getTicketStats);

// Get specific ticket by ID
router.get("/:id", authenticate, getTicket);

// Get comments for a specific ticket
router.get("/:id/comments", authenticate, getTicketComments);

// Create new ticket
router.post("/", authenticate, createTicket);

// Add comment to a ticket
router.post("/:id/comments", authenticate, addTicketComment);

// Update ticket status (moderators/admins only)
router.patch("/:id/status", authenticate, updateTicketStatus);

// Reassign ticket (admins only)
router.patch("/:id/assign", authenticate, reassignTicket);

// Update ticket priority (moderators/admins only)
router.patch("/:id/priority", authenticate, updateTicketPriority);

export default router;