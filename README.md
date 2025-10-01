# Segmentation Builder (Front‑End Prototype)

Interactive segmentation builder prototype for Momentum’s Product Analytics case study. The app consumes a static JSON dataset from the repo, performs client‑side filtering/aggregation, and renders results with a clean, responsive UI.

---

## Goals

* Demonstrate **correctness** of client‑side segmentation logic (filtering, aggregation, predefined & custom rules)
* Ship a usable **UI/UX** with pagination, metrics, and CSV export
* Keep the stack **simple** and **performant** (no backend required)
* Document **assumptions, dataset mapping, edge cases**, and **trade‑offs**

---

## Tech Stack

* **Framework**: Next.js 15.5.4 (App Router, Turbopack) + TypeScript 5
* **Styling**: Tailwind CSS v4
* **React**: v19.1.0
* **State**: Local component state + lightweight utils (no global store needed for MVP)
* **Data**: Static JSON file in `public/data/sample_events.json`
* **Linting/Formatting**: ESLint v9, eslint-config-next, Prettier (optional)
* **Tooling**: pnpm/npm, Vercel for deploy

---

## Getting Started

### Prerequisites

* Node.js 20+
* pnpm or npm

### Install & Run

```bash
pnpm install # or: npm install
pnpm dev     # or: npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Useful Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  }
}
```

---

## Project Structure (proposed)

```
app/
  layout.tsx
  page.tsx
  segments/
    page.tsx                 # main segmentation UI
components/
  Segments/                  # UI components for rule builder, lists, metrics
    RuleBuilder.tsx
    ResultTable.tsx
    MetricsSummary.tsx
lib/
  dataset.ts                 # load/normalize dataset (UTC, types)
  segmentation/
    filters.ts               # predicate builders for rules
    aggregate.ts             # metrics & grouping utils
    presets.ts               # predefined segments
  csv.ts                     # CSV export helpers
public/
  data/sample_events.json    # static dataset
styles/
  globals.css
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

* **Normalization**: All timestamps parsed as UTC (`Date.toISOString()`), tolerate missing/unknown fields.
* **Ordering**: Do not assume chronological order; sort by timestamp when required.

---

## Predefined Segments (initial)

* `active_last_7_days`
* `session_count_gt_5`
* `event_contains_signup_or_purchase`

Each preset resolves to a predicate over users/events and returns user IDs + metrics.

---

## Custom Rule Builder (MVP)

* Property selector (e.g., `event`, `country`, `path`, `session_count`)
* Operator selector (`=`, `!=`, `contains`, `>`, `<`, `>=`, `<=`)
* Value input (string/number/date)
* Boolean combinators: `AND` / `OR`

---

## Metrics & Output

* **Users list** with pagination
* **Summary metrics**: total users matched, total events, sessions, last active
* **CSV export**: current result set (users + selected fields)

---

## Assumptions & Edge Cases

* Missing `session_id`: infer sessions by **30‑minute inactivity** boundary when necessary
* Missing/invalid timestamps: skip or mark as `unknown`; never crash
* Timezones: treat inputs as UTC; UI displays local time with UTC note when relevant
* Large files: stream/async parse in future; MVP can load once (small sample)

---

## Development Notes

* Keep filtering functions **pure** and **testable**
* Separate **rule definition** (structure) from **execution** (predicates)
* Favor **derived data** over extra state

---

## Deployment

* Push to GitHub/GitLab
* Connect the repo to **Vercel**
* Ensure dataset is bundled from `public/`
* Verify the deployed URL loads and the presets work

---

## Time Tracking (TrackerTime/Clockify)

* Start timer when moving a Linear issue to **In Progress**
* Stop timer on **Done** and comment actual vs estimate

---

## License

MIT (or as required by the case study)

---

## Appendix: Types (sketch)

```ts
export type EventRow = {
  user_id: string
  event: string
  timestamp: string // ISO UTC
  session_id?: string
  properties?: Record<string, unknown>
}

export type UserMetrics = {
  userId: string
  sessionCount: number
  eventCount: number
  lastActive: string
}
```
