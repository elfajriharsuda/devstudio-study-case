"use client";

import { useDataset } from "@/hooks/useDataset";
import { DatasetPreview } from "@/components/segments/DatasetPreview";

export default function SegmentsPage() {
	const { status, rows, error } = useDataset();

	if (status === "loading") return <div className="p-6">Loading dataset…</div>;
	if (status === "error")
		return <div className="p-6 text-red-600">Error: {error}</div>;

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-semibold">
				Segments · Dataset Sanity Check
			</h1>
			<DatasetPreview rows={rows} />
		</div>
	);
}
