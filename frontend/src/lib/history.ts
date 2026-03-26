export interface SimulationHistoryItem {
  id: string;
  type: 'HVAC' | 'Solar' | 'Ventilação' | 'Eficiência Energética';
  date: string;
  summary: string;
}

const STORAGE_KEY = '@project8/simulations';

export function getSimulationHistory(): SimulationHistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addSimulationToHistory(item: Omit<SimulationHistoryItem, 'id' | 'date'>) {
  try {
    const history = getSimulationHistory();
    const newItem: SimulationHistoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
    };
    
    // Keep only the last 10
    const updated = [newItem, ...history].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  } catch (error) {
    console.error('Failed to save history', error);
  }
}

export function clearSimulationHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
