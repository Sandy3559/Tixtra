// backend/models/rating.js
import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true
    },
    solutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Solution",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    moderatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    categories: {
        clarity: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        helpfulness: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        completeness: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        timeliness: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        }
    },
    wouldRecommend: {
        type: Boolean,
        default: false
    },
    improvementSuggestions: {
        type: String,
        trim: true,
        maxlength: 500
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    wasHelpful: {
        type: Boolean,
        required: true
    },
    issueResolved: {
        type: Boolean,
        required: true
    },
    additionalHelpNeeded: {
        type: Boolean,
        default: false
    },
    additionalHelpDescription: {
        type: String,
        trim: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index to ensure one rating per user per solution
ratingSchema.index({ ticketId: 1, userId: 1 }, { unique: true });
ratingSchema.index({ solutionId: 1 });
ratingSchema.index({ moderatorId: 1 });
ratingSchema.index({ rating: 1 });
ratingSchema.index({ createdAt: -1 });

// Virtual for overall category average
ratingSchema.virtual('categoryAverage').get(function() {
    const { clarity, helpfulness, completeness, timeliness } = this.categories;
    return ((clarity + helpfulness + completeness + timeliness) / 4).toFixed(1);
});

export default mongoose.model("Rating", ratingSchema);