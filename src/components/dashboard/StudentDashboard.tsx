import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getAllStudents } from "@/data/seedData";
import { GraduationCap, IndianRupee, CalendarCheck, Bell, User, Award, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const { user, collegeId } = useAuth();
  
  const studentProfile = getAllStudents(collegeId).find(s => s.id === (user as any)?.uid);

  const attendanceProgress = studentProfile?.attendancePercentage ?? 82; 
  const totalFee = studentProfile?.totalFee ?? 120000;
  const paidFee = studentProfile?.paidAmount ?? 90000;
  const pendingFee = totalFee - paidFee;
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold">Student Portal</h1>
          <p className="text-muted-foreground text-sm">Manage your academic progress and fees.</p>
        </div>

        {/* Profile */}
        <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-transparent to-accent/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display text-2xl shadow-lg border-4 border-background">
                {(user as any)?.initials || "ST"}
              </div>
              <div className="text-center sm:text-left flex-1 space-y-2">
                <h2 className="font-display text-2xl font-bold">{(user as any)?.fullName || "Student Name"}</h2>
                <div className="flex flex-wrap flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                  <span>{user?.email || "student@college.edu"}</span>
                  <span className="hidden sm:inline">•</span> 
                  <span>+91 9876543210</span>
                  <span className="hidden sm:inline">•</span> 
                  <Badge variant="outline">{(user as any)?.branch || "Computer Science"}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/students/${(user as any)?.uid || "student-1"}`}><User className="h-4 w-4 mr-1.5" /> View Full Profile</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/examinations"><Award className="h-4 w-4 mr-1.5" /> Academic Grades</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/timetable"><Calendar className="h-4 w-4 mr-1.5" /> Class Schedule</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Attendance Overview */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <CalendarCheck className="h-5 w-5 text-info" /> Attendance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-display font-bold">{attendanceProgress}%</p>
                  <p className="text-sm text-muted-foreground">Cumulative Attendance</p>
                </div>
                {attendanceProgress >= 75 ? (
                  <Badge className="bg-success text-success-foreground border-0 text-sm py-1 px-3 shadow-md shadow-success/20">Good Status</Badge>
                ) : (
                  <Badge variant="destructive" className="border-0 text-sm py-1 px-3 shadow-md shadow-destructive/20">Low Status</Badge>
                )}
              </div>
              <Progress value={attendanceProgress} className="h-3" />
            </CardContent>
          </Card>

          {/* Fees Summary */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <IndianRupee className="h-5 w-5 text-warning" /> Fee Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center bg-card p-3 rounded-md border font-mono">
                <span className="text-muted-foreground text-sm">Total Fee</span>
                <span className="font-bold text-lg">₹{(totalFee/1000).toLocaleString()}K</span>
              </div>
              <div className="flex justify-between items-center bg-success/10 text-success p-3 rounded-md border-success/20 font-mono">
                <span className="text-sm font-medium">Paid Amount</span>
                <span className="font-bold text-lg">₹{(paidFee/1000).toLocaleString()}K</span>
              </div>
              <div className="flex justify-between items-center bg-destructive/10 text-destructive p-3 rounded-md border-destructive/20 font-mono">
                <span className="text-sm font-medium">Pending Amount</span>
                <span className="font-bold text-lg">₹{(pendingFee/1000).toLocaleString()}K</span>
              </div>
              <Button asChild className="w-full gradient-primary border-0 mt-2 shadow-lg shadow-primary/20">
                <Link to="/fees">Pay Outstanding Fees</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Bell className="h-5 w-5" /> Student Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-success/5 border border-success/10">
              <div className="h-2 w-2 mt-2 rounded-full bg-success shrink-0" />
              <div>
                <p className="font-semibold text-sm">Admission Confirmed</p>
                <p className="text-xs text-muted-foreground mt-1">Welcome to the Department of Computer Science. Your portal is now fully activated, and you can view your schedule.</p>
              </div>
            </div>
            {pendingFee > 0 && (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                <div className="h-2 w-2 mt-2 rounded-full bg-destructive shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-destructive">Urgent: Fee Reminder</p>
                  <p className="text-xs text-muted-foreground mt-1">Your next term fees are due by 30th April. Please clear your pending balance of ₹{(pendingFee/1000).toLocaleString()}K to avoid late penalties.</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/5 border border-accent/10">
              <div className="h-2 w-2 mt-2 rounded-full bg-accent shrink-0" />
              <div>
                <p className="font-semibold text-sm">Library Account Active</p>
                <p className="text-xs text-muted-foreground mt-1">Your library digital card has been successfully generated. Visit the campus library to pick up physical books.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
