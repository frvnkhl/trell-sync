import { CheckCircleIcon, InboxIcon, PackageCheckIcon, WrenchIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useOrderStats } from "../hooks/useOrderStats";

const STAT_CARDS = [
	{ status: "prijata" as const, label: "Prijaté", icon: InboxIcon },
	{ status: "vyroba" as const, label: "Vo výrobe", icon: WrenchIcon },
	{ status: "hotovo" as const, label: "Čakajú na vyzdvihnutie", icon: CheckCircleIcon },
	{ status: "vyzdvihnuta" as const, label: "Vyzdvihnuté", icon: PackageCheckIcon },
];

export const StatsGrid = () => {
	const { data: stats, isLoading } = useOrderStats();

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{STAT_CARDS.map((card) => {
				const Icon = card.icon;
				return (
					<Card key={card.status}>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{card.label}
							</CardTitle>
							<Icon className="size-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<p className="text-2xl font-bold">
								{isLoading ? (
									<span className="inline-block h-8 w-10 animate-pulse rounded bg-muted" />
								) : (
									(stats?.[card.status] ?? 0)
								)}
							</p>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
};
