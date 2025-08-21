import { inngest } from "../inngest/client.js";
import Solution from "../models/solution.js";
import Ticket from "../models/ticket.js";
import User from "../models/user.js";

export const createSolution = async (req, res) => {
  try {
    const {
      ticketId,
      solution,
      stepByStepGuide,
      additionalResources,
      tags,
      difficulty,
      moderatorNotes,
      followUpRequired,
      followUpNotes,
    } = req.body;

    const moderatorId = req.user._id;

    if (!ticketId || !solution) {
      return res
        .status(400)
        .json({ message: "Ticket ID and solution are required" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.assignedTo.toString() !== moderatorId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not assigned to this ticket" });
    }

    if (ticket.status === "COMPLETED") {
      return res
        .status(400)
        .json({ message: "Solution already exists for this ticket" });
    }

    const existingSolution = await Solution.findOne({ ticketId });
    if (existingSolution) {
      return res
        .status(400)
        .json({ message: "Solution already exists for this ticket" });
    }

    const timeToResolve = Math.round(
      (Date.now() - ticket.createdAt) / (1000 * 60 * 60)
    );

    const newSolution = await Solution.create({
      ticketId,
      moderatorId,
      solution,
      stepByStepGuide: stepByStepGuide || [],
      additionalResources: additionalResources || [],
      tags: tags || [],
      difficulty: difficulty || "medium",
      moderatorNotes: moderatorNotes || "",
      followUpRequired: followUpRequired || false,
      followUpNotes: followUpNotes || "",
      timeToResolve,
    });

    await Ticket.findByIdAndUpdate(ticketId, {
      status: "COMPLETED",
      completedAt: new Date(),
      lastUpdatedBy: moderatorId,
      lastUpdatedAt: new Date(),
      solution: newSolution._id,
    });

    await inngest.send({
      name: "solution/submitted",
      data: {
        solutionId: newSolution._id.toString(),
        ticketId,
        moderatorId: moderatorId.toString(),
        userId: ticket.createdBy.toString(),
        timeToResolve,
      },
    });

    return res.status(201).json({
      message: "Solution submitted successfully",
      solution: newSolution,
    });
  } catch (error) {
    console.error("Error creating solution:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const solution = await Solution.findById(id)
      .populate("ticketId", [
        "title",
        "description",
        "createdBy",
        "priority",
        "createdAt",
      ])
      .populate("moderatorId", ["email", "_id"]);

    if (!solution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    const ticket = solution.ticketId;
    if (user.role === "user") {
      if (ticket.createdBy.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (user.role === "moderator") {
      if (solution.moderatorId._id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    return res.status(200).json({ solution });
  } catch (error) {
    console.error("Error fetching solution:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSolutionByTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const user = req.user;

    const solution = await Solution.findOne({ ticketId })
      .populate("moderatorId", ["email", "_id", "skills"])
      .populate({
        path: "ticketId",
        select: "title description createdBy priority createdAt",
        populate: {
          path: "createdBy",
          select: "email _id",
        },
      });

    if (!solution) {
      return res
        .status(404)
        .json({ message: "Solution not found for this ticket" });
    }

    const ticket = solution.ticketId;
    if (user.role === "user") {
      if (ticket.createdBy._id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (user.role === "moderator") {
      if (solution.moderatorId._id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    return res.status(200).json({
      solution,
    });
  } catch (error) {
    console.error("Error fetching solution by ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      solution,
      stepByStepGuide,
      additionalResources,
      tags,
      moderatorNotes,
      followUpRequired,
      followUpNotes,
    } = req.body;

    const user = req.user;

    const existingSolution = await Solution.findById(id);
    if (!existingSolution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    if (
      user.role !== "admin" &&
      existingSolution.moderatorId.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedSolution = await Solution.findByIdAndUpdate(
      id,
      {
        solution: solution || existingSolution.solution,
        stepByStepGuide: stepByStepGuide || existingSolution.stepByStepGuide,
        additionalResources:
          additionalResources || existingSolution.additionalResources,
        tags: tags || existingSolution.tags,
        moderatorNotes: moderatorNotes || existingSolution.moderatorNotes,
        followUpRequired:
          followUpRequired !== undefined
            ? followUpRequired
            : existingSolution.followUpRequired,
        followUpNotes: followUpNotes || existingSolution.followUpNotes,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("moderatorId", ["email", "_id"]);

    return res.status(200).json({
      message: "Solution updated successfully",
      solution: updatedSolution,
    });
  } catch (error) {
    console.error("Error updating solution:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getModeratorSolutions = async (req, res) => {
  try {
    const moderatorId = req.user._id;

    const solutions = await Solution.find({ moderatorId })
      .populate("ticketId", [
        "title",
        "description",
        "priority",
        "createdAt",
        "createdBy",
      ])
      .populate({
        path: "ticketId",
        populate: {
          path: "createdBy",
          select: "email",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(solutions);
  } catch (error) {
    console.error("Error fetching moderator solutions:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};