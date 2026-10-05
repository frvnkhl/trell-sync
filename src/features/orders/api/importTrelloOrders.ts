import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	ensureIndexes,
	nextOrderId,
	ordersCollection,
} from "#/lib/mongo.server";
import { requireUser } from "#/lib/session.server";

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
		await requireUser();
		await ensureIndexes();

		const orders = ordersCollection();
		const result: ImportResult = { imported: 0, skipped: 0, errorDetails: [] };

		for (const card of cards) {
			if (
				await orders.findOne(
					{ trello_id: card.trelloId },
					{ projection: { _id: 1 } },
				)
			) {
				result.skipped++;
				continue;
			}

			try {
				await orders.insertOne({
					_id: card.orderId ?? (await nextOrderId()),
					name: card.name,
					phone: card.phone || null,
					email: card.email || null,
					type: card.type,
					zone: card.zone,
					shelf: card.shelf || null,
					status: card.status,
					payment: null,
					payment_amount: null,
					note: card.note || null,
					trello_id: card.trelloId,
					source: "import",
					sms_sent: false,
					created_at: new Date(card.createdAt),
				});
				result.imported++;
			} catch (e) {
				result.errorDetails.push({
					name: card.name,
					reason: e instanceof Error ? e.message : "Neznáma chyba",
				});
			}
		}

		return result;
	});
