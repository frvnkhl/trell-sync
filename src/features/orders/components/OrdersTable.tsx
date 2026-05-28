import {
	flexRender,
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from "@tanstack/react-table";
import { Link2 } from "lucide-react";
import { Skeleton } from "#/components/ui/skeleton";
import type { Order, OrderStatus, PaymentType } from "#/types/db";
import { ZONE_CONFIG } from "../lib/orderConfig";
import { PaymentBadge } from "./PaymentBadge";
import { StatusBadge } from "./StatusBadge";

const formatDate = (dateStr: string | null) => {
	if (!dateStr) return "—";
	return new Intl.DateTimeFormat("sk-SK", {
		day: "numeric",
		month: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(dateStr));
};

const columns: ColumnDef<Order>[] = [
	{
		accessorKey: "id",
		header: "Číslo",
		cell: ({ getValue }) => (
			<span className="font-mono text-xs">{getValue<string>()}</span>
		),
	},
	{
		id: "customer",
		header: "Zákazník",
		cell: ({ row }) => (
			<div>
				<p className="font-medium text-sm">{row.original.name}</p>
				{row.original.phone && (
					<p className="text-xs text-muted-foreground">{row.original.phone}</p>
				)}
			</div>
		),
	},
	{
		id: "type_zone",
		header: "Typ / Zóna",
		cell: ({ row }) => {
			const config = ZONE_CONFIG[row.original.type as keyof typeof ZONE_CONFIG];
			if (!config) return null;
			return (
				<div className="flex items-center gap-2">
					<span
						className="inline-flex size-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
						style={{ backgroundColor: config.color }}
					>
						{config.zone}
					</span>
					<span className="hidden text-xs text-muted-foreground xl:block">
						{config.label}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "shelf",
		header: "Police",
		cell: ({ getValue }) => {
			const shelf = getValue<string | null>();
			return shelf ? (
				<span className="font-mono text-sm">{shelf}</span>
			) : (
				<span className="text-muted-foreground">—</span>
			);
		},
	},
	{
		accessorKey: "created_at",
		header: "Vytvorené",
		cell: ({ getValue }) => (
			<span className="text-xs text-muted-foreground">
				{formatDate(getValue<string | null>())}
			</span>
		),
	},
	{
		id: "status",
		header: "Stav",
		cell: ({ row }) => (
			<div className="flex flex-wrap gap-1">
				<StatusBadge status={row.original.status as OrderStatus} />
				{row.original.payment && (
					<PaymentBadge
						payment={row.original.payment as PaymentType}
						amount={row.original.payment_amount}
					/>
				)}
			</div>
		),
	},
	{
		id: "trello",
		header: "",
		cell: ({ row }) =>
			row.original.trello_id ? (
				<Link2 className="size-4 text-muted-foreground" aria-label="Trello" />
			) : null,
	},
	{
		id: "actions",
		header: "",
		cell: () => <div className="flex gap-1">{/* Epic 5 */}</div>,
	},
];

type Props = {
	data: Order[];
	isLoading: boolean;
};

export const OrdersTable = ({ data, isLoading }: Props) => {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
	});

	return (
		<div className="rounded-lg border border-border overflow-hidden">
			<table className="w-full text-sm">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id} className="border-b border-border bg-muted/50">
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide"
								>
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{isLoading
						? Array.from({ length: 5 }).map((_, i) => (
								<tr key={i} className="border-b border-border">
									{columns.map((_col, j) => (
										<td key={j} className="px-4 py-3">
											<Skeleton className="h-4 w-full" />
										</td>
									))}
								</tr>
							))
						: table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="px-4 py-3">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))}
					{!isLoading && table.getRowModel().rows.length === 0 && (
						<tr>
							<td
								colSpan={columns.length}
								className="py-16 text-center text-muted-foreground"
							>
								Žiadne zákazky
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
