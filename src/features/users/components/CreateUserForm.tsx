import { useForm } from "@tanstack/react-form";
import { FieldError } from "#/components/FieldError";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useCreateUser } from "../hooks/useCreateUser";
import { createUserSchema } from "../types";
import type { CreateUserInput } from "../types";

const defaultValues: CreateUserInput = {
	name: "",
	email: "",
	password: "",
	role: "user",
};

export const CreateUserForm = () => {
	const { mutateAsync, error, isPending } = useCreateUser();

	const form = useForm({
		defaultValues,
		validators: { onSubmit: createUserSchema },
		onSubmit: async ({ value, formApi }) => {
			await mutateAsync(value);
			formApi.reset();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit().catch(() => {});
			}}
			className="grid gap-4 sm:grid-cols-2"
		>
			<form.Field name="name">
				{(field) => (
					<div className="space-y-1.5">
						<Label htmlFor="new-name">Name</Label>
						<Input
							id="new-name"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>

			<form.Field name="email">
				{(field) => (
					<div className="space-y-1.5">
						<Label htmlFor="new-email">Email</Label>
						<Input
							id="new-email"
							type="email"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>

			<form.Field name="password">
				{(field) => (
					<div className="space-y-1.5">
						<Label htmlFor="new-password">Initial password</Label>
						<Input
							id="new-password"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>

			<form.Field name="role">
				{(field) => (
					<div className="space-y-1.5">
						<Label htmlFor="new-role">Role</Label>
						<Select
							value={field.state.value}
							onValueChange={(v) =>
								field.handleChange(v as CreateUserInput["role"])
							}
						>
							<SelectTrigger id="new-role">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="user">User</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>
				)}
			</form.Field>

			{error && (
				<p className="text-sm text-destructive sm:col-span-2">
					{error.message}
				</p>
			)}

			<div className="sm:col-span-2">
				<Button type="submit" disabled={isPending}>
					{isPending ? "Creating…" : "Create user"}
				</Button>
				<p className="mt-2 text-xs text-muted-foreground">
					Share the initial password with them; they can change it under
					Account.
				</p>
			</div>
		</form>
	);
};
