import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth.server";
import type { AuthUser } from "../types";
import { toAuthUser } from "./toAuthUser";

export const getSession = createServerFn({ method: "GET" }).handler(
	async (): Promise<AuthUser | null> => {
		const session = await auth.api.getSession({ headers: getRequestHeaders() });
		return session ? toAuthUser(session.user) : null;
	},
);
