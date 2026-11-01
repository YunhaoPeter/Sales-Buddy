# Repository workflow

- `main` is the stable baseline. `develop` is the integration branch.
- After the initial repository import, start every implementation on a new `codex/<short-task>` branch based on the latest `develop`. Human-authored branches may use `feature/`, `fix/`, or `docs/`.
- Do not implement or commit routine changes directly on `main` or `develop`. Push the task branch and open a pull request targeting `develop`. Promote verified releases with a separate PR from `develop` to `main`.
- Fetch before branching when network access is available. Preserve unrelated local changes. Do not force-push shared branches, rewrite remote history, or reset user data.
- A request to implement a change authorizes its task branch, commits, push and reviewable PR. Merge only when the user's request includes merging or releasing.
- Use `npm run test:ci` and `npm run build` for portable checks. Run `npm test` and relevant Playwright journeys locally when the change affects CRM, conversations, memory, or P11. Full presentation generation tests require the separately configured Artifact runtime; never claim that the portable suite covers those operations.
- Never commit `.env`, API keys, runtime databases, local conversations/memory, uploads, or generated private reports. Run `npm run security:check` against staged changes before committing. Use `.env.example` for blank configuration.
- Keep product planning under `docs/`, Pencil sources under `designs/`, sales knowledge under `knowledge/sales/`, research under `knowledge/research/`, and bundled PPT assets under `assets/presentations/`. All databases, memory, uploads, reports and test runs belong under ignored `runtime/`. Use the shared paths and test-directory helper; never create root-level `data-test-*` folders. Update relevant documentation and describe validation in the PR.
- Do not run scenario reset or overwrite existing user-created CRM records as part of ordinary development or deployment.

Initial import exception: the first baseline commit may initialize an empty `main`, followed by creation of `develop` at the same revision.
