import { createFileRoute, redirect } from "@tanstack/react-router";
import { UsersPage } from "#/features/users";

export const Route = createFileRoute("/users")({
	beforeLoad: ({ context }) => {
		if (context.user?.role !== "admin") {
			throw redirect({ to: "/", search: { status: "all", q: "", page: 1 } });
		}
	},
	component: UsersPage,
});
