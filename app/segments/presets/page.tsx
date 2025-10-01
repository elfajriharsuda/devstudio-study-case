"use client";

import { useDataset } from "@/hooks/useDataset";
import {
	predefinedSegments,
	runPredefinedSegment,
} from "@/lib/segmentation/segments";

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
					const res = runPredefinedSegment(seg, rows);
					return (
						<li key={seg.id} className="border rounded p-4">
							<div className="flex items-center justify-between">
								<div>
									<div className="font-semibold">{seg.label}</div>
									<div className="text-sm opacity-70">{seg.description}</div>
								</div>
								<div className="text-sm">
									<div>
										Users: <b>{res.summary.users}</b>
									</div>
									<div>
										Events: <b>{res.summary.events}</b>
									</div>
									<div>
										Sessions: <b>{res.summary.sessions}</b>
									</div>
								</div>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
