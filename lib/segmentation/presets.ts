import type { RuleNode } from "./types";

// Active in last 7 days by timestamp
export const active_last_7_days: RuleNode = {
	kind: "condition",
	path: "timestamp",
	op: "gte",
	value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};

// Session count > 5 (requires an aggregate step, approximated by event-level filter + later metrics check in UI)
// Here we match all events; consumer can filter user metrics sessionCount > 5.
export const all_events: RuleNode = {
	kind: "condition",
	path: "event",
	op: "exists",
};

// Event name contains signup or purchase
export const signup_or_purchase: RuleNode = {
	kind: "or",
	children: [
		{ kind: "condition", path: "event", op: "eq", value: "signup" },
		{ kind: "condition", path: "event", op: "eq", value: "purchase" },
	],
};

export const presets = {
	active_last_7_days,
	all_events,
	signup_or_purchase,
};
