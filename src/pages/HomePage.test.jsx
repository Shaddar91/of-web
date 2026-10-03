import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import HomePage from './HomePage.jsx'
import useSession from '../hooks/useSession.js'

const storedSession = {
  token: 'example-token',
  username: 'ada',
  expiresAt: '2026-10-01T01:00:00Z',
}

function SessionHome() {
  const session = useSession()

  return session.token ? (
    <HomePage
      expiresAt={session.expiresAt}
      signOut={session.signOut}
      token={session.token}
      username={session.username}
    />
  ) : (
    <p>Signed out</p>
  )
}

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('HomePage', () => {
  test('shows the active session details', () => {
    vi.stubGlobal('fetch', vi.fn())

    render(
      <HomePage
        expiresAt={storedSession.expiresAt}
        signOut={vi.fn()}
        token={storedSession.token}
        username={storedSession.username}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Signed in as ada' })).toBeTruthy()
    expect(screen.getByText('2026-10-01T01:00:00Z')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Log out' })).toBeTruthy()
  })

  test('posts the bearer token and clears the session on logout', async () => {
    sessionStorage.setItem('of-web.token', JSON.stringify(storedSession))
    const fetchMock = vi.fn().mockResolvedValue({ status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    render(<SessionHome />)
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))

    expect(await screen.findByText('Signed out')).toBeTruthy()
    expect(sessionStorage.getItem('of-web.token')).toBeNull()
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/v1/logout', {
        method: 'POST',
        headers: { Authorization: 'Bearer example-token' },
        body: undefined,
      })
    })
  })
})
