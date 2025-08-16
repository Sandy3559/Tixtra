// backend/inngest/functions/on-solution-submitted.js
import { inngest } from "../client.js";
import Solution from "../../models/solution.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { sendMail } from "../../utils/mailer.js";
import { NonRetriableError } from "inngest";

export const onSolutionSubmitted = inngest.createFunction(
  { id: "on-solution-submitted", retries: 2 },
  { event: "solution/submitted" },
  async ({ event, step }) => {
    try {
      const { solutionId, ticketId, moderatorId, userId, timeToResolve } = event.data;

      // Fetch solution and related data
      const { solution, ticket, user, moderator } = await step.run("fetch-solution-data", async () => {
        const [solutionDoc, ticketDoc, userDoc, moderatorDoc] = await Promise.all([
          Solution.findById(solutionId),
          Ticket.findById(ticketId).populate("createdBy", ["email", "_id"]),
          User.findById(userId),
          User.findById(moderatorId)
        ]);

        if (!solutionDoc) {
          throw new NonRetriableError("Solution not found");
        }

        return {
          solution: solutionDoc,
          ticket: ticketDoc,
          user: userDoc,
          moderator: moderatorDoc
        };
      });

      // Send notification email to user
      await step.run("notify-user-solution-ready", async () => {
        if (user && user.email) {
          const subject = `Solution Ready: ${ticket.title}`;
          const message = `Hello,

Great news! A solution has been provided for your support ticket.

Ticket: ${ticket.title}
Solved by: ${moderator.email}
Solution difficulty: ${solution.difficulty}
Time to resolve: ${timeToResolve} hours

Your ticket has been marked as completed. You can now:
- View the detailed solution in your dashboard
- Rate the solution quality 
- Provide feedback to help us improve

Please log in to your account to view the complete solution and rate it.

If you need any additional help, don't hesitate to create a new ticket.

Thank you for using our support system!`;

          try {
            await sendMail(user.email, subject, message);
            console.log(`📧 Solution notification sent to user: ${user.email}`);
          } catch (emailError) {
            console.error("❌ Failed to send solution notification:", emailError.message);
          }
        }
      });

      // Log solution metrics
      await step.run("log-solution-metrics", async () => {
        console.log(`📊 Solution Metrics:`, {
          solutionId,
          ticketId,
          moderator: moderator.email,
          timeToResolve: `${timeToResolve} hours`,
          difficulty: solution.difficulty,
          stepsProvided: solution.stepByStepGuide?.length || 0,
          resourcesProvided: solution.additionalResources?.length || 0,
          timestamp: new Date().toISOString()
        });
      });

      // Update moderator performance stats (could be stored in a separate collection)
      await step.run("update-moderator-stats", async () => {
        // This could update moderator performance metrics
        // For now, we'll just log it
        console.log(`✅ Moderator ${moderator.email} completed ticket ${ticketId} in ${timeToResolve} hours`);
      });

      // Schedule rating reminder email (send after 1 hour)
      await step.run("schedule-rating-reminder", async () => {
        await inngest.send({
          name: "solution/rating-reminder",
          data: {
            solutionId,
            ticketId,
            userId,
            moderatorId,
            userEmail: user.email,
            ticketTitle: ticket.title
          },
          ts: Date.now() + (1 * 60 * 60 * 1000) // 1 hour from now
        });
        
        console.log(`⏰ Rating reminder scheduled for user: ${user.email}`);
      });

      return { 
        success: true, 
        solutionId, 
        notificationSent: true,
        timeToResolve: `${timeToResolve} hours`
      };
    } catch (error) {
      console.error("❌ Error in solution submission handler:", error.message);
      return { success: false, error: error.message };
    }
  }
);

// Rating reminder function
export const onSolutionRatingReminder = inngest.createFunction(
  { id: "on-solution-rating-reminder", retries: 1 },
  { event: "solution/rating-reminder" },
  async ({ event, step }) => {
    try {
      const { solutionId, ticketId, userId, userEmail, ticketTitle } = event.data;

      // Check if user has already rated
      const existingRating = await step.run("check-existing-rating", async () => {
        const Rating = (await import("../../models/rating.js")).default;
        return await Rating.findOne({ ticketId, userId });
      });

      if (existingRating) {
        console.log(`✅ User ${userEmail} already rated solution for ticket ${ticketId}`);
        return { success: true, alreadyRated: true };
      }

      // Send rating reminder
      await step.run("send-rating-reminder", async () => {
        const subject = `Please rate your solution: ${ticketTitle}`;
        const message = `Hello,

We hope the solution provided for your ticket "${ticketTitle}" was helpful!

Your feedback is valuable and helps us improve our service quality. It only takes a minute to rate the solution.

Please log in to your account to:
- Rate the solution quality (1-5 stars)
- Provide feedback on clarity and helpfulness
- Let us know if your issue was fully resolved

Your rating helps other users and improves our moderators' performance.

Rate your solution now: [Login to Dashboard]

Thank you for helping us improve!`;

        try {
          await sendMail(userEmail, subject, message);
          console.log(`📧 Rating reminder sent to: ${userEmail}`);
        } catch (emailError) {
          console.error("❌ Failed to send rating reminder:", emailError.message);
        }
      });

      return { success: true, reminderSent: true };
    } catch (error) {
      console.error("❌ Error in rating reminder handler:", error.message);
      return { success: false, error: error.message };
    }
  }
);