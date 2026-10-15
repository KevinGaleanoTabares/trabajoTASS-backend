# TASS Backend — Copilot Instructions

## Project commands

- Install dependencies with `npm ci`; `package-lock.json` is the lockfile.
- `npm run build` runs `tsc` and copies EJS templates and assets into `dist/`.
- `npm test` builds first, then runs the Node.js test runner (`node --test`).
- To run one test file, first run `npm run build`, then run `node --test tests/health.routes.test.js` or `node --test tests/error.middleware.test.js`.
- To filter to one test by its title, build first, then run `node --test --test-name-pattern="returns healthy only after MongoDB ping succeeds" tests/health.routes.test.js`.
- `npm run dev:local` runs `src/server.ts` with `NODE_ENV=local`; `npm run dev` uses `NODE_ENV=dev`. `npm start` runs the compiled `dist/server.js`.
- There is no configured lint or formatter script.

`dist/` is generated and ignored. Build before running the compiled application or the tests, since tests import compiled modules from `dist/`.

## Architecture and request flow

- `src/server.ts` creates the Express application, configures JSON and CORS middleware, mounts `/health` and the API router, then installs the global error middleware. Startup connects Mongoose before listening and starts the scheduled conflict-detection job only after the database connection succeeds.
- `src/routes/index.routes.ts` mounts feature routers under `/api` prefixes. Feature route files connect route paths to controllers and apply authentication/role middleware where required. For example, conflict routes use `authMiddleware` and `authorizeRoles`; inspect the specific route before assuming its access contract.
- Controllers handle HTTP input/output and call services. Services contain feature operations and coordinate Mongoose models. Models in `src/models/` define MongoDB schemas; shared enums and interfaces are in `src/utils/enums_types_interfaces.ts`.
- `src/config/env.ts` selects `.env.<NODE_ENV>` (default `local`) and reads required runtime settings from `process.env`. Deployment-provided variables take precedence over values loaded by dotenv. Compose sets the development environment and loads its development env file; production settings must be supplied by its deployment environment.
- The Compose development profile runs the backend and MongoDB on the Compose network. Containers should reach Mongo by its Compose service name, not by `localhost`; Mongo data is stored in the named `mongodb_data` volume. The backend healthcheck calls `GET /health`, which reports healthy only after a Mongo ping succeeds.
- `src/utils/logger.ts` centralizes Winston JSON logs. Keep event names stable and descriptive, and pass only operational metadata that is safe to log. `cliui` in `src/server.ts` is the human-readable startup display; it complements the structured Winston events.

## Repository-specific conventions

- Treat current routes, controllers, models, validators, error types, and existing API responses as the contract. Inspect the feature path end-to-end before changing behavior; do not infer an endpoint from a frontend call or documentation example alone.
- Keep HTTP concerns in route/controller code and database/business operations in existing services. Reuse `AppError` and its subclasses from `src/utils/errors.ts`; `src/middlewares/error.middleware.ts.ts` maps unknown errors and sanitizes server-error responses.
- Protect secrets and personal data: never open, print, or copy `.env` files or credentials into logs, tests, documentation, or responses. Use fake values in examples and tests. Do not log request bodies, full JWT payloads, Mongo documents, full exception messages/stacks, or full URLs that may contain query tokens.
- For health behavior, preserve the distinction between process availability and dependency availability: `/health` returns 200 only when Mongo is reachable and 503 otherwise. Keep the response free of connection strings and internal error details.
- When changing Compose, preserve the existing named database volume and avoid destructive commands such as `docker compose down -v`. Validate Compose without displaying interpolated environment values (for example, `docker compose --profile desarrollo config -q`).
- Tests use the built-in `node:test` runner and are JavaScript files under `tests/`; they exercise compiled TypeScript from `dist/`. Health-route tests inject a connection-shaped dependency and run an ephemeral HTTP server; error-middleware tests assert response sanitization and safe logs.
- Work only on the user-authorized phase/story. The backend instructions in `documentation/backend-copilot-instructions (1).md` also require reporting actual commands/results, preserving existing architecture, and waiting for authorization before moving to another story.

## Documentation policy

- Store project documentation under `documentation/`. Do not create a root-level README unless the user explicitly asks for one.
- For each implemented or changed feature, update the relevant documentation when behavior, configuration, API contracts, setup, or operational procedures change. Keep `documentation/README.md` as the documentation index when it is present.
- Write documentation in Spanish unless the user requests another language. Use fictitious example values and never include secrets or real personal data.
- Preserve existing documentation and pending working-tree changes; inspect their state before editing or restoring files.
