import { createServerFn } from "@tanstack/react-start";
import type { Filter } from "mongodb";
import { z } from "zod";
import { ordersCollection, toOrder } from "#/lib/mongo.server";
import { requireUser } from "#/lib/session.server";
import type { Order, OrderDoc } from "#/types/db";

const schema = z.object({
	status: z
		.enum(["all", "prijata", "vyroba", "hotovo", "vyzdvihnuta"])
		.default("all"),
	search: z.string().default(""),
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().max(100).default(20),
});

export type GetOrdersInput = z.infer<typeof schema>;

export type GetOrdersResult = {
	data: Order[];
	total: number;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getOrders = createServerFn({ method: "GET" })
	.inputValidator((raw: unknown) => schema.parse(raw))
	.handler(async ({ data }): Promise<GetOrdersResult> => {
		await requireUser();
		const { status, search, page, limit } = data;

		const filter: Filter<OrderDoc> = {};

		if (status !== "all") {
			filter.status = status;
		}

		if (search.trim()) {
			const re = new RegExp(escapeRegex(search.trim()), "i");
			filter.$or = [{ name: re }, { phone: re }, { email: re }, { _id: re }];
		}

		const orders = ordersCollection();
		const [rows, total] = await Promise.all([
			orders
				.find(filter)
				.sort({ created_at: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.toArray(),
			orders.countDocuments(filter),
		]);

		return { data: rows.map(toOrder), total };
	});
