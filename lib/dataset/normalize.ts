import type { EventRow, NormalizedEventRow } from "@/lib/types";
import { toUtcIso } from "@/lib/utils/date";

export function normalizeRows(rows: EventRow[]): NormalizedEventRow[] {
	return rows
		.map((r) => ({ ...r, timestamp: toUtcIso(r.timestamp) }))
		.filter((r) => r.timestamp !== "")
		.sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);
}
