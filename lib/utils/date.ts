/** Convert any valid timestamp (with or without timezone) to canonical UTC ISO string. */
export function toUtcIso(input: string): string {
	const d = new Date(input);
	if (isNaN(d.getTime())) return "";
	return d.toISOString();
}
