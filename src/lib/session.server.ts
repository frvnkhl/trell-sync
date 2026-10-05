import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth.server";

export const requireUser = async () => {
	const session = await auth.api.getSession({ headers: getRequestHeaders() });
	if (!session) throw new Error("Unauthorized");
	return session.user;
};

export const requireAdmin = async () => {
	const user = await requireUser();
	if (user.role !== "admin") throw new Error("Forbidden");
	return user;
};
