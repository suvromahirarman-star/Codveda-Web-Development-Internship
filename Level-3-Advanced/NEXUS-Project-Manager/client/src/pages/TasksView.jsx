import React, { useState } from 'react';

/**
 * TasksView Component
 * Dedicated task management interface with multi-dimensional filtering (Project, Status, Priority),
 * quick status transitions, and full CRUD capabilities connected to MongoDB.
 */
export default function TasksView({
  tasks = [],
  projects = [],
  isLoading,
  onOpenCreateModal,
  onEditTask,
  onDeleteTask,
  onQuickStatusChange
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const statuses = ['All', 'Todo', 'In Progress', 'Review', 'Completed'];
  const priorities = ['All', 'Low', 'Medium', 'High'];

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesProject =
      projectFilter === 'All' ||
      (task.project && (task.project._id === projectFilter || task.project === projectFilter));
    const matchesSearch =
      !searchQuery.trim() ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesPriority && matchesProject && matchesSearch;
  });

  return (
    <div className="view-container tasks-view">
      {/* Header with Title & Action */}
      <div className="view-header-bar">
        <div>
          <h1 className="view-title">Tasks</h1>
          <p className="view-subtitle">
            Track individual work items, adjust workflow statuses, and monitor execution across projects.
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
          <span>New Task</span>
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
            placeholder="Search tasks by title or criteria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter tasks by search query"
          />
        </div>

        <div className="filters-cluster">
          <div className="filter-select-wrap">
            <label htmlFor="task-proj-filter" className="filter-label">Project:</label>
            <select
              id="task-proj-filter"
              className="filter-select"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="All">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrap">
            <label htmlFor="task-status-filter" className="filter-label">Status:</label>
            <select
              id="task-status-filter"
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
            <label htmlFor="task-prio-filter" className="filter-label">Priority:</label>
            <select
              id="task-prio-filter"
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

      {/* Tasks Table / Card List */}
      {isLoading ? (
        <div className="loading-state-card card">
          <div className="nexus-spinner" aria-hidden="true"></div>
          <p className="loading-state-text">Retrieving task records from MongoDB...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state-box card">
          <div className="empty-icon-wrap" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h3 className="empty-heading">No Tasks Found</h3>
          <p className="empty-subtext">
            {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || projectFilter !== 'All'
              ? 'Try clearing active filters or adjusting search terms.'
              : 'Add an actionable task linked to a project in MongoDB.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreateModal}
          >
            Create New Task
          </button>
        </div>
      ) : (
        <div className="tasks-list-container card">
          <div className="tasks-table-header">
            <span className="col-header col-title">Task Title</span>
            <span className="col-header col-project">Project</span>
            <span className="col-header col-priority">Priority</span>
            <span className="col-header col-status">Status</span>
            <span className="col-header col-due">Due Date</span>
            <span className="col-header col-actions">Actions</span>
          </div>

          <div className="tasks-table-body">
            {filteredTasks.map((task) => {
              const formattedDate = task.dueDate
                ? new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })
                : '—';

              return (
                <div key={task._id} className="task-table-row">
                  <div className="col-cell col-title">
                    <span className="task-item-title">{task.title}</span>
                    {task.description && (
                      <span className="task-item-snippet">{task.description}</span>
                    )}
                  </div>

                  <div className="col-cell col-project">
                    <span className="task-parent-badge">
                      {task.project ? task.project.name : 'Unassigned'}
                    </span>
                  </div>

                  <div className="col-cell col-priority">
                    <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="col-cell col-status">
                    {/* Intuitive Quick Status Dropdown */}
                    <select
                      className={`task-status-select status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}
                      value={task.status}
                      onChange={(e) => onQuickStatusChange(task, e.target.value)}
                      aria-label={`Change status for ${task.title}`}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="col-cell col-due">
                    <span className="task-due-date">{formattedDate}</span>
                  </div>

                  <div className="col-cell col-actions">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => onEditTask(task)}
                      title="Edit task"
                      aria-label={`Edit ${task.title}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-icon-danger"
                      onClick={() => onDeleteTask(task)}
                      title="Delete task"
                      aria-label={`Delete ${task.title}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

