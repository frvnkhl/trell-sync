import { createServerFn } from "@tanstack/react-start";
import { getSupabaseAdminClient } from "#/lib/supabase.server";
import {
	TRELLO_BOARD_ID,
	TRELLO_LIST_STATUS,
	parseCard,
	trelloGet,
	type TrelloCardPreview,
} from "#/lib/trello.server";

export const fetchTrelloCards = createServerFn({ method: "GET" }).handler(
	async (): Promise<TrelloCardPreview[]> => {
		const supabase = getSupabaseAdminClient();

		const [lists, { data: existingOrders }] = await Promise.all([
			trelloGet(`/boards/${TRELLO_BOARD_ID}/lists`) as Promise<
				Array<{ id: string; name: string }>
			>,
			supabase.from("orders").select("trello_id").not("trello_id", "is", null),
		]);

		const knownIds = new Set(
			(existingOrders ?? []).map((o) => o.trello_id).filter(Boolean),
		);

		const targetLists = lists.filter((l) => l.name in TRELLO_LIST_STATUS);

		const cardsByList = await Promise.all(
			targetLists.map((l) =>
				(
					trelloGet(`/lists/${l.id}/cards`) as Promise<
						Array<{ id: string; name: string; desc: string }>
					>
				).then((cards) =>
					cards
						.filter((c) => !knownIds.has(c.id))
						.map((c) => parseCard(c, l.name)),
				),
			),
		);

		return cardsByList.flat();
	},
);
