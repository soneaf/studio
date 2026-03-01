# Project: Content Creation Studio (YaVe Cocktail Studio)

## Project Overview
- **Description**: AI-powered web application for generating photorealistic product imagery. Features two modes: Tequila Mode (cocktail scenes with YaVe Tequila) and Studio Mode (general product photography). Packaged as a desktop app via Electron.
- **Tech Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma ORM (SQLite) + Electron + Google Generative AI (Gemini)
- **Package Manager**: npm
- **Deployment Target**: Local Electron app (.dmg for macOS)

## Architecture

### Directory Structure
```
app/                  # Next.js App Router — pages, API routes, server actions
  ├── page.tsx        # Main studio interface (prompt builder + generation)
  ├── history/        # History view for past generations
  ├── actions.ts      # Server actions (Gemini image generation, file ops)
  ├── settings-actions.ts  # Settings CRUD (products, assets, bottles)
  └── campaign-actions.ts  # Campaign management
components/           # React UI components
  ├── CocktailBuilderControls.tsx  # Tequila Mode controls
  ├── StudioBuilderControls.tsx    # Studio Mode controls
  ├── WizardOverlay.tsx            # Multi-step wizard for guided generation
  ├── SettingsModal.tsx            # App settings, asset management
  ├── PromptReviewPanel.tsx        # Live prompt preview
  └── GeneratedResult.tsx          # Generation result modal
lib/                  # Core logic and shared utilities
  ├── builder-context.tsx  # React Context — central state management
  ├── prompt-generator.ts  # Builds AI prompts from UI state (CRITICAL FILE)
  └── data.ts              # All constants, options, presets, SKU definitions
electron/             # Electron main process (desktop app wrapper)
prisma/               # Database schema and SQLite DB
  ├── schema.prisma   # Campaign + Cocktail models
  └── dev.db          # Local SQLite database
public/               # Static assets
  ├── history/        # Generated images archive
  ├── products/       # Studio mode product images
  └── bottles/        # Tequila bottle reference images
build/                # Electron build resources (icons)
dist_electron/        # Built Electron app output (.dmg, .app)
yave-source-code/     # Legacy source snapshot (v0.1.0) — do not modify
docs/                 # Documentation and visualizations
```

### Key Architecture Patterns
- **State Management**: Single React Context (`BuilderContext`) in `lib/builder-context.tsx` holds all app state. Components read/write via `useBuilder()` hook.
- **Prompt Pipeline**: UI state → `lib/prompt-generator.ts` (`generateCocktailPrompt()`) → text prompt → Gemini API with reference images.
- **Server Actions**: All server-side operations (image generation, file I/O, DB) use Next.js Server Actions in `app/actions.ts` and `app/settings-actions.ts`.
- **Dual Mode**: The app supports `tequila` and `studio` modes, switching via `state.mode`. Both share the same context but render different control components.
- **Dispatch Pattern**: The `WizardOverlay` uses a `dispatch()` adapter on the context for action-based state updates (e.g., `UPDATE_BOTTLE_PLACEMENT`, `ADD_PROP`).

### Critical Files
- **`lib/prompt-generator.ts`** — The heart of the app. Converts all UI selections into the text prompt sent to Gemini. Any new UI control MUST have its value wired into this file or it won't affect generation.
- **`lib/builder-context.tsx`** — All app state lives here. New features need state added here first.
- **`lib/data.ts`** — All option constants (bottles, garnishes, backgrounds, etc.). New options go here.
- **`app/page.tsx`** — Main page orchestrates generation, collects image paths, and calls the prompt generator.

### Key Conventions
- **Components**: PascalCase filenames (`CocktailBuilderControls.tsx`). One component per file.
- **State Updates**: Use context setters or `dispatch()` for state mutations.
- **Styling**: Tailwind CSS with CSS custom properties defined in `app/globals.css`. Dark theme with gold accent (`--color-yave-gold: #c1b856`).
- **Selection Indicators**: Gold border + gold dot pattern for selected items throughout the UI.

## Workflow Rules

