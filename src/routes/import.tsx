import { createFileRoute } from "@tanstack/react-router";
import { TrelloImportPage } from "#/features/orders";

export const Route = createFileRoute("/import")({
	component: TrelloImportPage,
});
