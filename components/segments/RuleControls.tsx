"use client";

import type { ChangeEvent } from "react";
import { OPERATOR_OPTIONS, OperatorValue, PROPERTY_OPTIONS } from "./rules/constants";
import type { UiCondition } from "./rules/schema";

type ConditionRowProps = {
	cond: UiCondition;
	onChange: (next: UiCondition) => void;
	onRemove: () => void;
};

export function ConditionRow({ cond, onChange, onRemove }: ConditionRowProps) {
	function handlePathChange(event: ChangeEvent<HTMLSelectElement>) {
		onChange({ ...cond, path: event.target.value });
	}

	function handleOperatorChange(event: ChangeEvent<HTMLSelectElement>) {
		const nextOp = event.target.value as OperatorValue;

		let nextValue: UiCondition["value"] = cond.value;
		if (nextOp === "exists" || nextOp === "nexists") {
			nextValue = undefined;
		} else if (nextOp === "in" || nextOp === "nin") {
			nextValue = Array.isArray(cond.value) ? cond.value : [];
		} else if (Array.isArray(cond.value)) {
			nextValue = "";
		}

		onChange({ ...cond, op: nextOp, value: nextValue });
	}

	function handleSingleValueChange(event: ChangeEvent<HTMLInputElement>) {
		onChange({ ...cond, value: parseMaybeNumber(event.target.value) });
	}

	function handleArrayValueChange(event: ChangeEvent<HTMLInputElement>) {
		const parts = event.target.value
			.split(",")
			.map((part) => parseMaybeNumber(part.trim()))
			.filter((part) => part !== "");
		onChange({ ...cond, value: parts });
	}

	return (
		<div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
			<select
				className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-800"
				value={cond.path}
				onChange={handlePathChange}
			>
				{PROPERTY_OPTIONS.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>

			<select
				className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-800"
				value={cond.op}
				onChange={handleOperatorChange}
			>
				{OPERATOR_OPTIONS.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>

			{cond.op === "exists" || cond.op === "nexists" ? (
				<span className="text-xs text-slate-700">(no value)</span>
			) : cond.op === "in" || cond.op === "nin" ? (
				<input
					className="border rounded px-2 py-1 min-w-[200px]"
					placeholder="comma-separated values"
					value={Array.isArray(cond.value) ? cond.value.join(",") : ""}
					onChange={handleArrayValueChange}
				/>
			) : (
				<input
					className="border rounded px-2 py-1 min-w-[200px]"
					placeholder="value (string/number/date/regex)"
					value={cond.value === undefined ? "" : String(cond.value)}
					onChange={handleSingleValueChange}
				/>
			)}

			<button className="ml-auto text-red-600 hover:underline" onClick={onRemove}>
				Remove
			</button>
		</div>
	);
}

function parseMaybeNumber(raw: string): string | number {
	if (raw.trim() === "") return "";
	const asNumber = Number(raw);
	if (!Number.isNaN(asNumber)) return asNumber;
	return raw;
}
