import type {
	RawUser,
	RawEvent,
	EventRow,
	NormalizedEventRow,
} from "@/lib/types";
import { toUtcIso } from "@/lib/utils/date";

function flattenUsers(users: RawUser[]): EventRow[] {
	const out: EventRow[] = [];
	for (const u of users) {
		if (!u || !u.user_id) continue;
		const userProps: Record<string, unknown> = {
			plan_tier: u.plan_tier,
			signup_date: u.signup_date,
			last_active_at: u.last_active_at,
		};
		const evs: RawEvent[] = Array.isArray(u.events) ? u.events : [];
		for (const ev of evs) {
			if (!ev || typeof ev.event !== "string") continue;
			const timestamp = typeof ev.timestamp === "string" ? ev.timestamp : "";
			const { event, timestamp: _t, ...rest } = ev;
			void _t;
			out.push({
				user_id: u.user_id,
				event,
				timestamp, // normalize later
				properties: { ...userProps, ...rest },
			});
		}
	}
	return out;
}

export function normalizeRowsFromUsers(users: RawUser[]): NormalizedEventRow[] {
	const flattened = flattenUsers(users);
	return flattened
		.map((r) => ({ ...r, timestamp: toUtcIso(r.timestamp) }))
		.filter((r) => r.user_id && r.event && r.timestamp)
		.sort(
			(a, b) =>
				new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
		);
}
