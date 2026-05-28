import type { OrderStatus, OrderType, PaymentType } from "#/types/db";

export const ZONE_CONFIG: Record<
	OrderType,
	{ label: string; zone: string; color: string }
> = {
	velkformat: { label: "Rolky / Veľkoformát", zone: "A", color: "#e8521a" },
	plocha: { label: "Ploché tlačoviny", zone: "B", color: "#1a6ee8" },
	textil: { label: "Textil", zone: "C", color: "#e8a01a" },
	darcek: { label: "Darčekové predmety", zone: "D", color: "#9b1ae8" },
	gravir: { label: "Malé gravírovanie", zone: "E", color: "#1aaa4a" },
	peciatky: { label: "Pečiatky", zone: "F", color: "#e81a6e" },
	tabulky: { label: "Tabuľky", zone: "G", color: "#1aaae8" },
};

export const STATUS_CONFIG: Record<
	OrderStatus,
	{ label: string; className: string }
> = {
	prijata: {
		label: "Prijatá",
		className: "bg-warning text-warning-foreground",
	},
	vyroba: {
		label: "Vo výrobe",
		className: "bg-info text-info-foreground",
	},
	hotovo: {
		label: "Hotovo",
		className: "bg-success text-success-foreground",
	},
	vyzdvihnuta: {
		label: "Vyzdvihnutá",
		className: "bg-purple text-purple-foreground",
	},
};

export const PAYMENT_CONFIG: Record<
	PaymentType,
	{ label: string; className: string }
> = {
	zaplatene: {
		label: "Zaplatené",
		className: "bg-success text-success-foreground",
	},
	zaloha: {
		label: "Záloha",
		className: "bg-warning text-warning-foreground",
	},
	"treba-zaplatit": {
		label: "Treba zaplatiť",
		className: "bg-destructive/15 text-destructive-foreground",
	},
};

export const STATUS_FILTER_OPTIONS: Array<{
	value: OrderStatus | "all";
	label: string;
}> = [
	{ value: "all", label: "Všetky" },
	{ value: "prijata", label: "Prijaté" },
	{ value: "vyroba", label: "Vo výrobe" },
	{ value: "hotovo", label: "Hotové" },
	{ value: "vyzdvihnuta", label: "Vyzdvihnuté" },
];
