import { createServerFn } from "@tanstack/react-start";
import { ordersCollection } from "#/lib/mongo.server";
import { requireUser } from "#/lib/session.server";
import {
	TRELLO_BOARD_ID,
	TRELLO_LIST_STATUS,
	parseCard,
	trelloGet,
	type TrelloCardPreview,
} from "#/lib/trello.server";

export const fetchTrelloCards = createServerFn({ method: "GET" }).handler(
	async (): Promise<TrelloCardPreview[]> => {
		await requireUser();

		const [lists, existingOrders] = await Promise.all([
			trelloGet(`/boards/${TRELLO_BOARD_ID}/lists`) as Promise<
				Array<{ id: string; name: string }>
			>,
			ordersCollection()
				.find(
					{ trello_id: { $type: "string" } },
					{ projection: { trello_id: 1 } },
				)
				.toArray(),
		]);

		const knownIds = new Set(existingOrders.map((o) => o.trello_id));

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
