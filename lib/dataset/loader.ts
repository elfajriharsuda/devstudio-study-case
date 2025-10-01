import { DATA_URL } from "@/lib/constants";
import type { RawUser, NormalizedEventRow } from "@/lib/types";
import { normalizeRowsFromUsers } from "@/lib/dataset/normalize";

export async function loadDataset(
	noStore = true,
): Promise<NormalizedEventRow[]> {
	const res = await fetch(DATA_URL, {
		cache: noStore ? "no-store" : "force-cache",
	});
	if (!res.ok) throw new Error(`Failed to load dataset: ${res.status}`);
	const data = (await res.json()) as unknown;
	const users = Array.isArray(data) ? (data as RawUser[]) : [];
	return normalizeRowsFromUsers(users);
}
