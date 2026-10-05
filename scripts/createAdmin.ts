import { hashPassword } from "better-auth/crypto";
import { auth } from "../src/lib/auth.server";
import { mongoClient } from "../src/lib/mongo.server";

const [email, password, name = "Admin"] = process.argv.slice(2);

if (!email || !password) {
	console.error("Usage: pnpm admin:create <email> <password> [name]");
	process.exit(1);
}

if (password.length < 8) {
	console.error("Password must be at least 8 characters");
	process.exit(1);
}

const ctx = await auth.$context;

if (await ctx.internalAdapter.findUserByEmail(email)) {
	console.error(`User ${email} already exists`);
	await mongoClient.close();
	process.exit(1);
}

const user = await ctx.internalAdapter.createUser(
	{ email, name, role: "admin", emailVerified: true },
	{ method: "admin" },
);

await ctx.internalAdapter.linkAccount({
	userId: user.id,
	providerId: "credential",
	accountId: user.id,
	password: await hashPassword(password),
});

console.log(`Admin ${email} created`);
await mongoClient.close();
