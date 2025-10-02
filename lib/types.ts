export type RawEvent = {
	event: string;
	timestamp: string;
	[key: string]: unknown; // page, feature, amount, etc.
};

export type RawUser = {
	user_id: string;
	plan_tier?: string;
	signup_date?: string;
	last_active_at?: string;
	events?: RawEvent[];
	[key: string]: unknown;
};

export type EventRow = {
	user_id: string;
	event: string;
	timestamp: string; // ISO string (any TZ); will be normalized to UTC ISO
	session_id?: string;
	properties?: Record<string, unknown>;
};

export type NormalizedEventRow = Omit<EventRow, "timestamp"> & {
	timestamp: string; // ISO UTC string
};

export type UserMetrics = {
	userId: string;
	sessionCount: number;
	eventCount: number;
	lastActive: string;
	avgSessionDurationMs: number;
	totalSessionDurationMs: number;
};
