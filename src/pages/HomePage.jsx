import { useState } from 'react'
import { logout } from '../api/auth.js'
import StressPanel from '../components/StressPanel.jsx'

export default function HomePage({ expiresAt, signOut, token, username }) {
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setPending(true)
    await logout(token).catch(() => null)
    signOut()
  }

  return (
    <section className="auth-card home-card" aria-labelledby="home-title">
      <div className="status-mark" aria-hidden="true">✓</div>
      <div className="card-heading">
        <p className="eyebrow">Session active</p>
        <h2 id="home-title">Signed in as {username}</h2>
      </div>
      <dl className="session-details">
        <div>
          <dt>Username</dt>
          <dd>{username}</dd>
        </div>
        <div>
          <dt>Session expires</dt>
          <dd><time dateTime={expiresAt}>{expiresAt}</time></dd>
        </div>
      </dl>
      <StressPanel onUnauthorized={signOut} token={token} />
      <button className="secondary-button" disabled={pending} onClick={handleLogout} type="button">
        {pending ? 'Signing out…' : 'Log out'}
      </button>
    </section>
  )
}
