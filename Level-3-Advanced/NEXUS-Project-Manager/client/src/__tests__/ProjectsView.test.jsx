import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ProjectsView from '../pages/ProjectsView';
import { mockProjects } from '../test/mocks/testData';

describe('Frontend Component: ProjectsView', () => {
  test('renders project cards with correct titles, priorities, and status badges', () => {
    render(
      <ProjectsView
        projects={mockProjects}
        isLoading={false}
        onOpenCreateModal={vi.fn()}
        onEditProject={vi.fn()}
        onDeleteProject={vi.fn()}
      />
    );

    expect(screen.getByText('Nexus Core Platform')).toBeInTheDocument();
    expect(screen.getByText('Mobile Client Application')).toBeInTheDocument();
    expect(screen.getAllByText('High').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Medium').length).toBeGreaterThanOrEqual(1);
  });

  test('filters projects by status dropdown', () => {
    render(
      <ProjectsView
        projects={mockProjects}
        isLoading={false}
        onOpenCreateModal={vi.fn()}
        onEditProject={vi.fn()}
        onDeleteProject={vi.fn()}
      />
    );

    const statusSelect = screen.getByLabelText(/^status:/i);
    fireEvent.change(statusSelect, { target: { value: 'In Progress' } });

    expect(screen.getByText('Nexus Core Platform')).toBeInTheDocument();
    expect(screen.queryByText('Mobile Client Application')).not.toBeInTheDocument();
  });

  test('filters projects by search input', () => {
    render(
      <ProjectsView
        projects={mockProjects}
        isLoading={false}
        onOpenCreateModal={vi.fn()}
        onEditProject={vi.fn()}
        onDeleteProject={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search projects by title or description/i);
    fireEvent.change(searchInput, { target: { value: 'Mobile' } });

    expect(screen.getByText('Mobile Client Application')).toBeInTheDocument();
    expect(screen.queryByText('Nexus Core Platform')).not.toBeInTheDocument();
  });

  test('displays empty state when no projects match filters', () => {
    render(
      <ProjectsView
        projects={mockProjects}
        isLoading={false}
        onOpenCreateModal={vi.fn()}
        onEditProject={vi.fn()}
        onDeleteProject={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search projects by title or description/i);
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Project Query' } });

    expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
  });

  test('clicking "New Project" button triggers onOpenCreateModal callback', () => {
    const handleOpenCreate = vi.fn();
    render(
      <ProjectsView
        projects={mockProjects}
        isLoading={false}
        onOpenCreateModal={handleOpenCreate}
        onEditProject={vi.fn()}
        onDeleteProject={vi.fn()}
      />
    );

    const newBtn = screen.getByRole('button', { name: /new project/i });
    fireEvent.click(newBtn);

    expect(handleOpenCreate).toHaveBeenCalledTimes(1);
  });
});
