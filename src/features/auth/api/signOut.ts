import { createServerFn } from "@tanstack/react-start";
import { deleteCookie } from "@tanstack/react-start/server";
import { getSupabaseServerClient } from "#/lib/supabase.server";

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
	const supabase = getSupabaseServerClient();
	await supabase.auth.signOut();

	deleteCookie("sb-access-token", { path: "/" });
	deleteCookie("sb-refresh-token", { path: "/" });
});
