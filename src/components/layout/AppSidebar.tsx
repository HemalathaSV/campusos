import {
  LayoutDashboard, Users, GraduationCap, IndianRupee, CalendarCheck,
  FileText, Brain, Workflow, Settings, LogOut, ChevronDown, Award, Calendar,
  Briefcase, CalendarOff, BookOpen, Building, ShieldCheck, RotateCcw
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const adminNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Admissions", url: "/admissions", icon: GraduationCap },
  { title: "Students", url: "/students", icon: Users },
  { title: "Fees", url: "/fees", icon: IndianRupee },
  { title: "Attendance", url: "/attendance", icon: CalendarCheck },
  { title: "Examinations", url: "/examinations", icon: Award },
  { title: "Backlogs & Retests", url: "/backlogs", icon: RotateCcw },
  { title: "Timetable", url: "/timetable", icon: Calendar },
  { title: "Placements", url: "/placements", icon: Briefcase },
  { title: "Leaves", url: "/leaves", icon: CalendarOff },
  { title: "Library", url: "/library", icon: BookOpen },
  { title: "Hostel", url: "/hostel", icon: Building },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Parent Portal", url: "/parent-portal", icon: ShieldCheck },
  { title: "AI Insights", url: "/ai-insights", icon: Brain },
  { title: "Automation", url: "/automation", icon: Workflow },
];

const facultyNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Attendance", url: "/attendance", icon: CalendarCheck },
  { title: "Examinations", url: "/examinations", icon: Award },
  { title: "Backlogs & Retests", url: "/backlogs", icon: RotateCcw },
  { title: "Timetable", url: "/timetable", icon: Calendar },
  { title: "Placements", url: "/placements", icon: Briefcase },
  { title: "Leaves", url: "/leaves", icon: CalendarOff },
  { title: "Library", url: "/library", icon: BookOpen },
  { title: "Hostel", url: "/hostel", icon: Building },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Parent Portal", url: "/parent-portal", icon: ShieldCheck },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { role, user, signOut, setDemoRole, collegeName } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const studentNav = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Profile", url: `/students/${(user as any)?.uid || "student-1"}`, icon: Users },
    { title: "Fees", url: "/fees", icon: IndianRupee },
    { title: "Examinations", url: "/examinations", icon: Award },
  { title: "Backlogs & Retests", url: "/backlogs", icon: RotateCcw },
    { title: "Timetable", url: "/timetable", icon: Calendar },
    { title: "Placements", url: "/placements", icon: Briefcase },
    { title: "Leaves", url: "/leaves", icon: CalendarOff },
    { title: "Library", url: "/library", icon: BookOpen },
    { title: "Hostel", url: "/hostel", icon: Building },
    { title: "Parent Portal", url: "/parent-portal", icon: ShieldCheck },
  ];

  const navItems = role === "admin" ? adminNav : role === "faculty" ? facultyNav : studentNav;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            CO
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm text-sidebar-primary-foreground truncate">Campus OS</h2>
              <p className="text-[11px] text-sidebar-foreground/60 truncate">{collegeName}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
