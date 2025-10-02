"use client";

import { useEffect, useMemo, useState } from "react";
import type { SegmentExecution } from "@/lib/segmentation/types";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

type UserSortKey = "user" | "events" | "sessions" | "avgSession" | "lastActive";
type SortDirection = "asc" | "desc";

export function UserTable({ exec }: { exec: SegmentExecution }) {
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
	const [sortKey, setSortKey] = useState<UserSortKey | null>(null);
	const [sortDir, setSortDir] = useState<SortDirection>("asc");

	const rows = useMemo(() => {
		const base = exec.matchedUserIds.map((userId) => {
			const metrics = exec.metricsByUser[userId];
			return {
				userId,
				eventCount: metrics?.eventCount ?? 0,
				sessionCount: metrics?.sessionCount ?? 0,
				avgSessionDurationMs: metrics?.avgSessionDurationMs ?? 0,
				lastActive: metrics?.lastActive ?? "",
			};
		});

		if (!sortKey) return base;

		const sorted = [...base].sort((a, b) => {
			let cmp = 0;
			switch (sortKey) {
				case "user":
					cmp = a.userId.localeCompare(b.userId);
					break;
				case "events":
					cmp = a.eventCount - b.eventCount;
					break;
				case "sessions":
					cmp = a.sessionCount - b.sessionCount;
					break;
				case "avgSession":
					cmp = a.avgSessionDurationMs - b.avgSessionDurationMs;
					break;
				case "lastActive": {
					const left = Date.parse(a.lastActive || "");
					const right = Date.parse(b.lastActive || "");
					cmp = left - right;
					break;
				}
			}
			return sortDir === "asc" ? cmp : -cmp;
		});

		return sorted;
	}, [exec, sortKey, sortDir]);

	const pageCount = useMemo(
		() => Math.max(1, Math.ceil(rows.length / pageSize)),
		[rows.length, pageSize],
	);

	useEffect(() => {
		setPage(0);
	}, [pageSize, exec.matchedUserIds]);

	useEffect(() => {
		setPage((prev) => Math.min(prev, pageCount - 1));
	}, [pageCount]);

	const start = page * pageSize;
	const pageRows = rows.slice(start, start + pageSize);
	const rangeStart = rows.length === 0 ? 0 : start + 1;
	const rangeEnd = start + pageRows.length;

	function toggleSort(nextKey: UserSortKey) {
		if (sortKey === nextKey) {
			setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
			return;
		}

		setSortKey(nextKey);
		setSortDir("asc");
	}

	function headerLabel(key: UserSortKey) {
		if (sortKey !== key) return "";
		return sortDir === "asc" ? "↑" : "↓";
	}

	return (
		<div className="space-y-4">
			<header className="flex flex-wrap items-center gap-3 justify-between">
				<div className="text-sm text-slate-700">
					Showing {rangeStart}-{rangeEnd} of {rows.length.toLocaleString()} users
				</div>
				<div className="flex items-center gap-2 text-sm text-slate-800">
					<label className="text-slate-500" htmlFor="user-table-page-size">
						Rows per page
					</label>
					<select
						id="user-table-page-size"
						className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
						value={pageSize}
						onChange={(event) => setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
					>
						{PAGE_SIZE_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</div>
			</header>

			<div className="overflow-auto rounded-2xl border border-slate-200 shadow-sm">
				<table className="min-w-full divide-y divide-slate-200 text-sm">
					<thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
						<tr>
							<ThButton active={sortKey === "user"} onClick={() => toggleSort("user")}>User {headerLabel("user")}</ThButton>
							<ThButton active={sortKey === "events"} onClick={() => toggleSort("events")}>Events {headerLabel("events")}</ThButton>
							<ThButton active={sortKey === "sessions"} onClick={() => toggleSort("sessions")}>Sessions {headerLabel("sessions")}</ThButton>
							<ThButton className="hidden sm:table-cell" active={sortKey === "avgSession"} onClick={() => toggleSort("avgSession")}>
								Avg Session {headerLabel("avgSession")}
							</ThButton>
							<ThButton className="hidden md:table-cell" active={sortKey === "lastActive"} onClick={() => toggleSort("lastActive")}>
								Last Active {headerLabel("lastActive")}
							</ThButton>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 bg-white">
			{pageRows.map((row) => (
				<tr key={row.userId}>
					<Td mono>{row.userId}</Td>
					<Td>{row.eventCount.toLocaleString()}</Td>
					<Td>{row.sessionCount.toLocaleString()}</Td>
					<Td className="hidden sm:table-cell">{formatDuration(row.avgSessionDurationMs)}</Td>
					<Td className="hidden md:table-cell" mono>
						{formatDate(row.lastActive)}
					</Td>
				</tr>
			))}
						{pageRows.length === 0 && (
							<tr>
								<td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={5}>
									No users available for this segment.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<Pagination
				page={page}
				pageCount={pageCount}
				onPrev={() => setPage((prev) => Math.max(prev - 1, 0))}
				onNext={() => setPage((prev) => Math.min(prev + 1, pageCount - 1))}
				onGoto={(index) => setPage(index)}
			/>
		</div>
	);
}

type ThButtonProps = {
	children: React.ReactNode;
	onClick: () => void;
	active: boolean;
	className?: string;
};

function ThButton({ children, onClick, active, className }: ThButtonProps) {
	return (
		<th className={`px-4 py-3 font-semibold ${className ?? ""}`}>
				<button
					type="button"
					onClick={onClick}
					className={`inline-flex items-center gap-1 rounded-full px-2 py-1 transition ${
						active ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"
					}`}
			>
				{children}
			</button>
		</th>
	);
}

type TdProps = {
	children: React.ReactNode;
	mono?: boolean;
	className?: string;
};

function Td({ children, mono = false, className }: TdProps) {
	return (
		<td className={`px-4 py-3 text-slate-700 ${mono ? "font-mono" : ""} ${className ?? ""}`}>
			{children}
		</td>
	);
}

type PaginationProps = {
	page: number;
	pageCount: number;
	onPrev: () => void;
	onNext: () => void;
	onGoto: (index: number) => void;
};

function Pagination({ page, pageCount, onPrev, onNext, onGoto }: PaginationProps) {
	const pages = Array.from({ length: pageCount }, (_, index) => index);
	let startPage = Math.max(0, page - 4);
	const endPage = Math.min(pageCount, startPage + 10);
	if (endPage - startPage < 10) {
		startPage = Math.max(0, endPage - 10);
	}
	const visiblePages = pages.slice(startPage, endPage);
	const showStartBoundary = startPage > 0;
	const showStartEllipsis = startPage > 1;
	const showEndBoundary = endPage < pageCount;
	const showEndEllipsis = endPage < pageCount - 1;

	return (
		<div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
			<button
				className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
				onClick={onPrev}
				disabled={page === 0}
			>
				<span aria-hidden>←</span>
				Prev
			</button>
			{showStartBoundary && (
				<>
					<button
						className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold transition ${
							page === 0
								? "border-indigo-200 bg-indigo-50 text-indigo-600"
								: "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
						}`}
						onClick={() => onGoto(0)}
					>
						1
					</button>
					{showStartEllipsis && <span className="px-2">…</span>}
				</>
			)}
			{visiblePages.map((index) => (
				<button
					key={index}
					className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold transition ${
						index === page
							? "border-indigo-200 bg-indigo-50 text-indigo-600"
							: "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
					}`}
					onClick={() => onGoto(index)}
				>
					{index + 1}
				</button>
			))}
			{showEndEllipsis && <span className="px-2">…</span>}
			{showEndBoundary && (
				<button
					className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold transition ${
						page === pageCount - 1
							? "border-indigo-200 bg-indigo-50 text-indigo-600"
							: "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
					}`}
					onClick={() => onGoto(pageCount - 1)}
				>
					{pageCount}
				</button>
			)}
			<button
				className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
				onClick={onNext}
				disabled={page >= pageCount - 1}
			>
				Next
				<span aria-hidden>→</span>
			</button>
			<div className="ml-auto text-xs">
				Page {page + 1} / {pageCount}
			</div>
		</div>
	);
}

function formatDuration(ms: number): string {
	if (!Number.isFinite(ms) || ms <= 0) return "—";
	const minutes = Math.floor(ms / 60000);
	const seconds = Math.round((ms % 60000) / 1000);
	if (minutes === 0) return `${seconds}s`;
	return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function formatDate(raw: string): string {
	if (!raw) return "—";
	const parsed = Date.parse(raw);
	if (Number.isNaN(parsed)) return raw;
	return new Date(parsed).toLocaleString();
}
