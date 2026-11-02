import React, { useState, useEffect } from 'react';

/**
 * ProjectModal Component
 * Accessible modal dialog for creating and updating projects in MongoDB.
 */
export default function ProjectModal({ isOpen, project, onClose, onSave, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    progress: 0,
    dueDate: ''
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'Planning',
        priority: project.priority || 'Medium',
        progress: project.progress !== undefined ? project.progress : 0,
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Planning',
        priority: 'Medium',
        progress: 0,
        dueDate: ''
      });
    }
    setValidationError('');
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === 'name' && value.trim()) {
      setValidationError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Project name is mandatory');
      return;
    }
    if (formData.name.trim().length < 2) {
      setValidationError('Project name must be at least 2 characters');
      return;
    }

    onSave({
      ...formData,
      progress: Number(formData.progress),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null
    });
  };

  if (!isOpen) return null;

  const isEdit = Boolean(project && project._id);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-container project-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <div className="modal-header">
          <div className="modal-header-text">
            <h2 id="project-modal-title" className="modal-title">
              {isEdit ? 'Update Project' : 'Create New Project'}
            </h2>
            <p className="modal-subtitle">
              {isEdit ? 'Modify project details stored in MongoDB.' : 'Organize tasks and track progress within a unified workspace.'}
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
            <label htmlFor="project-name" className="form-label">
              Project Name <span className="required-star">*</span>
            </label>
            <input
              id="project-name"
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g., Q4 Architecture Redesign"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="project-desc" className="form-label">
              Description
            </label>
            <textarea
              id="project-desc"
              name="description"
              rows="3"
              className="form-textarea"
              placeholder="Outline project objectives, milestones, and deliverables..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-grid-row">
            <div className="form-group">
              <label htmlFor="project-status" className="form-label">
                Lifecycle Status
              </label>
              <select
                id="project-status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="project-priority" className="form-label">
                Priority
              </label>
              <select
                id="project-priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-grid-row">
            <div className="form-group">
              <label htmlFor="project-due" className="form-label">
                Target Due Date
              </label>
              <input
                id="project-due"
                name="dueDate"
                type="date"
                className="form-input"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-progress" className="form-label">
                Initial Progress ({formData.progress}%)
              </label>
              <input
                id="project-progress"
                name="progress"
                type="range"
                min="0"
                max="100"
                step="5"
                className="form-range"
                value={formData.progress}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
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
              {isSubmitting ? 'Saving to MongoDB...' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

