import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import type { OrderStatus } from "#/types/db";
import { useOrders } from "../hooks/useOrders";
import { STATUS_FILTER_OPTIONS } from "../lib/orderConfig";
import type { OrdersSearchParams } from "../types";
import { OrdersTable } from "./OrdersTable";
import { StatsGrid } from "./StatsGrid";

const PAGE_SIZE = 20;

type Props = {
	search: OrdersSearchParams;
};

export const OrdersPage = ({ search }: Props) => {
	const { status, q, page } = search;
	const navigate = useNavigate({ from: "/" });

	const [inputValue, setInputValue] = React.useState(q);

	// Sync input when URL q changes externally (e.g. back button)
	React.useEffect(() => {
		setInputValue(q);
	}, [q]);

	// Debounce search input → URL
	React.useEffect(() => {
		const timer = setTimeout(() => {
			if (inputValue !== q) {
				navigate({ search: (prev) => ({ ...prev, q: inputValue, page: 1 }) });
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [inputValue]);

	const { data, isLoading } = useOrders({
		status,
		search: q,
		page,
		limit: PAGE_SIZE,
	});

	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const to = Math.min(page * PAGE_SIZE, total);

	const setStatus = (s: OrderStatus | "all") =>
		navigate({ search: (prev) => ({ ...prev, status: s, page: 1 }) });

	const setPage = (p: number) =>
		navigate({ search: (prev) => ({ ...prev, page: p }) });

	return (
		<div className="flex flex-col gap-6 p-6">
			<StatsGrid />

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap gap-1">
					{STATUS_FILTER_OPTIONS.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onClick={() => setStatus(opt.value)}
							className={[
								"rounded-full px-3 py-1 text-sm font-medium transition-colors",
								status === opt.value
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground hover:bg-muted/70",
							].join(" ")}
						>
							{opt.label}
						</button>
					))}
				</div>

				<div className="relative w-full sm:w-64">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="Meno, telefón, ID…"
						className="pl-9"
					/>
				</div>
			</div>

			<OrdersTable data={data?.data ?? []} isLoading={isLoading} />

			{totalPages > 1 && (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<span>
						{from}–{to} z {total}
					</span>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage(page - 1)}
							disabled={page <= 1}
						>
							Predchádzajúca
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage(page + 1)}
							disabled={page >= totalPages}
						>
							Ďalšia
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
