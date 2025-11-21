# Iotrix Final

Short description: Iotrix is a Next.js dashboard and student portal project used for demonstration and internal use. This repository contains the app source, small tooling, and development configurations.

**Status:** Work in progress — this repo is prepared for public hosting by documenting structure and adding ignores for secrets.

**Quick Start**
- Install dependencies: `pnpm install`
- Run dev server: `pnpm run dev`
- Build: `pnpm run build`

**What to Keep In The Repo (required files)**
- `package.json` — project manifest
- `pnpm-lock.yaml` — lockfile for reproducible installs
- `app/` — application source (Next.js app directory)
- `postcss.config.cjs`, `tailwind.config.js` — build / styling config
- `db_schema.json`, `tasks.md`, documentation files describing the project

**Secrets & Local Files (do NOT commit)**
The repository previously contained credentials and exported datasets. Those should be removed from version control and replaced with environment-driven configuration. Ensure the following (or similar) files are NOT committed:
- `iotrix-final-firebase-adminsdk-fbsvc-6e07edd126.json` (Firebase admin service account)
- `firebaseConfig.js` (Firebase config with API keys)
- `student_data.json` (exported student datasets)
- Any `.env`, `.env.local`, or secret files

These are listed in `.gitignore` and should be removed from the repo history if they were previously committed.

**Contributing**
Please read `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` before opening issues or PRs. Use the provided GitHub issue and PR templates for reporting bugs or requesting changes.

**Next steps (recommended)**
- Add a `LICENSE` file (e.g., MIT) if you intend to make this public.
- Rotate any credentials that were committed in the past and remove them from history (use `git rm --cached <file>` and consider `git filter-repo` or BFG to scrub history).
- Add CI (GitHub Actions) for linting and tests.
