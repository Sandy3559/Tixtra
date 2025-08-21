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
      const { solutionId, ticketId, moderatorId, userId, timeToResolve } =
        event.data;

      // Fetch solution and related data
      const { solution, ticket, user, moderator } = await step.run(
        "fetch-solution-data",
        async () => {
          const [solutionDoc, ticketDoc, userDoc, moderatorDoc] =
            await Promise.all([
              Solution.findById(solutionId),
              Ticket.findById(ticketId).populate("createdBy", ["email", "_id"]),
              User.findById(userId),
              User.findById(moderatorId),
            ]);

          if (!solutionDoc) {
            throw new NonRetriableError("Solution not found");
          }

          return {
            solution: solutionDoc,
            ticket: ticketDoc,
            user: userDoc,
            moderator: moderatorDoc,
          };
        }
      );

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

Please log in to your account to view the complete solution.

If you need any additional help, don't hesitate to create a new ticket.

Thank you for using our support system!`;

          try {
            await sendMail(user.email, subject, message);
            console.log(
              `📧 Solution notification sent to user: ${user.email}`
            );
          } catch (emailError) {
            console.error(
              "❌ Failed to send solution notification:",
              emailError.message
            );
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
          timestamp: new Date().toISOString(),
        });
      });

      await step.run("update-moderator-stats", async () => {
        console.log(
          `✅ Moderator ${moderator.email} completed ticket ${ticketId} in ${timeToResolve} hours`
        );
      });

      return {
        success: true,
        solutionId,
        notificationSent: true,
        timeToResolve: `${timeToResolve} hours`,
      };
    } catch (error) {
      console.error("❌ Error in solution submission handler:", error.message);
      return { success: false, error: error.message };
    }
  }
);