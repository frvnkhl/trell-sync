import type { AuthUser, UserRole } from "../types";

type RawUser = {
	id: string;
	email: string;
	name: string;
	role?: string | null;
};

export const toAuthUser = (user: RawUser): AuthUser => ({
	id: user.id,
	email: user.email,
	name: user.name,
	role: (user.role as UserRole | null | undefined) ?? "user",
});
