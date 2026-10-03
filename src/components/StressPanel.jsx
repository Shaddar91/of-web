import { useEffect, useEffectEvent, useState } from 'react'
import { stressLevels } from '../api/load.js'
import useStressRun from '../hooks/useStressRun.js'

const PLACEHOLDER_LEVELS = ['easy', 'medium', 'high'].map((name) => ({ name }))

function levelLabel(name) {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`
}

function formatDuration(seconds) {
  return seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} s`
}

function formatClock(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export default function StressPanel({ onUnauthorized, token }) {
  const [levels, setLevels] = useState(null)
  const [loadError, setLoadError] = useState('')
  const { run, secondsLeft, start, stop } = useStressRun({ onUnauthorized, token })
  const rejectSession = useEffectEvent(() => onUnauthorized?.())
  const running = run?.state === 'running'

  useEffect(() => {
    const controller = new AbortController()

    stressLevels(token, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return
        }

        if (result.status === 200 && Array.isArray(result.data?.levels)) {
          setLevels(result.data.levels)
        } else if (result.status === 401) {
          rejectSession()
        } else {
          setLoadError(`the stress API answered ${result.status}, reload the page to try again`)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoadError('the stress API is not reachable, reload the page to try again')
        }
      })

    return () => controller.abort()
  }, [token])

  return (
    <section className="stress-panel" aria-labelledby="stress-title">
      <h3 id="stress-title">Stress test</h3>
      <p className="stress-intro">
        Each level keeps requests running in parallel for the time shown. Every request burns CPU and
        holds memory on the pod that answers it.
      </p>
      {loadError ? <p className="form-error" role="alert">{loadError}</p> : null}
      <div className="stress-levels">
        {(levels ?? PLACEHOLDER_LEVELS).map((level) => (
          <button
            className={running && run.level.name === level.name ? 'primary-button stress-level stress-level-active' : 'primary-button stress-level'}
            disabled={!levels || running}
            key={level.name}
            onClick={() => start(level)}
            type="button"
          >
            <span>{levelLabel(level.name)}</span>
            {levels ? (
              <>
                {' '}
                <span className="stress-level-meta">
                  {level.concurrency} parallel · {formatDuration(level.duration_seconds)}
                </span>
              </>
            ) : null}
          </button>
        ))}
      </div>
      <button className="secondary-button" disabled={!running} onClick={stop} type="button">
        Stop
      </button>
      {run ? (
        <>
          <p className="stress-status" role="status">
            {levelLabel(run.level.name)}: {run.state}
          </p>
          <dl className="stress-stats">
            <div>
              <dt>Time left</dt>
              <dd>{formatClock(secondsLeft)}</dd>
            </div>
            <div>
              <dt>Requests done</dt>
              <dd>{run.done}</dd>
            </div>
            <div>
              <dt>Busy retries</dt>
              <dd>{run.busy}</dd>
            </div>
            <div>
              <dt>Failures</dt>
              <dd>{run.failed}</dd>
            </div>
            <div className="stress-pods">
              <dt>Pods answering</dt>
              <dd>
                {run.pods.length}
                {run.pods.length ? (
                  <ul>
                    {run.pods.map((pod) => <li key={pod}>{pod}</li>)}
                  </ul>
                ) : null}
              </dd>
            </div>
          </dl>
        </>
      ) : null}
    </section>
  )
}
