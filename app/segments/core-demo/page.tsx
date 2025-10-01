"use client";

import { useDataset } from "@/hooks/useDataset";
import { executeSegment, presets } from "@/lib/segmentation";

export default function CoreDemoPage() {
	const { status, rows, error } = useDataset();

	if (status === "loading") return <div className="p-6">Loading…</div>;
	if (status === "error")
		return <div className="p-6 text-red-600">Error: {error}</div>;

	const result = executeSegment(presets.active_last_7_days, rows);

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-semibold">
				Segmentation · Core Filtering & Aggregation
			</h1>
			<section className="text-sm">
				<div>
					Users matched: <b>{result.summary.users}</b>
				</div>
				<div>
					Events matched: <b>{result.summary.events}</b>
				</div>
				<div>
					Sessions (approx): <b>{result.summary.sessions}</b>
				</div>
				<div className="opacity-70">Last run: {result.summary.lastRun}</div>
			</section>
			<section className="text-sm">
				<h2 className="mt-4 mb-2 font-semibold">Matched Users</h2>
				<ul className="list-disc ml-6">
					{result.matchedUserIds.map((u) => (
						<li key={u}>
							{u} · events: {result.metricsByUser[u].eventCount} · sessions:{" "}
							{result.metricsByUser[u].sessionCount} · lastActive:{" "}
							{result.metricsByUser[u].lastActive}
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
