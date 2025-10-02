"use client";

import type { SegmentExecution } from "@/lib/segmentation/types";
import { downloadCsv, toCsvFromExecution } from "@/lib/export/csv";

export function DownloadCsvButton({
	exec,
	filename = "segment.csv",
}: {
	exec: SegmentExecution;
	filename?: string;
}) {
	return (
		<button
			className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
			onClick={() => downloadCsv(filename, toCsvFromExecution(exec))}
		>
			<span aria-hidden>⬇</span>
			Export CSV
		</button>
	);
}
