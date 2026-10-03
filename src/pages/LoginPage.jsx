import { useState } from 'react'
import { login } from '../api/auth.js'
import { NetworkError } from '../api/client.js'
import LoginForm from '../components/LoginForm.jsx'

export default function LoginPage({ signIn }) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(username, password) {
    setError('')
    setPending(true)

    try {
      const result = await login(username, password)

      if (result.status === 200) {
        signIn(result.data)
        return
      }

      if (result.status === 401) {
        setError('wrong username or password')
      } else {
        setError(result.data?.error || 'login failed, try again')
      }
    } catch (requestError) {
      setError(
        requestError instanceof NetworkError
          ? 'the API is not reachable, try again'
          : 'login failed, try again',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="auth-card" aria-labelledby="login-title">
      <div className="card-heading">
        <p className="eyebrow">Account access</p>
        <h2 id="login-title">Sign in</h2>
      </div>
      <LoginForm error={error} onSubmit={handleSubmit} pending={pending} />
    </section>
  )
}
