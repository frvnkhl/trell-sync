import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "#/components/ui/button";
import { signOut } from "../api/signOut";
import { useAuthStore } from "../model/authStore";

export const LogoutButton = () => {
	const navigate = useNavigate();
	const setUser = useAuthStore((s) => s.setUser);

	const handleLogout = async () => {
		await signOut();
		setUser(null);
		await navigate({ to: "/login" });
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleLogout}
			title="Sign out"
		>
			<LogOut className="size-4" />
		</Button>
	);
};
