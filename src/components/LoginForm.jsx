import { useState } from 'react'

export default function LoginForm({ error, onSubmit, pending }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(username, password)
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="username">Username</label>
        <input
          autoComplete="username"
          disabled={pending}
          id="username"
          name="username"
          onChange={(event) => setUsername(event.target.value)}
          required
          type="text"
          value={username}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          autoComplete="current-password"
          disabled={pending}
          id="password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="primary-button" disabled={pending} type="submit">
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
