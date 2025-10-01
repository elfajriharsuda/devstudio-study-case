import type { NormalizedEventRow, UserMetrics } from "@/lib/types";
import { sessionize } from "./sessionize";

export function computeUserMetrics(rows: NormalizedEventRow[]): UserMetrics {
	const events = rows.length;
	const lastActive = rows[rows.length - 1]?.timestamp ?? "";
	const sessions = sessionize(rows);
	return {
		userId: rows[0]?.user_id ?? "unknown",
		eventCount: events,
		sessionCount: sessions.length,
		lastActive,
	};
}

export function sumSessionsAcrossUsers(
	userRows: Map<string, NormalizedEventRow[]>,
): number {
	let total = 0;
	for (const [, rows] of userRows) total += sessionize(rows).length;
	return total;
}
