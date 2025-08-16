import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";
import User from "../models/user.js"; 

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: (await newTicket)._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });
    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];
    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .populate("createdBy", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status priority createdAt relatedSkills")
        .sort({ createdAt: -1 });
    }
    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id)
        .populate("assignedTo", ["email", "_id"])
        .populate("createdBy", ["email", "_id"]);
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).select("title description status priority createdAt relatedSkills helpfulNotes");
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    // Only moderators and admins can update status
    if (user.role === "user") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    // Validate status
    const validStatuses = ["TODO", "IN_PROGRESS", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be one of: TODO, IN_PROGRESS, COMPLETED" 
      });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update the ticket status
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { 
        status,
        lastUpdatedBy: user._id,
        lastUpdatedAt: new Date()
      },
      { new: true }
    ).populate("assignedTo", ["email", "_id"])
     .populate("createdBy", ["email", "_id"]);

    // Send event for status update
    await inngest.send({
      name: "ticket/status-updated",
      data: {
        ticketId: id,
        oldStatus: ticket.status,
        newStatus: status,
        updatedBy: user._id.toString(),
        updatedByEmail: user.email
      },
    });

    return res.status(200).json({ 
      message: "Ticket status updated successfully", 
      ticket: updatedTicket 
    });
  } catch (error) {
    console.error("Error updating ticket status", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const reassignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const user = req.user;

    // Only admins can reassign tickets
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can reassign tickets" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { 
        assignedTo: assignedTo || null,
        lastUpdatedBy: user._id,
        lastUpdatedAt: new Date()
      },
      { new: true }
    ).populate("assignedTo", ["email", "_id"])
     .populate("createdBy", ["email", "_id"]);

    // Send event for reassignment
    await inngest.send({
      name: "ticket/reassigned",
      data: {
        ticketId: id,
        oldAssignee: ticket.assignedTo?.toString(),
        newAssignee: assignedTo,
        reassignedBy: user._id.toString()
      },
    });

    return res.status(200).json({ 
      message: "Ticket reassigned successfully", 
      ticket: updatedTicket 
    });
  } catch (error) {
    console.error("Error reassigning ticket", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTicketPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    const user = req.user;

    // Only moderators and admins can update priority
    if (user.role === "user") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority?.toLowerCase())) {
      return res.status(400).json({ 
        message: "Invalid priority. Must be one of: low, medium, high" 
      });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { 
        priority: priority.toLowerCase(),
        lastUpdatedBy: user._id,
        lastUpdatedAt: new Date()
      },
      { new: true }
    ).populate("assignedTo", ["email", "_id"])
     .populate("createdBy", ["email", "_id"]);

    return res.status(200).json({ 
      message: "Ticket priority updated successfully", 
      ticket: updatedTicket 
    });
  } catch (error) {
    console.error("Error updating ticket priority", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicketStats = async (req, res) => {
  try {
    const user = req.user;
    let matchQuery = {};

    // Regular users can only see their own tickets
    if (user.role === "user") {
      matchQuery = { createdBy: user._id };
    }

    const stats = await Ticket.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ["$status", "TODO"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      todo: 0,
      inProgress: 0,
      completed: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching ticket stats", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAssignedTickets = async (req, res) => {
  try {
    const user = req.user;
    
    // Only moderators can access this endpoint
    if (user.role !== 'moderator') {
      return res.status(403).json({ message: "Access denied" });
    }

    const tickets = await Ticket.find({ 
      assignedTo: user._id 
    })
    .populate("createdBy", ["email", "_id"])
    .populate("assignedTo", ["email", "_id"])
    .sort({ createdAt: -1 });

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching assigned tickets", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addTicketComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, isInternal } = req.body;
    const user = req.user;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check permissions
    const canComment = 
      user.role === 'admin' ||
      (user.role === 'moderator' && ticket.assignedTo && ticket.assignedTo.toString() === user._id.toString()) ||
      (user.role === 'user' && ticket.createdBy.toString() === user._id.toString());

    if (!canComment) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Add comment
    ticket.comments.push({
      text: text.trim(),
      author: user._id,
      isInternal: isInternal || false,
      createdAt: new Date()
    });

    // Set first response time if this is the first moderator/admin response
    if (!ticket.firstResponseAt && (user.role === 'moderator' || user.role === 'admin')) {
      ticket.firstResponseAt = new Date();
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(id)
      .populate("createdBy", ["email", "_id"])
      .populate("assignedTo", ["email", "_id"])
      .populate("comments.author", ["email", "_id"]);

    // Send notification
    await inngest.send({
      name: "ticket/comment-added",
      data: {
        ticketId: id,
        commentAuthor: user._id.toString(),
        commentAuthorEmail: user.email,
        commentText: text.trim(),
        isInternal: isInternal || false,
        ticketCreator: ticket.createdBy.toString()
      },
    });

    return res.status(200).json({
      message: "Comment added successfully",
      ticket: updatedTicket
    });
  } catch (error) {
    console.error("Error adding comment", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicketComments = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const ticket = await Ticket.findById(id)
      .populate("comments.author", ["email", "_id", "role"])
      .select("comments createdBy assignedTo");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check permissions
    const canView = 
      user.role === 'admin' ||
      (user.role === 'moderator' && ticket.assignedTo && ticket.assignedTo.toString() === user._id.toString()) ||
      (user.role === 'user' && ticket.createdBy.toString() === user._id.toString());

    if (!canView) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Filter comments based on user role
    let comments = ticket.comments;
    if (user.role === 'user') {
      // Users can't see internal comments
      comments = comments.filter(comment => !comment.isInternal);
    }

    return res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getModeratorStats = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'moderator') {
      return res.status(403).json({ message: "Access denied" });
    }

    const stats = await Ticket.aggregate([
      { $match: { assignedTo: user._id } },
      {
        $group: {
          _id: null,
          totalAssigned: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "TODO"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $eq: ["$escalated", true] }, 1, 0] } },
          avgCompletionTime: { 
            $avg: { 
              $cond: [
                { $ne: ["$completedAt", null] },
                { $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60 * 60 * 24] },
                null
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalAssigned: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
      escalated: 0,
      avgCompletionTime: 0
    };

    // Get recent activity
    const recentTickets = await Ticket.find({ 
      assignedTo: user._id 
    })
    .populate("createdBy", ["email", "_id"])
    .sort({ lastUpdatedAt: -1 })
    .limit(5)
    .select("title status priority lastUpdatedAt createdAt");

    return res.status(200).json({
      stats: result,
      recentActivity: recentTickets
    });
  } catch (error) {
    console.error("Error fetching moderator stats", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAdminDashboardData = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get ticket statistics
    const ticketStats = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "TODO"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          escalated: { $sum: { $cond: [{ $eq: ["$escalated", true] }, 1, 0] } },
          unassigned: { $sum: { $cond: [{ $eq: ["$assignedTo", null] }, 1, 0] } },
          avgResponseTime: {
            $avg: {
              $cond: [
                { $ne: ["$firstResponseAt", null] },
                { $divide: [{ $subtract: ["$firstResponseAt", "$createdAt"] }, 1000 * 60 * 60] },
                null
              ]
            }
          },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $ne: ["$completedAt", null] },
                { $divide: [{ $subtract: ["$completedAt", "$createdAt"] }, 1000 * 60 * 60 * 24] },
                null
              ]
            }
          }
        }
      }
    ]);

    // Get moderator performance
    const moderatorStats = await User.aggregate([
        { $match: { role: 'moderator' } },
        {
            $lookup: {
                from: "tickets",
                localField: "_id",
                foreignField: "assignedTo",
                as: "assignedTickets"
            }
        },
        {
            $lookup: {
                from: "ratings",
                localField: "_id",
                foreignField: "moderatorId",
                as: "ratings"
            }
        },
        {
            $project: {
                moderatorId: "$_id",
                moderatorEmail: "$email",
                totalAssigned: { $size: "$assignedTickets" },
                completed: {
                    $size: {
                        $filter: {
                            input: "$assignedTickets",
                            as: "ticket",
                            cond: { $eq: ["$$ticket.status", "COMPLETED"] }
                        }
                    }
                },
                averageRating: { $avg: "$ratings.rating" },
                totalRatings: { $size: "$ratings" }
            }
        },
        { $sort: { totalAssigned: -1 } }
    ]);


    // Get recent tickets
    const recentTickets = await Ticket.find()
      .populate("createdBy", ["email", "_id"])
      .populate("assignedTo", ["email", "_id"])
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority createdAt assignedTo escalated");

    const ticketStatsResult = ticketStats[0] || { totalTickets: 0, pending: 0, inProgress: 0, completed: 0, highPriority: 0, escalated: 0, unassigned: 0, avgResponseTime: 0, avgResolutionTime: 0 };

    return res.status(200).json({
      ticketStats: ticketStatsResult,
      moderatorStats,
      recentTickets,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};