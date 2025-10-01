"use client";

import { useEffect, useState } from "react";
import type { NormalizedEventRow } from "@/lib/types";
import { loadDataset } from "@/lib/dataset";

export function useDataset() {
	const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
		"idle",
	);
	const [rows, setRows] = useState<NormalizedEventRow[]>([]);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		let mounted = true;
		setStatus("loading");
		loadDataset()
			.then((data) => {
				if (!mounted) return;
				setRows(data);
				setStatus("ready");
			})
			.catch((e) => {
				if (!mounted) return;
				setError(String(e));
				setStatus("error");
			});
		return () => {
			mounted = false;
		};
	}, []);

	return { status, rows, error };
}
