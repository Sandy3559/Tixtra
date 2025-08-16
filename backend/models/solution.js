// backend/models/solution.js
import mongoose from 'mongoose';

const solutionSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true,
        unique: true // One solution per ticket
    },
    moderatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    solution: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 5000
    },
    stepByStepGuide: [{
        stepNumber: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        codeExample: {
            type: String,
            default: ""
        },
        notes: {
            type: String,
            default: ""
        }
    }],
    additionalResources: [{
        title: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        }
    }],
    tags: [{
        type: String,
        trim: true
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    timeToResolve: {
        type: Number, // in hours
        default: null
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium"
    },
    effectiveness: {
        type: String,
        enum: ["pending", "helpful", "not_helpful", "partially_helpful"],
        default: "pending"
    },
    userFeedback: {
        type: String,
        maxlength: 1000,
        default: ""
    },
    moderatorNotes: {
        type: String,
        maxlength: 1000,
        default: ""
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpNotes: {
        type: String,
        maxlength: 500,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
solutionSchema.index({ ticketId: 1 });
solutionSchema.index({ moderatorId: 1 });
solutionSchema.index({ createdAt: -1 });
solutionSchema.index({ effectiveness: 1 });
solutionSchema.index({ isVerified: 1 });

// Virtual for solution age
solutionSchema.virtual('ageInDays').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update updatedAt
solutionSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.updatedAt = Date.now();
    }
    next();
});

// Pre-findOneAndUpdate middleware
solutionSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

export default mongoose.model("Solution", solutionSchema);