type Props = {
	errors: Array<{ message: string } | undefined>;
};

export const FieldError = ({ errors }: Props) => {
	const message = errors.find(Boolean)?.message;
	return message ? <p className="text-sm text-destructive">{message}</p> : null;
};
