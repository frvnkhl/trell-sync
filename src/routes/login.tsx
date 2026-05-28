import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "#/features/auth/components/LoginForm";
import { getSession } from "#/features/auth/api/getSession";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const user = await getSession();
		if (user) throw redirect({ to: "/", search: { status: "all", q: "", page: 1 } });
	},
	component: () => (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="w-full max-w-sm space-y-6 px-4">
				<div className="space-y-1 text-center">
					<h1 className="text-2xl font-bold tracking-tight">trell-sync</h1>
					<p className="text-sm text-muted-foreground">
						MinuteCopy — správa zákaziek
					</p>
				</div>
				<LoginForm />
			</div>
		</div>
	),
});
