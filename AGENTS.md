# AGENTS.md - Repository Guidelines

## Build Commands
- **CLI tool**: `npm install && npm start example-tasks.md` - Run markdown to Linear converter
- **Web app dev**: `cd md-to-linear-app && npm install && npm run dev` - Start dev server at localhost:3000
- **Web app build**: `cd md-to-linear-app && npm run build` - Production build with Turbopack
- **No tests configured** - Add tests as needed

## Code Style
- **ES Modules**: Use `import/export` syntax (`"type": "module"` in package.json)
- **TypeScript**: Strict mode for Next.js app; CLI uses plain JavaScript
- **Imports**: Use `@/*` absolute imports in Next.js app (e.g., `@/components/ui/button`)
- **Async/Await**: Preferred over raw promises
- **Error Handling**: Use try-catch with descriptive console.error messages via chalk
- **Naming**: camelCase for variables/functions, PascalCase for React components

## Project Structure
- **Root**: Node.js CLI (`index.js`) using Linear SDK, chalk, dotenv
- **md-to-linear-app/**: Next.js 15 + React 19 + Tailwind CSS + shadcn/ui
- **Components**: `components/` for app components, `components/ui/` for shadcn primitives
- **API Routes**: App Router in `app/api/` (e.g., `app/api/migrate/route.ts`)
- **Environment**: Requires `LINEAR_API_KEY` and `LINEAR_TEAM_ID` in `.env` files
