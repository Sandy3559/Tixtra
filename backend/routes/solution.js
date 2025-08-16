// backend/routes/solution.js
import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { 
  createSolution,
  getSolution,
  getSolutionByTicket,
  updateSolution,
  rateSolution,
  getModeratorSolutions,
  getSolutionStats
} from "../controllers/solution.js";

const router = express.Router();

// Get solution statistics (moderators see their own, admins see all)
router.get("/stats", authenticate, getSolutionStats);

// Get all solutions by a moderator
router.get("/moderator", authenticate, getModeratorSolutions);

// Get solution by ticket ID
router.get("/ticket/:ticketId", authenticate, getSolutionByTicket);

// Get specific solution by ID
router.get("/:id", authenticate, getSolution);

// Create new solution (moderators only)
router.post("/", authenticate, createSolution);

// Update solution (moderator who created it or admin)
router.patch("/:id", authenticate, updateSolution);

// Rate a solution (users only)
router.post("/ticket/:ticketId/rate", authenticate, rateSolution);

export default router;