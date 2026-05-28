import type { OrderStatus } from "#/types/db";

export type OrdersSearchParams = {
	status: OrderStatus | "all";
	q: string;
	page: number;
};
