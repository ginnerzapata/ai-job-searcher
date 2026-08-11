---
status: accepted
---

# Use a pnpm workspace

The local application uses a pnpm workspace for dependency installation, lockfiles, and scripts, with React/Vite in `apps/web` and Hono in `apps/api`. pnpm is the sole package manager; Bun was considered but rejected to avoid competing package-management workflows and lockfiles.
