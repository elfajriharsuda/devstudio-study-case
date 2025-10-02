import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalNav } from "@/components/GlobalNav";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Momentum Segments",
	description:
		"Interactive segmentation playground to explore filters, metrics, and live previews.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-slate-100 antialiased`}
			>
				<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
					<header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
						<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
							<Link href="/" className="text-lg font-semibold tracking-tight text-white">
								Momentum Segments
							</Link>
							<GlobalNav />
						</div>
					</header>
					<main className="flex-1">
						<div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
							{children}
						</div>
					</main>
					<footer className="border-t border-slate-800 bg-slate-950/80">
						<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-slate-400">
							<span>© {new Date().getFullYear()} Momentum Segments</span>
							<span>Crafted for the Devstudio case study</span>
						</div>
					</footer>
				</div>
			</body>
		</html>
	);
}
