import { useEffect, useRef, useState } from 'react'
import { stressOnce } from '../api/load.js'

const BUSY_RETRY_MS = 250
const FAILED_RETRY_MS = 1000

function pause(ms, signal) {
  return new Promise((resolve) => {
    function finish() {
      clearTimeout(timer)
      signal.removeEventListener('abort', finish)
      resolve()
    }

    const timer = setTimeout(finish, ms)
    signal.addEventListener('abort', finish)
  })
}

function withPod(pods, pod) {
  return typeof pod === 'string' && !pods.includes(pod) ? [...pods, pod] : pods
}

export default function useStressRun({ onUnauthorized, token }) {
  const [run, setRun] = useState(null)
  const [now, setNow] = useState(0)
  const controllerRef = useRef(null)
  const running = run?.state === 'running'

  useEffect(() => () => controllerRef.current?.abort(), [])

  useEffect(() => {
    if (!running) {
      return undefined
    }

    const timer = setInterval(() => setNow(Date.now()), 1000)

    return () => clearInterval(timer)
  }, [running])

  function end(controller, state) {
    if (controllerRef.current !== controller) {
      return
    }

    controllerRef.current = null
    controller.abort()
    setRun((current) => ({ ...current, state }))
  }

  async function drive(level, endsAt, controller) {
    const { signal } = controller

    while (!signal.aborted && Date.now() < endsAt) {
      const result = await stressOnce(level.name, token, signal).catch(() => null)

      if (signal.aborted) {
        return
      }

      if (result?.status === 200) {
        const pod = result.data?.pod

        setRun((current) => ({ ...current, done: current.done + 1, pods: withPod(current.pods, pod) }))
      } else if (result?.status === 401) {
        end(controller, 'stopped')
        onUnauthorized?.()
        return
      } else if (result?.status === 429) {
        setRun((current) => ({ ...current, busy: current.busy + 1 }))
        await pause(BUSY_RETRY_MS, signal)
      } else {
        setRun((current) => ({ ...current, failed: current.failed + 1 }))
        await pause(FAILED_RETRY_MS, signal)
      }
    }
  }

  function start(level) {
    if (controllerRef.current) {
      return
    }

    const controller = new AbortController()
    const startedAt = Date.now()
    const endsAt = startedAt + level.duration_seconds * 1000

    controllerRef.current = controller
    setNow(startedAt)
    setRun({ level, endsAt, state: 'running', done: 0, busy: 0, failed: 0, pods: [] })
    Promise.all(Array.from({ length: level.concurrency }, () => drive(level, endsAt, controller)))
      .then(() => end(controller, 'finished'))
  }

  function stop() {
    if (controllerRef.current) {
      end(controllerRef.current, 'stopped')
    }
  }

  const secondsLeft = running ? Math.max(0, Math.ceil((run.endsAt - now) / 1000)) : 0

  return { run, secondsLeft, start, stop }
}
