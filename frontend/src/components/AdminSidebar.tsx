import { LayoutDashboard, Camera, Map, Cloud, Pill, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { t } = useTranslation();

  const adminItems = [
    { title: t('dashboard'), url: "/", icon: LayoutDashboard },
    { title: t('side_disease'), url: "/disease-detection", icon: Camera },
    { title: t('side_pest'), url: "/pest-heatmap", icon: Map },
    { title: t('side_weather'), url: "/weather-forecast", icon: Cloud },
    { title: t('side_treatments'), url: "/treatments", icon: Pill },
    { title: t('reports'), url: "/reports", icon: BarChart3 },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 !bg-[#020b06]/80 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src={logo} alt="CropGuard" className="w-8 h-8 rounded-full" />
          {!collapsed && (
            <div>
              <h2 className="text-sm font-display font-bold text-white tracking-wide">CropGuard AI</h2>
              <p className="text-xs text-green-400 font-medium">Plant Protection</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40 uppercase tracking-widest text-[10px]">Admin Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="hover:bg-white/5 text-white/70 hover:text-white transition-colors" activeClassName="bg-green-500/20 text-green-400 font-bold border-r-2 border-green-400 rounded-none">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/5">
        {!collapsed && (
          <p className="text-xs text-white/30 text-center font-medium">v1.0.0 — AI System</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
