import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importTrelloOrders } from "../api/importTrelloOrders";
import type { TrelloCardPreview } from "#/lib/trello.server";

export const useImportTrelloOrders = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (cards: TrelloCardPreview[]) =>
			importTrelloOrders({ data: cards }),
		onSuccess: (result) => {
			if (result.imported > 0) {
				queryClient.invalidateQueries({ queryKey: ["orders"] });
				queryClient.invalidateQueries({ queryKey: ["order-stats"] });
			}
		},
	});
};
