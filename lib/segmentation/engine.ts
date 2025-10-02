import type { NormalizedEventRow, UserMetrics } from "@/lib/types";
import { evalRuleOnEvent } from "./evalRule";
import type { RuleNode, SegmentExecution } from "./types";
import { groupByUser } from "@/lib/dataset";
import { computeUserMetrics, summarizeExecution } from "./metrics";

/** Execute a rule tree over normalized events. */
export function executeSegment(
	rule: RuleNode,
	allRows: NormalizedEventRow[],
): SegmentExecution {
	// Filter events by rule at the event level
	const matchedEvents = allRows.filter((r) => safeEval(rule, r));

	// Group matched events by user
	const grouped = groupByUser(matchedEvents);
	const metricsByUser: Record<string, UserMetrics> = {};
	for (const [userId, rows] of grouped.entries()) {
		metricsByUser[userId] = computeUserMetrics(rows);
	}

	const matchedUserIds = Array.from(grouped.keys());

	const generatedAt = new Date().toISOString();
	const summary = summarizeExecution(metricsByUser, matchedEvents, generatedAt);

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
