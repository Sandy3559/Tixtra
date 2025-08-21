import express from "express";
import { authenticate } from "../middlewares/auth.js";
import {
  createSolution,
  getSolution,
  getSolutionByTicket,
  updateSolution,
  getModeratorSolutions,
} from "../controllers/solution.js";

const router = express.Router();

router.get("/moderator", authenticate, getModeratorSolutions);

router.get("/ticket/:ticketId", authenticate, getSolutionByTicket);

router.get("/:id", authenticate, getSolution);

router.post("/", authenticate, createSolution);

router.patch("/:id", authenticate, updateSolution);

export default router;