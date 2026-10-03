import './App.css'
import useSession from './hooks/useSession.js'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'

export default function App() {
  const session = useSession()

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>{import.meta.env.VITE_APP_NAME}</h1>
        <p>version {import.meta.env.VITE_APP_VERSION}</p>
      </header>
      {session.token ? (
        <HomePage
          expiresAt={session.expiresAt}
          signOut={session.signOut}
          token={session.token}
          username={session.username}
        />
      ) : (
        <LoginPage signIn={session.signIn} />
      )}
    </main>
  )
}
