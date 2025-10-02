"use client";

import { useDataset } from "@/hooks/useDataset";
import {
	predefinedSegments,
	runPredefinedSegment,
} from "@/lib/segmentation/segments";
import { ResultsSummary } from "@/components/segments/ResultsSummary";
import { UserTable } from "@/components/segments/UserTable";
import { DownloadCsvButton } from "@/components/segments/DownloadCsvButton";

export default function PresetsPage() {
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
				<h1 className="text-2xl font-semibold">Predefined segments</h1>
				<p className="mt-2 text-sm text-slate-500">
					Jump-start your analysis with curated rules. Download the cohort as CSV or open it in the
					builder for further tweaks.
				</p>
			</section>
			<section className="space-y-6">
				{predefinedSegments.map((seg) => {
					const exec = runPredefinedSegment(seg, rows);
					return (
						<article
							key={seg.id}
							className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl"
						>
							<header className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<h2 className="text-lg font-semibold text-slate-900">{seg.label}</h2>
									<p className="text-sm text-slate-500">{seg.description}</p>
								</div>
								<DownloadCsvButton exec={exec} filename={`segment_${seg.id}.csv`} />
							</header>
							<ResultsSummary exec={exec} />
							<UserTable exec={exec} />
						</article>
					);
				})}
			</section>
		</div>
	);
}
