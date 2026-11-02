/**
 * Request validation middleware for Project and Task payloads.
 */

exports.validateProjectPayload = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request payload must be a valid JSON object'
    });
  }

  const { name, status, priority, progress } = req.body;

  if (req.method === 'POST') {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required and must be a non-empty string'
      });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Project name must be at least 2 characters long'
      });
    }
  }

  if (status && !['Planning', 'Active', 'In Progress', 'Completed', 'On Hold'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status '${status}'. Must be one of: Planning, Active, In Progress, Completed, On Hold`
    });
  }

  if (priority && !['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
    return res.status(400).json({
      success: false,
      message: `Invalid priority '${priority}'. Must be one of: Low, Medium, High, Urgent`
    });
  }

  if (progress !== undefined && (isNaN(progress) || progress < 0 || progress > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Progress must be a numeric percentage between 0 and 100'
    });
  }

  next();
};

exports.validateTaskPayload = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Request payload must be a valid JSON object'
    });
  }

  const { title, status, priority, project } = req.body;

  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required and must be a non-empty string'
      });
    }
    if (title.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Task title must be at least 2 characters long'
      });
    }
    if (!project) {
      return res.status(400).json({
        success: false,
        message: 'Task must be assigned to a valid Project'
      });
    }
  }

  if (status && !['Todo', 'In Progress', 'Review', 'Completed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status '${status}'. Must be one of: Todo, In Progress, Review, Completed`
    });
  }

  if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
    return res.status(400).json({
      success: false,
      message: `Invalid priority '${priority}'. Must be one of: Low, Medium, High`
    });
  }

  next();
};

