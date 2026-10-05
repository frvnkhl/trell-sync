import * as React from "react";
import { Button } from "#/components/ui/button";
import { useUsers } from "../hooks/useUsers";
import { CreateUserForm } from "./CreateUserForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const UsersPage = () => {
	const { data: users, isLoading } = useUsers();
	const [resettingId, setResettingId] = React.useState<string | null>(null);

	return (
		<div className="flex max-w-3xl flex-col gap-8 p-6">
			<section className="space-y-4">
				<h1 className="text-xl font-semibold">Users</h1>
				<CreateUserForm />
			</section>

			<section>
				{isLoading ? (
					<p className="text-sm text-muted-foreground">Loading…</p>
				) : (
					<ul className="divide-y rounded-md border">
						{users?.map((u) => (
							<li key={u.id} className="space-y-3 px-4 py-3 text-sm">
								<div className="flex items-center gap-4">
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{u.name}</p>
										<p className="truncate text-muted-foreground">{u.email}</p>
									</div>
									<span className="text-xs uppercase text-muted-foreground">
										{u.role}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setResettingId(u.id)}
									>
										Reset password
									</Button>
								</div>
								{resettingId === u.id && (
									<ResetPasswordForm
										userId={u.id}
										onDone={() => setResettingId(null)}
									/>
								)}
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
};
