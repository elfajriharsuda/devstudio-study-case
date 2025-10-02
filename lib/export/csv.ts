import type { SegmentExecution } from "@/lib/segmentation/types";

export function toCsvFromExecution(exec: SegmentExecution): string {
	const header = [
		"user_id",
		"eventCount",
		"sessionCount",
		"avgSessionDurationMs",
		"lastActive",
	];
	const lines = [header.join(",")];
	for (const userId of exec.matchedUserIds) {
		const metrics = exec.metricsByUser[userId];
		const row = [
			userId,
			String(metrics?.eventCount ?? 0),
			String(metrics?.sessionCount ?? 0),
			String(metrics?.avgSessionDurationMs ?? 0),
			metrics?.lastActive ?? "",
		];
		lines.push(row.map(csvEscape).join(","));
	}
	return lines.join("\n");
}

function csvEscape(cell: string): string {
	if (/[",\n]/.test(cell)) {
		return '"' + cell.replace(/"/g, '""') + '"';
	}
	return cell;
}

export function downloadCsv(filename: string, csv: string) {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.style.display = "none";
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
}
