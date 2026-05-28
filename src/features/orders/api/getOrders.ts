import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdminClient } from "#/lib/supabase.server";
import type { Order } from "#/types/db";

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

export const getOrders = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => schema.parse(raw))
  .handler(async ({ data }): Promise<GetOrdersResult> => {
    const supabase = getSupabaseAdminClient();
    const { status, search, page, limit } = data;

    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search.trim()) {
      const s = search.trim();
      query = query.or(
        `name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,id.ilike.%${s}%`,
      );
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: rows, error, count } = await query;

    if (error) throw new Error(error.message);

    return { data: rows ?? [], total: count ?? 0 };
  });
