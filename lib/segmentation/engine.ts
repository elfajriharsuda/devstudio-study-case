import type { NormalizedEventRow } from "@/lib/types";
import { evalRuleOnEvent } from "./evalRule";
import type { RuleNode, SegmentExecution } from "./types";
import { groupByUser } from "@/lib/dataset";
import { computeUserMetrics, sumSessionsAcrossUsers } from "./metrics";

/** Execute a rule tree over normalized events. */
export function executeSegment(
	rule: RuleNode,
	allRows: NormalizedEventRow[],
): SegmentExecution {
	// Filter events by rule at the event level
	const matchedEvents = allRows.filter((r) => safeEval(rule, r));

	// Group matched events by user
	const grouped = groupByUser(matchedEvents);
	const metricsByUser: Record<string, any> = {};
	for (const [userId, rows] of grouped.entries()) {
		metricsByUser[userId] = computeUserMetrics(rows);
	}

	const matchedUserIds = Array.from(grouped.keys());

	const summary = {
		users: matchedUserIds.length,
		events: matchedEvents.length,
		sessions: sumSessionsAcrossUsers(grouped),
		lastRun: new Date().toISOString(),
	};

	return { matchedEvents, matchedUserIds, metricsByUser, summary };
}

function safeEval(rule: RuleNode, row: NormalizedEventRow): boolean {
	try {
		return evalRuleOnEvent(rule, row);
	} catch {
		// Defensive: never crash due to bad rule or missing fields
		return false;
	}
}
