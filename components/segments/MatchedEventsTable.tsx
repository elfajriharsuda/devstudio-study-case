"use client";

import { useEffect, useMemo, useState } from "react";
import type { NormalizedEventRow } from "@/lib/types";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

type EventSortKey = "timestamp" | "user" | "event" | "feature";
type SortDirection = "asc" | "desc";

export function MatchedEventsTable({
	events,
}: {
	events: NormalizedEventRow[];
}) {
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] =
		useState<(typeof PAGE_SIZE_OPTIONS)[number]>(DEFAULT_PAGE_SIZE);
	const [sortKey, setSortKey] = useState<EventSortKey | null>(null);
	const [sortDir, setSortDir] = useState<SortDirection>("asc");
	const [featureFilter, setFeatureFilter] = useState<string>("all");

	const availableFeatures = useMemo(() => {
		const set = new Set<string>();
		for (const event of events) {
			const feature = featureFromEvent(event);
			if (feature) set.add(feature);
		}
		return Array.from(set).sort();
	}, [events]);

	const filteredEvents = useMemo(() => {
		if (featureFilter === "all") return events;
		return events.filter((event) => featureFromEvent(event) === featureFilter);
	}, [events, featureFilter]);

	const pageCount = useMemo(
		() => Math.max(1, Math.ceil(filteredEvents.length / pageSize)),
		[filteredEvents.length, pageSize],
	);

	useEffect(() => {
		setPage(0);
	}, [pageSize, events.length]);

	useEffect(() => {
		setPage((prev) => Math.min(prev, pageCount - 1));
	}, [pageCount]);

	const sortedEvents = useMemo(() => {
		if (!sortKey) return filteredEvents;

		const copy = filteredEvents.slice().sort((a, b) => {
			let cmp = 0;
			switch (sortKey) {
				case "timestamp": {
					const aTime = Date.parse(a.timestamp);
					const bTime = Date.parse(b.timestamp);
					cmp = aTime - bTime;
					break;
				}
				case "user":
					cmp = (a.user_id || "").localeCompare(b.user_id || "");
					break;
				case "event":
					cmp = (a.event || "").localeCompare(b.event || "");
					break;
				case "feature":
					cmp = (featureFromEvent(a) || "").localeCompare(
						featureFromEvent(b) || "",
					);
					break;
			}

			return sortDir === "asc" ? cmp : -cmp;
		});
		return copy;
	}, [filteredEvents, sortDir, sortKey]);

	const start = page * pageSize;
	const paginatedEvents = sortedEvents.slice(start, start + pageSize);
	const rangeStart = sortedEvents.length === 0 ? 0 : start + 1;
	const rangeEnd = start + paginatedEvents.length;

	function toggleSort(key: EventSortKey) {
		if (sortKey === key) {
			setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
			return;
		}

		setSortKey(key);
		setSortDir("asc");
	}

	function headerLabel(key: EventSortKey) {
		if (sortKey !== key) return "";
		return sortDir === "asc" ? "↑" : "↓";
	}

	return (
		<div className="space-y-4">
			<header className="flex flex-wrap items-center gap-3 justify-between">
				<div>
					<h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
						Matched Events
					</h4>
					<p className="text-xs text-slate-500">
						Quick sample of events pulled from the current segment.
					</p>
				</div>
				<div className="text-sm text-slate-700">
					Showing {rangeStart}-{rangeEnd} of{" "}
					{sortedEvents.length.toLocaleString()} events
				</div>
				<div className="flex items-center gap-3 text-sm text-slate-800">
					<label
						className="text-slate-500"
						htmlFor="matched-events-feature-filter"
					>
						Feature
					</label>
					<select
						id="matched-events-feature-filter"
						className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
						value={featureFilter}
						onChange={(event) => setFeatureFilter(event.target.value)}
					>
						<option value="all">All</option>
						{availableFeatures.map((feature) => (
							<option key={feature} value={feature}>
								{feature}
							</option>
						))}
					</select>
					<label className="text-slate-500" htmlFor="matched-events-page-size">
						Rows
					</label>
					<select
						id="matched-events-page-size"
						className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
						value={pageSize}
						onChange={(event) =>
							setPageSize(
								Number(
									event.target.value,
								) as (typeof PAGE_SIZE_OPTIONS)[number],
							)
						}
					>
						{PAGE_SIZE_OPTIONS.map((size) => (
							<option key={size} value={size}>
								{size}
							</option>
						))}
					</select>
				</div>
			</header>

			<div className="overflow-auto rounded-2xl border border-slate-200 shadow-sm">
				<table className="min-w-full divide-y divide-slate-200 text-sm">
					<thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
						<tr>
							<ThButton
								active={sortKey === "user"}
								onClick={() => toggleSort("user")}
							>
								User {headerLabel("user")}
							</ThButton>
							<ThButton
								active={sortKey === "event"}
								onClick={() => toggleSort("event")}
							>
								Event {headerLabel("event")}
							</ThButton>
							<ThButton
								className="hidden sm:table-cell"
								active={sortKey === "feature"}
								onClick={() => toggleSort("feature")}
							>
								Feature {headerLabel("feature")}
							</ThButton>
							<ThStatic className="hidden lg:table-cell">Page</ThStatic>
							<ThStatic className="hidden md:table-cell">Session</ThStatic>
							<ThButton
								active={sortKey === "timestamp"}
								onClick={() => toggleSort("timestamp")}
							>
								Timestamp {headerLabel("timestamp")}
							</ThButton>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 bg-white">
						{paginatedEvents.map((event) => (
							<tr key={`${event.user_id}-${event.timestamp}-${event.event}`}>
								<Td mono>{event.user_id}</Td>
								<Td>{event.event}</Td>
								<Td className="hidden sm:table-cell">
									{stringOrDash(event.properties?.feature)}
								</Td>
								<Td className="hidden lg:table-cell">
									{stringOrDash(event.properties?.page)}
								</Td>
								<Td className="hidden md:table-cell" mono>
									{event.session_id ?? "—"}
								</Td>
								<Td mono>{formatDate(event.timestamp)}</Td>
							</tr>
						))}
						{paginatedEvents.length === 0 && (
							<tr>
								<td
									className="px-4 py-6 text-center text-sm text-slate-500"
									colSpan={6}
								>
									No events match this rule yet.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<PaginationControls
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

type ThStaticProps = {
	children: React.ReactNode;
	className?: string;
};

function ThButton({ children, onClick, active, className }: ThButtonProps) {
	return (
		<th className={`px-4 py-3 font-semibold ${className ?? ""}`}>
			<button
				type="button"
				onClick={onClick}
				className={`inline-flex items-center gap-1 rounded-full px-2 py-1 transition ${
					active
						? "bg-indigo-600 text-white"
						: "text-slate-700 hover:bg-slate-100"
				}`}
			>
				{children}
			</button>
		</th>
	);
}

function ThStatic({ children, className }: ThStaticProps) {
	return (
		<th className={`px-4 py-3 font-semibold ${className ?? ""}`}>{children}</th>
	);
}

type TdProps = {
	children: React.ReactNode;
	mono?: boolean;
	className?: string;
};

function Td({ children, mono = false, className }: TdProps) {
	return (
		<td
			className={`px-4 py-3 text-slate-700 ${mono ? "font-mono" : ""} ${className ?? ""}`}
		>
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

function PaginationControls({
	page,
	pageCount,
	onPrev,
	onNext,
	onGoto,
}: PaginationProps) {
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

function stringOrDash(value: unknown): string {
	return typeof value === "string" && value.trim() !== "" ? value : "—";
}

function formatDate(raw: string): string {
	const parsed = Date.parse(raw);
	if (Number.isNaN(parsed)) return raw;
	return new Date(parsed).toLocaleString();
}

function featureFromEvent(event: NormalizedEventRow): string {
	const feature = event.properties?.feature;
	return typeof feature === "string" ? feature : "";
}
