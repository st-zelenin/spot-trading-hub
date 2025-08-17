# Coding Standards

## TypeScript Style Guidelines

### Naming Conventions

1. **Interface Names**
   - Use PascalCase for interface names
   - Do NOT use the `I` prefix for interfaces (e.g., use `ExchangeService` instead of `IExchangeService`)
   - Interface names should express their purpose (e.g., `TodoItemStorage` for a storage interface)

2. **File Names**
   - Use kebab-case for file names (e.g., `exchange-service.ts` instead of `exchangeService.ts`)
   - Ensure file names match the naming convention used in imports

3. **Class Members**
   - Always use explicit access modifiers (`public`, `private`, `protected`) for all class members
   - Use `readonly` for properties that should not be modified after initialization

### Type Safety

1. **Type Annotations**
   - Always add explicit type annotations for function parameters and return types
   - Particularly important in Express middleware and route handlers
   - Prefer interfaces over type aliases for object shapes
   - Avoid using `any` type; use more specific types or `unknown` when appropriate

### Code Organization

1. **Interface Definitions**
   - Move interface definitions to separate files
   - Create a dedicated directory for DTOs (Data Transfer Objects) under models
   - Group related interfaces by domain (e.g., order-related DTOs)

2. **Service Interfaces**
   - Place service interfaces in a dedicated `interfaces` directory
   - Use interface segregation principle (ISP) to create focused interfaces
   - Implement common functionality in base interfaces

### Error Handling

1. **Consistent Error Responses**
   - Use standardized error response format across the application
   - Include meaningful error messages
   - Log errors with appropriate context

### Documentation

1. **JSDoc Comments**
   - Add JSDoc comments for all public methods and interfaces
   - Include parameter descriptions and return type information
   - Add examples where appropriate

2. **Code Comments**
   - Do not add comments to self-explanatory code
   - Only add comments when they provide genuine value (explaining complex logic, non-obvious decisions, or important warnings)
   - Let clean, readable code speak for itself

## Linting and Formatting

1. **ESLint**
   - Follow the ESLint configuration in `.eslintrc.js`
   - Run `npm run lint` to check for linting issues
   - Run `npm run lint:fix` to automatically fix linting issues

2. **Prettier**
   - Follow the Prettier configuration in `.prettierrc`
   - Run `npm run format` to format code
   - Run `npm run format:check` to check for formatting issues

3. **Pre-commit Hooks**
   - Husky is configured to run lint-staged on pre-commit
   - This ensures that all committed code meets the coding standards

## Testing

1. **Unit Tests**
   - Write unit tests for all business logic
   - Use Jest as the testing framework
   - Aim for high test coverage

2. **Integration Tests**
   - Write integration tests for API endpoints
   - Test the interaction between components

## Git Workflow

1. **Commit Messages**
   - Use conventional commit format
     - Types include: feat, fix, docs, style, refactor, test, chore, etc.
     - Example: `feat(auth): add login functionality` or `fix: resolve memory leak`
   - Write clear and concise commit messages
   - Use the imperative mood (e.g., "add feature" instead of "added feature")


2. **Branching Strategy**
   - Use feature branches for new features
   - Use bugfix branches for bug fixes
   - Use release branches for releases
