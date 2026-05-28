import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "#/components/ui/sidebar";
import { navItems } from "../lib/navItems";
import ThemeToggle from "#/components/ThemeToggle";

type Props = {
  userEmail: string | undefined;
  onLogout: () => void;
};

export const AppSidebar = ({ userEmail, onLogout }: Props) => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
            tS
          </div>
          <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
            trellSync
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link to={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
                {userEmail?.[0] ?? "?"}
              </div>
              <span className="flex-1 truncate text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                {userEmail}
              </span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ThemeToggle />
            <SidebarMenuButton tooltip="Sign out" onClick={onLogout}>
              <LogOut className="size-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
