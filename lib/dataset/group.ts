import type { NormalizedEventRow } from "@/lib/types";

export function groupByUser(
	rows: NormalizedEventRow[],
): Map<string, NormalizedEventRow[]> {
	const map = new Map<string, NormalizedEventRow[]>();
	for (const r of rows) {
		const list = map.get(r.user_id);
		if (list) list.push(r);
		else map.set(r.user_id, [r]);
	}
	return map;
}
