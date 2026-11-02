const Project = require('../models/Project');
const Task = require('../models/Task');
const mongoose = require('mongoose');

/**
 * Maximum permitted search query length to prevent excessive regex processing.
 */
const MAX_SEARCH_LENGTH = 100;

/**
 * Safely escapes all special regex metacharacters to treat user input as literal text.
 * Prevents ReDoS (Regular Expression Denial of Service) and regex injection.
 * @param {string} str - Raw user input string
 * @returns {string} Escaped string safe for MongoDB $regex
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Export utilities for unit testing
exports.escapeRegex = escapeRegex;
exports.MAX_SEARCH_LENGTH = MAX_SEARCH_LENGTH;

/**
 * GET /api/projects
 * Retrieves all projects with aggregated task counts.
 */
exports.getProjects = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    if (search !== undefined && search !== null) {
      if (typeof search !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query must be a string'
        });
      }

      const trimmedSearch = search.trim();

      if (trimmedSearch.length > MAX_SEARCH_LENGTH) {
        return res.status(400).json({
          success: false,
          message: `Search query exceeds maximum allowed length of ${MAX_SEARCH_LENGTH} characters`
        });
      }

      if (trimmedSearch.length > 0) {
        const sanitizedSearch = escapeRegex(trimmedSearch);
        filter.$or = [
          { name: { $regex: sanitizedSearch, $options: 'i' } },
          { description: { $regex: sanitizedSearch, $options: 'i' } }
        ];
      }
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 });

    // Aggregate task counts for each project
    const projectIds = projects.map((p) => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const countMap = {};
    taskCounts.forEach((c) => {
      countMap[c._id.toString()] = {
        total: c.totalTasks,
        completed: c.completedTasks
      };
    });

    const enrichedProjects = projects.map((p) => {
      const counts = countMap[p._id.toString()] || { total: 0, completed: 0 };
      // If project has tasks, compute progress dynamically if not explicitly customized
      const calculatedProgress =
        counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : p.progress;

      return {
        ...p.toObject(),
        taskCount: counts.total,
        completedTaskCount: counts.completed,
        progress: calculatedProgress
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedProjects.length,
      data: enrichedProjects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id
 * Retrieves a single project and populates its associated tasks.
 */
exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Project ID format'
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const tasks = await Task.find({ project: id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        tasks
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/projects
 * Creates a new project in MongoDB.
 */
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, progress, dueDate } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      status: status || 'Planning',
      priority: priority || 'Medium',
      progress: progress !== undefined ? Number(progress) : 0,
      dueDate: dueDate || null
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id
 * Updates an existing project in MongoDB.
 */
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Project ID format'
      });
    }

    const { name, description, status, priority, progress, dueDate } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (progress !== undefined) updateData.progress = Number(progress);
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id
 * Deletes a project and cascades deletion to all associated tasks.
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Project ID format'
      });
    }

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Cascade delete all tasks belonging to this project
    const deletedTasks = await Task.deleteMany({ project: id });

    res.status(200).json({
      success: true,
      message: `Project and ${deletedTasks.deletedCount} associated tasks deleted successfully`,
      data: { deletedProjectId: id }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats
 * Aggregates high-level metrics for the dashboard homepage.
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({
      status: { $in: ['Active', 'In Progress'] }
    });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });

    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
    const todoTasks = await Task.countDocuments({ status: 'Todo' });
    const reviewTasks = await Task.countDocuments({ status: 'Review' });

    const overallProgress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        reviewTasks,
        overallProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

