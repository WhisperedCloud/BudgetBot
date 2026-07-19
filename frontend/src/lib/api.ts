const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const isFormData = options.body instanceof FormData;
  const headers: any = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  let baseUrl = API_URL;
  if (baseUrl && !baseUrl.startsWith('http') && !baseUrl.startsWith('/')) {
    baseUrl = `https://${baseUrl}`;
  }
  if (baseUrl && !baseUrl.endsWith('/api')) {
    baseUrl = `${baseUrl.replace(/\/$/, '')}/api`;
  }
  const fullUrl = `${baseUrl}${endpoint}`.replace(/([^:]\/)\/+/g, "$1");
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
};
