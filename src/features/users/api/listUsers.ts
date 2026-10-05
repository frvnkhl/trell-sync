import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth.server";
import { requireAdmin } from "#/lib/session.server";
import type { ManagedUser } from "../types";

export const listUsers = createServerFn({ method: "GET" }).handler(
	async (): Promise<ManagedUser[]> => {
		await requireAdmin();
		const { users } = await auth.api.listUsers({
			query: { sortBy: "createdAt", sortDirection: "desc", limit: 200 },
			headers: getRequestHeaders(),
		});

		return users.map((u) => ({
			id: u.id,
			name: u.name,
			email: u.email,
			role: u.role === "admin" ? "admin" : "user",
			createdAt: new Date(u.createdAt).toISOString(),
		}));
	},
);
