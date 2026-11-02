import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import { mockProjects } from '../test/mocks/testData';

describe('Frontend Components: Modals & Dialogs', () => {
  describe('ProjectModal Component', () => {
    test('displays validation error when submitting with empty project name', () => {
      const handleSave = vi.fn();
      const { container } = render(
        <ProjectModal
          isOpen={true}
          project={null}
          onClose={vi.fn()}
          onSave={handleSave}
          isSubmitting={false}
        />
      );

      const form = container.querySelector('form');
      fireEvent.submit(form);

      expect(screen.getByText(/project name is mandatory/i)).toBeInTheDocument();
      expect(handleSave).not.toHaveBeenCalled();
    });

    test('submits valid form data and triggers onSave callback', () => {
      const handleSave = vi.fn();
      const { container } = render(
        <ProjectModal
          isOpen={true}
          project={null}
          onClose={vi.fn()}
          onSave={handleSave}
          isSubmitting={false}
        />
      );

      const nameInput = screen.getByLabelText(/project name/i);
      fireEvent.change(nameInput, { target: { name: 'name', value: 'New Test Project' } });

      const descInput = screen.getByLabelText(/description/i);
      fireEvent.change(descInput, { target: { name: 'description', value: 'Test description text' } });

      const form = container.querySelector('form');
      fireEvent.submit(form);

      expect(handleSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Test Project',
          description: 'Test description text',
          status: 'Planning',
          priority: 'Medium'
        })
      );
    });

    test('clicking close/cancel button triggers onClose', () => {
      const handleClose = vi.fn();
      render(
        <ProjectModal
          isOpen={true}
          project={null}
          onClose={handleClose}
          onSave={vi.fn()}
          isSubmitting={false}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelBtn);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('TaskModal Component', () => {
    test('displays validation error when submitting with empty title', () => {
      const handleSave = vi.fn();
      const { container } = render(
        <TaskModal
          isOpen={true}
          task={null}
          projects={mockProjects}
          initialProjectId="proj-1"
          onClose={vi.fn()}
          onSave={handleSave}
          isSubmitting={false}
        />
      );

      const form = container.querySelector('form');
      fireEvent.submit(form);

      expect(screen.getByText(/task title is mandatory/i)).toBeInTheDocument();
      expect(handleSave).not.toHaveBeenCalled();
    });

    test('submits valid task data linked to selected project', () => {
      const handleSave = vi.fn();
      const { container } = render(
        <TaskModal
          isOpen={true}
          task={null}
          projects={mockProjects}
          initialProjectId="proj-1"
          onClose={vi.fn()}
          onSave={handleSave}
          isSubmitting={false}
        />
      );

      const titleInput = screen.getByLabelText(/task title/i);
      fireEvent.change(titleInput, { target: { name: 'title', value: 'Implement Authentication' } });

      const form = container.querySelector('form');
      fireEvent.submit(form);

      expect(handleSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Implement Authentication',
          project: 'proj-1'
        })
      );
    });
  });

  describe('ConfirmModal Component', () => {
    test('renders confirmation title, message and fires callbacks', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <ConfirmModal
          isOpen={true}
          title="Delete Project?"
          message="This action cannot be undone."
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      expect(screen.getByText('Delete Project?')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);

      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelBtn);
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });
});
