import Link from "next/link";

export default function HomePage() {
	return (
		<main className="p-6">
			<h1 className="text-2xl font-semibold">Segmentation Builder</h1>
			<p className="opacity-80">Prototype for Momentum case study.</p>
			<div className="mt-4">
				<Link className="underline" href="/segments">
					Open Segments
				</Link>
			</div>
		</main>
	);
}
