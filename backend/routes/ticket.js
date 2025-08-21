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

router.get("/admin/dashboard", authenticate, getAdminDashboardData);

router.get("/moderator/stats", authenticate, getModeratorStats);
router.get("/assigned", authenticate, getAssignedTickets);

router.get("/", authenticate, getTickets);

router.get("/stats", authenticate, getTicketStats);

router.get("/:id", authenticate, getTicket);

router.get("/:id/comments", authenticate, getTicketComments);

router.post("/", authenticate, createTicket);

router.post("/:id/comments", authenticate, addTicketComment);

router.patch("/:id/status", authenticate, updateTicketStatus);

router.patch("/:id/assign", authenticate, reassignTicket);

router.patch("/:id/priority", authenticate, updateTicketPriority);

export default router;