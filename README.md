# of-web
Smallest stateless React (Vite) app: one page with the app name and build version. Needs Node `^22.22.2 || ^24.15.0 || >=26` (jsdom's range); CI uses 24.
Run: `npm ci && npm run dev`, then open the printed local URL.
Test: `npm run lint && npm test`. Build: `npm run build` writes `dist/`.
CI (`.github/workflows/ci.yml`) lints, tests and builds every push and PR to `master`. Its `deploy` job runs only on `master` once the repo variable `DEPLOY_ENABLED` is `true`: it assumes the `AWS_ROLE_ARN` secret over OIDC in `AWS_REGION`, syncs `dist/` to `WEB_BUCKET`, uploads `index.html` last with `no-cache`, and invalidates `CLOUDFRONT_DISTRIBUTION_ID`.
