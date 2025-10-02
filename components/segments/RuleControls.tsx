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
			.map((part) => parseMaybeNumber(part.trim()));
		onChange({ ...cond, value: parts });
	}

	return (
		<div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:shadow-md">
			<div className="flex flex-wrap items-start gap-4">
				<div>
					<span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
						Property
					</span>
					<div className="relative">
						<select
							className="min-w-[160px] appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
							value={cond.path}
							onChange={handlePathChange}
						>
							{PROPERTY_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
							▾
						</span>
					</div>
				</div>

				<div>
					<span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
						Operator
					</span>
					<div className="relative">
						<select
							className="min-w-[120px] appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-8 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
							value={cond.op}
							onChange={handleOperatorChange}
						>
							{OPERATOR_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
							▾
						</span>
					</div>
				</div>

				<div className="flex-1 min-w-[220px]">
					<span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
						Value
					</span>
					{cond.op === "exists" || cond.op === "nexists" ? (
						<div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
							(no value required)
						</div>
					) : cond.op === "in" || cond.op === "nin" ? (
						<input
							className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
							placeholder="Add comma-separated values"
							value={Array.isArray(cond.value) ? cond.value.join(",") : ""}
							onChange={handleArrayValueChange}
						/>
					) : (
						<input
							className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
							placeholder="e.g. Trial, 200, 2024-01-01"
							value={cond.value === undefined ? "" : String(cond.value)}
							onChange={handleSingleValueChange}
						/>
					)}
				</div>

				<button
					className="ml-auto inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
					onClick={onRemove}
				>
					<span>Remove</span>
					<span aria-hidden>×</span>
				</button>
			</div>
		</div>
	);
}

function parseMaybeNumber(raw: string): string | number {
	if (raw.trim() === "") return "";
	const asNumber = Number(raw);
	if (!Number.isNaN(asNumber)) return asNumber;
	return raw;
}
