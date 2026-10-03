export class NetworkError extends Error {
  constructor(cause) {
    super('The API request failed', { cause })
    this.name = 'NetworkError'
  }
}

export function apiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')
}

export async function request(path, { method = 'GET', body, token, baseUrl = apiBaseUrl(), signal } = {}) {
  const headers = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      ...(signal ? { signal } : {}),
    })
  } catch (error) {
    throw new NetworkError(error)
  }

  const data = response.status === 204 ? null : await response.json()

  return { status: response.status, data }
}
