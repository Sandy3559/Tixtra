// backend/inngest/functions/on-solution-rated.js
import { inngest } from "../client.js";
import Rating from "../../models/rating.js";
import Solution from "../../models/solution.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { sendMail } from "../../utils/mailer.js";
import { NonRetriableError } from "inngest";

export const onSolutionRated = inngest.createFunction(
  { id: "on-solution-rated", retries: 2 },
  { event: "solution/rated" },
  async ({ event, step }) => {
    try {
      const { 
        ratingId, 
        solutionId, 
        ticketId, 
        moderatorId, 
        userId, 
        rating,
        wasHelpful,
        issueResolved
      } = event.data;

      // Fetch rating and related data
      const { ratingDoc, solution, ticket, moderator, user } = await step.run("fetch-rating-data", async () => {
        const [ratingData, solutionData, ticketData, moderatorData, userData] = await Promise.all([
          Rating.findById(ratingId),
          Solution.findById(solutionId),
          Ticket.findById(ticketId),
          User.findById(moderatorId),
          User.findById(userId)
        ]);

        if (!ratingData) {
          throw new NonRetriableError("Rating not found");
        }

        return {
          ratingDoc: ratingData,
          solution: solutionData,
          ticket: ticketData,
          moderator: moderatorData,
          user: userData
        };
      });

      // Update ticket with rating information
      await step.run("update-ticket-rating", async () => {
        await Ticket.findByIdAndUpdate(ticketId, {
          satisfactionRating: rating,
          isRated: true,
          ratingId: ratingId,
          needsFollowUp: !issueResolved || ratingDoc.additionalHelpNeeded
        });
        
        console.log(`✅ Ticket ${ticketId} updated with rating: ${rating}/5`);
      });

      // Send thank you email to user
      await step.run("send-thank-you-to-user", async () => {
        if (user && user.email) {
          const subject = `Thank you for rating our solution!`;
          const message = `Hello,

Thank you for taking the time to rate the solution for your ticket "${ticket.title}".

Your rating: ${rating}/5 stars
Was helpful: ${wasHelpful ? 'Yes' : 'No'}
Issue resolved: ${issueResolved ? 'Yes' : 'No'}

Your feedback helps us:
- Improve our service quality
- Train our moderators better
- Help other users find quality solutions

${ratingDoc.additionalHelpNeeded ? 
  `We've noted that you need additional help. Our team will review your request and may reach out to you soon.` :
  `We're glad we could help resolve your issue!`
}

${ratingDoc.feedback ? `Your feedback: "${ratingDoc.feedback}"` : ''}

Thank you for being a valued user of our support system!`;

          try {
            await sendMail(user.email, subject, message);
            console.log(`📧 Thank you email sent to user: ${user.email}`);
          } catch (emailError) {
            console.error("❌ Failed to send thank you email:", emailError.message);
          }
        }
      });

      // Send rating notification to moderator
      await step.run("notify-moderator-of-rating", async () => {
        if (moderator && moderator.email) {
          const ratingText = ['', 'Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'][rating];
          const subject = `Your solution has been rated: ${rating}/5 stars`;
          const message = `Hello ${moderator.email},

Great news! The user has rated your solution for ticket "${ticket.title}".

Rating Details:
- Overall Rating: ${rating}/5 stars (${ratingText})
- Was Helpful: ${wasHelpful ? 'Yes' : 'No'}
- Issue Resolved: ${issueResolved ? 'Yes' : 'No'}
- Would Recommend: ${ratingDoc.wouldRecommend ? 'Yes' : 'No'}

Category Ratings:
- Clarity: ${ratingDoc.categories.clarity}/5
- Helpfulness: ${ratingDoc.categories.helpfulness}/5  
- Completeness: ${ratingDoc.categories.completeness}/5
- Timeliness: ${ratingDoc.categories.timeliness}/5

${ratingDoc.feedback && !ratingDoc.isAnonymous ? 
  `User Feedback: "${ratingDoc.feedback}"` : 
  ratingDoc.feedback && ratingDoc.isAnonymous ?
  `Anonymous Feedback: "${ratingDoc.feedback}"` :
  'No additional feedback provided.'
}

${ratingDoc.improvementSuggestions ? 
  `Improvement Suggestions: "${ratingDoc.improvementSuggestions}"` : 
  ''
}

${ratingDoc.additionalHelpNeeded ? 
  `Note: The user has requested additional help with this issue.` : 
  ''
}

Keep up the great work! Your contributions help make our support system better.

View more details in your moderator dashboard.`;

          try {
            await sendMail(moderator.email, subject, message);
            console.log(`📧 Rating notification sent to moderator: ${moderator.email}`);
          } catch (emailError) {
            console.error("❌ Failed to send moderator notification:", emailError.message);
          }
        }
      });

      // Handle low ratings or additional help requests
      await step.run("handle-low-rating-or-help-request", async () => {
        if (rating <= 2 || !wasHelpful || !issueResolved || ratingDoc.additionalHelpNeeded) {
          // Send alert to admin about poor rating or help request
          const adminUsers = await User.find({ role: 'admin' }).select('email');
          
          if (adminUsers.length > 0) {
            const subject = `Action Required: ${rating <= 2 ? 'Low Rating' : 'Additional Help'} - Ticket ${ticketId}`;
            const message = `Admin Alert,

A ticket requires attention:

Ticket: ${ticket.title}
Moderator: ${moderator.email}
User: ${user.email}
Rating: ${rating}/5 stars

Issues:
${rating <= 2 ? '- Low rating received' : ''}
${!wasHelpful ? '- Solution marked as not helpful' : ''}
${!issueResolved ? '- Issue not resolved' : ''}
${ratingDoc.additionalHelpNeeded ? '- User requested additional help' : ''}

${ratingDoc.additionalHelpDescription ? 
  `Additional help needed: "${ratingDoc.additionalHelpDescription}"` : 
  ''
}

Please review this ticket and consider:
- Following up with the user
- Providing additional guidance to the moderator
- Escalating if necessary

View full details in the admin dashboard.`;

            for (const admin of adminUsers) {
              try {
                await sendMail(admin.email, subject, message);
                console.log(`📧 Admin alert sent to: ${admin.email}`);
              } catch (emailError) {
                console.error("❌ Failed to send admin alert:", emailError.message);
              }
            }
          }

          // Create follow-up task or flag for review
          console.log(`🚨 Ticket ${ticketId} flagged for review: Rating ${rating}/5, Resolved: ${issueResolved}`);
        }
      });

      // Log rating analytics
      await step.run("log-rating-analytics", async () => {
        console.log(`📊 Rating Analytics:`, {
          ratingId,
          solutionId,
          ticketId,
          moderator: moderator.email,
          rating,
          wasHelpful,
          issueResolved,
          wouldRecommend: ratingDoc.wouldRecommend,
          categoryAverage: ratingDoc.categoryAverage,
          additionalHelpNeeded: ratingDoc.additionalHelpNeeded,
          timestamp: new Date().toISOString()
        });
      });

      return { 
        success: true, 
        ratingProcessed: true,
        rating,
        followUpRequired: !issueResolved || ratingDoc.additionalHelpNeeded
      };
    } catch (error) {
      console.error("❌ Error in rating handler:", error.message);
      return { success: false, error: error.message };
    }
  }
);