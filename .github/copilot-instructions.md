# Hyperdash Copilot Instructions

## Project Overview
Hyperdash is a performance monitoring dashboard built with Next.js and React 19 that demonstrates event processing patterns with Web Worker optimization. It's a testing/demonstration app for comparing main-thread vs. Web Worker performance for handling high-volume event streams.

## Key Architecture

### Core Patterns
1. **Event Processing Layer** (`src/store/useEventStore.ts`): Zustand store manages event state with buffering (max 2000 events), worker toggles, and batch intervals
2. **Web Worker System** (`src/workers/eventWorkers.ts` + dashboard page): Offloads CPU-intensive `computeData()` computation from main thread
3. **Widget-Based UI** (`src/components/widgets/`): Dashboard displays data through specialized widgets (Stats, Chart, Logs, Performance)
4. **Control Panel** (`src/components/shell/ControlPanel.tsx`): Real-time configuration for worker mode, batch intervals, and event rate presets (normal/high/extreme)

### Data Flow
1. Dashboard generates random events (5-16 per tick based on preset rate)
2. Events route to either Web Worker (if enabled) or main thread
3. Heavy computation in `computeData()` simulates data processing with configurable `WORK_FACTOR` (500)
4. Results batch-flushed to store at intervals (default 100ms)
5. Widgets subscribe to store changes and re-render

### Key Files by Function
- **State**: `src/store/useEventStore.ts` (Zustand - mutations, event buffer management)
- **Performance Sensing**: `src/hooks/useRenderCount.ts` (tracks re-renders for debugging)
- **Heavy Lifting**: `src/lib/utils.ts` (`computeData()` - simulates realistic workload with random arrays, aggregations)
- **Dashboard Layout**: `src/app/dashboard/page.tsx` (event loop, worker lifecycle, refs for non-reactive state)
- **UI Components**: `src/components/ui/` (button, card, select, switch - shadcn-style primitives)

## Developer Workflows

### Running the App
```bash
npm run dev          # Start dev server on localhost:3000/dashboard
npm run build        # Production build
npm run lint         # Run ESLint (eslint.config.mjs)
```

### Key Concepts
- **Refs for non-reactive state**: Dashboard uses `useRef` to cache worker/batch settings without causing re-renders (see `workerEnabledRef`, `batchIntervalRef`)
- **Worker initialization**: Created on mount in dashboard page; destroyed on unmount
- **Batch flushing**: Debounced via `batchInterval` from store; incrementally updates UI
- **Render counting**: Uncomment logs in `useRenderCount` to profile component re-render frequency

## Project-Specific Patterns

### Styling
- **Tailwind CSS v4** with shadcn-style components (class-variance-authority for variants)
- **Dark mode**: Hardcoded in layout (`dark` class on `<html>`)
- **Utility**: `cn()` function merges Tailwind classes safely (clsx + tailwind-merge)

### Event Simulation
- Event rate controlled via `eventRatePreset` dropdown (100ms extreme, 500ms high, 1000ms normal)
- Each tick generates 5-16 random events; `computeData()` expands with `WORK_FACTOR` multiplier
- Events include metadata: `{ value, source: 'worker'|'main-thread', timestamp }`

### Widget Pattern
All dashboard widgets follow this structure:
```tsx
<WidgetContainer title="..." actions={...} footer={...}>
  {/* Content */}
</WidgetContainer>
```
Widgets subscribe to store selectively (e.g., `useEventStore(s => s.flushCount)`) to avoid unnecessary re-renders.

## Dependencies
- **Next.js 16** + React 19: Framework & UI library
- **Zustand**: Lightweight state management (no context hell)
- **Recharts**: Charts for live event data visualization
- **Radix UI**: Headless component primitives (via shadcn)
- **TanStack Table & Virtual**: Performance-optimized table/list rendering
- **Babel React Compiler**: Automatic memoization (installed but may need enabling in config)

## Integration Points
1. **Web Worker communication**: `worker.postMessage(eventCount)` → worker processes → `worker.onmessage` updates store
2. **Zustand subscriptions**: Components access store via hooks; listen to state changes without re-renders via selector pattern
3. **Tailwind + PostCSS**: CSS generation from component classes (v4 with @tailwindcss/postcss)

## Important Notes
- **No database**: This is an in-memory demo; all events are generated and ephemeral
- **TypeScript strict**: Full type coverage expected
- **"use client" directives**: All interactive components marked for client-side rendering (Next.js 16 App Router)
