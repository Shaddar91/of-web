import { request } from './client.js'

export function loadApiBaseUrl() {
  return (import.meta.env.VITE_LOAD_API_BASE_URL || 'http://localhost:8001').replace(/\/+$/, '')
}

export function stressLevels(token, signal) {
  return request('/api/v1/stress', { baseUrl: loadApiBaseUrl(), signal, token })
}

export function stressOnce(level, token, signal) {
  return request(`/api/v1/stress/${encodeURIComponent(level)}`, {
    method: 'POST',
    baseUrl: loadApiBaseUrl(),
    signal,
    token,
  })
}
