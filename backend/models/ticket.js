import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 200
    },
    description: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 2000
    },
    status: { 
        type: String, 
        default: "TODO",
        enum: ["TODO", "IN_PROGRESS", "COMPLETED"]
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    deadline: {
        type: Date,
        default: null
    },
    helpfulNotes: {
        type: String,
        default: ""
    },
    relatedSkills: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    estimatedHours: {
        type: Number,
        min: 0,
        default: null
    },
    actualHours: {
        type: Number,
        min: 0,
        default: null
    },
    attachments: [{
        filename: String,
        url: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        isInternal: {
            type: Boolean,
            default: false
        }
    }],
    resolutionNotes: {
        type: String,
        default: ""
    },
    satisfactionRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
ticketSchema.index({ createdBy: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ createdAt: -1 });

// Virtual for ticket age in days
ticketSchema.virtual('ageInDays').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for time to completion
ticketSchema.virtual('timeToCompletion').get(function() {
    if (this.completedAt) {
        return Math.floor((this.completedAt - this.createdAt) / (1000 * 60 * 60 * 24));
    }
    return null;
});

// Pre-save middleware to update lastUpdatedAt
ticketSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.lastUpdatedAt = Date.now();
    }
    if (this.isModified('status') && this.status === 'COMPLETED' && !this.completedAt) {
        this.completedAt = Date.now();
    }
    next();
});

// Pre-findOneAndUpdate middleware
ticketSchema.pre('findOneAndUpdate', function(next) {
    this.set({ lastUpdatedAt: Date.now() });
    
    // Set completedAt when status changes to COMPLETED
    const update = this.getUpdate();
    if (update.status === 'COMPLETED') {
        this.set({ completedAt: Date.now() });
    }
    next();
});

export default mongoose.model("Ticket", ticketSchema);