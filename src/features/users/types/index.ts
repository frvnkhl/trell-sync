import { z } from "zod";

export const createUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.enum(["admin", "user"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const resetPasswordSchema = z.object({
	userId: z.string().min(1),
	newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type ManagedUser = {
	id: string;
	name: string;
	email: string;
	role: "admin" | "user";
	createdAt: string;
};
