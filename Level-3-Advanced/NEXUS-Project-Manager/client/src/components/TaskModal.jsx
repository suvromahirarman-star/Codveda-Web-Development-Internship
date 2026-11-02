import React, { useState, useEffect } from 'react';

/**
 * TaskModal Component
 * Accessible modal dialog for creating and updating tasks linked to a Project in MongoDB.
 */
export default function TaskModal({ isOpen, task, projects = [], initialProjectId = '', onClose, onSave, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    project: '',
    dueDate: ''
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Todo',
        priority: task.priority || 'Medium',
        project: task.project ? (task.project._id || task.project) : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        project: initialProjectId || (projects[0] ? projects[0]._id : ''),
        dueDate: ''
      });
    }
    setValidationError('');
  }, [task, initialProjectId, projects, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === 'title' && value.trim()) {
      setValidationError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setValidationError('Task title is mandatory');
      return;
    }
    if (formData.title.trim().length < 2) {
      setValidationError('Task title must be at least 2 characters');
      return;
    }
    if (!formData.project) {
      setValidationError('Please select a parent project');
      return;
    }

    onSave({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null
    });
  };

  if (!isOpen) return null;

  const isEdit = Boolean(task && task._id);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container task-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <div className="modal-header">
          <div className="modal-header-text">
            <h2 id="task-modal-title" className="modal-title">
              {isEdit ? 'Update Task' : 'Create New Task'}
            </h2>
            <p className="modal-subtitle">
              {isEdit ? 'Modify task attributes and synchronize status.' : 'Assign actionable tasks to a parent project in MongoDB.'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {validationError && (
            <div className="form-error-alert" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{validationError}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="task-title" className="form-label">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g., Audit Mongoose schema indexes"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-project" className="form-label">
              Associated Project <span className="required-star">*</span>
            </label>
            <select
              id="task-project"
              name="project"
              className="form-select"
              value={formData.project}
              onChange={handleChange}
              disabled={isSubmitting || projects.length === 0}
              required
            >
              {projects.length === 0 && <option value="">No projects available</option>}
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-desc" className="form-label">
              Description
            </label>
            <textarea
              id="task-desc"
              name="description"
              rows="3"
              className="form-textarea"
              placeholder="Provide technical criteria, reproduction steps, or context..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-grid-row">
            <div className="form-group">
              <label htmlFor="task-status" className="form-label">
                Workflow Status
              </label>
              <select
                id="task-status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority" className="form-label">
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-due" className="form-label">
              Due Date
            </label>
            <input
              id="task-due"
              name="dueDate"
              type="date"
              className="form-input"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-actions-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving to MongoDB...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

