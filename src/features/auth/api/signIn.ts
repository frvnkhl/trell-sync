import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { getSupabaseServerClient } from "#/lib/supabase.server";
import { signInSchema } from "../types";

export const signIn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => signInSchema.parse(data))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { data: authData, error } = await supabase.auth.signInWithPassword({
			email: data.email,
			password: data.password,
		});

		if (error || !authData.session) {
			throw new Error("Invalid email or password");
		}

		const { access_token, refresh_token, expires_in } = authData.session;

		const cookieBase = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax" as const,
			path: "/",
		};

		setCookie("sb-access-token", access_token, {
			...cookieBase,
			maxAge: expires_in,
		});

		setCookie("sb-refresh-token", refresh_token, {
			...cookieBase,
			maxAge: 60 * 60 * 24 * 90,
		});

		return {
			id: authData.user.id,
			email: authData.user.email!,
		};
	});
