# Spot Trading Hub

A Node.js application for managing crypto exchange spot orders.

## Features

- Unified API for multiple cryptocurrency exchanges
- Order management (create, cancel, query)
- Swagger API documentation
- TypeScript for type safety

## Project Structure

```
src/
├── config/           # Configuration and environment variables
├── controllers/      # API controllers
├── models/           # Data models and DTOs
│   └── dto/          # Data Transfer Objects
├── routes/           # API routes
├── services/         # Business logic and exchange integrations
│   ├── interfaces/   # Service interfaces
│   └── exchanges/    # Exchange-specific implementations
└── utils/            # Utility functions and helpers
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/spot-trading-hub.git
   cd spot-trading-hub
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```bash
   cp .env.example .env
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

### API Documentation

Swagger documentation is available at `http://localhost:3000/api-docs` when the server is running.

## Development

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Linting and Formatting

```bash
npm run lint        # Check for linting issues
npm run lint:fix    # Fix linting issues
npm run format      # Format code
```

### Git Hooks

This project uses Husky and lint-staged to automatically check code quality before commits:

- **pre-commit**: Runs lint-staged on staged files to ensure they meet code standards

## Architecture

### Service Layer

The service layer follows these principles:

1. **Interface Segregation**: Each service interface defines a specific set of operations
2. **Factory Pattern**: The `ExchangeFactory` creates appropriate exchange service instances
3. **Dependency Injection**: Services receive their dependencies through constructors

### Controller Layer

Controllers handle HTTP requests and delegate business logic to services:

1. **Single Responsibility**: Each controller handles a specific resource
2. **Validation**: Input validation is performed before processing
3. **Error Handling**: Standardized error responses are returned

## License

ISC