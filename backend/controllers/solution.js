// backend/controllers/solution.js
import { inngest } from "../inngest/client.js";
import Solution from "../models/solution.js";
import Ticket from "../models/ticket.js";
import Rating from "../models/rating.js";
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
      followUpNotes
    } = req.body;
    
    const moderatorId = req.user._id;

    // Validate required fields
    if (!ticketId || !solution) {
      return res.status(400).json({ message: "Ticket ID and solution are required" });
    }

    // Check if ticket exists and is assigned to this moderator
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.assignedTo.toString() !== moderatorId.toString()) {
      return res.status(403).json({ message: "You are not assigned to this ticket" });
    }

    if (ticket.status === 'COMPLETED') {
      return res.status(400).json({ message: "Solution already exists for this ticket" });
    }

    // Check if solution already exists
    const existingSolution = await Solution.findOne({ ticketId });
    if (existingSolution) {
      return res.status(400).json({ message: "Solution already exists for this ticket" });
    }

    // Calculate time to resolve (in hours)
    const timeToResolve = Math.round((Date.now() - ticket.createdAt) / (1000 * 60 * 60));

    // Create solution
    const newSolution = await Solution.create({
      ticketId,
      moderatorId,
      solution,
      stepByStepGuide: stepByStepGuide || [],
      additionalResources: additionalResources || [],
      tags: tags || [],
      difficulty: difficulty || 'medium',
      moderatorNotes: moderatorNotes || '',
      followUpRequired: followUpRequired || false,
      followUpNotes: followUpNotes || '',
      timeToResolve
    });

    // Update ticket status to completed
    await Ticket.findByIdAndUpdate(ticketId, {
      status: 'COMPLETED',
      completedAt: new Date(),
      lastUpdatedBy: moderatorId,
      lastUpdatedAt: new Date(),
      solutionId: newSolution._id
    });

    // Send Inngest event
    await inngest.send({
      name: "solution/submitted",
      data: {
        solutionId: newSolution._id.toString(),
        ticketId,
        moderatorId: moderatorId.toString(),
        userId: ticket.createdBy.toString(),
        timeToResolve
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
      .populate("ticketId", ["title", "description", "createdBy", "priority", "createdAt"])
      .populate("moderatorId", ["email", "_id"]);

    if (!solution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    // Check permissions
    const ticket = solution.ticketId;
    if (user.role === 'user') {
      if (ticket.createdBy.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (user.role === 'moderator') {
      if (solution.moderatorId._id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    // Admins can see all solutions

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
          select: "email _id"
        }
      });

    if (!solution) {
      return res.status(404).json({ message: "Solution not found for this ticket" });
    }

    // Check permissions
    const ticket = solution.ticketId;
    if (user.role === 'user') {
      if (ticket.createdBy._id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else if (user.role === 'moderator') {
      if (solution.moderatorId._id.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Get rating if exists
    let userRating = null;
    if (user.role === 'user') {
      userRating = await Rating.findOne({ 
        ticketId, 
        userId: user._id 
      });
    }

    return res.status(200).json({ 
      solution,
      userRating
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
      followUpNotes
    } = req.body;
    
    const user = req.user;

    const existingSolution = await Solution.findById(id);
    if (!existingSolution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    // Only the moderator who created the solution can update it (or admin)
    if (user.role !== 'admin' && existingSolution.moderatorId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedSolution = await Solution.findByIdAndUpdate(
      id,
      {
        solution: solution || existingSolution.solution,
        stepByStepGuide: stepByStepGuide || existingSolution.stepByStepGuide,
        additionalResources: additionalResources || existingSolution.additionalResources,
        tags: tags || existingSolution.tags,
        moderatorNotes: moderatorNotes || existingSolution.moderatorNotes,
        followUpRequired: followUpRequired !== undefined ? followUpRequired : existingSolution.followUpRequired,
        followUpNotes: followUpNotes || existingSolution.followUpNotes,
        updatedAt: new Date()
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

export const rateSolution = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const {
      rating,
      feedback,
      categories,
      wouldRecommend,
      improvementSuggestions,
      isAnonymous,
      wasHelpful,
      issueResolved,
      additionalHelpNeeded,
      additionalHelpDescription
    } = req.body;

    const user = req.user;

    // Only users can rate solutions
    if (user.role !== 'user') {
      return res.status(403).json({ message: "Only users can rate solutions" });
    }

    // Get the solution
    const solution = await Solution.findOne({ ticketId })
      .populate("ticketId", ["createdBy"]);

    if (!solution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    // Check if user is the ticket creator
    if (solution.ticketId.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "You can only rate solutions for your own tickets" });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ ticketId, userId: user._id });
    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this solution" });
    }

    // Validate required fields
    if (!rating || !categories || wasHelpful === undefined || issueResolved === undefined) {
      return res.status(400).json({ message: "Missing required rating fields" });
    }

    // Create rating
    const newRating = await Rating.create({
      ticketId,
      solutionId: solution._id,
      userId: user._id,
      moderatorId: solution.moderatorId,
      rating,
      feedback: feedback || '',
      categories,
      wouldRecommend: wouldRecommend || false,
      improvementSuggestions: improvementSuggestions || '',
      isAnonymous: isAnonymous || false,
      wasHelpful,
      issueResolved,
      additionalHelpNeeded: additionalHelpNeeded || false,
      additionalHelpDescription: additionalHelpDescription || ''
    });

    // Update solution effectiveness based on rating
    let effectiveness = 'helpful';
    if (rating <= 2 || !wasHelpful) {
      effectiveness = 'not_helpful';
    } else if (rating === 3 || !issueResolved) {
      effectiveness = 'partially_helpful';
    }

    await Solution.findByIdAndUpdate(solution._id, {
      effectiveness,
      userFeedback: feedback || ''
    });

    // Send Inngest event
    await inngest.send({
      name: "solution/rated",
      data: {
        ratingId: newRating._id.toString(),
        solutionId: solution._id.toString(),
        ticketId,
        moderatorId: solution.moderatorId.toString(),
        userId: user._id.toString(),
        rating,
        wasHelpful,
        issueResolved
      },
    });

    return res.status(201).json({
      message: "Rating submitted successfully",
      rating: newRating,
    });
  } catch (error) {
    console.error("Error rating solution:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getModeratorSolutions = async (req, res) => {
  try {
    const moderatorId = req.user._id;

    const solutions = await Solution.find({ moderatorId })
      .populate("ticketId", ["title", "description", "priority", "createdAt", "createdBy"])
      .populate({
        path: "ticketId",
        populate: {
          path: "createdBy",
          select: "email"
        }
      })
      .sort({ createdAt: -1 });

    // Get ratings for these solutions
    const solutionIds = solutions.map(s => s._id);
    const ratings = await Rating.find({ 
      solutionId: { $in: solutionIds } 
    }).populate("userId", ["email"]);

    // Add ratings to solutions
    const solutionsWithRatings = solutions.map(solution => {
      const solutionRatings = ratings.filter(r => 
        r.solutionId.toString() === solution._id.toString()
      );
      
      return {
        ...solution.toObject(),
        ratings: solutionRatings,
        averageRating: solutionRatings.length > 0 
          ? (solutionRatings.reduce((sum, r) => sum + r.rating, 0) / solutionRatings.length).toFixed(1)
          : null
      };
    });

    return res.status(200).json(solutionsWithRatings);
  } catch (error) {
    console.error("Error fetching moderator solutions:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSolutionStats = async (req, res) => {
  try {
    const user = req.user;
    let matchQuery = {};

    // Moderators see only their stats
    if (user.role === 'moderator') {
      matchQuery = { moderatorId: user._id };
    }
    // Admins see all stats

    const stats = await Solution.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSolutions: { $sum: 1 },
          averageTimeToResolve: { $avg: "$timeToResolve" },
          easySolutions: { $sum: { $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0] } },
          mediumSolutions: { $sum: { $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0] } },
          hardSolutions: { $sum: { $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0] } },
          helpfulSolutions: { $sum: { $cond: [{ $eq: ["$effectiveness", "helpful"] }, 1, 0] } },
          partiallyHelpfulSolutions: { $sum: { $cond: [{ $eq: ["$effectiveness", "partially_helpful"] }, 1, 0] } },
          notHelpfulSolutions: { $sum: { $cond: [{ $eq: ["$effectiveness", "not_helpful"] }, 1, 0] } }
        }
      }
    ]);

    // Get average rating
    const ratingStats = await Rating.aggregate([
      { $match: user.role === 'moderator' ? { moderatorId: user._id } : {} },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          averageClarity: { $avg: "$categories.clarity" },
          averageHelpfulness: { $avg: "$categories.helpfulness" },
          averageCompleteness: { $avg: "$categories.completeness" },
          averageTimeliness: { $avg: "$categories.timeliness" }
        }
      }
    ]);

    const result = stats[0] || {
      totalSolutions: 0,
      averageTimeToResolve: 0,
      easySolutions: 0,
      mediumSolutions: 0,
      hardSolutions: 0,
      helpfulSolutions: 0,
      partiallyHelpfulSolutions: 0,
      notHelpfulSolutions: 0
    };

    const ratingResult = ratingStats[0] || {
      averageRating: 0,
      totalRatings: 0,
      averageClarity: 0,
      averageHelpfulness: 0,
      averageCompleteness: 0,
      averageTimeliness: 0
    };

    return res.status(200).json({
      ...result,
      ...ratingResult
    });
  } catch (error) {
    console.error("Error fetching solution stats:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};