export const OPERATOR_OPTIONS = [
	{ value: "eq", label: "=" },
	{ value: "neq", label: "≠" },
	{ value: "contains", label: "contains" },
	{ value: "gt", label: ">" },
	{ value: "gte", label: "≥" },
	{ value: "lt", label: "<" },
	{ value: "lte", label: "≤" },
	{ value: "in", label: "in [a,b]" },
	{ value: "nin", label: "not in [a,b]" },
	{ value: "exists", label: "exists" },
	{ value: "nexists", label: "not exists" },
	{ value: "regex", label: "regex" },
] as const;

export type OperatorValue = (typeof OPERATOR_OPTIONS)[number]["value"];

export const PROPERTY_OPTIONS = [
	{ value: "event", label: "event" },
	{ value: "timestamp", label: "timestamp (ISO)" },
	{ value: "user_id", label: "user_id" },
	// Common properties from our user-centric dataset
	{ value: "properties.plan_tier", label: "properties.plan_tier" },
	{ value: "properties.amount", label: "properties.amount" },
	{ value: "properties.page", label: "properties.page" },
	{ value: "properties.feature", label: "properties.feature" },
	{ value: "properties.signup_date", label: "properties.signup_date" },
	{ value: "properties.last_active_at", label: "properties.last_active_at" },
] as const;
