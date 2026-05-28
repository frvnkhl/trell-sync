import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdminClient } from "#/lib/supabase.server";

export type OrderStats = {
	prijata: number;
	vyroba: number;
	hotovo: number;
	vyzdvihnuta: number;
};

export const getOrderStats = createServerFn({ method: "GET" }).handler(
	async (): Promise<OrderStats> => {
		const supabase = getSupabaseAdminClient();

		const [prijata, vyroba, hotovo, vyzdvihnuta] = await Promise.all([
			supabase
				.from("orders")
				.select("*", { count: "exact", head: true })
				.eq("status", "prijata"),
			supabase
				.from("orders")
				.select("*", { count: "exact", head: true })
				.eq("status", "vyroba"),
			supabase
				.from("orders")
				.select("*", { count: "exact", head: true })
				.eq("status", "hotovo"),
			supabase
				.from("orders")
				.select("*", { count: "exact", head: true })
				.eq("status", "vyzdvihnuta"),
		]);

		return {
			prijata: prijata.count ?? 0,
			vyroba: vyroba.count ?? 0,
			hotovo: hotovo.count ?? 0,
			vyzdvihnuta: vyzdvihnuta.count ?? 0,
		};
	},
);
