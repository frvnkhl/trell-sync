import { useForm } from "@tanstack/react-form";
import { FieldError } from "#/components/FieldError";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { useChangePassword } from "../hooks/useChangePassword";
import { changePasswordFormSchema } from "../types";

export const ChangePasswordForm = () => {
	const { mutateAsync, error, isSuccess, isPending } = useChangePassword();

	const form = useForm({
		defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
		validators: { onSubmit: changePasswordFormSchema },
		onSubmit: async ({ value, formApi }) => {
			await mutateAsync({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
			});
			formApi.reset();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit().catch(() => {});
			}}
			className="space-y-4"
		>
			<form.Field name="currentPassword">
				{(field) => (
					<div className="space-y-1.5">
						<Label htmlFor="currentPassword">Current password</Label>
						<Input
							id="currentPassword"
							type="password"
							autoComplete="current-password"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>

			<form.Field name="newPassword">
				{(field) => (
					<div className="space-y-1.5">
						<Label htmlFor="newPassword">New password</Label>
						<Input
							id="newPassword"
							type="password"
							autoComplete="new-password"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>

			<form.Field name="confirm">
				{(field) => (
					<div className="space-y-1.5">
						<Label htmlFor="confirm">Confirm new password</Label>
						<Input
							id="confirm"
							type="password"
							autoComplete="new-password"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>

			{error && <p className="text-sm text-destructive">{error.message}</p>}
			{isSuccess && (
				<p className="text-sm text-muted-foreground">Password changed.</p>
			)}

			<Button type="submit" disabled={isPending}>
				{isPending ? "Saving…" : "Change password"}
			</Button>
		</form>
	);
};
