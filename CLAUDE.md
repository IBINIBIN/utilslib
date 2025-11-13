# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo for `@utilslib` - a collection of utility libraries published to npm. The project is organized into packages targeting different environments:

- **@utilslib/core** - Core utility functions (array, string, function, async, validator, etc.)
- **@utilslib/web** - Web-specific utilities (DOM manipulation, browser detection)
- **@utilslib/node** - Node.js-specific utilities (environment detection)
- **@utilslib/uniapp** - UniApp-specific utilities (cross-platform mobile development)
- **@utilslib/types** - TypeScript type definitions

## Development Commands

### Building
```bash
# Build all packages (production)
npm run build

# Build code only (excludes documentation)
npm run build:code

# Build integrated (code + documentation)
npm run build:integration

# Build documentation only
npm run build:doc

# Build VS Code snippets
npm run build:buildVscodeSnippetsJson
```

### Testing
```bash
# Run all tests
npm run test

# Run tests for specific package
npx jest packages/web/__tests__/

# Run tests with coverage
npm run test -- --coverage

# Run tests for single file
npm test -- packages/web/__tests__/dom.test.ts
```

### Linting
```bash
# Fix linting issues
npm run lint:fix

# Lint specific patterns
npm run lint:fix -- packages/**/*.ts
```

### Package Management
```bash
# Create new package interactively
npm run createPackage

# Update package versions
npm run updateVersion:package

# Dry-run publish (test deployment)
npm run deploy:test
```

### Documentation
```bash
# Deprecated commands (do not use)
# npm run dev:doc (deprecated)
# npm run build:doc-config (deprecated)
```

## Architecture

### Custom Monorepo Setup
The project uses a custom monorepo setup without Lerna or Nx. Key architectural decisions:

- Each package is self-contained in `packages/*/` with its own `package.json` and `tsconfig.json`
- Internal dependencies use `workspace:^` notation (e.g., `@utilslib/core` depends on `@utilslib/types`)
- Build process automatically creates aliases for cross-package imports using `rollup.config.js`

### Build System (Rollup-based)
The build system uses a sophisticated Rollup configuration (`rollup.config.js`) that:

- Generates three output formats for each package: ESM, CommonJS, and IIFE
- Outputs to both `dist/` (for npm) and `lib/` (for direct copying)
- Creates separate TypeScript declarations using `rollup-plugin-dts`
- Uses automatic package discovery via `globSync("packages/*/src/index.ts")`
- Applies package-specific naming: `_utilslibCore`, `_utilslibWeb`, etc.

### Package Architecture
- **Core utilities**: Located in `packages/*/src/` with functional organization
- **Exports**: Each package exports from its `src/index.ts` file
- **Dependencies**: Cross-package imports are resolved as aliases during build
- **Web package**: Requires DOM APIs and is designed for browser environments
- **Testing**: JSDOM environment for web package tests, Node environment for others

### Testing Strategy
- Jest with TypeScript support using `ts-jest/presets/js-with-ts-esm`
- ESM module support with proper module name mapping
- Tests located in `packages/**/__tests__/**/*.test.{ts,tsx}`
- Web package tests use JSDOM environment via `@jest-environment jsdom`
- Coverage collection from all TypeScript source files

## Code Quality

- ESLint with TypeScript support and Prettier integration
- Git hooks via Husky for pre-commit linting
- Lint-staged runs on all staged files
- Strict TypeScript configuration in individual packages
- 100% test coverage requirement for new utilities

## Development Workflow

### Adding New Utilities
1. Add functions to appropriate package based on environment (core/web/node/uniapp)
2. Export from package's `src/index.ts`
3. Write comprehensive tests in corresponding `__tests__/` directory
4. Run `npm run test` to verify functionality and coverage
5. Update package version if needed with `npm run updateVersion:package`

### Web Package Development
- DOM manipulation functions use `HTMLElement` type for HTML-specific APIs
- Browser detection uses `navigator` and `window` globals
- Tests require JSDOM mocking for browser APIs
- Functions should handle cases where elements are null/undefined gracefully

### Package Creation Process
1. Run `npm run createPackage` and follow prompts
2. Add package structure following existing patterns (src/index.ts, tsconfig.json, package.json)
3. Update build system if special handling needed
4. Add initial test suite with proper environment setup

### Publishing
- Use `pnpm` as package manager (required by engines field in package.json)
- All packages publish to public npm registry
- Use `npm run deploy:test` to verify before actual publish

## Key Configuration Files

- `rollup.config.js` - Custom build configuration with automatic package discovery
- `jest.config.json` - Jest configuration with TypeScript and ESM support
- `eslint.config.js` - ESLint with TypeScript and Prettier rules
- Each package has its own `tsconfig.json` for TypeScript compilation
- Package-specific engines requirement: Node.js >=16 and pnpm 8