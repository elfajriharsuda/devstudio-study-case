"use client";

import { useDataset } from "@/hooks/useDataset";
import { executeSegment, presets } from "@/lib/segmentation";

export default function CoreDemoPage() {
	const { status, rows, error } = useDataset();

	if (status === "loading") {
		return (
			<div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-300">
				Loading…
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
				Error loading dataset: {error}
			</div>
		);
	}

	const result = executeSegment(presets.active_last_7_days, rows);

	return (
		<div className="space-y-6">
			<section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
				<h1 className="text-2xl font-semibold">Core filtering & aggregation</h1>
				<p className="mt-2 text-sm text-slate-500">
					We run the ‘Active in last 7 days’ preset through the segmentation engine and surface the
					key metrics below.
				</p>
			</section>
			<section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
				<div className="grid gap-3 sm:grid-cols-4 text-sm">
					<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<div className="text-xs uppercase tracking-[0.25em] text-slate-500">Users</div>
						<div className="mt-2 text-xl font-semibold text-slate-900">{result.summary.users}</div>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<div className="text-xs uppercase tracking-[0.25em] text-slate-500">Events</div>
						<div className="mt-2 text-xl font-semibold text-slate-900">{result.summary.events}</div>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<div className="text-xs uppercase tracking-[0.25em] text-slate-500">Sessions</div>
						<div className="mt-2 text-xl font-semibold text-slate-900">{result.summary.sessions}</div>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<div className="text-xs uppercase tracking-[0.25em] text-slate-500">Last run</div>
						<div className="mt-2 text-sm text-slate-700">{result.summary.lastRun}</div>
					</div>
				</div>
				<div className="mt-6">
					<h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
						Matched users
					</h2>
					<ul className="mt-3 grid gap-3 sm:grid-cols-2">
						{result.matchedUserIds.map((userId) => (
							<li
								key={userId}
								className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
							>
								<div className="font-semibold text-slate-900">{userId}</div>
								<div className="mt-1 text-xs text-slate-500">
									Events: {result.metricsByUser[userId].eventCount} · Sessions: {" "}
									{result.metricsByUser[userId].sessionCount}
								</div>
								<div className="text-xs text-slate-500">
									Last active: {result.metricsByUser[userId].lastActive}
								</div>
							</li>
						))}
					</ul>
				</div>
			</section>
		</div>
	);
}
