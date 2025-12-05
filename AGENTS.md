# AGENTS.md - Repository Guidelines

## Build Commands
- **Main project**: `npm start` - Run CLI markdown to Linear converter
- **Next.js app**: `cd md-to-linear-app && npm run dev` - Development server
- **Build**: `cd md-to-linear-app && npm run build --turbopack` - Production build
- **No test commands defined** - Add tests as needed

## Code Style
- **ES Modules**: Use `import/export` syntax (type: "module" in package.json)
- **TypeScript**: Strict mode enabled for Next.js app (`"strict": true`)
- **React/JSX**: Use `.tsx` for React components, preserve JSX syntax
- **Imports**: Use absolute imports with `@/` prefix in Next.js app
- **Async/Await**: Preferred over promises for better readability
- **Error Handling**: Use try-catch blocks with descriptive error messages

## Project Structure
- **Root**: Node.js CLI tool using Linear SDK for markdown conversion
- **md-to-linear-app/**: Next.js 15 web app with Tailwind CSS and shadcn/ui
- **Components**: Place in `components/` with UI primitives in `components/ui/`
- **API Routes**: Use App Router pattern in `app/api/` directory
- **Environment**: Use `.env` files with `LINEAR_API_KEY` and `LINEAR_TEAM_ID`