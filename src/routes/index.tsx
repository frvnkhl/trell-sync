import { createFileRoute } from "@tanstack/react-router";
import { OrdersPage, type OrdersSearchParams } from "#/features/orders";
import type { OrderStatus } from "#/types/db";

const VALID_STATUSES: Array<OrderStatus | "all"> = [
	"all",
	"prijata",
	"vyroba",
	"hotovo",
	"vyzdvihnuta",
];

export const Route = createFileRoute("/")({
	validateSearch: (raw: Record<string, unknown>): OrdersSearchParams => ({
		status: VALID_STATUSES.includes(raw.status as OrderStatus | "all")
			? (raw.status as OrderStatus | "all")
			: "all",
		q: typeof raw.q === "string" ? raw.q : "",
		page:
			typeof raw.page === "number" && raw.page >= 1
				? Math.floor(raw.page)
				: 1,
	}),
	component: () => {
		const search = Route.useSearch();
		return <OrdersPage search={search} />;
	},
});
