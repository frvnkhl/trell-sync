import { LayoutList, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
	label: string;
	url: string;
	icon: LucideIcon;
};

export const navItems: NavItem[] = [
	{
		label: "Zákazky",
		url: "/",
		icon: LayoutList,
	},
	{
		label: "Import z Trella",
		url: "/import",
		icon: Download,
	},
];
