# Deployment (GitHub Actions → GHCR → Coolify)

The site is a static build served by unprivileged nginx on port **8080** ([Dockerfile](../Dockerfile), [nginx.conf](nginx.conf)). The workflow in [.github/workflows/ci.yml](../.github/workflows/ci.yml) works like this:

| Event | What runs |
| --- | --- |
| Pull request | Catalog validation, tests, type check, build, private-data check, container smoke test. No secrets, nothing pushed. |
| Push to `main` | The same checks, then the image is pushed to `ghcr.io/samrepository/ufc-student-platform` with two tags: `sha-<commit>` (immutable) and `main`. |
| Push to `main` with deployment enabled | Coolify redeploys `:main`. The job waits until `<site>/release.json` reports the pushed commit, then smoke-tests the live site. |

Endpoints: `/health/live` (process up), `/health/ready` (site files present), `/release.json` (commit, build time, counts).

## One-time Coolify setup (needs the university server details)

1. **Image visibility.** After the first push to `main`, open the package `ufc-student-platform` under GitHub → Packages and check its visibility.
   - Public package: Coolify can pull it without credentials.
   - Private package: add a GHCR registry login in Coolify using a token with only `read:packages`.
2. **Create the application.** In Coolify, choose *Docker Image* with image `ghcr.io/samrepository/ufc-student-platform`, tag `main`, and exposed port `8080`.
3. **Domain and checks.** Set the chosen subdomain with HTTPS, and set the health check path to `/health/ready`.
4. **Auto Deploy.** Turn off any Coolify auto-deploy or Git webhook for this app, so only CI can deploy it, after the checks pass.
5. **API token.** Create one with **deploy** permission only (*Keys & Tokens → API Tokens*), and copy the app's deploy webhook URL.
6. **GitHub settings.** In *Settings → Environments → production*, add:
   - secrets `COOLIFY_DEPLOY_WEBHOOK` and `COOLIFY_TOKEN`
   - variable `SITE_URL`, e.g. `https://<subdomain>`
7. **Enable deployment.** In *Settings → Variables → Actions*, set the repository variable `COOLIFY_DEPLOY_ENABLED` to `true`.
8. **Network.** GitHub-hosted runners must be able to reach the Coolify API. If it is only reachable inside the university network, use an approved self-hosted runner. Do not expose the dashboard just for CI.

## Rollback

In Coolify, set the image tag to `sha-<previous good commit>` (listed in the GitHub Actions run summaries and on the GHCR package page) and redeploy. Set it back to `main` once a fixed commit is on `main`. The site has no database, so rolling back the image restores the previous site exactly.
