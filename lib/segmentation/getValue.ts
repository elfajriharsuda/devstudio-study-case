import type { NormalizedEventRow } from "@/lib/types";

/** Safe getter for dot-paths on an event row, returns undefined if missing. */
export function getValue(row: NormalizedEventRow, path: string): unknown {
	// Fast-path for common fields
	if (path === "user_id") return row.user_id;
	if (path === "event") return row.event;
	if (path === "timestamp") return row.timestamp;
	if (path === "session_id") return row.session_id;

	const parts = path.split(".");
	let cur: any = row as any;
	for (const p of parts) {
		if (cur == null) return undefined;
		cur = cur[p];
	}
	return cur;
}
