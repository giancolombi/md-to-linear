# AGENTS.md - Repository Guidelines

## Build Commands
- `npm install` - Install dependencies
- `npm run dev` - Start dev server at localhost:3000
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- No tests configured yet

## Code Style
- **TypeScript**: Strict mode enabled
- **Imports**: Use `@/*` absolute imports (e.g., `@/components/ui/button`)
- **Components**: PascalCase, one component per file
- **Functions**: camelCase, prefer async/await
- **Error Handling**: Use try-catch with descriptive error messages

## Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components, `ui/` for shadcn primitives
- `src/lib/` - Utilities (parser, cn helper)
- **Environment**: Requires `LINEAR_API_KEY` and `LINEAR_TEAM_ID` in `.env.local`
