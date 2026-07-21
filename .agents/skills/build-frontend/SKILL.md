---
name: build-frontend
description: Build Forrit's production Remix/Vite frontend and commit only the generated embedded client assets. Use when the user explicitly asks to rebuild, regenerate, update, or commit frontend artifacts under frontend/build/client.
---

# Build Frontend

Rebuild Forrit's embedded frontend and keep the generated output in a separate
Conventional Commit.

## Preserve the worktree

1. Run `git status --short` from the repository root.
2. Treat all existing changes as user-owned. Do not stage, restore, or modify
   unrelated files.
3. Do not rebuild artifacts unless the user explicitly requests it.
4. Do not restart the Vite development server. The production build is a
   separate process and must leave an existing HMR session running.
5. Do not install or update dependencies unless the existing installation is
   missing or unusable. Never stage a lockfile changed only to run this skill.

## Build the artifact

1. Run `pnpm build` from `frontend`.
2. Stop if the build fails. Do not stage or commit partial output.
3. Inspect `git status --short frontend/build/client` and
   `git diff --stat -- frontend/build/client`.
4. Run `git diff --check -- frontend/build/client`.
5. Do not edit generated files manually. Fix source code and rebuild when the
   output is wrong.

Only `frontend/build/client` is the tracked embedded artifact. Do not stage
`frontend/build/server`, frontend source, tests, dependency files, or unrelated
changes as part of the artifact commit.

## Commit the artifact

1. If `frontend/build/client` has no changes, report that the artifact is
   already current and do not create an empty commit.
2. Stage only the generated client with:

   ```sh
   git add -A frontend/build/client
   ```

3. Verify the index before committing:

   ```sh
   git diff --cached --check
   git diff --cached --stat
   git diff --cached --name-only
   ```

4. Confirm that every staged path is under `frontend/build/client`. If another
   path is staged, stop and preserve it for the user instead of including it.
5. Commit with this subject and no co-author trailer:

   ```sh
   git commit -m "chore(frontend): rebuild embedded assets"
   ```

6. Report the commit hash, build result, and any remaining uncommitted changes.
