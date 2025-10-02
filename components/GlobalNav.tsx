"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: Array<{ href: string; label: string }> = [
	{ href: "/", label: "Home" },
	{ href: "/segments", label: "Segments" },
	{ href: "/segments/builder", label: "Builder" },
	{ href: "/segments/presets", label: "Presets" },
	{ href: "/segments/core-demo", label: "Core Demo" },
];

export function GlobalNav() {
	const pathname = usePathname();

	return (
		<nav className="flex flex-wrap items-center gap-2 text-sm">
			{LINKS.map((link) => {
				const isActive =
					pathname === link.href ||
					(pathname?.startsWith(link.href) && link.href !== "/");
				return (
					<Link
						key={link.href}
						href={link.href}
						className={`inline-flex items-center rounded-full px-3 py-1 font-medium transition ${
							isActive
								? "bg-slate-100 text-slate-900 shadow"
								: "text-slate-100/80 hover:text-white hover:bg-slate-100/10"
						}`}
					>
						{link.label}
					</Link>
				);
			})}
		</nav>
	);
}
