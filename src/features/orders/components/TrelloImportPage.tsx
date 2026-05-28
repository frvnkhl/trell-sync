import * as React from "react";
import {
	AlertCircle,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Download,
	Link2,
	Loader2,
	RefreshCw,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import { ZONE_CONFIG, STATUS_CONFIG } from "../lib/orderConfig";
import { useFetchTrelloCards } from "../hooks/useFetchTrelloCards";
import { useImportTrelloOrders } from "../hooks/useImportTrelloOrders";
import type { TrelloCardPreview } from "#/lib/trello.server";
import type { ImportResult } from "../api/importTrelloOrders";
import type { OrderType } from "#/types/db";

export const TrelloImportPage = () => {
	const [fetchEnabled, setFetchEnabled] = React.useState(false);
	const [selected, setSelected] = React.useState<Set<string>>(new Set());
	const [importResult, setImportResult] = React.useState<ImportResult | null>(null);
	const [showErrors, setShowErrors] = React.useState(false);

	const { data: cards, isLoading, error: fetchError, refetch } = useFetchTrelloCards(fetchEnabled);
	const {
		mutate: importCards,
		isPending: isImporting,
		error: importError,
	} = useImportTrelloOrders();

	const handleFetch = () => {
		setImportResult(null);
		setSelected(new Set());
		if (fetchEnabled) refetch();
		else setFetchEnabled(true);
	};

	React.useEffect(() => {
		if (cards) {
			setSelected(new Set(cards.map((c) => c.trelloId)));
		}
	}, [cards]);

	const toggleCard = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleAll = () => {
		if (!cards) return;
		if (selected.size === cards.length) setSelected(new Set());
		else setSelected(new Set(cards.map((c) => c.trelloId)));
	};

	const handleImport = () => {
		if (!cards) return;
		const toImport = cards.filter((c) => selected.has(c.trelloId));
		importCards(toImport, {
			onSuccess: (result) => {
				setImportResult(result);
				setShowErrors(false);
				setSelected(new Set());
			},
		});
	};

	return (
		<div className="flex flex-col gap-6 p-6 max-w-4xl">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-xl font-semibold">Import z Trella</h1>
					<p className="text-sm text-muted-foreground mt-0.5">
						Načíta existujúce karty z Trello boardu a importuje ich ako zákazky.
					</p>
				</div>
				<Button onClick={handleFetch} disabled={isLoading}>
					{isLoading ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<RefreshCw className="size-4" />
					)}
					{isLoading ? "Načítavam…" : "Načítať z Trella"}
				</Button>
			</div>

			{importResult && (() => {
				const hasErrors = importResult.errorDetails.length > 0;
				const hasSuccesses = importResult.imported > 0;
				const colorClass =
					hasErrors && !hasSuccesses
						? "bg-destructive/15 text-destructive-foreground"
						: hasErrors
							? "bg-warning text-warning-foreground"
							: "bg-success text-success-foreground";
				return (
				<div className={`flex flex-col gap-2 rounded-lg border border-border px-4 py-3 text-sm ${colorClass}`}>
					<div className="flex items-center gap-2">
						{hasErrors && !hasSuccesses ? (
							<AlertCircle className="size-4 flex-shrink-0" />
						) : (
							<CheckCircle2 className="size-4 flex-shrink-0" />
						)}
						<span>
							Importované: <strong>{importResult.imported}</strong>
							{importResult.skipped > 0 && (
								<>, preskočené (duplicity): {importResult.skipped}</>
							)}
							{importResult.errorDetails.length > 0 && (
								<>, chyby: {importResult.errorDetails.length}</>
							)}
						</span>
					</div>
					{importResult.errorDetails.length > 0 && (
						<>
							<button
								type="button"
								onClick={() => setShowErrors((v) => !v)}
								className="flex items-center gap-1 text-xs underline underline-offset-2 opacity-80 w-fit"
							>
								{showErrors ? (
									<ChevronUp className="size-3" />
								) : (
									<ChevronDown className="size-3" />
								)}
								{showErrors ? "Skryť" : "Zobraziť"} chyby
							</button>
							{showErrors && (
								<ul className="mt-1 space-y-1 text-xs opacity-80">
									{importResult.errorDetails.map((e, i) => (
										<li key={i}>
											<strong>{e.name}</strong>: {e.reason}
										</li>
									))}
								</ul>
							)}
						</>
					)}
				</div>
				);
			})()}

			{fetchError && (
				<div className="flex items-center gap-3 rounded-lg border bg-destructive/15 px-4 py-3 text-sm text-destructive-foreground">
					<AlertCircle className="size-4 flex-shrink-0" />
					<span>Chyba pri načítaní z Trella: {(fetchError as Error).message}</span>
				</div>
			)}

			{importError && (
				<div className="flex items-center gap-3 rounded-lg border bg-destructive/15 px-4 py-3 text-sm text-destructive-foreground">
					<AlertCircle className="size-4 flex-shrink-0" />
					<span>Chyba pri importe: {(importError as Error).message}</span>
				</div>
			)}

			{cards && cards.length === 0 && (
				<div className="rounded-lg border border-border bg-muted/30 py-16 text-center text-sm text-muted-foreground">
					Žiadne nové karty — všetky sú už v systéme.
				</div>
			)}

			{cards && cards.length > 0 && (
				<>
					<div className="flex items-center justify-between">
						<label className="flex items-center gap-2 text-sm cursor-pointer">
							<input
								type="checkbox"
								checked={selected.size === cards.length}
								onChange={toggleAll}
								className="rounded"
							/>
							Vybrať všetky ({cards.length})
						</label>
						<Button
							onClick={handleImport}
							disabled={selected.size === 0 || isImporting}
						>
							{isImporting ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Download className="size-4" />
							)}
							{isImporting
								? "Importujem…"
								: `Importovať (${selected.size})`}
						</Button>
					</div>

					<div className="rounded-lg border border-border overflow-hidden">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border bg-muted/50">
									<th className="w-10 px-4 py-3" />
									<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Zákazník
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Police / Zóna
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Stav
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
										Zoznam
									</th>
									<th className="w-10 px-4 py-3" />
								</tr>
							</thead>
							<tbody>
								{cards.map((card) => (
									<CardRow
										key={card.trelloId}
										card={card}
										checked={selected.has(card.trelloId)}
										onToggle={() => toggleCard(card.trelloId)}
									/>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
};

const CardRow = ({
	card,
	checked,
	onToggle,
}: {
	card: TrelloCardPreview;
	checked: boolean;
	onToggle: () => void;
}) => {
	const zoneConfig = ZONE_CONFIG[card.type as OrderType];
	const statusConfig = STATUS_CONFIG[card.status];

	return (
		<tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
			<td className="px-4 py-3">
				<input
					type="checkbox"
					checked={checked}
					onChange={onToggle}
					className="rounded"
				/>
			</td>
			<td className="px-4 py-3">
				<p className="font-medium">{card.name}</p>
				{card.phone && (
					<p className="text-xs text-muted-foreground">{card.phone}</p>
				)}
				{!card.phone && card.email && (
					<p className="text-xs text-muted-foreground">{card.email}</p>
				)}
			</td>
			<td className="px-4 py-3">
				<div className="flex items-center gap-2">
					{card.shelf ? (
						<span className="font-mono text-sm">{card.shelf}</span>
					) : (
						<span className="text-muted-foreground text-xs">—</span>
					)}
					{zoneConfig && (
						<span
							className="inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
							style={{ backgroundColor: zoneConfig.color }}
						>
							{zoneConfig.zone}
						</span>
					)}
				</div>
			</td>
			<td className="px-4 py-3">
				<span
					className={[
						"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
						statusConfig.className,
					].join(" ")}
				>
					{statusConfig.label}
				</span>
			</td>
			<td className="px-4 py-3 text-xs text-muted-foreground">
				{card.listName}
			</td>
			<td className="px-4 py-3">
				<a
					href={`https://trello.com/c/${card.trelloId}`}
					target="_blank"
					rel="noreferrer"
					className="text-muted-foreground hover:text-foreground transition-colors"
				>
					<Link2 className="size-4" />
				</a>
			</td>
		</tr>
	);
};
