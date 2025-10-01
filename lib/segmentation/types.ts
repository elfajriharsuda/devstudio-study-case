import type { NormalizedEventRow, UserMetrics } from "@/lib/types";

// Primitive operators supported for conditions
export type Operator =
	| "eq"
	| "neq"
	| "contains"
	| "gt"
	| "gte"
	| "lt"
	| "lte"
	| "in"
	| "nin"
	| "exists"
	| "nexists"
	| "regex";

// A condition checks a value at a path (e.g., 'event', 'properties.country')
export type Condition = {
	kind: "condition";
	path: string; // dot-path into event row (e.g., 'event', 'properties.plan')
	op: Operator;
	value?: unknown; // optional for 'exists'/'nexists'
};

export type And = { kind: "and"; children: RuleNode[] };
export type Or = { kind: "or"; children: RuleNode[] };
export type Not = { kind: "not"; child: RuleNode };

export type RuleNode = Condition | And | Or | Not;

export type SegmentExecution = {
	matchedEvents: NormalizedEventRow[];
	matchedUserIds: string[];
	metricsByUser: Record<string, UserMetrics>;
	summary: {
		users: number;
		events: number;
		sessions: number;
		lastRun: string; // ISO
	};
};
