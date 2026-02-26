# Copilot Instructions

## Project Overview

Dwarfium is a desktop application for controlling DWARF smart telescopes (mini / II / 3).
Fork of [stevejcl/dwarfium](https://github.com/stevejcl/dwarfium) `apiV2` branch (v2.5.5).

## Tech Stack

- **Framework:** Next.js 15 with Pages Router (`src/pages/`)
- **UI:** React 18 + TypeScript 5
- **Styling:** Bootstrap 5 + React Bootstrap + MUI (no Tailwind)
- **Desktop:** Tauri v1 (Rust wrapper in `src-tauri/`)
- **State:** React Context (`src/stores/ConnectionContext.tsx`) + RTK Query (asteroids only)
- **i18n:** i18next + react-i18next (10 languages in `src/locales/`)
- **Testing:** Jest 29 + React Testing Library
- **Server:** Express + WebSocket proxy (`server/server.ts`)
- **Device API:** `dwarfii_api` npm package (WebSocket + Protobuf/JSON)

## Architecture

### Pages Router (not App Router)

This project uses **Pages Router** (`src/pages/`), NOT App Router.
The upstream codebase predates App Router adoption and has extensive Pages Router patterns
(70+ context properties, `_app.tsx` provider nesting, `src/pages/api/` routes).
Migration is not planned — all new code must follow Pages Router conventions.
Do NOT use `'use client'` directives or `app/` directory patterns.

### Directory Structure

- `src/pages/` — Page components and API routes (`src/pages/api/`)
- `src/lib/` — Shared utilities (NOT `lib/` at root)
- `src/lib/ai/` — AI feature core logic (new)
- `src/components/ai/` — AI feature UI components (new)
- `src/stores/` — React Context providers
- `src/hooks/` — Custom React hooks
- `src/__tests__/lib/` — Test files
- `data/catalogs/` — DSO catalog data (~1,000+ objects)
- `public/mosaic/cat_json/` — Mosaic planning catalogs

### Tauri Desktop (v1)

Tauri is used as a minimal desktop wrapper. The Rust code in `src-tauri/src/main.rs` is
intentionally minimal — do NOT add custom Tauri commands or modify Rust code.

The frontend uses Tauri only for **sidecar process management** in `src/pages/_app.tsx`:

```typescript
import { Command } from "@tauri-apps/api/shell";
// Spawn proxy and media streaming sidecars
const proxy = Command.sidecar("bin/DwarfiumProxy", [...args]);
const mediamtx = Command.sidecar("bin/mediamtx", [configPath]);
```

All telescope communication goes through the WebSocket proxy, not Tauri IPC.

### State Management

**Primary: ConnectionContext** (`src/stores/ConnectionContext.tsx`)
- Single context with 70+ properties managing all app state
- Connection status, device info, camera settings, imaging session, location, Stellarium
- Access via `useContext(ConnectionContext)`

**Secondary: ApplicationProvider** (`src/components/witmotion/ApplicationProvider.tsx`)
- Witmotion IMU sensor state only
- Access via `useApplicationContext()`

**Redux (RTK Query)** (`src/components/asteroids/api/store.ts`)
- Used ONLY for NASA asteroid API queries
- Do NOT extend Redux usage — use ConnectionContext for new state

### DWARF Device Communication (dwarfii_api)

All telescope communication uses the `dwarfii_api` package via WebSocket + Protobuf.
The pattern is:

```typescript
import { WebSocketHandler } from "dwarfii_api";
import { Dwarfii_Api, messageCameraTeleOpenCamera } from "dwarfii_api";

// 1. Get or create WebSocket handler
const webSocketHandler = connectionCtx.socketIPDwarf
  ?? new WebSocketHandler(IPDwarf);

// 2. Create Protobuf command messages
const WS_Packet = messageCameraTeleOpenCamera(binning);

// 3. Define response handlers
const customMessageHandler = (txt_info, result_data) => {
  if (result_data.cmd === Dwarfii_Api.DwarfCMD.CMD_CAMERA_TELE_OPEN_CAMERA) {
    if (result_data.data.code === Dwarfii_Api.DwarfErrorCode.OK) {
      // Success
    }
  }
};

// 4. Prepare and run
webSocketHandler.prepare(
  [WS_Packet],           // Protobuf messages to send
  "OpenCamera",          // Command label for logging
  ["*"],                 // Response cmd filters ("*" = all)
  customMessageHandler,  // Response handler
  customStateHandler,    // Connection state changes
  customErrorHandler,    // Socket close handler
  customReconnectHandler // Auto-reconnect trigger
);
webSocketHandler.run();
```

Key files: `src/lib/connect_utils.ts`, `src/lib/dwarf_utils.ts`, `src/lib/goto_utils.ts`

## Error Handling

Telescope control involves frequent connection drops and timeouts. Follow these patterns:

### Connection Timeouts

```typescript
// 10s timeout for socket operations
webSocketHandler.closeSocketTimer = setTimeout(() => {
  webSocketHandler.handleClose("");
  connectionCtx.setConnectionStatus(false);
}, 10000);
```

### Health Check with Retry

```typescript
// 90s interval health check, 5s fetch timeout, max 5 retries
fetch(proxyUrl, { signal: AbortSignal.timeout(5000) })
  .then(() => { errorCount.current = 0; })
  .catch(() => {
    if (errorCount.current < 5) {
      errorCount.current += 1;  // Retry
    } else {
      connectionCtx.setConnectionStatus(false);  // Give up
      webSocketHandler.close();
    }
  });
```

### Device Error Codes

```typescript
// Always check result_data.data.code against DwarfErrorCode enum
if (result_data.data.code === Dwarfii_Api.DwarfErrorCode.OK) { /* success */ }
else if (result_data.data.code === Dwarfii_Api.DwarfErrorCode.CODE_ASTRO_FUNCTION_BUSY) {
  setErrors("Error function Busy");
}
```

### Cross-Component Events

```typescript
import eventBus from "@/lib/event_bus";
eventBus.dispatch("clearErrors", {});  // Clear error state
eventBus.on("clearErrors", handler);   // Listen for events
```

### Logging

```typescript
import { logger } from "@/lib/logger";
logger(text, message, connectionCtx);  // Logs to console + persists to DB
```

## AI Features (New Development)

New AI capabilities being added to the fork:

- **Shooting Advisor** (`src/lib/ai/shooting_advisor.ts`) — Recommend optimal exposure, gain, binning based on target object, weather, and equipment
- **Observation Scorer** (`src/lib/ai/observation_scorer.ts`) — Score current observing conditions (cloud cover, moon phase, light pollution)
- **Plate Solver** (`src/lib/ai/plate_solver.ts`) — Identify celestial objects via Astrometry.net API
- **Vision Identifier** (`src/lib/ai/vision_identifier.ts`) — Claude Vision API fallback for object identification
- **Image Annotation** (`src/lib/ai/annotation_engine.ts`) — Overlay object names, constellation lines on captured images

Phase 1 is rule-based (no API keys required). Phase 2 adds LLM integration via Anthropic API.

## TypeScript

- Use strict mode (`strict: true` in tsconfig.json).
- Avoid `any` — use `unknown` or specific types.
- Use interfaces for component props and function parameters.
- Path alias: `@/*` maps to `./src/*`.

## React Components

- Use functional components with hooks. No class components.
- Keep components focused and under 200 lines when possible.
- Extract reusable logic into custom hooks (`src/hooks/`).
- Use `useTranslation()` from react-i18next for all user-facing strings.
- Do NOT hardcode display strings — always use i18n keys.

## Styling

- Use Bootstrap classes and React Bootstrap components as primary styling.
- MUI components are used alongside Bootstrap — follow existing patterns.
- CSS files are in `src/styles/`. Add styles to existing files when possible.

## i18n

- All user-facing strings must use i18n keys via `useTranslation()`.
- Translation files are in `src/locales/{lang}.json` (flat key-value JSON).
- When adding new strings, add keys to ALL locale files (en, ja, de, es, fr, it, nl, pl, pt, zh_CN).
- Key naming convention: `p` prefix for pages, `c` prefix for components (e.g., `pSetLocation`, `cNavHome`).

## Testing

- Write tests in `src/__tests__/lib/` following existing patterns.
- Use Jest with jsdom environment.
- New utility functions in `src/lib/` and `src/lib/ai/` must have tests.
- Run tests with `npm run test`.

## Code Quality

- Comments in English.
- Commit messages in English, Conventional Commits format (`feat:`, `fix:`, `test:`, etc.).
- Documentation and README in Japanese.
- Minimize changes to existing upstream code — prefer adding new files.
- New AI features go in dedicated directories (`src/lib/ai/`, `src/components/ai/`).

## Do NOT

- Do not use App Router patterns (no `app/` directory, no `'use client'` directives).
- Do not introduce Tailwind CSS.
- Do not add barrel files (`index.ts` re-exports).
- Do not create example/demo files unless explicitly requested.
- Do not modify upstream code unless absolutely necessary.
- Do not add custom Tauri commands in Rust — keep `main.rs` minimal.
- Do not extend Redux usage — use ConnectionContext for new state.
