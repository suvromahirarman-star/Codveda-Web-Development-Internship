import React from 'react';

/**
 * AnalyticsView Component
 * Renders statistical metrics, workflow distribution, and project completion summaries.
 */
export default function AnalyticsView({ stats, projects = [], tasks = [] }) {
  const totalTasks = stats.totalTasks || 0;

  const statusBreakdown = [
    { label: 'Completed', count: stats.completedTasks || 0, color: 'var(--color-success)' },
    { label: 'In Progress', count: stats.inProgressTasks || 0, color: 'var(--color-primary)' },
    { label: 'Review', count: stats.reviewTasks || 0, color: 'var(--color-secondary)' },
    { label: 'Todo', count: stats.todoTasks || 0, color: 'var(--color-muted)' }
  ];

  // Calculate Priority distribution from real tasks
  const priorityCounts = { High: 0, Medium: 0, Low: 0 };
  tasks.forEach((t) => {
    if (priorityCounts[t.priority] !== undefined) {
      priorityCounts[t.priority] += 1;
    }
  });

  return (
    <div className="view-container analytics-view">
      <div className="view-header-bar">
        <div>
          <h1 className="view-title">Analytics &amp; Metrics</h1>
          <p className="view-subtitle">
            Aggregate performance indicators and workflow distribution computed from MongoDB records.
          </p>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Task Status Distribution */}
        <div className="card analytics-card">
          <h2 className="card-title">Workflow Status Distribution</h2>
          <p className="card-subtitle">Breakdown of actionable items across all stages</p>

          <div className="distribution-list">
            {statusBreakdown.map((item) => {
              const percentage = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <div key={item.label} className="distribution-row">
                  <div className="distribution-label-wrap">
                    <span className="dist-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <span className="dist-name">{item.label}</span>
                    <span className="dist-count">{item.count} items ({percentage}%)</span>
                  </div>
                  <div className="nexus-progress-bar-wrap">
                    <div
                      className="nexus-progress-bar-fill"
                      style={{ width: `${percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="card analytics-card">
          <h2 className="card-title">Priority Breakdown</h2>
          <p className="card-subtitle">Urgency and allocation across pending workloads</p>

          <div className="priority-stats-container">
            <div className="priority-stat-box priority-box-high">
              <span className="prio-box-count">{priorityCounts.High}</span>
              <span className="prio-box-label">High Priority</span>
            </div>
            <div className="priority-stat-box priority-box-medium">
              <span className="prio-box-count">{priorityCounts.Medium}</span>
              <span className="prio-box-label">Medium Priority</span>
            </div>
            <div className="priority-stat-box priority-box-low">
              <span className="prio-box-count">{priorityCounts.Low}</span>
              <span className="prio-box-label">Low Priority</span>
            </div>
          </div>

          <div className="db-verification-notice">
            <span className="notice-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div className="notice-text">
              <span className="notice-title">Persistent Database Integrity</span>
              <p className="notice-desc">
                All analytics calculations run on live records queried from MongoDB via Mongoose. Data survives backend server restarts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Health Table */}
      <div className="card project-health-card">
        <h2 className="card-title">Project Completion Progress</h2>
        <p className="card-subtitle">Calculated dynamically from associated tasks in MongoDB</p>

        <div className="health-table-container">
          {projects.length === 0 ? (
            <p className="empty-subtext">No projects available for analysis.</p>
          ) : (
            <div className="health-rows">
              {projects.map((p) => (
                <div key={p._id} className="health-row-item">
                  <div className="health-row-info">
                    <span className="health-row-title">{p.name}</span>
                    <span className="health-row-meta">
                      {p.taskCount || 0} tasks &bull; {p.completedTaskCount || 0} completed
                    </span>
                  </div>

                  <div className="health-row-progress-block">
                    <span className="health-row-pct">{p.progress}%</span>
                    <div className="nexus-progress-bar-wrap health-bar">
                      <div
                        className="nexus-progress-bar-fill"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

