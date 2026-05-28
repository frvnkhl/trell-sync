import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { getSupabaseServerClient } from "#/lib/supabase.server";
import type { AuthUser } from "../types";

export const getSession = createServerFn({ method: "GET" }).handler(
	async (): Promise<AuthUser | null> => {
		const accessToken = getCookie("sb-access-token");
		const refreshToken = getCookie("sb-refresh-token");

		if (!accessToken || !refreshToken) return null;

		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken,
		});

		if (error || !data.session) {
			deleteCookie("sb-access-token", { path: "/" });
			deleteCookie("sb-refresh-token", { path: "/" });
			return null;
		}

		const { session } = data;

		// Rotate cookies when Supabase issues a refreshed access token
		if (session.access_token !== accessToken) {
			const cookieBase = {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax" as const,
				path: "/",
			};
			setCookie("sb-access-token", session.access_token, {
				...cookieBase,
				maxAge: session.expires_in,
			});
			setCookie("sb-refresh-token", session.refresh_token, {
				...cookieBase,
				maxAge: 60 * 60 * 24 * 90,
			});
		}

		return {
			id: session.user.id,
			email: session.user.email!,
		};
	},
);
