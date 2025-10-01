export type EventRow = {
	user_id: string;
	event: string;
	timestamp: string; // ISO string (any TZ); will be normalized to UTC ISO
	session_id?: string;
	properties?: Record<string, unknown>;
};

export type NormalizedEventRow = Omit<EventRow, "timestamp"> & {
	timestamp: string; // ISO UTC string (e.g., 2025-01-05T12:34:56.000Z)
};
