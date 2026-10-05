import { useForm } from "@tanstack/react-form";
import { FieldError } from "#/components/FieldError";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { useResetUserPassword } from "../hooks/useResetUserPassword";
import { resetPasswordSchema } from "../types";

type Props = {
	userId: string;
	onDone: () => void;
};

export const ResetPasswordForm = ({ userId, onDone }: Props) => {
	const { mutateAsync, error, isPending } = useResetUserPassword();

	const form = useForm({
		defaultValues: { userId, newPassword: "" },
		validators: { onSubmit: resetPasswordSchema },
		onSubmit: async ({ value }) => {
			await mutateAsync(value);
			onDone();
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit().catch(() => {});
			}}
			className="flex flex-col gap-2 sm:flex-row sm:items-start"
		>
			<form.Field name="newPassword">
				{(field) => (
					<div className="flex-1 space-y-1.5">
						<Input
							placeholder="New password"
							autoComplete="off"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						<FieldError errors={field.state.meta.errors} />
					</div>
				)}
			</form.Field>
			<Button type="submit" size="sm" disabled={isPending}>
				Save
			</Button>
			<Button type="button" size="sm" variant="ghost" onClick={onDone}>
				Cancel
			</Button>
			{error && <p className="text-sm text-destructive">{error.message}</p>}
		</form>
	);
};
