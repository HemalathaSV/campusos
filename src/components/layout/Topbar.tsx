import { Bell, Search, Check, Trash2, CalendarCheck, FileText, IndianRupee, GraduationCap, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  subscribeToNotifications,
  formatTimeAgo,
  NotificationItem
} from "@/services/notifications";
import { ThemeToggle } from "@/components/ThemeToggle";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/admissions": "Admissions",
  "/students": "Students",
  "/fees": "Fees",
  "/attendance": "Attendance",
  "/examinations": "Examinations & Grading",
  "/timetable": "Timetable & Classes",
  "/placements": "Campus Placements",
  "/leaves": "Leaves & Absence",
  "/library": "Digital Library",
  "/hostel": "Hostel & Helpdesk",
  "/parent-portal": "Parent Portal",
  "/reports": "Reports",
  "/ai-insights": "AI Insights",
  "/automation": "Automation",
  "/profile": "My Profile",
};

export function Topbar() {
  const { role, user, collegeName, setDemoRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getNotifications(role));

  useEffect(() => {
    const sync = () => setNotifications(getNotifications(role));
    sync();
    const unsubscribe = subscribeToNotifications(sync);
    return () => unsubscribe();
  }, [role]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (q.includes("student")) navigate("/students");
      else if (q.includes("fee") || q.includes("pay") || q.includes("receipt")) navigate("/fees");
      else if (q.includes("admin") || q.includes("apply") || q.includes("application")) navigate("/admissions");
      else if (q.includes("attend")) navigate("/attendance");
      else if (q.includes("exam") || q.includes("grade") || q.includes("mark") || q.includes("sgpa") || q.includes("cgpa") || q.includes("backlog")) navigate("/examinations");
      else if (q.includes("time") || q.includes("sched") || q.includes("class")) navigate("/timetable");
      else if (q.includes("place") || q.includes("job") || q.includes("drive") || q.includes("career")) navigate("/placements");
      else if (q.includes("leave") || q.includes("absent") || q.includes("od")) navigate("/leaves");
      else if (q.includes("lib") || q.includes("book")) navigate("/library");
      else if (q.includes("hostel") || q.includes("room") || q.includes("bed") || q.includes("helpdesk")) navigate("/hostel");
      else if (q.includes("parent") || q.includes("guard")) navigate("/parent-portal");
      else if (q.includes("report")) navigate("/reports");
      else if (q.includes("dash")) navigate("/dashboard");
      else {
        toast({ title: "Search", description: `Searching for: "${searchQuery}"...`, variant: "default" });
      }
      setSearchQuery("");
    }
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-success shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning shrink-0" />;
      case "destructive":
        return <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-primary shrink-0" />;
    }
  };

  const currentPage = routeNames[location.pathname] || "Campus OS";

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
      <SidebarTrigger className="mr-1" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground font-semibold">Campus OS • {collegeName || 'MIT College'}</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{currentPage}</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center relative max-w-xs">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students, exams, fees..."
          className="pl-9 h-9 bg-muted/50 border-transparent focus:border-primary/30 w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* 1-Click Role Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs capitalize gap-1.5 font-medium border-border/80">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
            Role: {role}{role === "student" && user?.fullName ? ` (${user.fullName.split(" ")[0]})` : ""}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-xs w-60">
          <div className="px-2 py-1.5 font-semibold text-[11px] text-muted-foreground border-b border-border/50">
            Switch Demo Persona
          </div>
          <DropdownMenuItem 
            onClick={() => setDemoRole("student", { id: "student-1", name: "Aarav Sharma", email: "aarav1@gmail.com" })} 
            className="cursor-pointer flex flex-col items-start gap-0.5"
          >
            <span className="font-medium">Student: Aarav Sharma</span>
            <span className="text-[10px] text-muted-foreground">1SI22CS001 • Sem 3 • 0 Backlogs</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDemoRole("student", { id: "student-5", name: "Arjun Reddy", email: "arjun5@gmail.com" })} 
            className="cursor-pointer flex flex-col items-start gap-0.5 bg-destructive/5 hover:bg-destructive/10"
          >
            <span className="font-medium text-destructive flex items-center gap-1">
              Student: Arjun Reddy ⚠️
            </span>
            <span className="text-[10px] text-muted-foreground">1SI22CS005 • Sem 2 • 1 Backlog (CS202)</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDemoRole("faculty")} 
            className="cursor-pointer flex flex-col items-start gap-0.5"
          >
            <span className="font-medium">Faculty: Dr. Ramesh Kumar</span>
            <span className="text-[10px] text-muted-foreground">CS Dept • Marks Evaluation & Tracking</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDemoRole("admin")} 
            className="cursor-pointer flex flex-col items-start gap-0.5"
          >
            <span className="font-medium">Admin: Dean / Principal</span>
            <span className="text-[10px] text-muted-foreground">College-wide Oversight & Analytics</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Dynamic Notifications Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-88 sm:w-96 p-0 shadow-lg border-border/80">
          <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
            <div>
              <p className="font-semibold text-sm">Notifications</p>
              <p className="text-xs text-muted-foreground">{unreadCount} unread update{unreadCount === 1 ? '' : 's'}</p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                  onClick={() => markAllAsRead(role)}
                >
                  <Check className="h-3 w-3" /> Mark Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1 px-2"
                  onClick={() => clearNotifications(role)}
                >
                  <Trash2 className="h-3 w-3" /> Clear
                </Button>
              )}
            </div>
          </div>
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border/40">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Bell className="h-6 w-6 mx-auto mb-2 opacity-30" />
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 text-left transition-colors cursor-pointer hover:bg-muted/50 flex items-start gap-3 ${
                    !n.read ? "bg-primary/5 font-medium" : "opacity-80"
                  }`}
                >
                  <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate text-foreground">{n.title}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0 font-normal">
                        {formatTimeAgo(n.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 font-normal">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full gradient-primary text-primary-foreground text-sm font-bold shadow-sm border-2 border-primary/20 hover:border-primary/50 transition-colors"
          >
            {(user as any)?.initials || "U"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/examinations")}>
            Academic Records
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/timetable")}>
            Class Timetable
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => (window as any).location.href = "/login"}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
