import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './pages/DashboardView';
import ProjectsView from './pages/ProjectsView';
import TasksView from './pages/TasksView';
import AnalyticsView from './pages/AnalyticsView';
import ProjectModal from './components/ProjectModal';
import TaskModal from './components/TaskModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats
} from './services/api';

/**
 * App Component
 * Master application orchestrator managing views, state mutations,
 * dialogs, and persistent MongoDB synchronization via the Express REST API.
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data State loaded from MongoDB
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    reviewTasks: 0,
    overallProgress: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Modals & Action States
  const [projectModalState, setProjectModalState] = useState({ isOpen: false, project: null });
  const [taskModalState, setTaskModalState] = useState({ isOpen: false, task: null, initialProjectId: '' });
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  /**
   * Refetches all core datasets from persistent MongoDB.
   */
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectsData, tasksData, statsData] = await Promise.all([
        getProjects(),
        getTasks(),
        getDashboardStats()
      ]);
      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setStats(statsData || {});
    } catch (error) {
      showToast(error.message || 'Failed to connect to MongoDB REST API', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ---------------------------------------------------------------------------
  // Project Mutation Handlers
  // ---------------------------------------------------------------------------
  const handleOpenCreateProject = () => {
    setProjectModalState({ isOpen: true, project: null });
  };

  const handleEditProject = (project) => {
    setProjectModalState({ isOpen: true, project });
  };

  const handleSaveProject = async (projectData) => {
    setIsSubmitting(true);
    try {
      if (projectModalState.project && projectModalState.project._id) {
        // PUT /api/projects/:id
        await updateProject(projectModalState.project._id, projectData);
        showToast('Project updated successfully in MongoDB');
      } else {
        // POST /api/projects
        await createProject(projectData);
        showToast('Project created and persisted to MongoDB');
      }
      setProjectModalState({ isOpen: false, project: null });
      await loadAllData();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = (project) => {
    setConfirmModalState({
      isOpen: true,
      title: `Delete project "${project.name}"?`,
      message: `Are you sure you want to delete this project? All associated tasks (${project.taskCount || 0}) will also be permanently removed from MongoDB.`,
      onConfirm: async () => {
        try {
          // DELETE /api/projects/:id
          await deleteProject(project._id);
          showToast('Project and linked tasks deleted from MongoDB');
          setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
          await loadAllData();
        } catch (error) {
          showToast(error.message, 'error');
        }
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Task Mutation Handlers
  // ---------------------------------------------------------------------------
  const handleOpenCreateTask = (initialProjectId = '') => {
    setTaskModalState({ isOpen: true, task: null, initialProjectId });
  };

  const handleEditTask = (task) => {
    setTaskModalState({ isOpen: true, task, initialProjectId: '' });
  };

  const handleSaveTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      if (taskModalState.task && taskModalState.task._id) {
        // PUT /api/tasks/:id
        await updateTask(taskModalState.task._id, taskData);
        showToast('Task updated in MongoDB');
      } else {
        // POST /api/tasks
        await createTask(taskData);
        showToast('Task created and linked in MongoDB');
      }
      setTaskModalState({ isOpen: false, task: null, initialProjectId: '' });
      await loadAllData();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = (task) => {
    setConfirmModalState({
      isOpen: true,
      title: `Delete task "${task.title}"?`,
      message: 'This task will be permanently removed from MongoDB, and parent project progress will be recalculated.',
      onConfirm: async () => {
        try {
          // DELETE /api/tasks/:id
          await deleteTask(task._id);
          showToast('Task deleted from MongoDB');
          setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
          await loadAllData();
        } catch (error) {
          showToast(error.message, 'error');
        }
      }
    });
  };

  /**
   * One-click task status updater that updates MongoDB and updates parent progress.
   */
  const handleQuickTaskStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task._id, { status: newStatus });
      showToast(`Task status updated to ${newStatus}`);
      await loadAllData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className="nexus-app">
      {/* Skip Navigation Link for Accessibility */}
      <a href="#main-view" className="skip-link">
        Skip to main content
      </a>

      {/* Top Header */}
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenProjectModal={handleOpenCreateProject}
        onOpenTaskModal={() => handleOpenCreateTask()}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
      />

      {/* Main Body with Sidebar + View */}
      <div className="nexus-body-layout">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main id="main-view" className="nexus-main-content">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              projects={projects}
              tasks={tasks}
              isLoading={isLoading}
              onNavigate={setActiveTab}
              onOpenProjectModal={handleOpenCreateProject}
              onOpenTaskModal={() => handleOpenCreateTask()}
              onEditProject={handleEditProject}
              onEditTask={handleEditTask}
              onQuickTaskStatusChange={handleQuickTaskStatusChange}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              isLoading={isLoading}
              onOpenCreateModal={handleOpenCreateProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              projects={projects}
              isLoading={isLoading}
              onOpenCreateModal={() => handleOpenCreateTask()}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onQuickStatusChange={handleQuickTaskStatusChange}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              stats={stats}
              projects={projects}
              tasks={tasks}
            />
          )}
        </main>
      </div>

      {/* Project Form Modal (Create / Edit) */}
      <ProjectModal
        isOpen={projectModalState.isOpen}
        project={projectModalState.project}
        onClose={() => setProjectModalState({ isOpen: false, project: null })}
        onSave={handleSaveProject}
        isSubmitting={isSubmitting}
      />

      {/* Task Form Modal (Create / Edit) */}
      <TaskModal
        isOpen={taskModalState.isOpen}
        task={taskModalState.task}
        projects={projects}
        initialProjectId={taskModalState.initialProjectId}
        onClose={() => setTaskModalState({ isOpen: false, task: null, initialProjectId: '' })}
        onSave={handleSaveTask}
        isSubmitting={isSubmitting}
      />

      {/* Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
      />

      {/* Notification Toast Banner */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

