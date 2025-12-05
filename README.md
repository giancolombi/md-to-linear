# Markdown to Linear Converter

A web application that converts markdown files into Linear projects, issues, and sub-issues.

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd md-to-linear

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Linear API credentials

# 4. Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **Linear Account**: You'll need a Linear API key and team ID
  - Get your API key at: https://linear.app/settings/api

## Environment Variables

Create a `.env.local` file:

```bash
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINEAR_TEAM_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Markdown Format

The tool uses a 3-level hierarchy:

```markdown
# Project Name

## Task 1: Task Title

### Subtasks

#### Subtask 1.1: Subtask Title

**Description**

Details about this subtask.
```

- **`#` (H1)** - Creates a Linear **Project**
- **`## Task N:`** - Creates a **Task** (issue) within the project
- **`#### Subtask N.M:`** - Creates a **Subtask** (sub-issue) under the task

## Features

- Live preview of parsed markdown structure
- Real-time progress tracking during migration
- Support for projects, tasks, and subtasks
- Error handling with detailed feedback

## Development

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run start  # Start production server
```

## Project Structure

```
├── src/
│   ├── app/           # Next.js app router
│   │   ├── api/       # API routes
│   │   └── page.tsx   # Main page
│   ├── components/    # React components
│   │   └── ui/        # shadcn/ui primitives
│   └── lib/           # Utilities and parser
├── public/            # Static assets
└── package.json
```
