# Markdown to Linear Converter

A powerful tool that converts markdown files into Linear projects, issues, and sub-issues. Available as both a CLI script and a web application with a modern UI.

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd md-to-linear

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Linear API credentials

# 4. Find your team ID
node find-team.js

# 5. Run with the example file
npm start example-tasks.md
```

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **Linear Account**: You'll need a Linear API key and team ID
  - Get your API key at: https://linear.app/settings/api

## Features

- **3-Level Hierarchy**: Create Projects → Tasks → Subtasks in Linear
- **Web Application**: Modern Next.js app with shadcn/ui components
- **CLI Script**: Command-line tool for batch processing
- **Live Preview**: See how your markdown will be structured before migrating
- **Progress Tracking**: Real-time feedback during migration
- **Error Handling**: Clear error messages for failed operations

## Project Structure

```
.
├── md-to-linear-app/     # Next.js web application
│   ├── app/              # App router and API routes
│   ├── components/       # React components
│   └── lib/              # Shared utilities
├── index.js              # CLI script
├── find-team.js          # Helper to find your Linear team ID
└── example-tasks.md      # Example markdown file
```

## Setup

### 1. Get Linear API Credentials

1. Go to [Linear Settings](https://linear.app/settings/api)
2. Create a new personal API key
3. Find your team ID by running:
   ```bash
   node find-team.js
   ```

### 2. Configure Environment

Create a `.env` file for the CLI:
```bash
LINEAR_API_KEY=lin_api_xxxxx
LINEAR_TEAM_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

For the web app, create `md-to-linear-app/.env.local`:
```bash
LINEAR_API_KEY=lin_api_xxxxx
LINEAR_TEAM_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Markdown Format

The tool uses a 3-level hierarchy:

```markdown
# Project Name
Project description here...

## Task Title
Task description with details about what needs to be done.

### Subtask Title
Specific subtask that belongs to the task above.

### Another Subtask
Another subtask under the same task.

## Another Task
Description of another task in the project.

### Its Subtask
Subtask description.

# Another Project
Start a new project with its own tasks and subtasks.
```

- **`#` (H1)** → Creates a Linear **Project**
- **`##` (H2)** → Creates a **Task** (issue) within the project
- **`###` (H3)** → Creates a **Subtask** (sub-issue) under the task

## Usage

### Web Application

1. Install dependencies:
   ```bash
   cd md-to-linear-app
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

4. Features:
   - Paste or type markdown in the Input tab
   - Click "Preview" to see the parsed structure
   - Configure API credentials in Settings (or use env variables)
   - Click "Migrate to Linear" to create projects and issues

### CLI Script

1. Install dependencies in the root directory:
   ```bash
   npm install
   ```

2. Run with a markdown file:
   ```bash
   npm start example-tasks.md
   ```
   
   Or directly:
   ```bash
   node index.js example-tasks.md
   ```

## Web App Features

- **Input Tab**: Large text area for markdown with syntax highlighting
- **Preview Tab**: Visual representation of how content will be structured
- **Settings Tab**: Configure API credentials (optional if using env variables)
- **Progress Bar**: Real-time migration progress
- **Results Display**: Shows created projects, tasks, and subtasks with Linear links
- **Error Handling**: Clear display of any issues during migration

## Output

The tool will:
1. Parse your markdown file into projects, tasks, and subtasks
2. Create Linear projects for each `#` header
3. Create issues for each `##` header within the project
4. Create sub-issues for each `###` header linked to parent tasks
5. Display links to all created items in Linear

## Example

See `example-tasks.md` for a complete example of the markdown format. The web app also includes a "Load Example" button to quickly test the functionality.

## Development

### Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **API**: Linear SDK
- **Styling**: Tailwind CSS with CSS variables

### Project Structure
- `/app` - Next.js app router and API routes
- `/components` - React components
- `/lib` - Shared utilities and parser
- `/api/migrate` - API endpoint for Linear migration

## Troubleshooting

### "LINEAR_API_KEY and LINEAR_TEAM_ID must be set"
Make sure you've created a `.env` file with your credentials. You can copy from the example:
```bash
cp .env.example .env
```

### "Team ID not found"
Run `node find-team.js` after setting your `LINEAR_API_KEY` to get a list of available teams.

### Web app not finding credentials
For the Next.js app, create a separate `.env.local` file in the `md-to-linear-app/` directory:
```bash
cp md-to-linear-app/.env.example md-to-linear-app/.env.local
```

## Notes

- Projects are created first, then tasks and subtasks are associated
- All items are created in the team specified by `LINEAR_TEAM_ID`
- The web app supports both light and dark modes
- API keys can be configured via environment variables or the UI