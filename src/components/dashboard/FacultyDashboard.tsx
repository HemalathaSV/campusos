import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Users, CalendarCheck, FileText, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function FacultyDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold">Faculty Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, Professor.</p>
        </div>

        {/* Profile Summary */}
        <Card className="border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display text-xl shadow-lg">
                {(user as any)?.initials || "FC"}
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">{(user as any)?.fullName || "Faculty Member"}</h2>
                <p className="text-muted-foreground">{user?.email || "faculty@college.edu"} • {(user as any)?.branch || "Assigned Department"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <Users className="h-5 w-5 text-primary" /> Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">View and manage your assigned students.</p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/students">View Students</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <CalendarCheck className="h-5 w-5 text-info" /> Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Mark daily attendance for your classes.</p>
              <Button asChild className="w-full gradient-primary border-0">
                <Link to="/attendance">Mark Attendance</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-display">
                <FileText className="h-5 w-5 text-warning" /> Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Generate class and performance reports.</p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Bell className="h-5 w-5" /> Recent Updates & System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <div className="h-2 w-2 mt-2 rounded-full bg-accent shrink-0" />
              <div>
                <p className="font-medium text-sm">Exam schedule published</p>
                <p className="text-xs text-muted-foreground">The mid-semester exam schedule has been updated.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-lg bg-warning/5 border border-warning/10">
              <div className="h-2 w-2 mt-2 rounded-full bg-warning shrink-0" />
              <div>
                <p className="font-medium text-sm text-warning">Attendance marking pending</p>
                <p className="text-xs text-muted-foreground">Please complete yesterday's roll call.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-lg bg-info/5 border border-info/10">
              <div className="h-2 w-2 mt-2 rounded-full bg-info shrink-0" />
              <div>
                <p className="font-medium text-sm text-info">New Student Enrollment</p>
                <p className="text-xs text-muted-foreground">3 new students added to your Computer Science batch.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
