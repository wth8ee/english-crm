"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Users2,
  Wallet,
  GraduationCap,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Главная",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Календарь",
    url: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Ученики",
    url: "/students",
    icon: Users2,
  },
  {
    title: "Финансы",
    url: "/finances",
    icon: Wallet,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const Router = useRouter();

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar">
      <SidebarHeader className="h-14 flex flex-row items-center justify-start px-4 border-b border-border/40 shrink-0">
        <div
          onClick={() => Router.push("/")}
          className="flex items-center gap-2.5 pl-2 cursor-pointer"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground truncate">
            English CRM
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-9 px-3 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-foreground/5 text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={`h-4 w-4 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
