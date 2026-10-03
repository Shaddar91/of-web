import { useState } from 'react'

const SESSION_ITEM = 'of-web.token'

function readSession() {
  const stored = sessionStorage.getItem(SESSION_ITEM)

  if (!stored) {
    return null
  }

  try {
    const session = JSON.parse(stored)

    if (session.token && session.username && session.expiresAt) {
      return session
    }
  } catch {
    sessionStorage.removeItem(SESSION_ITEM)
    return null
  }

  sessionStorage.removeItem(SESSION_ITEM)
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

    sessionStorage.setItem(SESSION_ITEM, JSON.stringify(nextSession))
    setSession(nextSession)
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_ITEM)
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
