import { DATA_URL } from "@/lib/constants";
import type { EventRow, NormalizedEventRow } from "@/lib/types";
import { normalizeRows } from "@/lib/dataset/normalize";

export async function loadDataset(
	noStore = true,
): Promise<NormalizedEventRow[]> {
	const res = await fetch(DATA_URL, {
		cache: noStore ? "no-store" : "force-cache",
	});
	if (!res.ok) throw new Error(`Failed to load dataset: ${res.status}`);
	const data = (await res.json()) as EventRow[];
	return normalizeRows(data);
}
