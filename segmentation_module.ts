import { loadDataset } from "@/lib/dataset";
import type { NormalizedEventRow } from "@/lib/types";
import {
	executeSegment,
	type RuleNode,
	type SegmentExecution,
	type SegmentSummary,
} from "@/lib/segmentation";

enum ExportError {
	MissingFetch = "PostHog export requires a global fetch implementation",
}

export type RunSegmentOptions = {
	rows?: NormalizedEventRow[];
	useCache?: boolean;
};

export async function runSegment(
	rule: RuleNode,
	options: RunSegmentOptions = {},
): Promise<SegmentExecution> {
	const dataset =
		options.rows ?? (await loadDataset(options.useCache ? false : true));
	return executeSegment(rule, dataset);
}

export type PostHogCohortPerson = {
	distinct_id: string;
	properties: {
		last_active: string;
		session_count: number;
		event_count: number;
		avg_session_duration_ms: number;
	};
};

export type PostHogCohortPayload = {
	name: string;
	generated_at: string;
	count: number;
	summary: Pick<SegmentSummary, "sessions" | "avgSessionDurationMs" | "lastActive">;
	people: PostHogCohortPerson[];
};

export function toPostHogCohort(
	execution: SegmentExecution,
	cohortName: string,
): PostHogCohortPayload {
	const people: PostHogCohortPerson[] = execution.matchedUserIds.map((userId) => {
		const metrics = execution.metricsByUser[userId];
		return {
			distinct_id: userId,
			properties: {
				last_active: metrics?.lastActive ?? "",
				session_count: metrics?.sessionCount ?? 0,
				event_count: metrics?.eventCount ?? 0,
				avg_session_duration_ms: Math.round(
					metrics?.avgSessionDurationMs ?? 0,
				),
			},
		};
	});

	return {
		name: cohortName,
		generated_at: execution.summary.lastRun,
		count: people.length,
		summary: {
			sessions: execution.summary.sessions,
			avgSessionDurationMs: execution.summary.avgSessionDurationMs,
			lastActive: execution.summary.lastActive,
		},
		people,
	};
}

export type ExportSegmentOptions = RunSegmentOptions & {
	cohortName: string;
	postUrl?: string;
	authToken?: string;
};

export async function exportSegmentToPostHog(
	rule: RuleNode,
	options: ExportSegmentOptions,
) {
	const execution = await runSegment(rule, options);
	const payload = toPostHogCohort(execution, options.cohortName);

	if (!options.postUrl) {
		return { execution, payload };
	}

	if (typeof fetch !== "function") {
		throw new Error(ExportError.MissingFetch);
	}

	const response = await fetch(options.postUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {}),
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(`PostHog export failed with status ${response.status}`);
	}

	return { execution, payload };
}

export { presets } from "@/lib/segmentation";
