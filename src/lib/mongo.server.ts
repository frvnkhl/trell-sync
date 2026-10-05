import { MongoClient } from "mongodb";
import type { Collection, Db } from "mongodb";
import { env } from "#/env";
import type { Order, OrderDoc, SmsLogDoc } from "#/types/db";

type OrderIdCounterDoc = { _id: string; last_num: number };

const globalForMongo = globalThis as unknown as { __mongoClient?: MongoClient };

export const mongoClient =
	globalForMongo.__mongoClient ?? new MongoClient(env.MONGODB_URI);

if (process.env.NODE_ENV !== "production") {
	globalForMongo.__mongoClient = mongoClient;
}

export const db: Db = mongoClient.db(env.MONGODB_DB);

export const ordersCollection = (): Collection<OrderDoc> =>
	db.collection<OrderDoc>("orders");

export const smsLogCollection = (): Collection<SmsLogDoc> =>
	db.collection<SmsLogDoc>("sms_log");

const countersCollection = (): Collection<OrderIdCounterDoc> =>
	db.collection<OrderIdCounterDoc>("order_id_counters");

let indexesReady: Promise<unknown> | null = null;

export const ensureIndexes = () => {
	indexesReady ??= Promise.all([
		ordersCollection().createIndex(
			{ trello_id: 1 },
			{
				unique: true,
				partialFilterExpression: { trello_id: { $type: "string" } },
			},
		),
		ordersCollection().createIndex({ created_at: -1 }),
		ordersCollection().createIndex({ status: 1 }),
		smsLogCollection().createIndex({ order_id: 1 }),
	]).catch((error) => {
		indexesReady = null;
		throw error;
	});
	return indexesReady;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

// Atomic YYMMDD-NNN generator; $inc on a single document is safe across tabs/PCs
export const nextOrderId = async (): Promise<string> => {
	const now = new Date();
	const key = `${pad2(now.getFullYear() % 100)}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;

	const counter = await countersCollection().findOneAndUpdate(
		{ _id: key },
		{ $inc: { last_num: 1 } },
		{ upsert: true, returnDocument: "after" },
	);

	return `${key}-${String(counter?.last_num ?? 1).padStart(3, "0")}`;
};

export const toOrder = ({ _id, created_at, ...rest }: OrderDoc): Order => ({
	...rest,
	id: _id,
	created_at: created_at.toISOString(),
});
