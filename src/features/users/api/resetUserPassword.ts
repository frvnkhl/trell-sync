import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth.server";
import { requireAdmin } from "#/lib/session.server";
import { resetPasswordSchema } from "../types";

export const resetUserPassword = createServerFn({ method: "POST" })
	.inputValidator((raw: unknown) => resetPasswordSchema.parse(raw))
	.handler(async ({ data }) => {
		await requireAdmin();
		await auth.api.setUserPassword({
			body: data,
			headers: getRequestHeaders(),
		});
	});
