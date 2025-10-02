"use client";

import { useDataset } from "@/hooks/useDataset";
import { RuleBuilder } from "@/components/segments/RuleBuilder";

export default function BuilderPage() {
	const { status, rows, error } = useDataset();
	if (status === "loading") return <div className="p-6">Loading…</div>;
	if (status === "error")
		return <div className="p-6 text-red-600">Error: {error}</div>;

	return (
		<div className="p-6">
			<RuleBuilder rows={rows} />
		</div>
	);
}
