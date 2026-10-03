import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'vitest'
import useSession from './useSession.js'

beforeEach(() => {
  sessionStorage.clear()
})

describe('useSession', () => {
  test('persists the login response in sessionStorage', () => {
    const { result } = renderHook(() => useSession())

    act(() => {
      result.current.signIn({
        token: 'example-token',
        username: 'ada',
        expires_at: '2026-10-01T01:00:00Z',
      })
    })

    expect(result.current.token).toBe('example-token')
    expect(result.current.username).toBe('ada')
    expect(result.current.expiresAt).toBe('2026-10-01T01:00:00Z')
    expect(JSON.parse(sessionStorage.getItem('of-web.token'))).toEqual({
      token: 'example-token',
      username: 'ada',
      expiresAt: '2026-10-01T01:00:00Z',
    })
  })

  test('hydrates and clears a stored session', () => {
    sessionStorage.setItem('of-web.token', JSON.stringify({
      token: 'example-stored-token',
      username: 'grace',
      expiresAt: '2026-10-01T02:00:00Z',
    }))
    const { result } = renderHook(() => useSession())

    expect(result.current.username).toBe('grace')

    act(() => {
      result.current.signOut()
    })

    expect(result.current.token).toBeNull()
    expect(sessionStorage.getItem('of-web.token')).toBeNull()
  })

  test('discards malformed stored session data', () => {
    sessionStorage.setItem('of-web.token', '{not-json')

    const { result } = renderHook(() => useSession())

    expect(result.current.token).toBeNull()
    expect(sessionStorage.getItem('of-web.token')).toBeNull()
  })
})
