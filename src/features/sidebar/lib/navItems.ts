import { Download, KeyRound, LayoutList, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
	label: string;
	url: string;
	icon: LucideIcon;
	adminOnly?: boolean;
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
	{
		label: "Users",
		url: "/users",
		icon: Users,
		adminOnly: true,
	},
	{
		label: "Account",
		url: "/account",
		icon: KeyRound,
	},
];
