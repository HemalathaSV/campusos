import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getAllStudents } from "@/data/seedData";
import { Users, IndianRupee, CalendarCheck, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = ["hsl(230,75%,55%)", "hsl(165,70%,42%)", "hsl(38,92%,50%)", "hsl(280,60%,55%)"];

export default function AdminDashboard() {
  const { collegeName, collegeId } = useAuth();
  const stats = getDashboardStats(collegeId);
  const localStudents = getAllStudents(collegeId);

  const recentActivity = [
    { text: "Fee payment received from Aarav Sharma", time: "2 min ago", type: "success" },
    { text: "Attendance marked for CS Year 2", time: "15 min ago", type: "info" },
    { text: "New admission: Priya Patel (ECE)", time: "1 hr ago", type: "info" },
    { text: `Low attendance alert: ${stats.lowAttendance} students below 75%`, time: "3 hr ago", type: "warning" },
    { text: `Fee reminder sent to ${stats.feeDefaulters} students`, time: "5 hr ago", type: "warning" },
  ];

  const lowAttendanceStudents = localStudents.filter(s => s.attendancePercentage < 75).slice(0, 5);
  const feeDefaulters = localStudents.filter(s => s.feeStatus === "pending").slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of your college management system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs"><TrendingUp className="h-3 w-3 mr-1" />+12%</Badge>
              </div>
              <p className="text-2xl font-bold font-display">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-success" />
                </div>
                <Badge variant="secondary" className="text-xs"><TrendingUp className="h-3 w-3 mr-1" />+8%</Badge>
              </div>
              <p className="text-2xl font-bold font-display">₹{(stats.feesCollected / 100000).toFixed(1)}L</p>
              <p className="text-sm text-muted-foreground">Fees Collected</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-warning" />
                </div>
                <Badge variant="secondary" className="text-xs text-destructive"><TrendingDown className="h-3 w-3 mr-1" />₹{(stats.pendingFees / 100000).toFixed(1)}L</Badge>
              </div>
              <p className="text-2xl font-bold font-display">₹{(stats.pendingFees / 100000).toFixed(1)}L</p>
              <p className="text-sm text-muted-foreground">Pending Fees</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <CalendarCheck className="h-5 w-5 text-info" />
                </div>
                <Badge variant={stats.avgAttendance >= 75 ? "secondary" : "destructive"} className="text-xs">{stats.avgAttendance}%</Badge>
              </div>
              <p className="text-2xl font-bold font-display">{stats.avgAttendance}%</p>
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg">Monthly Fee Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.monthlyFees}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v / 100000}L`} />
                  <Tooltip formatter={(v: number) => `₹${(v / 100000).toFixed(1)}L`} />
                  <Bar dataKey="amount" fill="hsl(230,75%,55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg">Branch Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={stats.branchDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="name" label={({ name, count }) => `${name}: ${count}`}>
                    {stats.branchDistribution.map((item, i) => (
                      <Cell key={item.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alerts + Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Low Attendance */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" /> Low Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowAttendanceStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.usn} • {s.branch.name}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">{s.attendancePercentage}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fee Defaulters */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-destructive" /> Fee Defaulters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {feeDefaulters.map(s => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.usn}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">₹{(s.totalFee / 1000).toFixed(0)}K Pending</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((a) => (
                <div key={`${a.text}-${a.time}`} className="flex items-start gap-3 text-sm">
                  <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${a.type === "success" ? "bg-success" : a.type === "warning" ? "bg-warning" : "bg-info"}`} />
                  <div>
                    <p>{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
