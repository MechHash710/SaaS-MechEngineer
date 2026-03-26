import axios from 'axios';

// Instância do Axios centralizada para o Backend de Engenharia
export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper para pegar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@EngenhariaPro:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tratamento de erros globais padrão para a plataforma
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 402) {
      alert(`Upgrade Necessário: ${error.response.data.detail}`);
      window.location.href = '/?mode=pricing';
    } else if (error.response?.status === 429) {
      alert('Limite de requisições atingido. Por favor, aguarde e tente novamente.');
    } else {
      console.error('API Error:', error?.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);
