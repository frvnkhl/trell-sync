import * as React from "react";
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { redirect, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
import type { QueryClient } from "@tanstack/react-query";
import { getSession } from "#/features/auth/api/getSession";
import { signOut, useAuthStore } from "#/features/auth";
import type { AuthUser } from "#/features/auth/types";
import { AppSidebar } from "#/features/sidebar";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";

interface MyRouterContext {
	queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

const RootDocument = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans">
				{children}
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
};

const RootLayout = () => {
	const { user } = Route.useRouteContext();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const setUser = useAuthStore((s) => s.setUser);
	const navigate = useNavigate();

	React.useEffect(() => {
		setUser(user);
	}, [user, setUser]);

	const handleLogout = async () => {
		await signOut();
		setUser(null);
		await navigate({ to: "/login" });
	};

	if (pathname.startsWith("/login")) {
		return <Outlet />;
	}

	return (
		<SidebarProvider>
			<AppSidebar userEmail={user?.email} onLogout={handleLogout} />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async ({ location }) => {
		if (location.pathname.startsWith("/login")) {
			return { user: null as AuthUser | null };
		}
		const user = await getSession();
		if (!user) throw redirect({ to: "/login" });
		return { user };
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "trell-sync" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootLayout,
	shellComponent: RootDocument,
});
