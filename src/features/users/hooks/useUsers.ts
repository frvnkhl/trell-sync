import { useQuery } from "@tanstack/react-query";
import { listUsers } from "../api/listUsers";

export const useUsers = () =>
	useQuery({ queryKey: ["users"], queryFn: () => listUsers() });
