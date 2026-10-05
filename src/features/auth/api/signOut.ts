import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth.server";

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
	await auth.api.signOut({ headers: getRequestHeaders() });
});
