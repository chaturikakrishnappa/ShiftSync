import axios from 'axios';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true
});

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
  if (token) localStorage.setItem('accessToken', token);
  else localStorage.removeItem('accessToken');
}

setAccessToken(localStorage.getItem('accessToken'));

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing = null;
async function refresh() {
  if (!refreshing) refreshing = api.post('/auth/refresh').then((r) => r.data).finally(() => (refreshing = null));
  return refreshing;
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        const data = await refresh();
        setAccessToken(data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api.request(error.config);
      } catch (e) {
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  }
);

