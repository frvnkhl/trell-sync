import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../api/getOrders";
import type { GetOrdersInput } from "../api/getOrders";

export const useOrders = (params: GetOrdersInput) => {
	return useQuery({
		queryKey: ["orders", params],
		queryFn: () => getOrders({ data: params }),
		placeholderData: (prev) => prev,
	});
};
