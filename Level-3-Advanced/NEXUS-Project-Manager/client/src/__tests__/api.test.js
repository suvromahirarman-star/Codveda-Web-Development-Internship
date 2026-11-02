import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  createTask,
  getDashboardStats
} from '../services/api';

describe('Frontend API Service Layer (client/src/services/api.js)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getProjects() appends query parameters properly and returns data', async () => {
    const mockData = [{ _id: '1', name: 'Project 1' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockData })
    });

    const data = await getProjects({ status: 'In Progress', search: 'Redesign' });

    expect(fetch).toHaveBeenCalledWith(
      '/api/projects?status=In+Progress&search=Redesign',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' })
      })
    );
    expect(data).toEqual(mockData);
  });

  test('createProject() sends POST request with JSON stringified body', async () => {
    const newProj = { name: 'Brand New Project', status: 'Planning' };
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: { _id: 'new-1', ...newProj } })
    });

    const result = await createProject(newProj);

    expect(fetch).toHaveBeenCalledWith(
      '/api/projects',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newProj)
      })
    );
    expect(result._id).toBe('new-1');
  });

  test('handles 503 gateway timeout with helpful Express server message', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({})
    });

    await expect(getDashboardStats()).rejects.toThrow(
      'Server unreachable (503): Please ensure the backend Express server is running on port 5000.'
    );
  });

  test('handles API validation error with server provided message', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ success: false, message: 'Validation Failed: Project name is required' })
    });

    await expect(createProject({})).rejects.toThrow('Validation Failed: Project name is required');
  });
});

