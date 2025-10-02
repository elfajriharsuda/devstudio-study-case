"use client";

import { useMemo, useState } from "react";
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

	const summaryStats: SummaryStatProps[] = [
		{
			label: "Users Matched",
			value: execution.summary.users,
			helper: "Distinct users in the dataset",
		},
		{
			label: "Events Matched",
			value: execution.summary.events,
			helper: "Filtered by the active rule",
		},
		{
			label: "Sessions (est.)",
			value: execution.summary.sessions,
			helper: `Last run ${lastRun}`,
		},
	];

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
								Craft nested AND/OR groups, tune conditions, and see how your segment reacts to sample data without leaving the page.
							</p>
						</div>
					</div>

					<div className="grid gap-3 text-sm">
						<span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 shadow-inner">
							Structure
						</span>
						<div className="flex flex-wrap gap-3 text-xs">
							<Pill>{structureTotals.groups} group(s)</Pill>
							<Pill>{structureTotals.conditions} condition(s)</Pill>
						</div>
					</div>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{summaryStats.map((stat) => (
						<SummaryStat key={stat.label} {...stat} />
					))}
				</div>
			</section>

			<RuleGroupView node={root} onChange={setRoot} isRoot />

			<section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur">
				<div className="flex flex-wrap items-center gap-3">
					<h3 className="text-lg font-semibold text-slate-900">Matched Users</h3>
					<span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
						{execution.matchedUserIds.length} users
					</span>
				</div>
				<p className="mt-1 text-sm text-slate-600">
					Previewing the first five users that satisfy the current rule tree.
				</p>

				{execution.matchedUserIds.length === 0 ? (
					<div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
						No users match the current logic. Try broadening your conditions.
					</div>
				) : (
					<div className="mt-6 grid gap-4 md:grid-cols-2">
						{execution.matchedUserIds.slice(0, 5).map((id) => {
							const metrics = execution.metricsByUser[id];
							return (
								<article key={id} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/40 p-4 shadow-sm">
									<header className="flex items-start justify-between">
										<span className="font-medium text-slate-900">{id}</span>
										<span className="text-xs uppercase tracking-[0.25em] text-slate-400">
											User
										</span>
									</header>
									<dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
										<div>
											<dt className="uppercase tracking-[0.2em]">Events</dt>
											<dd className="mt-1 text-base font-semibold text-slate-900">
												{metrics.eventCount}
											</dd>
										</div>
										<div>
											<dt className="uppercase tracking-[0.2em]">Sessions</dt>
											<dd className="mt-1 text-base font-semibold text-slate-900">
												{metrics.sessionCount}
											</dd>
										</div>
										<div className="col-span-2">
											<dt className="uppercase tracking-[0.2em]">Last Active</dt>
											<dd className="mt-1 text-sm text-slate-700">{metrics.lastActive}</dd>
										</div>
									</dl>
								</article>
							);
						})}
					</div>
				)}

				{execution.matchedUserIds.length > 5 && (
					<div className="mt-4 text-xs text-slate-500">
						+{execution.matchedUserIds.length - 5} more users not shown in preview
					</div>
				)}
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

function RuleGroupView({ node, onChange, onRemove, isRoot = false }: RuleGroupViewProps) {
	function updateChild(idx: number, child: UiNode) {
		const nextChildren = node.children.slice();
		nextChildren[idx] = child;
		onChange({ ...node, children: nextChildren });
	}

	function removeChild(idx: number) {
		const nextChildren = node.children.filter((_, i) => i !== idx);
		const normalized = nextChildren.length === 0 ? [makeCondition()] : nextChildren;
		onChange({ ...node, children: normalized });
	}

	function addCondition() {
		onChange({ ...node, children: [...node.children, makeCondition()] });
	}

	function addGroup(kind: "and" | "or") {
		onChange({ ...node, children: [...node.children, makeGroup(kind)] });
	}

	function toggleKind() {
		onChange({ ...node, kind: node.kind === "and" ? "or" : "and" });
	}

	return (
		<div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur">
			<div className="flex flex-wrap items-center gap-3">
				<span className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">
					{isRoot ? "Root Group" : "Group"}
				</span>
				<span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
					{node.kind.toUpperCase()}
				</span>
				<button
					className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
					onClick={toggleKind}
				>
					<span aria-hidden>⇆</span>
					<span>Toggle AND/OR</span>
				</button>
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
					<div key={child.id} className="border-l-2 border-dashed border-indigo-100 pl-4">
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

type SummaryStatProps = {
	label: string;
	value: number | string;
	helper?: string;
};

function SummaryStat({ label, value, helper }: SummaryStatProps) {
	return (
		<div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
			<p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
				{label}
			</p>
			<p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
			{helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
		</div>
	);
}

type PillProps = {
	children: string | number;
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
