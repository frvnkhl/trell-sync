import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdminClient } from "#/lib/supabase.server";

const CardSchema = z.object({
	trelloId: z.string(),
	orderId: z.string().nullable(),
	name: z.string(),
	phone: z.string(),
	email: z.string(),
	shelf: z.string(),
	note: z.string(),
	status: z.enum(["prijata", "vyroba", "hotovo", "vyzdvihnuta"]),
	type: z.enum([
		"velkformat",
		"plocha",
		"textil",
		"darcek",
		"gravir",
		"peciatky",
		"tabulky",
	]),
	zone: z.string(),
	createdAt: z.string(),
});

const schema = z.array(CardSchema);

export type ImportError = {
	name: string;
	reason: string;
};

export type ImportResult = {
	imported: number;
	skipped: number;
	errorDetails: ImportError[];
};

export const importTrelloOrders = createServerFn({ method: "POST" })
	.inputValidator((raw: unknown) => schema.parse(raw))
	.handler(async ({ data: cards }): Promise<ImportResult> => {
		const supabase = getSupabaseAdminClient();
		const result: ImportResult = { imported: 0, skipped: 0, errorDetails: [] };

		for (const card of cards) {
			const { data: existing } = await supabase
				.from("orders")
				.select("id")
				.eq("trello_id", card.trelloId)
				.maybeSingle();

			if (existing) {
				result.skipped++;
				continue;
			}

			let orderId = card.orderId;
			if (!orderId) {
				const { data: generatedId, error: rpcError } =
					await supabase.rpc("order_id_seq");
				if (rpcError || !generatedId) {
					result.errorDetails.push({
						name: card.name,
						reason: rpcError?.message ?? "Nepodarilo sa vygenerovať ID zákazky",
					});
					continue;
				}
				orderId = generatedId;
			}

			const { error } = await supabase.from("orders").insert({
				id: orderId,
				name: card.name,
				phone: card.phone || null,
				email: card.email || null,
				type: card.type,
				zone: card.zone,
				shelf: card.shelf || null,
				status: card.status,
				note: card.note || null,
				trello_id: card.trelloId,
				source: "import",
				sms_sent: false,
				created_at: card.createdAt,
			});

			if (error) {
				result.errorDetails.push({ name: card.name, reason: error.message });
			} else {
				result.imported++;
			}
		}

		return result;
	});
