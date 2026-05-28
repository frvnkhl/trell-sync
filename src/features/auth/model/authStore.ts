import { create } from "zustand";
import type { AuthUser } from "../types";

type AuthStore = {
	user: AuthUser | null;
	setUser: (user: AuthUser | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
}));
