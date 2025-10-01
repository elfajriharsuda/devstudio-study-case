import type { NormalizedEventRow, UserMetrics } from "@/lib/types";
import { executeSegment } from "./engine";
import type {
	SegmentDefinition,
	SegmentExecution,
	MetricOp,
	MetricPredicate,
} from "./types";
import {
	rule_active_last_7_days,
	rule_all_events,
	rule_payments_ge_200,
	rule_enterprise_users,
} from "./presets";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const predefinedSegments: SegmentDefinition[] = [
	{
		id: "active_last_7_days",
		label: "Active in last 7 days",
		description: "Users who generated at least one event in the last 7 days",
		rule: rule_active_last_7_days,
	},
	{
		id: "session_count_gt_5",
		label: "Power users (sessions > 5)",
		description: "Users with more than 5 sessions overall",
		rule: rule_all_events,
		metricPredicates: [
			{ field: "sessionCount", op: "gt", value: 5 },
		],
	},
	{
		id: "high_value_payers",
		label: "High-value payers (>= $200)",
		description: "Users with at least one payment >= 200",
		rule: rule_payments_ge_200,
	},
	{
		id: "enterprise_plan",
		label: "Enterprise plan users",
		description: "Users on plan_tier = enterprise",
		rule: rule_enterprise_users,
	},
	{
		id: "inactive_30_days",
		label: "Inactive (30+ days)",
		description: "Users whose last activity is more than 30 days ago",
		rule: rule_all_events,
		metricPredicates: [
			{
				field: "lastActive",
				op: "before",
				value: () => new Date(Date.now() - THIRTY_DAYS_MS).toISOString(),
			},
		],
	},
];

export function runPredefinedSegment(
	definition: SegmentDefinition,
	rows: NormalizedEventRow[],
): SegmentExecution {
	const base = executeSegment(definition.rule, rows);

	if (!definition.metricPredicates || definition.metricPredicates.length === 0) {
		return base;
	}

	const passingUserIds = base.matchedUserIds.filter((userId) => {
		const metrics = base.metricsByUser[userId];
		if (!metrics) return false;
		return definition.metricPredicates!.every((predicate) =>
			evalMetricPredicate(predicate, metrics),
		);
	});

	const filteredEvents = base.matchedEvents.filter((event) =>
		passingUserIds.includes(event.user_id),
	);

	const filteredMetrics: Record<string, UserMetrics> = {};
	for (const userId of passingUserIds) {
		filteredMetrics[userId] = base.metricsByUser[userId];
	}

	return {
		matchedEvents: filteredEvents,
		matchedUserIds: passingUserIds,
		metricsByUser: filteredMetrics,
		summary: {
			users: passingUserIds.length,
			events: filteredEvents.length,
			sessions: sumSessions(filteredMetrics),
			lastRun: base.summary.lastRun,
		},
	};
}

function evalMetricPredicate(
	predicate: MetricPredicate,
	metrics: UserMetrics,
): boolean {
	const rawValue =
		typeof predicate.value === "function"
			? (predicate.value as () => unknown)()
			: predicate.value;

	switch (predicate.field) {
		case "eventCount":
			return numCompare(predicate.op, metrics.eventCount, Number(rawValue));
		case "sessionCount":
			return numCompare(predicate.op, metrics.sessionCount, Number(rawValue));
		case "lastActive": {
			const left = Date.parse(metrics.lastActive || "");
			const right = Date.parse(String(rawValue ?? ""));
			if (Number.isNaN(left) || Number.isNaN(right)) return false;
			if (predicate.op === "before") return left < right;
			if (predicate.op === "after") return left >= right;
			return numCompare(predicate.op, left, right);
		}
		default:
			return false;
	}
}

function numCompare(op: MetricOp, left: number, right: number): boolean {
	if (Number.isNaN(left) || Number.isNaN(right)) return false;
	switch (op) {
		case "gt":
			return left > right;
		case "gte":
			return left >= right;
		case "lt":
			return left < right;
		case "lte":
			return left <= right;
		case "eq":
			return left === right;
		case "neq":
			return left !== right;
		case "before":
			return left < right;
		case "after":
			return left >= right;
		default:
			return false;
	}
}

function sumSessions(metrics: Record<string, UserMetrics>): number {
	let total = 0;
	for (const value of Object.values(metrics)) {
		total += value.sessionCount;
	}
	return total;
}
