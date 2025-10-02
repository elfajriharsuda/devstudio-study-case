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
	{ value: "event", label: "Event" },
	{ value: "timestamp", label: "Timestamp (ISO)" },
	{ value: "user_id", label: "User id" },
	// Common properties from our user-centric dataset
	{ value: "properties.plan_tier", label: "Plan tier" },
	{ value: "properties.amount", label: "Amount" },
	{ value: "properties.page", label: "Page" },
	{ value: "properties.feature", label: "Feature" },
	{ value: "properties.signup_date", label: "Signup date" },
	{ value: "properties.last_active_at", label: "Last active at" },
] as const;
