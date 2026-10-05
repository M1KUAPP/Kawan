# Commit messages — Conventional Commits (enforced)

All commits MUST follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): subject`.

- Allowed types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `build`, `ci`, `style`, `revert`.
- Scope is optional but encouraged — use the lane or area: `feat(frontend): ...`, `fix(ai): ...`, `chore(tooling): ...`, `docs: ...`.
- Subject in lower case, imperative mood, no trailing period.
- The header (`type(scope): subject`) is at most 50 characters, scope included.
- Enforcement is mechanical: the husky `commit-msg` hook runs commitlint (rules in `commitlint.config.mjs`); non-conforming messages are rejected. Write conforming messages on the first attempt.
- Judges review this repo's git history — keep messages meaningful; never use empty or placeholder messages.
