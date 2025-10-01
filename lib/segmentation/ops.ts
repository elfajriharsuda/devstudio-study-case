import type { Operator } from "./types";

export function applyOperator(
	op: Operator,
	left: unknown,
	right: unknown,
): boolean {
	switch (op) {
		case "eq":
			return normalize(left) === normalize(right);
		case "neq":
			return normalize(left) !== normalize(right);
		case "contains":
			return toStr(left).includes(String(right ?? ""));
		case "gt":
			return toNum(left) > toNum(right);
		case "gte":
			return toNum(left) >= toNum(right);
		case "lt":
			return toNum(left) < toNum(right);
		case "lte":
			return toNum(left) <= toNum(right);
		case "in":
			return (
				Array.isArray(right) && right.map(normalize).includes(normalize(left))
			);
		case "nin":
			return (
				Array.isArray(right) && !right.map(normalize).includes(normalize(left))
			);
		case "exists":
			return left !== undefined && left !== null;
		case "nexists":
			return left === undefined || left === null;
		case "regex":
			return matchRegex(left, right);
		default:
			return false;
	}
}

function matchRegex(left: unknown, right: unknown): boolean {
	try {
		if (right instanceof RegExp) {
			return right.test(toStr(left));
		}

		const spec = String(right ?? "");
		// support both 'foo' and '/foo/i' specs
		const m =
			spec.startsWith("/") && spec.lastIndexOf("/") > 0
				? spec.slice(1).split("/")
				: [spec, ""];
		const pat = m[0] ?? "";
		const flags = m[1] ?? "";
		const rx = new RegExp(pat, flags as any);
		return rx.test(toStr(left));
	} catch {
		return false;
	}
}

function normalize(v: unknown): string | number | boolean | null {
	if (v == null) return null;
	if (typeof v === "number" || typeof v === "boolean") return v;
	// date-like strings: attempt timestamp numeric compare equivalence
	const asDate = Date.parse(String(v));
	if (!Number.isNaN(asDate)) return asDate;
	return String(v).toLowerCase();
}

function toNum(v: unknown): number {
	if (typeof v === "number") return v;
	const asDate = Date.parse(String(v));
	if (!Number.isNaN(asDate)) return asDate;
	const n = Number(v);
	return Number.isNaN(n) ? NaN : n;
}

function toStr(v: unknown): string {
	if (v == null) return "";
	return typeof v === "string" ? v : JSON.stringify(v);
}
