import React, { useState } from 'react';

/**
 * ProjectsView Component
 * Dedicated full-page project management interface with filtering, searching,
 * creation, updating, and deletion (CRUD).
 */
export default function ProjectsView({
  projects = [],
  isLoading,
  onOpenCreateModal,
  onEditProject,
  onDeleteProject
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const statuses = ['All', 'Active', 'In Progress', 'Planning', 'Completed', 'On Hold'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || project.priority === priorityFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="view-container projects-view">
      {/* Header with Title & Action */}
      <div className="view-header-bar">
        <div>
          <h1 className="view-title">Projects</h1>
          <p className="view-subtitle">
            Manage high-level initiatives, monitor completion, and organize tasks stored in MongoDB.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenCreateModal}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="controls-bar card">
        <div className="search-filter-wrap">
          <svg className="control-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="control-search-input"
            placeholder="Search projects by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter projects by search query"
          />
        </div>

        <div className="filters-cluster">
          <div className="filter-select-wrap">
            <label htmlFor="status-filter" className="filter-label">Status:</label>
            <select
              id="status-filter"
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrap">
            <label htmlFor="priority-filter" className="filter-label">Priority:</label>
            <select
              id="priority-filter"
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="loading-state-card card">
          <div className="nexus-spinner" aria-hidden="true"></div>
          <p className="loading-state-text">Querying projects from MongoDB database...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state-box card">
          <div className="empty-icon-wrap" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="empty-heading">No Projects Found</h3>
          <p className="empty-subtext">
            {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All'
              ? 'Try adjusting your search criteria or active filters.'
              : 'Get started by creating your first persistent project in MongoDB.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreateModal}
          >
            Create New Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const formattedDate = project.dueDate
              ? new Date(project.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'No due date';

            return (
              <article key={project._id} className="project-card card" aria-labelledby={`project-title-${project._id}`}>
                <div className="project-card-header">
                  <div className="project-badges">
                    <span className={`status-pill status-${project.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {project.status}
                    </span>
                    <span className={`priority-pill priority-${project.priority.toLowerCase()}`}>
                      {project.priority}
                    </span>
                  </div>

                  <div className="card-action-menu">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => onEditProject(project)}
                      title="Edit project"
                      aria-label={`Edit ${project.name}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-icon-danger"
                      onClick={() => onDeleteProject(project)}
                      title="Delete project"
                      aria-label={`Delete ${project.name}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <h2 id={`project-title-${project._id}`} className="project-card-title">
                  {project.name}
                </h2>

                <p className="project-card-desc">
                  {project.description || 'No detailed scope or milestone notes provided for this project.'}
                </p>

                {/* Progress Bar & Percentage */}
                <div className="project-progress-block">
                  <div className="progress-labels-row">
                    <span className="progress-text-label">Progress</span>
                    <span className="progress-number-label">{project.progress}%</span>
                  </div>
                  <div className="nexus-progress-bar-wrap">
                    <div
                      className="nexus-progress-bar-fill"
                      style={{ width: `${project.progress}%` }}
                      role="progressbar"
                      aria-valuenow={project.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                </div>

                <div className="project-card-footer">
                  <div className="project-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{formattedDate}</span>
                  </div>

                  <div className="project-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    <span>{project.taskCount || 0} tasks</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

