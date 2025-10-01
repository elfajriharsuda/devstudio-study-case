"use client";

import type { NormalizedEventRow } from "@/lib/types";

export function DatasetPreview({ rows }: { rows: NormalizedEventRow[] }) {
	return (
		<div className="space-y-3">
			<p className="text-sm opacity-80">
				Showing first 10 normalized rows (timestamps in UTC).
			</p>
			<ul className="text-sm font-mono bg-gray-50 rounded p-4 overflow-auto border">
				{rows.slice(0, 10).map((r, i) => (
					<li key={i}>
						{r.user_id} · {r.event} · {r.timestamp}
					</li>
				))}
			</ul>
		</div>
	);
}
