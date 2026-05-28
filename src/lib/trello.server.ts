import { env } from "#/env";
import type { OrderStatus, OrderType } from "#/types/db";

export const TRELLO_BOARD_ID = "q50dQSrx";

export const TRELLO_LIST_STATUS: Record<string, OrderStatus> = {
	"Čo treba urobiť": "prijata",
	"ZÁKAZKY PREDAJŇA": "prijata",
	Výroba: "vyroba",
	"Hotove zakazky na predajni": "hotovo",
	Odovzdané: "vyzdvihnuta",
};

const SHELF_ZONE_TO_TYPE: Record<string, OrderType> = {
	A: "velkformat",
	B: "plocha",
	C: "textil",
	D: "darcek",
	E: "gravir",
	F: "peciatky",
	G: "tabulky",
};

export const trelloGet = async (path: string): Promise<unknown> => {
	const url = `https://api.trello.com/1${path}?key=${env.TRELLO_KEY}&token=${env.TRELLO_TOKEN}`;

	let res: Response;
	try {
		res = await fetch(url);
	} catch (e) {
		throw new Error(`Sieťová chyba pri volaní Trello API: ${(e as Error).message}`);
	}

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		const hint =
			res.status === 401
				? "Neplatný API kľúč alebo token."
				: res.status === 404
					? "Board alebo zoznam nebol nájdený."
					: body || `HTTP ${res.status}`;
		throw new Error(`Trello chyba (${res.status}): ${hint}`);
	}

	try {
		return await res.json();
	} catch {
		throw new Error("Trello vrátilo neočakávanú odpoveď (nie JSON).");
	}
};

export type TrelloCardPreview = {
	trelloId: string;
	listName: string;
	orderId: string | null;
	name: string;
	phone: string;
	email: string;
	shelf: string;
	note: string;
	status: OrderStatus;
	type: OrderType;
	zone: string;
	createdAt: string;
};

const parseDesc = (desc: string) => {
	const lines = desc.split("\n").map((l) => l.trim());
	const get = (prefix: string) =>
		lines.find((l) => l.startsWith(prefix))?.slice(prefix.length).trim() ?? "";
	return {
		phone: get("📞"),
		email: get("📧"),
		shelf: get("📍"),
		note: get("📝"),
	};
};

const inferType = (shelf: string): OrderType => {
	const zone = shelf[0]?.toUpperCase() ?? "";
	return SHELF_ZONE_TO_TYPE[zone] ?? "darcek";
};

const cardCreatedAt = (cardId: string): string =>
	new Date(parseInt(cardId.substring(0, 8), 16) * 1000).toISOString();

export const parseCard = (
	card: { id: string; name: string; desc: string },
	listName: string,
): TrelloCardPreview => {
	const idMatch = card.name.match(/\[(\d{6}-\d{3})\]/);
	const orderId = idMatch?.[1] ?? null;
	const name = card.name.replace(/\[.*?\]\s*/, "").trim() || card.name;

	const { phone, email, shelf, note } = parseDesc(card.desc ?? "");
	const type = inferType(shelf);
	const zone = shelf[0]?.toUpperCase() ?? "D";

	return {
		trelloId: card.id,
		listName,
		orderId,
		name,
		phone,
		email,
		shelf,
		note,
		status: TRELLO_LIST_STATUS[listName] ?? "prijata",
		type,
		zone,
		createdAt: cardCreatedAt(card.id),
	};
};
