import React from 'react';

/**
 * DashboardView Component
 * Renders the primary SaaS dashboard with real-time MongoDB statistics,
 * project progress overviews, and recent actionable projects and tasks.
 */
export default function DashboardView({
  stats,
  projects = [],
  tasks = [],
  isLoading,
  onNavigate,
  onOpenProjectModal,
  onOpenTaskModal,
  onEditProject,
  onEditTask,
  onQuickTaskStatusChange
}) {
  const recentProjects = projects.slice(0, 4);
  const recentTasks = tasks.slice(0, 6);

  return (
    <div className="view-container dashboard-view">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text-wrap">
          <span className="welcome-badge">Workspace Overview</span>
          <h1 className="welcome-title">Good morning, Mahir</h1>
          <p className="welcome-subtitle">
            Here's what's happening across your persistent MongoDB projects and tasks today.
          </p>
        </div>

        <div className="welcome-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenTaskModal}
          >
            + Create Task
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenProjectModal}
          >
            + Create Project
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <section className="stats-grid" aria-label="Key operational metrics">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Projects</span>
            <div className="stat-icon-wrap stat-icon-indigo" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{isLoading ? '...' : stats.totalProjects || 0}</div>
          <p className="stat-meta">Stored in MongoDB database</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active Projects</span>
            <div className="stat-icon-wrap stat-icon-cyan" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{isLoading ? '...' : stats.activeProjects || 0}</div>
          <p className="stat-meta">In Progress or Active state</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Tasks</span>
            <div className="stat-icon-wrap stat-icon-violet" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{isLoading ? '...' : stats.totalTasks || 0}</div>
          <p className="stat-meta">Associated across all projects</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Completed Tasks</span>
            <div className="stat-icon-wrap stat-icon-emerald" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{isLoading ? '...' : stats.completedTasks || 0}</div>
          <p className="stat-meta">
            {stats.totalTasks > 0 ? `${stats.overallProgress}% completion rate` : '0% completion rate'}
          </p>
        </div>
      </section>

      {/* Progress Overview Section */}
      <section className="dashboard-progress-section card">
        <div className="progress-section-header">
          <div>
            <h2 className="card-title">Overall Workspace Completion</h2>
            <p className="card-subtitle">Real-time aggregate calculated from all tasks linked in MongoDB</p>
          </div>
          <div className="progress-percentage-display">
            <span className="percentage-number">{stats.overallProgress || 0}%</span>
            <span className="percentage-label">Finished</span>
          </div>
        </div>

        <div className="nexus-progress-bar-wrap">
          <div
            className="nexus-progress-bar-fill"
            style={{ width: `${stats.overallProgress || 0}%` }}
            role="progressbar"
            aria-valuenow={stats.overallProgress || 0}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </section>

      {/* Two Column Grid: Recent Projects & Recent Tasks */}
      <div className="dashboard-columns-grid">
        {/* Recent Projects */}
        <section className="card dashboard-list-card" aria-labelledby="recent-projects-heading">
          <div className="card-header-flex">
            <div>
              <h2 id="recent-projects-heading" className="card-title">Recent Projects</h2>
              <p className="card-subtitle">Latest active initiatives</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('projects')}
            >
              View All &rarr;
            </button>
          </div>

          {recentProjects.length === 0 ? (
            <div className="empty-state-box">
              <p className="empty-state-text">No projects recorded in MongoDB yet.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onOpenProjectModal}
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="recent-projects-list">
              {recentProjects.map((project) => (
                <div key={project._id} className="project-list-row">
                  <div className="project-row-main">
                    <h3 className="project-row-name">{project.name}</h3>
                    <p className="project-row-desc">{project.description || 'No description provided'}</p>
                    <div className="project-row-meta">
                      <span className={`status-pill status-${project.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {project.status}
                      </span>
                      <span className={`priority-pill priority-${project.priority.toLowerCase()}`}>
                        {project.priority} Priority
                      </span>
                      <span className="project-row-tasks">
                        {project.taskCount || 0} {project.taskCount === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </div>

                  <div className="project-row-right">
                    <div className="row-progress-wrap">
                      <span className="row-progress-text">{project.progress}%</span>
                      <div className="mini-progress-track">
                        <div
                          className="mini-progress-fill"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Tasks */}
        <section className="card dashboard-list-card" aria-labelledby="recent-tasks-heading">
          <div className="card-header-flex">
            <div>
              <h2 id="recent-tasks-heading" className="card-title">Recent Tasks</h2>
              <p className="card-subtitle">Action items and current statuses</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate('tasks')}
            >
              View All &rarr;
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="empty-state-box">
              <p className="empty-state-text">No tasks created yet.</p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onOpenTaskModal}
              >
                Create First Task
              </button>
            </div>
          ) : (
            <div className="recent-tasks-list">
              {recentTasks.map((task) => (
                <div key={task._id} className="task-list-row">
                  <div className="task-row-main">
                    <h3 className="task-row-title">{task.title}</h3>
                    <div className="task-row-meta">
                      <span className="task-parent-badge">
                        {task.project ? task.project.name : 'Unassigned'}
                      </span>
                      <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <div className="task-row-right">
                    <select
                      className={`task-status-select status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}
                      value={task.status}
                      onChange={(e) => onQuickTaskStatusChange(task, e.target.value)}
                      aria-label={`Change status for ${task.title}`}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>

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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

