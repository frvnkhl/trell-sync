import { createServerFn } from "@tanstack/react-start";
import { ordersCollection } from "#/lib/mongo.server";
import { requireUser } from "#/lib/session.server";

export type OrderStats = {
	prijata: number;
	vyroba: number;
	hotovo: number;
	vyzdvihnuta: number;
};

export const getOrderStats = createServerFn({ method: "GET" }).handler(
	async (): Promise<OrderStats> => {
		await requireUser();

		const groups = await ordersCollection()
			.aggregate<{ _id: string; count: number }>([
				{ $group: { _id: "$status", count: { $sum: 1 } } },
			])
			.toArray();

		const countOf = (status: keyof OrderStats) =>
			groups.find((g) => g._id === status)?.count ?? 0;

		return {
			prijata: countOf("prijata"),
			vyroba: countOf("vyroba"),
			hotovo: countOf("hotovo"),
			vyzdvihnuta: countOf("vyzdvihnuta"),
		};
	},
);
