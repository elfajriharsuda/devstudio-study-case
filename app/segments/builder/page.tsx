"use client";

import { useDataset } from "@/hooks/useDataset";
import { RuleBuilder } from "@/components/segments/RuleBuilder";

export default function BuilderPage() {
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

	return (
		<div className="space-y-6">
			<section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl">
				<h1 className="text-2xl font-semibold">Interactive rule builder</h1>
				<p className="mt-2 text-sm text-slate-500">
					Toggle between AND/OR groups, add granular conditions, and watch the matched users update in
					real time.
				</p>
			</section>
			<RuleBuilder rows={rows} />
		</div>
	);
}
