import { useMutation } from "@tanstack/react-query";
import { resetUserPassword } from "../api/resetUserPassword";
import type { ResetPasswordInput } from "../types";

export const useResetUserPassword = () =>
	useMutation({
		mutationFn: (input: ResetPasswordInput) =>
			resetUserPassword({ data: input }),
	});
