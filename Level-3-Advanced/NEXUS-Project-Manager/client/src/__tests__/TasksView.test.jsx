import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import TasksView from '../pages/TasksView';
import { mockProjects, mockTasks } from '../test/mocks/testData';

describe('Frontend Component: TasksView', () => {
  test('renders tasks with titles, status badges, and project names', () => {
    render(
      <TasksView
        tasks={mockTasks}
        projects={mockProjects}
        isLoading={false}
        onOpenCreateModal={vi.fn()}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onQuickStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText('Design high-fidelity dashboard')).toBeInTheDocument();
    expect(screen.getByText('Implement Express REST API routes')).toBeInTheDocument();
    expect(screen.getByText('Setup mobile build pipeline')).toBeInTheDocument();
  });

  test('filters tasks by project dropdown', () => {
    render(
      <TasksView
        tasks={mockTasks}
        projects={mockProjects}
        isLoading={false}
        onOpenCreateModal={vi.fn()}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onQuickStatusChange={vi.fn()}
      />
    );

    const projectSelect = screen.getByLabelText(/^project:/i);
    fireEvent.change(projectSelect, { target: { value: 'proj-2' } });

    expect(screen.getByText('Setup mobile build pipeline')).toBeInTheDocument();
    expect(screen.queryByText('Design high-fidelity dashboard')).not.toBeInTheDocument();
  });

  test('filters tasks by status dropdown', () => {
    render(
      <TasksView
        tasks={mockTasks}
        projects={mockProjects}
        isLoading={false}
        onOpenCreateModal={vi.fn()}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onQuickStatusChange={vi.fn()}
      />
    );

    const statusSelect = screen.getByLabelText(/^status:/i);
    fireEvent.change(statusSelect, { target: { value: 'Completed' } });

    expect(screen.getByText('Design high-fidelity dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Setup mobile build pipeline')).not.toBeInTheDocument();
  });

  test('changing task status select triggers onQuickStatusChange callback', () => {
    const handleStatusChange = vi.fn();
    render(
      <TasksView
        tasks={mockTasks}
        projects={mockProjects}
        isLoading={false}
        onOpenCreateModal={vi.fn()}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onQuickStatusChange={handleStatusChange}
      />
    );

    const quickSelect = screen.getByLabelText(`Change status for ${mockTasks[0].title}`);
    fireEvent.change(quickSelect, { target: { value: 'Review' } });

    expect(handleStatusChange).toHaveBeenCalledWith(mockTasks[0], 'Review');
  });

  test('shows empty state when no tasks match filters', () => {
    render(
      <TasksView
        tasks={mockTasks}
        projects={mockProjects}
        isLoading={false}
        onOpenCreateModal={vi.fn()}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onQuickStatusChange={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search tasks by title or criteria/i);
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Task String' } });

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
  });
});
