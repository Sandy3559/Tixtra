import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { 
  createTicket, 
  getTicket, 
  getTickets,
  updateTicketStatus,
  reassignTicket,
  updateTicketPriority,
  getTicketStats
} from "../controllers/ticket.js";

const router = express.Router();

// Get all tickets for the user
router.get("/", authenticate, getTickets);

// Get ticket statistics
router.get("/stats", authenticate, getTicketStats);

// Get specific ticket by ID
router.get("/:id", authenticate, getTicket);

// Create new ticket
router.post("/", authenticate, createTicket);

// Update ticket status (moderators/admins only)
router.patch("/:id/status", authenticate, updateTicketStatus);

// Reassign ticket (admins only)
router.patch("/:id/assign", authenticate, reassignTicket);

// Update ticket priority (moderators/admins only)
router.patch("/:id/priority", authenticate, updateTicketPriority);

export default router;