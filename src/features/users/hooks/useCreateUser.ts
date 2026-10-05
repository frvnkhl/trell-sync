import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api/createUser";
import type { CreateUserInput } from "../types";

export const useCreateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateUserInput) => createUser({ data: input }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
	});
};
