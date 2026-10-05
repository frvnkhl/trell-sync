import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth.server";
import { changePasswordSchema } from "../types";

export const changePassword = createServerFn({ method: "POST" })
	.validator((data: unknown) => changePasswordSchema.parse(data))
	.handler(async ({ data }) => {
		try {
			await auth.api.changePassword({
				body: { ...data, revokeOtherSessions: true },
				headers: getRequestHeaders(),
			});
		} catch {
			throw new Error("Current password is incorrect");
		}
	});
