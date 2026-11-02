export const mockProjects = [
  {
    _id: 'proj-1',
    name: 'Nexus Core Platform',
    description: 'Complete UI redesign and architecture modernization',
    status: 'In Progress',
    priority: 'High',
    progress: 50,
    taskCount: 2,
    dueDate: '2026-12-31T00:00:00.000Z'
  },
  {
    _id: 'proj-2',
    name: 'Mobile Client Application',
    description: 'React Native mobile app for iOS and Android',
    status: 'Planning',
    priority: 'Medium',
    progress: 0,
    taskCount: 1,
    dueDate: '2026-11-30T00:00:00.000Z'
  }
];

export const mockTasks = [
  {
    _id: 'task-1',
    title: 'Design high-fidelity dashboard',
    description: 'Create Figma components for project cards and stats',
    status: 'Completed',
    priority: 'High',
    project: { _id: 'proj-1', name: 'Nexus Core Platform' },
    dueDate: '2026-11-15T00:00:00.000Z'
  },
  {
    _id: 'task-2',
    title: 'Implement Express REST API routes',
    description: 'Build controllers and validation middleware',
    status: 'In Progress',
    priority: 'High',
    project: { _id: 'proj-1', name: 'Nexus Core Platform' },
    dueDate: '2026-11-20T00:00:00.000Z'
  },
  {
    _id: 'task-3',
    title: 'Setup mobile build pipeline',
    description: 'Configure EAS and Fastlane build pipelines',
    status: 'Todo',
    priority: 'Medium',
    project: { _id: 'proj-2', name: 'Mobile Client Application' },
    dueDate: '2026-11-25T00:00:00.000Z'
  }
];

export const mockStats = {
  totalProjects: 2,
  activeProjects: 2,
  completedProjects: 0,
  totalTasks: 3,
  completedTasks: 1,
  inProgressTasks: 1,
  todoTasks: 1,
  reviewTasks: 0,
  overallProgress: 33
};

