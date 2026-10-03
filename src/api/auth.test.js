import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { login, logout, me } from './auth.js'

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('auth API', () => {
  test('posts the login contract body to the configured endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: vi.fn().mockResolvedValue({
        token: 'session-token',
        expires_at: '2026-10-01T01:00:00Z',
        username: 'ada',
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await login('ada', 'correct horse')

    expect(result.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ada', password: 'correct horse' }),
    })
  })

  test('gets the current user with bearer authentication', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: vi.fn().mockResolvedValue({
        username: 'ada',
        expires_at: '2026-10-01T01:00:00Z',
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await me('session-token')

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/v1/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer session-token' },
      body: undefined,
    })
  })

  test('posts logout with bearer authentication', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    const result = await logout('session-token')

    expect(result).toEqual({ status: 204, data: null })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/v1/logout', {
      method: 'POST',
      headers: { Authorization: 'Bearer session-token' },
      body: undefined,
    })
  })
})
