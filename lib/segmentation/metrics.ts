import type { NormalizedEventRow, UserMetrics } from "@/lib/types";
import { sessionize } from "./sessionize";
import type { SegmentSummary } from "./types";

export function computeUserMetrics(rows: NormalizedEventRow[]): UserMetrics {
	if (rows.length === 0) {
		return {
			userId: "unknown",
			eventCount: 0,
			sessionCount: 0,
			lastActive: "",
			avgSessionDurationMs: 0,
			totalSessionDurationMs: 0,
		};
	}

	const sorted = [...rows].sort(
		(a, b) =>
			new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
	);
	const sessions = sessionize(sorted);

	let totalDurationMs = 0;
	for (const session of sessions) {
		const start = Date.parse(session.start || "");
		const end = Date.parse(session.end || "");
		if (Number.isNaN(start) || Number.isNaN(end) || end < start) continue;
		totalDurationMs += end - start;
	}

	const sessionCount = sessions.length;
	const avgSessionDurationMs =
		sessionCount > 0 ? totalDurationMs / sessionCount : 0;

	return {
		userId: sorted[0]?.user_id ?? "unknown",
		eventCount: sorted.length,
		sessionCount,
		lastActive: sorted[sorted.length - 1]?.timestamp ?? "",
		avgSessionDurationMs,
		totalSessionDurationMs: totalDurationMs,
	};
}

export function summarizeExecution(
	metricsByUser: Record<string, UserMetrics>,
	matchedEvents: NormalizedEventRow[],
	generatedAtIso: string,
): SegmentSummary {
	const metrics = Object.values(metricsByUser);
	const sessions = metrics.reduce(
		(acc, item) => acc + (item?.sessionCount ?? 0),
		0,
	);
	const totalDuration = metrics.reduce(
		(acc, item) => acc + (item?.totalSessionDurationMs ?? 0),
		0,
	);
	const avgSessionDurationMs = sessions > 0 ? totalDuration / sessions : 0;

	let lastActiveTs = 0;
	for (const item of metrics) {
		const ts = Date.parse(item?.lastActive ?? "");
		if (!Number.isNaN(ts) && ts > lastActiveTs) {
			lastActiveTs = ts;
		}
	}

	return {
		users: metrics.length,
		events: matchedEvents.length,
		sessions,
		avgSessionDurationMs,
		lastActive: lastActiveTs === 0 ? "" : new Date(lastActiveTs).toISOString(),
		lastRun: generatedAtIso,
	};
}
