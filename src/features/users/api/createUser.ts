import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth.server";
import { requireAdmin } from "#/lib/session.server";
import { createUserSchema } from "../types";

export const createUser = createServerFn({ method: "POST" })
	.inputValidator((raw: unknown) => createUserSchema.parse(raw))
	.handler(async ({ data }) => {
		await requireAdmin();
		await auth.api.createUser({ body: data, headers: getRequestHeaders() });
	});
