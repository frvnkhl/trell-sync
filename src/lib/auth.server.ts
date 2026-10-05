import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "#/env";
import { db } from "./mongo.server";

export const auth = betterAuth({
	database: mongodbAdapter(db),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	// Invite-only: accounts are created by admins via the admin plugin
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		minPasswordLength: 8,
	},
	plugins: [admin(), tanstackStartCookies()],
});
