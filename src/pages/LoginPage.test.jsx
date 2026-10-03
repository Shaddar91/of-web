import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import HomePage from './HomePage.jsx'
import LoginPage from './LoginPage.jsx'
import useSession from '../hooks/useSession.js'

function LoginFlow() {
  const session = useSession()

  return session.token ? (
    <HomePage
      expiresAt={session.expiresAt}
      signOut={session.signOut}
      token={session.token}
      username={session.username}
    />
  ) : (
    <LoginPage signIn={session.signIn} />
  )
}

function submitCredentials(username = 'ada', password = 'example-password') {
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: username } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('LoginPage', () => {
  test('renders the credential form', () => {
    vi.stubGlobal('fetch', vi.fn())

    render(<LoginPage signIn={vi.fn()} />)

    expect(screen.getByLabelText('Username')).toBeTruthy()
    expect(screen.getByLabelText('Password')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy()
  })

  test('stores a successful session and shows the username', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: vi.fn().mockResolvedValue({
        token: 'example-token',
        expires_at: '2026-10-01T01:00:00Z',
        username: 'ada',
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<LoginFlow />)
    submitCredentials()

    expect(await screen.findByRole('heading', { name: 'Signed in as ada' })).toBeTruthy()
    expect(JSON.parse(sessionStorage.getItem('of-web.token'))).toEqual({
      token: 'example-token',
      username: 'ada',
      expiresAt: '2026-10-01T01:00:00Z',
    })
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ada', password: 'example-password' }),
    })
  })

  test('shows the credentials error for a 401 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 401,
      json: vi.fn().mockResolvedValue({ error: 'invalid credentials' }),
    }))

    render(<LoginPage signIn={vi.fn()} />)
    submitCredentials('ada', 'wrong')

    expect((await screen.findByRole('alert')).textContent).toBe('wrong username or password')
  })

  test('shows the retry message when the API cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('connection refused')))

    render(<LoginPage signIn={vi.fn()} />)
    submitCredentials()

    expect((await screen.findByRole('alert')).textContent).toBe('the API is not reachable, try again')
  })
})
