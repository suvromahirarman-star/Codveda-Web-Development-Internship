const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

/**
 * Helper to update project completion percentage based on actual tasks in MongoDB.
 */
async function updateProjectProgress(projectId) {
  try {
    const total = await Task.countDocuments({ project: projectId });
    if (total === 0) return;

    const completed = await Task.countDocuments({
      project: projectId,
      status: 'Completed'
    });

    const progress = Math.round((completed / total) * 100);
    const status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Active';

    await Project.findByIdAndUpdate(projectId, { progress, status });
  } catch (err) {
    console.error(`Error updating project progress: ${err.message}`);
  }
}

/**
 * GET /api/tasks
 * Retrieves tasks with optional filtering by project, status, priority, or search term.
 */
exports.getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, search } = req.query;
    const filter = {};

    if (project && mongoose.Types.ObjectId.isValid(project)) {
      filter.project = project;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name status priority')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tasks/:id
 * Retrieves a single task by ID.
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Task ID format'
      });
    }

    const task = await Task.findById(id).populate('project', 'name status');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tasks
 * Creates a new task and updates project progress.
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, project, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Project ID is required'
      });
    }

    // Verify parent project exists in MongoDB
    const parentProject = await Project.findById(project);
    if (!parentProject) {
      return res.status(404).json({
        success: false,
        message: 'Parent Project does not exist'
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'Todo',
      priority: priority || 'Medium',
      project,
      dueDate: dueDate || null
    });

    // Recalculate project progress
    await updateProjectProgress(project);

    const populatedTask = await Task.findById(task._id).populate('project', 'name status');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tasks/:id
 * Updates an existing task and updates project progress.
 */
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Task ID format'
      });
    }

    const { title, description, status, priority, project, dueDate } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    if (project !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(project)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Project ID format'
        });
      }
      updateData.project = project;
    }

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('project', 'name status');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Recalculate progress for task's project
    await updateProjectProgress(task.project._id || task.project);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tasks/:id
 * Removes a task from MongoDB and updates project progress.
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Task ID format'
      });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Recalculate progress for parent project
    await updateProjectProgress(task.project);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { deletedTaskId: id }
    });
  } catch (error) {
    next(error);
  }
};

