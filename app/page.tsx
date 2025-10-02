import Link from "next/link";

const cards = [
	{
		title: "Explore Dataset",
		description:
			"See the cleaned demo data and understand its shape before segmenting.",
		href: "/segments",
		cta: "View dataset",
	},
	{
		title: "Interactive Builder",
		description:
			"Craft nested AND/OR rules, preview matched users, and export cohorts.",
		href: "/segments/builder",
		cta: "Launch builder",
	},
	{
		title: "Preset Library",
		description:
			"Start from curated audience definitions and tweak the rules to fit.",
		href: "/segments/presets",
		cta: "Browse presets",
	},
	{
		title: "Core Demo",
		description:
			"Run the engine end-to-end and inspect the aggregated user metrics.",
		href: "/segments/core-demo",
		cta: "Open demo",
	},
];

export default function HomePage() {
	return (
		<div className="space-y-12">
			<section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-slate-900 text-white shadow-2xl">
				<div className="px-8 py-12 sm:px-12">
					<div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em]">
						Live Preview
					</div>
					<h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
						Segment faster with instant feedback.
					</h1>
					<p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
						Momentum Segments is a focused playground for experimenting with
						event-based rules, seeing matched users in real time, and exporting
						cohorts without leaving the page.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-3">
						<Link
							href="/segments/builder"
							className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:shadow-xl"
						>
							Start building
						</Link>
						<Link
							href="/segments"
							className="inline-flex items-center rounded-full border border-white/50 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
						>
							Preview dataset
						</Link>
					</div>
				</div>
			</section>

			<section className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold text-white">
						Explore the tooling
					</h2>
					<p className="text-sm text-slate-400">
						Pick a workflow below to jump straight into segmentation.
					</p>
				</div>
				<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
					{cards.map((card) => (
						<Link
							key={card.href}
							href={card.href}
							className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
						>
							<div className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
								{card.title}
							</div>
							<p className="mt-3 text-sm text-slate-600">{card.description}</p>
							<span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
								{card.cta}
								<span
									aria-hidden
									className="transition group-hover:translate-x-1"
								>
									→
								</span>
							</span>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
