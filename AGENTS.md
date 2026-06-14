## component-patterns

`.opencode/skills/component-patterns/SKILL.md` — component/store/dialog/page conventions for dashboard features.

## component-test-patterns

`.opencode/skills/component-test-patterns/SKILL.md` — test organization, mock conventions, store auth-branching, and component interaction testing.

## api-patterns

`.opencode/skills/api-endpoint-patterns/SKILL.md` — route handlers, validation, migrations, tests, OpenAPI.

## graphify

Knowledge graph at `graphify-out/`. Use `graphify query|path|explain` for codebase questions (faster than grep). Run `graphify update .` after code changes. Trigger with `/graphify`.

## verification

After every code change, run these checks:
```
npm run lint:fix && npm run typecheck && npm test && npx fallow dead-code
```
