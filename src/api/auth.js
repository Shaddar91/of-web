import { request } from './client.js'

export function login(username, password) {
  return request('/api/v1/login', {
    method: 'POST',
    body: { username, password },
  })
}

export function me(token) {
  return request('/api/v1/me', { token })
}

export function logout(token) {
  return request('/api/v1/logout', {
    method: 'POST',
    token,
  })
}
