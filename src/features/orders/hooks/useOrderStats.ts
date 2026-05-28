import { useQuery } from "@tanstack/react-query";
import { getOrderStats } from "../api/getOrderStats";

export const useOrderStats = () => {
	return useQuery({
		queryKey: ["order-stats"],
		queryFn: () => getOrderStats(),
		staleTime: 30_000,
	});
};
