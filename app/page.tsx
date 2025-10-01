import Link from "next/link";

export default function HomePage() {
	return (
		<main className="p-6 space-y-2">
			<h1 className="text-2xl font-semibold">Segmentation Builder</h1>
			<p className="opacity-80">Prototype for Momentum case study.</p>
			<div className="mt-4 space-x-4">
				<Link className="underline" href="/segments">
					Open Segments
				</Link>
				<Link className="underline" href="/segments/core-demo">
					Core Demo
				</Link>
				<Link className="underline" href="/segments/presets">
					Predefined Segments
				</Link>
			</div>
		</main>
	);
}
