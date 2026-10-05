import { z } from "zod";

export const signInSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const changePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const changePasswordFormSchema = changePasswordSchema
	.extend({ confirm: z.string() })
	.refine((v) => v.newPassword === v.confirm, {
		message: "Passwords do not match",
		path: ["confirm"],
	});

export type UserRole = "admin" | "user";

export type AuthUser = {
	id: string;
	email: string;
	name: string;
	role: UserRole;
};
