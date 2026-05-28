import { useQuery } from "@tanstack/react-query";
import { fetchTrelloCards } from "../api/fetchTrelloCards";

export const useFetchTrelloCards = (enabled: boolean) => {
	return useQuery({
		queryKey: ["trello-cards"],
		queryFn: () => fetchTrelloCards(),
		enabled,
		staleTime: 0,
		gcTime: 0,
	});
};
