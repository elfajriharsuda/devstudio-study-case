import type { RuleNode } from "./types";

export const rule_active_last_7_days: RuleNode = {
	kind: "condition",
	path: "timestamp",
	op: "gte",
	value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const rule_all_events: RuleNode = {
	kind: "condition",
	path: "event",
	op: "exists",
};

export const rule_payments_ge_200: RuleNode = {
	kind: "and",
	children: [
		{ kind: "condition", path: "event", op: "eq", value: "payment" },
		{ kind: "condition", path: "properties.amount", op: "gte", value: 200 },
	],
};

export const rule_enterprise_users: RuleNode = {
	kind: "condition",
	path: "properties.plan_tier",
	op: "eq",
	value: "enterprise",
};

export const presets = {
	active_last_7_days: rule_active_last_7_days,
	session_count_gt_5: rule_all_events,
	high_value_payers: rule_payments_ge_200,
	enterprise_plan: rule_enterprise_users,
	inactive_30_days: rule_all_events,
};