### Planning First
- Start every complex task in **plan mode**. The prompt generator and state context are tightly coupled — changes to one often require changes to both.
- For simple UI tweaks or option additions, execute directly.

### The Prompt Pipeline Checklist
When adding any new UI control or option:
1. Add the data/options to `lib/data.ts`
2. Add state field to `BuilderState` in `lib/builder-context.tsx`
3. Add setter/dispatch handler in `builder-context.tsx`
4. Wire UI component to read/write the state
5. **Add prompt output in `lib/prompt-generator.ts`** — this is the step most commonly missed
6. Verify the prompt preview panel shows the new data

### Autonomous Execution
- If the build fails, read the error output carefully and resolve before moving on.
- If TypeScript errors block the build, fix them (common: Prisma client out of date → run `npx prisma generate`).
- If a linter flags issues, fix them as part of the current task.

## Git Workflow
- This project does not currently use git. If initialized in the future:
  - Use conventional commit format: `type: concise description`
  - Types: `feat`, `fix`, `refactor`, `chore`

## Code Style

### General Principles
- Write readable code over clever code.
- No premature abstractions — this is a single-purpose app, keep it direct.
- Delete dead code. Do not comment it out.

### TypeScript Specific
- `any` is used in some places due to dynamic state shapes — minimize but accept where needed for dispatch/context patterns.
- Use `as const` for literal option arrays in `data.ts`.
- Use path aliases (`@/`) for imports.

### Imports
- Group: (1) external packages, (2) `@/` aliases, (3) relative imports.

## Environment & Setup

### Bootstrap
```bash
cd "Content Creation Studio"
npm install
npx prisma generate
npm run dev
# Opens at http://localhost:3005
```

### Build Electron App
```bash
npm run dist
# Output: dist_electron/Content Creation Studio-{version}-arm64.dmg
```

### Required Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite path (in `.env`) | Yes |
| `GOOGLE_AI_API_KEY` | Gemini API key (in `.env.local`) | Yes |

## Known Gotchas
- **Prisma client out of sync**: If you modify `prisma/schema.prisma`, run `npx prisma generate` before building. The build will fail with "Property X does not exist on type PrismaClient" otherwise.
- **Port 3005**: Dev server runs on port 3005 (not the default 3000). Check `package.json` scripts.
- **Bottle placement bug (fixed Feb 2026)**: Bottle `placementX`/`placementDepth` were not reaching the prompt in bottle-only mode. Fixed in `prompt-generator.ts` — both single and multi-bottle paths now include placement data.
- **`humanText` in bottle-only mode (fixed Feb 2026)**: Human element descriptions were silently dropped in bottle-only prompts. Now included.
- **JSX.Element namespace**: Use `React.JSX.Element` instead of bare `JSX.Element` in newer React/TS versions.
- **Large DMG builds**: The dist build copies all of `node_modules` into the standalone bundle, resulting in ~1.4GB DMGs. This is expected.

## Dependencies & Packages
- **@google/generative-ai** — Gemini API client for image generation
- **@imgly/background-removal** — Client-side background removal
- **@prisma/client** — ORM for SQLite database
- **lucide-react** — Icon library
- **papaparse** — CSV export for history
- **electron / electron-builder** — Desktop app packaging

## MCP & Tools Available
- **Stitch**: UI design generation and prototyping.
- **Playwright**: Browser automation for testing.

## Custom Slash Commands

### Build & Create
- `/scaffold` — Generate boilerplate for a new feature.
- `/parallel` — Break a large task into independent parallel tracks.

### Quality & Maintenance
- `/review` — Deep code review of recent changes.
- `/improve` — Analyze an existing feature and suggest improvements.
- `/techdebt` — Scan codebase for code smells and cleanup opportunities.

### Verify & Learn
- `/verify` — Launch the app in a browser and test visually.
- `/learn` — Capture patterns and decisions back into this CLAUDE.md.

### Visualize & Design
- `/visualize` — Generate visual HTML presentations for architecture.

## Communication Style
- Be direct. Skip filler.
- Always explain the "why" behind changes.
- When presenting options, lead with the recommendation.
