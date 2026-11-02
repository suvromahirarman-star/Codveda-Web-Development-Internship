/**
 * NEXUS REST API Client Service Layer
 * Centralizes all communication between the React frontend and Express backend.
 */

const API_BASE = '/api';

/**
 * Universal JSON request helper with structured error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      let errorMsg = data.message;
      if (!errorMsg) {
        if (res.status === 500 || res.status === 502 || res.status === 503) {
          errorMsg = `Server unreachable (${res.status}): Please ensure the backend Express server is running on port 5000.`;
        } else {
          errorMsg = `Request failed with status ${res.status}`;
        }
      }
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${url}:`, error.message);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Dashboard Statistics API
// -----------------------------------------------------------------------------
export async function getDashboardStats() {
  const res = await request('/stats');
  return res.data;
}

// -----------------------------------------------------------------------------
// Projects API
// -----------------------------------------------------------------------------
export async function getProjects(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== 'All') searchParams.append('status', params.status);
  if (params.priority && params.priority !== 'All') searchParams.append('priority', params.priority);
  if (params.search && params.search.trim()) searchParams.append('search', params.search.trim());

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const res = await request(`/projects${query}`);
  return res.data;
}

export async function getProjectById(id) {
  const res = await request(`/projects/${id}`);
  return res.data;
}

export async function createProject(projectData) {
  const res = await request('/projects', {
    method: 'POST',
    body: projectData
  });
  return res.data;
}

export async function updateProject(id, projectData) {
  const res = await request(`/projects/${id}`, {
    method: 'PUT',
    body: projectData
  });
  return res.data;
}

export async function deleteProject(id) {
  const res = await request(`/projects/${id}`, {
    method: 'DELETE'
  });
  return res.data;
}

// -----------------------------------------------------------------------------
// Tasks API
// -----------------------------------------------------------------------------
export async function getTasks(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.project && params.project !== 'All') searchParams.append('project', params.project);
  if (params.status && params.status !== 'All') searchParams.append('status', params.status);
  if (params.priority && params.priority !== 'All') searchParams.append('priority', params.priority);
  if (params.search && params.search.trim()) searchParams.append('search', params.search.trim());

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const res = await request(`/tasks${query}`);
  return res.data;
}

export async function getTaskById(id) {
  const res = await request(`/tasks/${id}`);
  return res.data;
}

export async function createTask(taskData) {
  const res = await request('/tasks', {
    method: 'POST',
    body: taskData
  });
  return res.data;
}

export async function updateTask(id, taskData) {
  const res = await request(`/tasks/${id}`, {
    method: 'PUT',
    body: taskData
  });
  return res.data;
}

export async function deleteTask(id) {
  const res = await request(`/tasks/${id}`, {
    method: 'DELETE'
  });
  return res.data;
}

