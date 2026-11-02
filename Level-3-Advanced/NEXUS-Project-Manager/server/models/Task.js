const mongoose = require('mongoose');

/**
 * Task Mongoose Schema
 * Represents an individual actionable item assigned to a Project.
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Task title must be at least 2 characters'],
      maxlength: [120, 'Task title cannot exceed 120 characters']
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
        values: ['Todo', 'In Progress', 'Review', 'Completed'],
        message: '{VALUE} is not a valid task status'
      },
      default: 'Todo'
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid task priority'
      },
      default: 'Medium'
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must be linked to a project'],
      index: true
    },
    dueDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', taskSchema);

