import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App.jsx'

test('shows the app name and build version', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('of-web')
  expect(screen.getByText(/^version \d+\.\d+\.\d+/)).toBeTruthy()
})
