export interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  simulations: any[];
}

const STORAGE_KEY = '@multiagent:projects';

export const getProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveProject = (project: Omit<Project, 'id' | 'createdAt' | 'simulations'>) => {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: `PRJ-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    simulations: []
  };
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return newProject;
};

export const updateProject = (id: string, updates: Partial<Project>) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index > -1) {
    projects[index] = { ...projects[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
};

export const deleteProject = (id: string) => {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const duplicateProject = (id: string) => {
  const projects = getProjects();
  const p = projects.find(p => p.id === id);
  if (p) {
    saveProject({ name: `${p.name} (Cópia)`, type: p.type, description: p.description });
  }
};

export const addSimulationToProject = (projectId: string, simulation: any) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index > -1) {
    projects[index].simulations.push({
      ...simulation,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
};
