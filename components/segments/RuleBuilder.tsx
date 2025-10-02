"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { NormalizedEventRow } from "@/lib/types";
import { executeSegment } from "@/lib/segmentation";
import {
	UiCondition,
	UiGroup,
	UiNode,
	isGroup,
	makeCondition,
	makeGroup,
	toRuleNode,
} from "./rules/schema";
import { ConditionRow } from "./RuleControls";
import { ResultsSummary } from "./ResultsSummary";
import { DownloadCsvButton } from "./DownloadCsvButton";
import { UserTable } from "./UserTable";
import { MatchedEventsTable } from "./MatchedEventsTable";

type RuleBuilderProps = {
	rows: NormalizedEventRow[];
};

export function RuleBuilder({ rows }: RuleBuilderProps) {
	const [root, setRoot] = useState<UiGroup>(() => makeGroup("and"));

	const execution = useMemo(
		() => executeSegment(toRuleNode(root), rows),
		[root, rows],
	);

	const lastRun = useMemo(
		() => new Date(execution.summary.lastRun).toLocaleString(),
		[execution.summary.lastRun],
	);

	const structureTotals = useMemo(() => summarizeStructure(root), [root]);

	const datasetUserCount = useMemo(() => {
		const ids = new Set<string>();
		for (const row of rows) ids.add(row.user_id);
		return ids.size;
	}, [rows]);

	const coverage = useMemo(() => {
		if (datasetUserCount === 0) return "0.0";
		return ((execution.summary.users / datasetUserCount) * 100).toFixed(1);
	}, [datasetUserCount, execution.summary.users]);

	const exportFilename = useMemo(() => {
		const timestamp = new Date(execution.summary.lastRun)
			.toISOString()
			.replace(/[:.]/g, "-");
		return `rule-builder-${timestamp}.csv`;
	}, [execution.summary.lastRun]);

	return (
		<div className="space-y-10">
			<section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-100 via-white to-sky-50 p-6 shadow-xl">
				<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
					<div className="space-y-3">
						<span className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-700">
							Live Segment Preview
						</span>
						<div className="space-y-2">
							<h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
								Design rules visually, validate instantly.
							</h2>
							<p className="max-w-xl text-sm text-slate-600 md:text-base">
								Craft nested AND/OR groups, tune conditions, and see how your
								segment reacts to sample data without leaving the page.
							</p>
						</div>
					</div>

					<div className="grid gap-3 text-sm">
						<span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 shadow">
							Structure & Cohort
						</span>
						<div className="flex flex-wrap gap-3 text-xs">
							<Pill>{structureTotals.groups} group(s)</Pill>
							<Pill>{structureTotals.conditions} condition(s)</Pill>
							<Pill>
								{execution.summary.users.toLocaleString()} matched users
							</Pill>
							<Pill>{coverage}% dataset coverage</Pill>
						</div>
					</div>
				</div>
			</section>

			<RuleGroupView node={root} onChange={setRoot} isRoot />

			<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
				<div className="flex flex-wrap items-center gap-3">
					<div>
						<h3 className="text-lg font-semibold text-slate-900">
							Matched Cohort
						</h3>
						<p className="text-sm text-slate-500">
							Results refresh automatically as you refine the rule logic.
						</p>
					</div>
					<span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
						{execution.matchedUserIds.length} users
					</span>
					<div className="ml-auto">
						<DownloadCsvButton exec={execution} filename={exportFilename} />
					</div>
				</div>
				<div className="mt-4 text-xs text-slate-700">
					Last evaluated: {lastRun}
				</div>

				<div className="mt-6">
					<ResultsSummary exec={execution} />
				</div>

				<div className="mt-6 space-y-6">
					<UserTable exec={execution} />
					<MatchedEventsTable events={execution.matchedEvents} />
				</div>
			</section>
		</div>
	);
}

type RuleGroupViewProps = {
	node: UiGroup;
	onChange: (next: UiGroup) => void;
	onRemove?: () => void;
	isRoot?: boolean;
};

function RuleGroupView({
	node,
	onChange,
	onRemove,
	isRoot = false,
}: RuleGroupViewProps) {
	function updateChild(idx: number, child: UiNode) {
		const nextChildren = node.children.slice();
		nextChildren[idx] = child;
		onChange({ ...node, children: nextChildren });
	}

	function removeChild(idx: number) {
		const nextChildren = node.children.filter((_, i) => i !== idx);
		const normalized =
			nextChildren.length === 0 ? [makeCondition()] : nextChildren;
		onChange({ ...node, children: normalized });
	}

	function addCondition() {
		onChange({ ...node, children: [...node.children, makeCondition()] });
	}

	function addGroup(kind: "and" | "or") {
		onChange({ ...node, children: [...node.children, makeGroup(kind)] });
	}

	function setKind(kind: "and" | "or") {
		onChange({ ...node, kind });
	}

	return (
		<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
			<div className="flex flex-wrap items-center gap-3">
				<span className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">
					{isRoot ? "Root Group" : "Group"}
				</span>
				<div className="inline-flex items-center rounded-full border border-indigo-300 bg-indigo-50 p-1 text-xs font-semibold text-indigo-700">
					<button
						className={`rounded-full px-3 py-1 transition ${
							node.kind === "and"
								? "bg-indigo-600 text-white"
								: "text-indigo-600 hover:bg-white"
						}`}
						onClick={() => setKind("and")}
						type="button"
					>
						AND
					</button>
					<button
						className={`rounded-full px-3 py-1 transition ${
							node.kind === "or"
								? "bg-indigo-600 text-white"
								: "text-indigo-600 hover:bg-white"
						}`}
						onClick={() => setKind("or")}
						type="button"
					>
						OR
					</button>
				</div>
				<div className="ml-auto flex flex-wrap gap-2">
					<button
						className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
						onClick={addCondition}
					>
						<span aria-hidden>＋</span>
						Condition
					</button>
					<button
						className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
						onClick={() => addGroup("and")}
					>
						<span aria-hidden>＋</span>
						AND Group
					</button>
					<button
						className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
						onClick={() => addGroup("or")}
					>
						<span aria-hidden>＋</span>
						OR Group
					</button>
					{!isRoot && onRemove && (
						<button
							className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
							onClick={onRemove}
						>
							<span aria-hidden>×</span>
							Remove group
						</button>
					)}
				</div>
			</div>

			<div className="mt-6 space-y-4">
				{node.children.map((child, idx) => (
					<div
						key={child.id}
						className="border-l-2 border-dashed border-indigo-100 pl-4"
					>
						{isGroup(child) ? (
							<RuleGroupView
								node={child as UiGroup}
								onChange={(group) => updateChild(idx, group)}
								onRemove={() => removeChild(idx)}
							/>
						) : (
							<ConditionRow
								cond={child as UiCondition}
								onChange={(condition) => updateChild(idx, condition)}
								onRemove={() => removeChild(idx)}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

type PillProps = {
	children: ReactNode;
};

function Pill({ children }: PillProps) {
	return (
		<span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 shadow">
			{children}
		</span>
	);
}

function summarizeStructure(node: UiNode) {
	const totals = { groups: 0, conditions: 0 };

	function walk(current: UiNode) {
		if (isGroup(current)) {
			totals.groups += 1;
			current.children.forEach((child) => walk(child));
		} else {
			totals.conditions += 1;
		}
	}

	walk(node);
	return totals;
}
