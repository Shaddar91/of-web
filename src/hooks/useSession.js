import { useState } from 'react'

const SESSION_KEY = 'of-web.token'

function readSession() {
  const stored = sessionStorage.getItem(SESSION_KEY)

  if (!stored) {
    return null
  }

  try {
    const session = JSON.parse(stored)

    if (session.token && session.username && session.expiresAt) {
      return session
    }
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }

  sessionStorage.removeItem(SESSION_KEY)
  return null
}

export default function useSession() {
  const [session, setSession] = useState(readSession)

  function signIn(result) {
    const nextSession = {
      token: result.token,
      username: result.username,
      expiresAt: result.expires_at,
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
  }

  return {
    token: session?.token ?? null,
    username: session?.username ?? null,
    expiresAt: session?.expiresAt ?? null,
    signIn,
    signOut,
  }
}
