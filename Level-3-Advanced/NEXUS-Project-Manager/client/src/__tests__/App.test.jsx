import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import * as api from '../services/api';
import { mockProjects, mockTasks, mockStats } from '../test/mocks/testData';

vi.mock('../services/api', () => ({
  getProjects: vi.fn(),
  getTasks: vi.fn(),
  getDashboardStats: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn()
}));

describe('Frontend Component: App Master Orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getProjects.mockResolvedValue(mockProjects);
    api.getTasks.mockResolvedValue(mockTasks);
    api.getDashboardStats.mockResolvedValue(mockStats);
  });

  test('renders top navigation branding and workspace badge', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('NEXUS')).toBeInTheDocument();
      expect(screen.getByText('Codveda Workspace')).toBeInTheDocument();
    });
  });

  test('loads initial data from API and renders dashboard overview', async () => {
    render(<App />);

    await waitFor(() => {
      expect(api.getProjects).toHaveBeenCalledTimes(1);
      expect(api.getTasks).toHaveBeenCalledTimes(1);
      expect(api.getDashboardStats).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    });
  });

  test('switches tabs between Dashboard, Projects, Tasks, and Analytics', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
    });

    const sidebarNav = screen.getByRole('navigation');

    // 1. Switch to Projects tab
    const projectsBtn = within(sidebarNav).getByRole('button', { name: /projects/i });
    fireEvent.click(projectsBtn);

    await waitFor(() => {
      expect(screen.getByText('Nexus Core Platform')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /new project/i }).length).toBeGreaterThanOrEqual(1);
    });

    // 2. Switch to Tasks tab
    const tasksBtn = within(sidebarNav).getByRole('button', { name: /tasks/i });
    fireEvent.click(tasksBtn);

    await waitFor(() => {
      expect(screen.getByText('Design high-fidelity dashboard')).toBeInTheDocument();
    });

    // 3. Switch to Analytics tab
    const analyticsBtn = within(sidebarNav).getByRole('button', { name: /analytics/i });
    fireEvent.click(analyticsBtn);

    await waitFor(() => {
      expect(screen.getByText(/workflow status distribution/i)).toBeInTheDocument();
    });
  });

  test('displays error toast notification when API connection fails', async () => {
    api.getProjects.mockRejectedValueOnce(new Error('Network connection timeout'));
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/network connection timeout/i)).toBeInTheDocument();
    });
  });
});
