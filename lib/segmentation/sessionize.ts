import type { NormalizedEventRow } from "@/lib/types";

export type Session = {
	sessionId: string;
	start: string; // ISO UTC
	end: string; // ISO UTC
	events: NormalizedEventRow[];
};

const THIRTY_MIN = 30 * 60 * 1000;

/**
 * Build sessions using provided session_id when available; otherwise infer by 30-min inactivity.
 * Input rows must be sorted ascending by timestamp (Issue 2 guarantees this).
 */
export function sessionize(rows: NormalizedEventRow[]): Session[] {
	if (rows.length === 0) return [];

	// First, if session_id exists for most rows, group by it; else fall back to inactivity windows.
	const hasSessionId = rows.some((r) => !!r.session_id);
	if (hasSessionId) {
		const map = new Map<string, NormalizedEventRow[]>();
		for (const r of rows) {
			const id = r.session_id ?? `inf-${r.user_id}-${r.timestamp}`;
			const list = map.get(id);
			if (list) list.push(r);
			else map.set(id, [r]);
		}
		return Array.from(map.entries()).map(([id, evs]) => ({
			sessionId: id,
			start: evs[0].timestamp,
			end: evs[evs.length - 1].timestamp,
			events: evs,
		}));
	}

	// Inactivity window sessionization
	const sessions: Session[] = [];
	let cur: Session | null = null;
	for (const e of rows) {
		if (!cur) {
			cur = {
				sessionId: `inf-${e.user_id}-${e.timestamp}`,
				start: e.timestamp,
				end: e.timestamp,
				events: [e],
			};
			sessions.push(cur);
			continue;
		}
		const prev = cur.events[cur.events.length - 1];
		const diff =
			new Date(e.timestamp).getTime() - new Date(prev.timestamp).getTime();
		if (diff > THIRTY_MIN) {
			cur = {
				sessionId: `inf-${e.user_id}-${e.timestamp}`,
				start: e.timestamp,
				end: e.timestamp,
				events: [e],
			};
			sessions.push(cur);
		} else {
			cur.events.push(e);
			cur.end = e.timestamp;
		}
	}
	return sessions;
}
