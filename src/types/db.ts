import type { ObjectId } from "mongodb";

export type OrderStatus = "prijata" | "vyroba" | "hotovo" | "vyzdvihnuta";
export type OrderType =
	| "velkformat"
	| "plocha"
	| "textil"
	| "darcek"
	| "gravir"
	| "peciatky"
	| "tabulky";
export type OrderZone = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type PaymentType = "zaplatene" | "zaloha" | "treba-zaplatit";

type OrderFields = {
	name: string;
	phone: string | null;
	email: string | null;
	type: string;
	zone: string;
	shelf: string | null;
	status: string;
	payment: string | null;
	payment_amount: number | null;
	note: string | null;
	trello_id: string | null;
	sms_sent: boolean | null;
	source: string | null;
};

// Stored shape: the order ID (YYMMDD-NNN) is the document _id
export type OrderDoc = OrderFields & { _id: string; created_at: Date };

// API shape: what server functions return and the UI consumes
export type Order = OrderFields & { id: string; created_at: string };

export type OrderInsert = Partial<OrderFields> &
	Pick<OrderFields, "name" | "type" | "zone"> & {
		id: string;
		created_at?: string;
	};

export type SmsLogDoc = {
	_id?: ObjectId;
	order_id: string;
	phone: string | null;
	message: string | null;
	sent_at: Date;
	manual: boolean;
};
