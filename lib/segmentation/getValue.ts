import type { NormalizedEventRow } from "@/lib/types";

/** Safe getter for dot-paths on an event row, returns undefined if missing. */
export function getValue(row: NormalizedEventRow, path: string): unknown {
	// Fast-path for common fields
	if (path === "user_id") return row.user_id;
	if (path === "event") return row.event;
	if (path === "timestamp") return row.timestamp;
	if (path === "session_id") return row.session_id;

	const parts = path.split(".");
	let current: unknown = row;
	for (const part of parts) {
		if (current == null) return undefined;
		if (Array.isArray(current)) {
			const index = Number(part);
			if (!Number.isInteger(index) || index < 0 || index >= current.length) {
				return undefined;
			}
			current = current[index];
			continue;
		}
		if (typeof current !== "object") return undefined;
		current = (current as Record<string, unknown>)[part];
	}
	return current;
}
