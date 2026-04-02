import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const routeNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/admissions": "Admissions",
  "/students": "Students",
  "/fees": "Fees",
  "/attendance": "Attendance",
  "/reports": "Reports",
  "/ai-insights": "AI Insights",
  "/automation": "Automation",
};

const mockNotifications = [
  { id: 1, text: "15 students have attendance below 75%", time: "2 min ago", type: "warning" as const },
  { id: 2, text: "Fee payment received from Aarav Sharma", time: "10 min ago", type: "success" as const },
  { id: 3, text: "New admission application received", time: "1 hr ago", type: "info" as const },
  { id: 4, text: "23 students have pending fees", time: "3 hr ago", type: "warning" as const },
];

export function Topbar() {
  const { role, user, collegeName } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (q.includes("student")) navigate("/students");
      else if (q.includes("fee") || q.includes("pay") || q.includes("receipt")) navigate("/fees");
      else if (q.includes("admin") || q.includes("apply") || q.includes("application")) navigate("/admissions");
      else if (q.includes("attend")) navigate("/attendance");
      else if (q.includes("report")) navigate("/reports");
      else if (q.includes("dash")) navigate("/dashboard");
      else {
        toast({ title: "Search", description: `Searching for: "${searchQuery}"...`, variant: "default" });
      }
      setSearchQuery("");
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
          placeholder="Search students, fees..."
          className="pl-9 h-9 bg-muted/50 border-transparent focus:border-primary/30 w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* Role badge */}
      <Badge variant="secondary" className="capitalize text-xs hidden sm:flex">
        {role}
      </Badge>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-2 border-b border-border">
            <p className="font-semibold text-sm">Notifications</p>
          </div>
          {mockNotifications.map(n => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm">{n.text}</span>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </DropdownMenuItem>
          ))}
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
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => (window as any).location.href = "/login"}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
