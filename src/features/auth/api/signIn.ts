import { createServerFn } from "@tanstack/react-start";
import { auth } from "#/lib/auth.server";
import { signInSchema } from "../types";
import { toAuthUser } from "./toAuthUser";

export const signIn = createServerFn({ method: "POST" })
	.validator((data: unknown) => signInSchema.parse(data))
	.handler(async ({ data }) => {
		try {
			const { user } = await auth.api.signInEmail({
				body: { email: data.email, password: data.password },
			});
			return toAuthUser(user);
		} catch {
			throw new Error("Invalid email or password");
		}
	});
