import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // Fetch ticket from DB
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      // Update initial status
      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      // AI processing - moved outside of step to avoid nesting
      console.log(`🤖 Starting AI analysis for ticket: ${ticket._id}`);

      let aiResponse = null;
      try {
        aiResponse = await analyzeTicket(ticket);
      } catch (error) {
        console.error("❌ AI processing error:", error.message);
        aiResponse = null;
      }

      // Update ticket with AI analysis results
      const relatedskills = await step.run(
        "update-with-ai-results",
        async () => {
          if (aiResponse) {
            console.log("✅ AI analysis successful:", aiResponse);

            await Ticket.findByIdAndUpdate(ticket._id, {
              priority: aiResponse.priority || "medium",
              helpfulNotes: aiResponse.helpfulNotes || "AI analysis pending",
              status: "IN_PROGRESS",
              relatedSkills: aiResponse.relatedSkills || ["General Support"],
            });

            return aiResponse.relatedSkills || ["General Support"];
          } else {
            console.log("⚠️ AI analysis failed, using defaults");

            // Update with default values if AI fails
            await Ticket.findByIdAndUpdate(ticket._id, {
              priority: "medium",
              helpfulNotes: "Manual review required - AI analysis unavailable",
              status: "IN_PROGRESS",
              relatedSkills: ["General Support"],
            });

            return ["General Support"];
          }
        }
      );

      // Assign moderator based on skills
      const moderator = await step.run("assign-moderator", async () => {
        console.log(
          `🔍 Looking for moderator with skills: ${relatedskills.join(", ")}`
        );

        // Only search by skills if we have specific skills
        let user = null;

        if (
          relatedskills.length > 0 &&
          !relatedskills.includes("General Support")
        ) {
          user = await User.findOne({
            role: "moderator",
            skills: {
              $elemMatch: {
                $regex: relatedskills.join("|"),
                $options: "i",
              },
            },
          });
        }

        // Fallback to any moderator
        if (!user) {
          user = await User.findOne({ role: "moderator" });
        }

        // Final fallback to admin
        if (!user) {
          console.log("⚠️ No moderator found, assigning to admin");
          user = await User.findOne({ role: "admin" });
        }

        if (user) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            assignedTo: user._id,
          });
          console.log(`✅ Ticket assigned to: ${user.email}`);
        } else {
          console.log("⚠️ No suitable user found for assignment");
        }

        return user;
      });

      // Send notification email
      await step.run("send-email-notification", async () => {
        if (moderator) {
          try {
            const finalTicket = await Ticket.findById(ticket._id);
            await sendMail(
              moderator.email,
              "New Ticket Assigned",
              `A new support ticket has been assigned to you.
              
Title: ${finalTicket.title}
Priority: ${finalTicket.priority || "Medium"}
Skills Required: ${finalTicket.relatedSkills?.join(", ") || "General Support"}

Please log in to the system to view full details.`
            );
            console.log(`📧 Notification sent to: ${moderator.email}`);
          } catch (emailError) {
            console.error("❌ Email sending failed:", emailError.message);
          }
        }
      });

      console.log(
        `✅ Ticket processing completed successfully for: ${ticket._id}`
      );
      return { success: true };
    } catch (err) {
      console.error("❌ Error in ticket processing:", err.message);
      return { success: false, error: err.message };
    }
  }
);
