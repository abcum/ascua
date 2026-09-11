# ascua

## Project overview

Lerna-managed monorepo of `@ascua/*` Ember addons used by the Hire Insight platform. Provides reusable UI components, integrations, and utilities.

### Tech stack

- **Framework:** Ember.js (addon format)
- **Monorepo:** Lerna with npm
- **Build:** ember-cli

### Development setup

This is a Lerna-managed monorepo. **Always use the Makefile commands** for dependency management.

**Installing dependencies** — use `make setup`:
- Runs `npm install` to set up the monorepo correctly
- Properly configures all Lerna-managed packages

**IMPORTANT**: do NOT manually run `npm install`, `npm ci`, or other npm commands without going through the Makefile - it may not properly configure the Lerna workspace.

**Cleaning dependencies** — use `make clean`:
- Removes all `node_modules` directories
- Cleans Lerna packages with `lerna clean`
- Removes temporary files, build artifacts, and unnecessary config files from packages
- Cleans `dist`, `tmp`, and other build directories

### Other available commands

- `make serve` — Start the development server (with Fastboot disabled)
- `make version` — Version packages using Lerna
- `make publish` — Publish packages to npm
- `make deploy` — Deploy to production

Reference `Makefile` for the complete list of available commands.

## Commit conventions

- Use **imperative mood** ("Fix", "Add", "Ensure", not "Fixed", "Added", "Ensures")
- Use **sentence case** (capitalise the first word only)
- No conventional commit prefixes (no `feat:`, `fix:`, `chore:`, etc.)
- Version bump commits use bare version numbers (e.g. `v0.13.1`)
- Never commit `.env` files, credentials, or secret keys

Good:
- `Fix image importing`
- `Ensure gravatar images are not duplicated`
- `Make improvements to @ascua/quill.js package`
- `v0.13.1`

Bad:
- `fix: image importing` (no prefixes)
- `Fixed image importing` (use imperative mood)
- `fix image importing` (capitalise first word)

## Style

Use British English spelling in all code, comments, commit messages, and documentation.

- **-ise** not -ize (e.g. initialise, organise, optimise)
- **-our** not -or (e.g. colour, behaviour, favourite)
- **-tre** not -ter (e.g. centre, metre)
- **-ence** not -ense (e.g. licence, defence)
- **-lled/-lling** not -led/-ling (e.g. cancelled, modelling)
- **-ogue** not -og (e.g. catalogue, dialogue)
