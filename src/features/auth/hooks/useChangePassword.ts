import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../api/changePassword";
import type { ChangePasswordInput } from "../types";

export const useChangePassword = () =>
	useMutation({
		mutationFn: (input: ChangePasswordInput) => changePassword({ data: input }),
	});
