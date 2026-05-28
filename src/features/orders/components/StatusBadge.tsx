import { cn } from "#/lib/utils";
import type { OrderStatus } from "#/types/db";
import { STATUS_CONFIG } from "../lib/orderConfig";

type Props = {
	status: OrderStatus;
	className?: string;
};

export const StatusBadge = ({ status, className }: Props) => {
	const config = STATUS_CONFIG[status];
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
				config.className,
				className,
			)}
		>
			{config.label}
		</span>
	);
};
