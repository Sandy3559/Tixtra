import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { sendMail } from "../../utils/mailer.js";
import { NonRetriableError } from "inngest";

export const onTicketStatusUpdated = inngest.createFunction(
  { id: "on-ticket-status-updated", retries: 2 },
  { event: "ticket/status-updated" },
  async ({ event, step }) => {
    try {
      const { ticketId, oldStatus, newStatus, updatedBy, updatedByEmail } = event.data;

      // Fetch ticket details
      const ticket = await step.run("fetch-ticket-details", async () => {
        const ticketData = await Ticket.findById(ticketId)
          .populate("createdBy", ["email", "_id"])
          .populate("assignedTo", ["email", "_id"]);
        
        if (!ticketData) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketData;
      });

      // Send notification to ticket creator
      await step.run("notify-ticket-creator", async () => {
        if (ticket.createdBy && ticket.createdBy.email) {
          const statusMessages = {
            'TODO': 'pending review',
            'IN_PROGRESS': 'being worked on',
            'COMPLETED': 'resolved and completed'
          };

          const subject = `Ticket Status Update: ${ticket.title}`;
          const message = `Hello,

Your support ticket has been updated:

Ticket: ${ticket.title}
Status: ${statusMessages[newStatus] || newStatus}
Updated by: ${updatedByEmail}

${newStatus === 'COMPLETED' ? 
  'Your issue has been resolved. If you need further assistance, please create a new ticket.' :
  'You can view the full details by logging into your account.'
}

Thank you for using our support system!`;

          try {
            await sendMail(ticket.createdBy.email, subject, message);
            console.log(`📧 Status update notification sent to: ${ticket.createdBy.email}`);
          } catch (emailError) {
            console.error("❌ Failed to send status update email:", emailError.message);
            // Don't fail the entire process for email errors
          }
        }
      });

      // Send notification to assigned moderator/admin (if different from updater)
      await step.run("notify-assigned-user", async () => {
        if (ticket.assignedTo && 
            ticket.assignedTo.email && 
            ticket.assignedTo._id.toString() !== updatedBy) {
          
          const subject = `Ticket Status Changed: ${ticket.title}`;
          const message = `Hello,

A ticket assigned to you has been updated:

Ticket: ${ticket.title}
Status: ${oldStatus} → ${newStatus}
Updated by: ${updatedByEmail}

Please review the ticket for any additional actions needed.

View ticket details in the admin panel.`;

          try {
            await sendMail(ticket.assignedTo.email, subject, message);
            console.log(`📧 Status update notification sent to assigned user: ${ticket.assignedTo.email}`);
          } catch (emailError) {
            console.error("❌ Failed to send status update email to assigned user:", emailError.message);
          }
        }
      });

      // Log analytics/metrics
      await step.run("log-status-change-analytics", async () => {
        console.log(`📊 Ticket Status Analytics:`, {
          ticketId,
          oldStatus,
          newStatus,
          updatedBy: updatedByEmail,
          timestamp: new Date().toISOString(),
          ticketAge: ticket.ageInDays
        });
      });

      return { success: true, ticketId, statusChange: `${oldStatus} → ${newStatus}` };
    } catch (error) {
      console.error("❌ Error in ticket status update handler:", error.message);
      return { success: false, error: error.message };
    }
  }
);

export const onTicketReassigned = inngest.createFunction(
  { id: "on-ticket-reassigned", retries: 2 },
  { event: "ticket/reassigned" },
  async ({ event, step }) => {
    try {
      const { ticketId, oldAssignee, newAssignee, reassignedBy } = event.data;

      // Fetch ticket and user details
      const { ticket, oldUser, newUser } = await step.run("fetch-reassignment-details", async () => {
        const ticketData = await Ticket.findById(ticketId)
          .populate("createdBy", ["email", "_id"]);
        
        if (!ticketData) {
          throw new NonRetriableError("Ticket not found");
        }

        const [oldUserData, newUserData] = await Promise.all([
          oldAssignee ? User.findById(oldAssignee).select("email") : null,
          newAssignee ? User.findById(newAssignee).select("email") : null
        ]);

        return { 
          ticket: ticketData, 
          oldUser: oldUserData, 
          newUser: newUserData 
        };
      });

      // Notify old assignee
      if (oldUser) {
        await step.run("notify-old-assignee", async () => {
          const subject = `Ticket Reassigned: ${ticket.title}`;
          const message = `Hello,

A ticket previously assigned to you has been reassigned:

Ticket: ${ticket.title}
Status: No longer assigned to you
Reassigned by: Admin

You are no longer responsible for this ticket.`;

          try {
            await sendMail(oldUser.email, subject, message);
            console.log(`📧 Reassignment notification sent to previous assignee: ${oldUser.email}`);
          } catch (emailError) {
            console.error("❌ Failed to send reassignment email to old assignee:", emailError.message);
          }
        });
      }

      // Notify new assignee
      if (newUser) {
        await step.run("notify-new-assignee", async () => {
          const subject = `New Ticket Assigned: ${ticket.title}`;
          const message = `Hello,

A new support ticket has been assigned to you:

Ticket: ${ticket.title}
Priority: ${ticket.priority || 'Medium'}
Skills Required: ${ticket.relatedSkills?.join(', ') || 'General Support'}

${ticket.helpfulNotes ? `AI Analysis: ${ticket.helpfulNotes.substring(0, 200)}...` : ''}

Please log in to the admin panel to view full details and start working on this ticket.`;

          try {
            await sendMail(newUser.email, subject, message);
            console.log(`📧 Assignment notification sent to new assignee: ${newUser.email}`);
          } catch (emailError) {
            console.error("❌ Failed to send assignment email to new assignee:", emailError.message);
          }
        });
      }

      return { success: true, ticketId, reassignment: `${oldUser?.email || 'unassigned'} → ${newUser?.email || 'unassigned'}` };
    } catch (error) {
      console.error("❌ Error in ticket reassignment handler:", error.message);
      return { success: false, error: error.message };
    }
  }
);