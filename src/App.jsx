export default function App() {
  return (
    <main>
      <h1>{import.meta.env.VITE_APP_NAME}</h1>
      <p>version {import.meta.env.VITE_APP_VERSION}</p>
    </main>
  )
}
