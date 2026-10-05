import { createFileRoute } from "@tanstack/react-router";
import { ChangePasswordForm } from "#/features/auth";

export const Route = createFileRoute("/account")({
	component: () => (
		<div className="max-w-sm space-y-6 p-6">
			<h1 className="text-xl font-semibold">Account</h1>
			<ChangePasswordForm />
		</div>
	),
});
