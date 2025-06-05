# Commit Message Examples

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Good Examples

### Features

```
feat: add episode player with volume controls
feat(ui): implement theme switcher component
feat(api): add episode generation queue endpoint
```

### Bug Fixes

```
fix: resolve sidebar layout spacing issue
fix(player): correct audio playback state management
fix(database): handle connection timeout errors
```

### Documentation

```
docs: update API endpoint documentation
docs(readme): add development setup instructions
```

### Refactoring

```
refactor: extract episode card variants to separate files
refactor(components): simplify button component props
```

### Styling

```
style: fix code formatting and linting errors
style(components): adjust spacing and typography
```

### Performance

```
perf: optimize episode loading with lazy loading
perf(api): add caching to episode queries
```

### Tests

```
test: add unit tests for episode player component
test(api): add integration tests for queue endpoints
```

### Chores

```
chore: update dependencies to latest versions
chore(build): configure webpack optimization
```

### CI/Build

```
ci: add automated testing workflow
build: configure Vercel deployment settings
```

## Rules Enforced by Commitlint

- **Required**: type and description
- **Max length**: 100 characters for header
- **No period**: at end of subject line
- **Case**: subject should be lowercase (except proper nouns)
- **Types allowed**: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert

## Bad Examples (Will Fail)

```bash
# Missing type
"add new feature"

# Capitalized subject
"feat: Add new feature"

# Period at end
"feat: add new feature."

# Too long
"feat: add a really long description that exceeds the maximum character limit for commit messages"

# Invalid type
"feature: add new component"
```
