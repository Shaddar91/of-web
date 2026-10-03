# of-web
A single-page React app (Vite) with a login. You enter a username and password, the page sends them to the API, and a 200 opens the signed-in view: `Signed in as <username>`, when the session expires, and a Log out button. A 401 shows "wrong username or password"; if the API can't be reached, the form says "the API is not reachable, try again". The header shows the app name and build version.

The session (`{token, username, expiresAt}`) is kept in `sessionStorage` under `of-web.token`, so it survives a reload and ends when the tab closes or you log out. Nothing in `src/` writes it to `localStorage`, a cookie or the console.

## API contract

`VITE_API_BASE_URL` sets the API base URL (default `http://localhost:8000`). Vite reads it when `npm run dev` starts and bakes it into `dist/` at `npm run build`, so a change needs a restart or a rebuild.
`VITE_LOAD_API_BASE_URL` sets the stress API's base URL (default `http://localhost:8001`) the same way; the Easy, Medium and High buttons on the signed-in page call it.

- `POST /api/v1/login` with `{"username","password"}` → 200 `{"token","expires_at","username"}`, or 401 on bad credentials. Any other status shows the body's `error` text, else "login failed, try again".
- `GET /api/v1/me` with `Authorization: Bearer <token>` → 200 `{"username","expires_at"}`.
- `POST /api/v1/logout` with the bearer → 204. Log out clears the session even when this call fails.

## Run

Needs Node `^22.22.2 || ^24.15.0 || >=26` (jsdom's range); CI uses 24. Start the API first. The browser calls it directly, with no dev proxy, so the API must allow the page's origin, `http://localhost:5173`, through CORS.

```sh
npm ci && VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

Then open `http://localhost:5173`. Without a matching Node, run it in the `node:24-bookworm` image instead. The browser fetches the API URL, not the container, so `localhost` still means your machine:

```sh
docker run --rm -it -u "$(id -u):$(id -g)" -v "$PWD":/w -w /w -e HOME=/tmp \
  -p 127.0.0.1:5173:5173 -e VITE_API_BASE_URL=http://localhost:8000 \
  node:24-bookworm sh -c 'npm ci && npm run dev -- --host 0.0.0.0'
```

## Layout

```text
src/main.jsx                  mounts App into #root
src/App.jsx                   header, then LoginPage or HomePage depending on the session
src/App.css                   plain CSS for both screens
src/api/client.js             fetch wrapper: base URL, JSON body, bearer header, NetworkError
src/api/auth.js               login(), me(), logout()
src/hooks/useSession.js       the session in sessionStorage: signIn(), signOut()
src/components/LoginForm.jsx  username and password fields, error line, Sign in button
src/pages/LoginPage.jsx       calls login(), then signs in or shows the error
src/pages/HomePage.jsx        username, expiry, Log out
```

## Test, lint, build

```sh
npm run lint && npm test && npm run build
```

Tests (`*.test.js`, `*.test.jsx`) sit next to the file they cover and run in Vitest with jsdom; they cover the three API calls, the stored session, the form's 200, 401 and unreachable-API outcomes, logout, and the header. `npm run build` writes `dist/`. The same checks in Docker, in the order CI runs them:

```sh
docker run --rm -u "$(id -u):$(id -g)" -v "$PWD":/w -w /w -e HOME=/tmp node:24-bookworm \
  sh -c 'npm ci && npm run lint && npm test && npm run build'
```

CI (`.github/workflows/ci.yml`) lints, tests and builds every push and pull request to `master`; a push to `master` also deploys the build. The file is generated, so an edit made to it here is overwritten.
