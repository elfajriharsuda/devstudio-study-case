# Segmentation Builder (Front-End Prototype)

Interactive segmentation builder prototype for Momentum’s Product Analytics case study. The app consumes a static JSON dataset from the repo, performs client‑side filtering/aggregation, and renders results with a clean, responsive UI.

---

## Demo

- **DEMO_URL**: https://devstudio-study-case.vercel.app/
---

## Tech Stack

* **Framework**: Next.js 15.5.4 (App Router, Turbopack) + TypeScript 5
* **Styling**: Tailwind CSS v4
* **React**: v19.1.0
* **State**: Local component state + lightweight utils (no global store needed for MVP)
* **Data**: Static JSON file in `public/data/sample_events.json`
* **Linting/Formatting**: ESLint v9, eslint-config-next, Prettier (optional)
* **Tooling**: pnpm/npm, Vercel for deploy, Codex AI for assistance, Copilot for suggestions

---

## Goals

- Demonstrate **correctness** of client-side segmentation logic (filtering, aggregation, predefined & custom rules)
- Ship a usable **UI/UX** with pagination, metrics, CSV export, and PostHog cohort hand-off
- Keep the stack **simple** and **performant** (no backend required)
- Document **assumptions, dataset mapping, edge cases**, and **trade-offs**

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm or npm

### Install & Run

```bash
pnpm install # or: npm install
pnpm dev     # or: npm run dev
```

Visit http://localhost:3000.

### Production Checks

```bash
pnpm build   # or: npm run build
pnpm lint    # optional: npm run lint
```

---

## Project Structure

```
app/
  layout.tsx
  page.tsx
  segments/
    page.tsx              # dataset preview
    builder/page.tsx      # interactive AND/OR rule builder
    presets/page.tsx      # predefined segments library
    core-demo/page.tsx    # quick smoke test of the engine
components/
  GlobalNav.tsx
  segments/
    DatasetPreview.tsx
    DownloadCsvButton.tsx
    MatchedEventsTable.tsx
    ResultsSummary.tsx
    RuleBuilder.tsx
    RuleControls.tsx
    UserTable.tsx
hooks/
  useDataset.ts           # shared dataset loader hook
lib/
  constants.ts
  dataset/                # load → normalize → group helpers
  export/csv.ts
  segmentation/           # engine, predicates, presets, metrics
  types.ts
public/data/
  sample_events.json      # static dataset shipped to production
segmentation_module.ts    # reusable engine + PostHog cohort export
```

---

## Dataset Mapping
- Input: `public/data/sample_events.json`
- Shape (user-centric with embedded events):
```json
{
  "user_id": "u001",
  "plan_tier": "enterprise",
  "signup_date": "2024-08-30T06:20:03.383Z",
  "last_active_at": "2025-07-04T17:18:34.745Z",
  "events": [
    { "event": "signup", "timestamp": "2024-08-30T06:20:03.383Z" },
    { "event": "page_view", "page": "/features", "timestamp": "2025-07-17T23:13:11.804Z" },
    { "event": "payment", "amount": 200, "timestamp": "2025-08-01T07:07:34.998Z" }
  ]
}
```

### Structure & Normalisation

- Input file: `public/data/sample_events.json`
- Shape: user-centric objects that contain an `events` array with event records.
- Normalisation steps:
  - Drop malformed rows and missing `user_id`/`event` pairs.
  - Convert every timestamp to ISO-8601 UTC via `lib/utils/date.ts#toUtcIso`.
  - Merge user-level properties into each event’s `properties` map.
  - Sort events chronologically and derive sessions with a 30-minute inactivity window fallback.

### Swapping the Dataset

1. Replace the JSON file at `public/data/sample_events.json` with another data set that follows the same schema (or update the loader to map fields).
2. If you add new user/event properties, expose them in `components/segments/rules/constants.ts` so the rule builder can target them.
3. Restart `pnpm dev` (or clear the Next.js cache) to ensure the fresh data is loaded. Deployed builds re-fetch the bundled JSON at runtime, so the same file powers production.

---

## Feature Overview

- **Predefined Segments**: `active_last_7_days`, `session_count_gt_5`, `high_value_payers`, `enterprise_plan`, `inactive_30_days`. Each preset combines rule predicates with optional metric-based filters.
- **Custom Rule Builder**: Compose nested AND/OR groups, choose operators (`eq`, `neq`, `gt`, `lt`, `gte`, `lte`, `contains`, `regex`, `in`, etc.), and preview the cohort live.
- **Summary Metrics**: Cohort cards display user count, event count, session count, average session duration (ms → readable) and the most recent `last_active` across the match.
- **User & Event Tables**: Paginated/sortable tables highlight who matched and which events triggered the rule. CSV export includes the key metrics for offline review.
- **Edge Cases**: Missing timestamps are ignored, invalid values never crash the evaluation, and sessions are reconstructed when `session_id` is absent.

---

## Segmentation Engine & PostHog Export

Core logic lives in `lib/segmentation/*` and is surfaced through `segmentation_module.ts` for reuse and automation.

```ts
import { presets } from "./segmentation_module";
import { exportSegmentToPostHog } from "./segmentation_module";

const { execution, payload } = await exportSegmentToPostHog(
  presets.active_last_7_days,
  {
    cohortName: "Active users - last 7 days",
    postUrl: "https://app.posthog.com/api/projects/<id>/cohorts/",
    authToken: process.env.POSTHOG_API_KEY,
  },
);
```

The helper:

- Loads the static dataset (or accepts injected rows for testing).
- Runs the deterministic rule tree via `executeSegment`.
- Produces a PostHog-ready payload (`distinct_id`, session counts, last active, average session duration) that can be POSTed to the PostHog Cohorts API or downloaded for manual upload.

If you only need the payload without calling the API, use `toPostHogCohort(execution, name)`.

---

## Deployment

1. Push the repo to GitHub.
2. Create a Vercel project pointed at this folder.
3. Build command: `pnpm build`
4. Output directory: `.next`
5. Ensure `public/data/sample_events.json` ships with the deployment (Vercel handles this automatically).
6. Verify the public URL renders presets, custom rules, summary metrics, and CSV export.

Include the final URL in the **DEMO_URL** field above before submitting the case study.

---

## Assumptions & Edge Cases

- 30-minute inactivity defines session boundaries when `session_id` is missing.
- Invalid or missing timestamps are skipped; they never abort evaluation.
- All timestamps are normalised to UTC ISO strings; the UI renders them in the viewer’s locale with ISO fallback.
- Dataset size is modest (mock sample), so eager loading is acceptable. For larger files we would stream/virtualise.

---

## Testing & Verification

- `pnpm build` – type-checks, lints, and compiles the production bundle.
- Manual QA:
  1. Open `/segments/presets` and confirm each preset yields sensible counts/metrics.
  2. Visit `/segments/builder`, add ≥2 custom conditions with AND/OR logic, and verify the summary + tables update in real time.
  3. Download the CSV and spot-check metrics.

---

## Appendix: Key Types

```ts
export type UserMetrics = {
  userId: string;
  eventCount: number;
  sessionCount: number;
  lastActive: string;
  avgSessionDurationMs: number;
  totalSessionDurationMs: number;
};

export type SegmentSummary = {
  users: number;
  events: number;
  sessions: number;
  avgSessionDurationMs: number;
  lastActive: string;
  lastRun: string;
};
```

Additional types live in `lib/segmentation/types.ts`.
