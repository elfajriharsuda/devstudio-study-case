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
	if (status === "loading") return <div className="p-6">Loading…</div>;
	if (status === "error")
		return <div className="p-6 text-red-600">Error: {error}</div>;

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Predefined Segments</h1>
			<ul className="space-y-6">
				{predefinedSegments.map((seg) => {
					const exec = runPredefinedSegment(seg, rows);
					return (
						<li key={seg.id} className="border rounded p-4 space-y-3 bg-white">
							<div className="flex items-center justify-between">
								<div>
									<div className="font-semibold">{seg.label}</div>
									<div className="text-sm opacity-70">{seg.description}</div>
								</div>
								<DownloadCsvButton
									exec={exec}
									filename={`segment_${seg.id}.csv`}
								/>
							</div>
							<ResultsSummary exec={exec} />
							<UserTable exec={exec} />
						</li>
					);
				})}
			</ul>
		</div>
	);
}
