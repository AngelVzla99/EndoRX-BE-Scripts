# EndoRX Scripts

A TypeScript project with ESM support.

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration values.

## Development

Run the project in development mode (with hot reload):
```bash
yarn dev
```

## Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

## Production

Run the compiled JavaScript:
```bash
npm start
```

## Installed Packages

- **TypeScript**: Static typing for JavaScript
- **tsx**: TypeScript execution environment for Node.js
- **dotenv**: Load environment variables from .env file
- **axios**: HTTP client for making API requests
- **mongoose**: MongoDB object modeling tool

## Project Structure

```
.
├── src/
│   └── index.ts       # Main entry point
├── dist/              # Compiled JavaScript (generated)
├── .env               # Environment variables (create from .env.example)
├── .env.example       # Example environment variables
├── tsconfig.json      # TypeScript configuration
└── package.json       # Project dependencies and scripts
```

