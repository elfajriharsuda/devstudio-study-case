"use client";

import type { SegmentExecution } from "@/lib/segmentation/types";

export function ResultsSummary({ exec }: { exec: SegmentExecution }) {
	const avgMs = exec.summary.avgSessionDurationMs ?? 0;
	const minutes = Math.floor(avgMs / 60000);
	const seconds = Math.round((avgMs % 60000) / 1000);
	const avgDisplay = avgMs === 0 ? "—" : `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
			<Stat label="Users" value={exec.summary.users.toLocaleString()} />
			<Stat label="Events" value={exec.summary.events.toLocaleString()} />
			<Stat label="Sessions" value={exec.summary.sessions.toLocaleString()} />
			<Stat label="Avg session" value={avgDisplay} />
		</div>
	);
}

type StatProps = {
	label: string;
	value: React.ReactNode;
};

function Stat({ label, value }: StatProps) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-3">
			<div className="text-xs uppercase tracking-[0.25em] text-slate-500">
				{label}
			</div>
			<div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
		</div>
	);
}
