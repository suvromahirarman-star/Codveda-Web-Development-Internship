const mongoose = require('mongoose');

/**
 * Project Mongoose Schema
 * Represents a discrete project container within the NEXUS system.
 */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters'],
      maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['Planning', 'Active', 'In Progress', 'Completed', 'On Hold'],
        message: '{VALUE} is not a supported project status'
      },
      default: 'Planning'
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'Urgent'],
        message: '{VALUE} is not a supported project priority'
      },
      default: 'Medium'
    },
    progress: {
      type: Number,
      min: [0, 'Progress cannot be lower than 0%'],
      max: [100, 'Progress cannot exceed 100%'],
      default: 0
    },
    dueDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Virtual property to populate related tasks count
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project'
});

// Configure toJSON to include virtuals
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);

