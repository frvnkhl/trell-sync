import { cn } from "#/lib/utils";
import type { PaymentType } from "#/types/db";
import { PAYMENT_CONFIG } from "../lib/orderConfig";

type Props = {
	payment: PaymentType;
	amount?: number | null;
	className?: string;
};

export const PaymentBadge = ({ payment, amount, className }: Props) => {
	const config = PAYMENT_CONFIG[payment];
	const label =
		payment === "zaloha" && amount != null
			? `${config.label}: ${amount}€`
			: config.label;

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
				config.className,
				className,
			)}
		>
			{label}
		</span>
	);
};
